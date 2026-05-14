import type { DatabaseService } from "../database/connection.js";
import { getGlobalSetting } from "../services/settings/index.js";
import { consolidateMemories } from "../services/analysis/consolidation.js";

let cronTimer: NodeJS.Timeout | null = null;

export async function startCronJobs(dbService: DatabaseService) {
	// Simple polling interval to check if consolidation should run.
	// For simplicity without external cron libraries, we check every hour.
	const checkInterval = 60 * 60 * 1000; // 1 hour

	cronTimer = setInterval(async () => {
		try {
			// In a real multi-project setup, we'd iterate active projects.
			// Here we run for the default project.
			console.error("[Cron] Running scheduled memory consolidation...");
			const res = await consolidateMemories(dbService, "lallamastation");
			if (res.consolidatedGroups > 0) {
				console.error(`[Cron] Consolidated ${res.consolidatedGroups} topic groups.`);
			}
		} catch (e: any) {
			console.error("[Cron] Error running consolidation:", e.message);
		}
	}, checkInterval);
}
