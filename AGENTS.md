# 🤖 Manual Operativo para Agentes de IA (AGENTS.md)

Este documento contiene el contexto vital y las reglas de arquitectura para cualquier sistema de IA (Cursor, Copilot, Gemini, etc.) que asista en la escritura de código, refactorización o debugging del proyecto **LaLlamaStation MCP**.

## 1. Naturaleza del Proyecto
LaLlamaStation **NO** es un LLM. Es un **Proxy Inverso, Panel de Control, y Servidor MCP** (Model Context Protocol) construido alrededor del motor de `ollama/ollama`.
El sistema intercepta tráfico hacia Ollama para:
1. Agregar seguridad (API Keys, Rate Limiting, IP Banning).
2. Capturar telemetría (TTFT, Tokens/sec, consumo eléctrico).
3. Exponer una interfaz web de control de infraestructura (Start/Stop containers, Ngrok tunnel).

## 2. Arquitectura de Componentes
*   `mcp-ollama-motor`: El runtime puro (C++ / Go). Ejecuta los modelos. Usa GPU intensivamente.
*   `mcp-server`: Backend en Node.js (Express + TypeScript).
    *   **NO** hace inferencia de IA.
    *   **SÍ** se comunica con el socket de Docker (`/var/run/docker.sock`) usando `dockerode`.
    *   **SÍ** extrae métricas de hardware ejecutando comandos shell nativos (`nvidia-smi`) internamente, por lo que **requiere mapeo de GPU** (`deploy` en Docker) aunque sea solo para lectura de sensores.
*   `mcp-frontend`: SPA en React (Vite) conectada vía REST y Socket.IO al `mcp-server`.
*   `mcp-ngrok-tunnel`: Túnel seguro activado bajo demanda por el backend usando Docker API.

## 3. Reglas Estrictas para Agentes

### Backend (`mcp-server`)
*   **Aislamiento de Docker:** Cualquier control sobre contenedores externos debe hacerse mediante la librería `dockerode`, manejando correctamente los estados (Running, Stopped).
*   **Métricas No-Bloqueantes:** Las consultas de hardware (ej. `nvidia-smi`) deben ser asíncronas y cacheadas para no bloquear el Event Loop de Node.js durante los streams largos de chat.
*   **Compatibilidad OpenAI:** Las rutas `/v1/chat/completions` deben mantener compatibilidad binaria estricta con los clientes de OpenAI (usando SSE `text/event-stream` cuando `stream: true`).
*   **Seguridad:** Toda ruta de la API (`/api/*`) y de OpenAI (`/v1/*`) debe pasar por el `authMiddleware`, excepto los assets estáticos.

### Frontend (`mcp-frontend`)
*   **Consumo de Estado:** Todo el estado en tiempo real (métrica TTFT, uso de VRAM, progreso de descarga de modelos) debe consumirse vía Socket.IO (`new-access`, `security-alert`, `pull-progress`), no mediante *long-polling*.
*   **Estética:** Se requiere mantener un estilo "Premium" (Glassmorphism, Dark Mode, UI reactiva).

## 4. MCP (Model Context Protocol)
El backend actúa como un Servidor MCP mediante SSE (`/sse` y `/messages`). Si se agregan *Tools* (Herramientas), deben registrarse en el `Server` de `@modelcontextprotocol/sdk/server/index.js` y manejar su respectivo *middleware* de autorización.
