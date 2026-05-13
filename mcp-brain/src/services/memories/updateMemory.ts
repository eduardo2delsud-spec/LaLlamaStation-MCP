import type { DatabaseService } from "../../database/connection.js";
import { getMemory } from "./getMemory.js";
import { embed } from "../llm/index.js";

export async function updateMemory(
	dbService: DatabaseService,
	id: string,
	title?: string,
	content?: string,
	tags?: string,
	topicKey?: string
): Promise<boolean> {
	const db = dbService.getDb();
	const memory = await getMemory(dbService, id);
	if (!memory) return false;

	const newTitle = title || memory.title;
	const newContent = content || memory.content;
	const newTags = tags || memory.tags;
	const newTopicKey = topicKey !== undefined ? topicKey : (memory as any).topic_key;
	const now = Date.now();

	let vectorJson: string | null = null;
	if (title || content) {
		try {
			const embeddings = await embed(`${newTitle}\n${newContent}`);
			if (embeddings && embeddings.length > 0) {
				vectorJson = JSON.stringify(embeddings[0]);
			}
		} catch (_err) {}
	}

	await dbService.enqueueWrite(async () => {
		if (vectorJson) {
			await db.run(
				`UPDATE memories SET title = ?, content = ?, tags = ?, vector = ?, topic_key = ?, updatedAt = ? WHERE id = ?`,
				[newTitle, newContent, newTags, vectorJson, newTopicKey, now, id]
			);
		} else {
			await db.run(`UPDATE memories SET title = ?, content = ?, tags = ?, topic_key = ?, updatedAt = ? WHERE id = ?`, [
				newTitle,
				newContent,
				newTags,
				newTopicKey,
				now,
				id,
			]);
		}
	});
	return true;
}
