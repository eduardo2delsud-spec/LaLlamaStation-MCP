import type { DatabaseService } from "../../database/connection.js";

export async function endSession(dbService: DatabaseService, sessionId: string, summary: string): Promise<boolean> {
	const db = dbService.getDb();
	const now = Date.now();
	let changes = 0;
	await dbService.enqueueWrite(async () => {
		const res = await db.run(`UPDATE sessions SET summary = ?, endedAt = ? WHERE id = ?`, [
			summary,
			now,
			sessionId,
		]);
		changes = res.changes || 0;
	});
	return changes > 0;
}
