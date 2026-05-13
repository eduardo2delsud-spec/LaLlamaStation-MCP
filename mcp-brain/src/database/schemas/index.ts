import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { createSessionsTable } from "./sessions.js";
import { createMemoriesTable } from "./memories.js";
import { createRelationsTable } from "./relations.js";

export async function applySchemas(db: Database<sqlite3.Database, sqlite3.Statement>) {
	await createSessionsTable(db);
	await createMemoriesTable(db);
	await createRelationsTable(db);
}
