import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Server as SocketServer } from "socket.io";
import { AuthService } from "./auth/auth.service.js";
import { DatabaseService } from "./memory/database.service.js";
import { MemoryService } from "./memory/memory.service.js";
import { MEMORY_TOOL_CATALOG, MemoryTools } from "./memory/memory.tools.js";
import { OllamaService } from "./ollama/ollama.service.js";
import { MCP_TOOL_CATALOG, OllamaTools } from "./ollama/ollama.tools.js";
import { SessionManager } from "./session/session.manager.js";

export class AppModule {
	public readonly ollamaService: OllamaService;
	public readonly authService: AuthService;
	public readonly sessionManager: SessionManager;
	public readonly databaseService: DatabaseService;
	public readonly memoryService: MemoryService;
	private readonly ollamaTools: OllamaTools;
	private readonly memoryTools: MemoryTools;

	constructor() {
		this.authService = new AuthService();
		this.authService.setKnownMcpTools([
			...MCP_TOOL_CATALOG.map((tool) => tool.name),
			...MEMORY_TOOL_CATALOG.map((tool) => tool.name),
		]);
		this.ollamaService = new OllamaService();
		this.sessionManager = new SessionManager();
		
		this.databaseService = new DatabaseService();
		this.memoryService = new MemoryService(this.databaseService, this.ollamaService);

		this.ollamaTools = new OllamaTools(this.ollamaService, this.authService);
		this.memoryTools = new MemoryTools(this.memoryService, this.authService);
	}

	async bootstrap(server: Server, io?: SocketServer) {
		await this.databaseService.initialize();
		if (io) this.ollamaService.setIo(io);
		
		this.ollamaTools.register(server);
		this.memoryTools.register(server);
		
		console.log("AppModule bootstrapped with WebSockets and SQLite Memory support");
	}
}
