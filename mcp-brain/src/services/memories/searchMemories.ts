import type { DatabaseService } from "../../database/connection.js";
import type { Memory } from "../types.js";
import { embed, cosineSimilarity } from "../llm/index.js";

export async function searchMemories(
	dbService: DatabaseService,
	query: string,
	project: string,
	mode: "lexical" | "semantic" | "hybrid" = "hybrid",
	limit: number = 10
): Promise<Memory[]> {
	const db = dbService.getDb();

	if (mode === "lexical") {
		const rows = await db.all(
			`SELECT m.id, m.project, m.type, m.title, m.content, m.tags, m.createdAt, m.updatedAt 
             FROM memories_fts f 
             JOIN memories m ON f.id = m.id 
             WHERE f.memories_fts MATCH ? AND m.project = ? 
             ORDER BY rank LIMIT ?`,
			[`"${query}"*`, project, limit]
		);
		return rows as Memory[];
	}

	if (mode === "semantic" || mode === "hybrid") {
		let queryVector: number[] = [];
		try {
			const emb = await embed(query);
			if (emb && emb.length > 0) queryVector = emb[0];
		} catch (err) {
			console.error("[MemoryService] Semantic search failed. Falling back to lexical.", err);
			if (mode === "hybrid") return searchMemories(dbService, query, project, "lexical", limit);
			return [];
		}

		if (queryVector.length === 0) return [];

		const allRows = await db.all(
			`SELECT id, project, type, title, content, tags, vector, createdAt, updatedAt 
             FROM memories WHERE project = ? AND vector IS NOT NULL`,
			[project]
		);

		const results = allRows.map((row: any) => {
			const vec: number[] = JSON.parse(row.vector);
			const score = cosineSimilarity(queryVector, vec);
			return { ...row, vector: undefined, score } as Memory;
		});

		results.sort((a, b) => (b.score || 0) - (a.score || 0));
		return results.slice(0, limit);
	}

	return [];
}
