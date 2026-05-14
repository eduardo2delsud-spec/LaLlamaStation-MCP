import type { DatabaseService } from "../../database/connection.js";

export async function getCoreDirectives(dbService: DatabaseService, project: string): Promise<string> {
	const db = dbService.getDb();
	const row = await db.get(`SELECT content FROM core_directives WHERE project = ?`, [project]);
	if (row && row.content) {
		return row.content;
	}
	return `# Directivas Centrales: ${project}

1. **Arquitectura Limpia:** Mantén el código modular y desacoplado.
2. **Spec-Driven Development (SDD):** Evalúa e indica siempre la fase activa (exploración, diseño, implementación, revisión).
3. **Transparencia:** Registra los aprendizajes clave en la memoria pasiva para evitar redundancia.`;
}

export async function updateCoreDirectives(dbService: DatabaseService, project: string, content: string): Promise<boolean> {
	const db = dbService.getDb();
	const now = Date.now();
	await dbService.enqueueWrite(async () => {
		await db.run(
			`INSERT INTO core_directives (project, content, updatedAt) VALUES (?, ?, ?)
			 ON CONFLICT(project) DO UPDATE SET content = ?, updatedAt = ?`,
			[project, content, now, content, now]
		);
	});
	return true;
}

export async function getGlobalSetting(dbService: DatabaseService, key: string, defaultValue: string = ""): Promise<string> {
	const db = dbService.getDb();
	const row = await db.get(`SELECT value FROM global_settings WHERE key = ?`, [key]);
	return row ? row.value : defaultValue;
}

export async function updateGlobalSetting(dbService: DatabaseService, key: string, value: string): Promise<boolean> {
	const db = dbService.getDb();
	const now = Date.now();
	await dbService.enqueueWrite(async () => {
		await db.run(
			`INSERT INTO global_settings (key, value, updatedAt) VALUES (?, ?, ?)
			 ON CONFLICT(key) DO UPDATE SET value = ?, updatedAt = ?`,
			[key, value, now, value, now]
		);
	});
	return true;
}
