import type { DatabaseService } from "../../database/connection.js";
import type { Memory } from "../types.js";

export async function getContext(dbService: DatabaseService, project: string, limit: number = 20): Promise<Memory[]> {
	const db = dbService.getDb();
	return await db.all(
		`SELECT id, project, type, title, content, tags, createdAt, updatedAt 
         FROM memories WHERE project = ? ORDER BY createdAt DESC LIMIT ?`,
		[project, limit]
	);
}
