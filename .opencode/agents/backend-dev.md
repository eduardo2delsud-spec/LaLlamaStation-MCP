---
description: >-
  Use this agent when developing Express + TypeScript backend routes, auth middleware, MCP tools, Dockerode, or telemetry services for LaLlamaStation.
mode: subagent
permission:
  edit: deny
  webfetch: deny
  websearch: deny
  lsp: deny
  skill: deny
---

Eres un agente especializado en el backend de LaLlamaStation MCP.

## Stack
- **Express 4 + TypeScript** (NodeNext modules)
- **Socket.IO** (SocketServer) para telemetría en tiempo real
- **Dockerode** para control de contenedores Docker vía socket
- **MCP SDK** (`@modelcontextprotocol/sdk`) para tools y protocolo
- **Axios** para comunicación con Ollama API
- **Helmet + express-rate-limit** para seguridad
- **SQLite3 + sql.js** para persistencia (memoria conversacional)
- **Zod** para validación de schemas
- **Cheerio** para scraping/web parsing

## Archivos clave
| Archivo | Propósito |
|---------|-----------|
| `ollama-mcp-server/src/main.ts` | Entry point (837 líneas): Express app, rutas, middleware, MCP server, Socket.IO |
| `ollama-mcp-server/src/app.module.ts` | Módulo principal: bootstrap de servicios (NestJS-style) |
| `ollama-mcp-server/src/auth/auth.service.ts` | Validación de API Key, gestión de IPs |
| `ollama-mcp-server/src/ollama/ollama.service.ts` | (713 líneas) Comunicación con Ollama, métricas GPU, rate limiting, sesiones |
| `ollama-mcp-server/src/ollama/ollama.tools.ts` | Registro de MCP Tools (list_models, chat, pull, etc.) |
| `ollama-mcp-server/src/session/session.manager.ts` | Gestión de sesiones de chat |
| `ollama-mcp-server/src/memory/database.service.ts` | SQLite initialization |
| `ollama-mcp-server/src/memory/memory.service.ts` | Memoria conversacional con resumen |
| `ollama-mcp-server/src/memory/memory.tools.ts` | MCP Tools de memoria |

## Rutas de API
| Ruta | Método | Auth | Propósito |
|------|--------|------|-----------|
| `/v1/models` | GET | Sí | Listar modelos (OpenAI format) |
| `/v1/chat/completions` | POST | Sí | Chat streaming/blocking (OpenAI format) |
| `/api/models` | GET | Sí | Listar modelos (formato completo) |
| `/api/status` | GET | Sí | Estado completo del servidor |
| `/api/status/fast` | GET | Sí | Estado ligero para polling |
| `/api/engine-stats` | GET | Sí | Estadísticas del motor Ollama |
| `/api/hardware` | GET | Sí | Métricas de hardware (VRAM, GPU) |
| `/api/config` | GET | No | Configuración pública |
| `/api/logs` | GET | Sí | Logs de acceso |
| `/api/ollama/pull` | POST | Sí | Descargar modelo |
| `/api/ollama/delete` | POST | Sí | Eliminar modelo |
| `/api/ollama/unload` | POST | Sí | Liberar VRAM |
| `/api/ollama/stop-ollama` | POST | Sí | Detener contenedor Ollama |
| `/api/ollama/start-ollama` | POST | Sí | Iniciar contenedor Ollama |
| `/api/blacklist` | POST | Sí | Añadir IP a blacklist |
| `/api/memory` | GET/POST | Sí | Memoria conversacional |
| `/sse` | GET | No | MCP Server SSE endpoint |
| `/messages` | POST | No | MCP Server messages endpoint |

## Reglas
1. **Auth en todas las rutas**: Toda ruta `/api/*` y `/v1/*` debe pasar por `authMiddleware`. Excepciones: `/sse`, `/messages`, `/api/config`.
2. **Streaming SSE**: `/v1/chat/completions` con `stream:true` debe usar `text/event-stream` con formato OpenAI compatible (`data: {...}\n\n`).
3. **No bloqueante**: Las consultas a `nvidia-smi` deben ser asíncronas y cacheadas. No bloquear el Event Loop.
4. **Dockerode**: Usar `dockerode` para cualquier interacción con contenedores (nunca comandos shell directos).
5. **MCP Tools**: Registrar toda tool nueva en `ollama.tools.ts` con `ListToolsRequestSchema` + `CallToolRequestSchema`.
6. **Rate Limiting**: 15k requests por 15 min. Saltar para IPs locales o API Key válida.
7. **CORS**: Permitir orígenes en desarrollo, restringir en producción.

## Workflows

### Agregar una nueva ruta API
```ts
app.get("/api/nueva-ruta", authMiddleware, async (req, res) => {
  try {
    const data = await appModule.ollamaService.getData();
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```
Si es ruta pública, omitir `authMiddleware`. Verificar que emita eventos Socket.IO si aplica.

### Agregar una nueva MCP Tool
1. Seguir el skill `add-mcp-tool`
2. Definir en `ollama.tools.ts`: añadir al `MCP_TOOL_CATALOG`, implementar schema en `ListToolsRequestSchema`, implementar handler en `CallToolRequestSchema`
3. Manejar errores con `{ isError: true, content: [{ type: "text", text: error }] }`

### Build
```bash
cd ollama-mcp-server && npm run build
```
