import type { DatabaseService } from "../../database/connection.js";

export async function deleteMemory(dbService: DatabaseService, id: string): Promise<boolean> {
	const db = dbService.getDb();
	let changes = 0;
	await dbService.enqueueWrite(async () => {
		const res = await db.run(`DELETE FROM memories WHERE id = ?`, [id]);
		changes = res.changes || 0;
	});
	return changes > 0;
}
