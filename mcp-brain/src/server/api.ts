import cors from "cors";
import express from "express";
import type { DatabaseService } from "../database/connection.js";
import { memories } from "../services/index.js";

const PORT = process.env.BRAIN_PORT || 3001;

export function startApiServer(dbService: DatabaseService) {
	const app = express();
	app.use(cors());
	app.use(express.json());

	app.get("/api/memory/stats", async (req, res) => {
		const project = (req.query.project as string) || "lallamastation";
		try {
			const stats = await memories.getStats(dbService, project);
			res.json(stats);
		} catch (e: any) {
			res.status(500).json({ error: e.message });
		}
	});

	app.get("/api/memory/search", async (req, res) => {
		const q = (req.query.q as string) || "";
		const project = (req.query.project as string) || "lallamastation";
		const mode = (req.query.mode as "lexical" | "semantic" | "hybrid") || "hybrid";
		try {
			const results =
				q.trim() === ""
					? await memories.getContext(dbService, project, 50)
					: await memories.searchMemories(dbService, q, project, mode, 50);
			res.json(results);
		} catch (e: any) {
			res.status(500).json({ error: e.message });
		}
	});

	app.delete("/api/memory/:id", async (req, res) => {
		try {
			const success = await memories.deleteMemory(dbService, req.params.id);
			if (success) res.json({ message: "Memory deleted" });
			else res.status(404).json({ error: "Memory not found" });
		} catch (e: any) {
			res.status(500).json({ error: e.message });
		}
	});

	const serverInstance = app.listen(PORT, () => {
		console.error(`[Brain UI API] Dashboard API listening on port ${PORT}`);
	});

	serverInstance.on("error", (err: any) => {
		if (err.code === "EADDRINUSE") {
			console.error(`[Brain UI API] Warning: Port ${PORT} already in use. Running in Stdio-only mode.`);
		} else {
			console.error(`[Brain UI API] Server error:`, err);
		}
	});
}
