import "dotenv/config";
import { validateEnv } from "./env.js";
import { DatabaseService } from "./database/connection.js";
import { startMcpServer } from "./server/mcp.js";
import { startApiServer } from "./server/api.js";
import { startCronJobs } from "./server/cron.js";

async function bootstrap() {
	// 1. Validar Entorno
	validateEnv();

	// 2. Iniciar Base de Datos
	const dbService = new DatabaseService();
	await dbService.initialize();

	// 3. Iniciar Servidores
	await startMcpServer(dbService);
	startApiServer(dbService);
	startCronJobs(dbService);
}

bootstrap().catch((err) => {
	console.error("[Fatal]", err);
	process.exit(1);
});
