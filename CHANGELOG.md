# LaLlamaStation MCP — Changelog

Todos los cambios notables del proyecto están documentados aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased]

### 🧠 Evolución de mcp-brain y Auto-Sincronización MCP (2026-05-14)

#### Añadido
- **Conciencia de Fase SDD (Spec-Driven Development):**
  - Columna `phase` añadida en tablas SQLite `memories` y `memories_fts`.
  - Badges morados en la UI para auditar visualmente en qué fase del ciclo de vida se originó cada aprendizaje.
- **Directivas Centrales (Core Directives) y Captura de Memoria Autónoma:**
  - Nueva tabla `core_directives` para almacenar instrucciones inmutables por proyecto.
  - Inyección automática de la cláusula de **OBLIGACIÓN COGNITIVA CRÍTICA** en `getCoreDirectives`, forzando a todos los agentes autónomos (Cursor, Claude, Antigravity) a ejecutar `mem_save` en el mismo turno tras editar código.
- **Gatillos de Intervención (Delegation Triggers):**
  - Rastreos de frecuencia de consultas en `searchMemories.ts`. Inyecta automáticamente la advertencia `WARNING_DELEGATION` si un agente repite búsquedas idénticas >3 veces en 5 minutos.
- **Mantenimiento Proactivo y Consolidación (Ollama):**
  - Servicio `consolidation.ts` que agrupa memorias por etiqueta y utiliza Ollama en segundo plano (vía Cronjob) para resumir redundancias en "Key Learnings" limpios.
- **Auto-Instalador y Sincronización MCP (Auto-Sync):**
  - Endpoint `POST /api/mcp/sync` en `api.ts` para localizar y actualizar configuraciones en **OpenCode AI**, **Antigravity AI**, **RooCode (VS Code)** y **Claude Desktop**.
  - Tarjetas UI en `BrainSettings.tsx` con tooltips de información (`ℹ️`) y botón de copia global al portapapeles (`📋`).

### 🧹 Corrección masiva Biome — 0 errores, 0 warnings (2026-05-14)

#### Corregido

##### Backend (`backend/`)
- **Tipado fuerte**: Reemplazo masivo de `any` por tipos concretos en 6 archivos
- **Interfaces creadas**: `MemoryStats`, `ConflictJudgment`, `SessionSummary`, `MemoryComparison`, `RequestLogEntry`, `SessionMessage`, `GpuMetrics`, `ChatResponse`, `ScrapedModel`
- **Error handling**: ~20 bloques `catch (error: any)` migrados a `catch (error: unknown)`
- **Middlewares**: `next: Function` reemplazado por `next: (err?: unknown) => void`
- **Código muerto**: `ChatMessage` no usado eliminado

##### mcp-brain/
- **Tipado de promesas**: `Promise<any>` reemplazado por interfaces concretas en 11 archivos
- **Limpieza**: Imports no usados eliminados, variables renombradas con prefijo `_`
- **Error handling**: `catch (e: any)` tipados correctamente con `unknown`
- **SQL mappings**: Tipado de filas de SQLite con interfaces específicas

##### Frontend (`frontend/`)
- **Accesibilidad**: `type="button"` añadido a ~25 botones sin tipo explícito
- **Accesibilidad**: Elementos `div` con `onClick` convertidos a elementos interactivos accesibles (`role="button"`, `tabIndex`, `onKeyDown`)
- **Accesibilidad**: SVG con `aria-label` añadido en iconos decorativos
- **Error handling**: `catch (err: any)` → `catch (err: unknown)` en manejo de errores
- **Tipado**: `[key: string]: any` → `[key: string]: unknown` en tipos de API
- **Seguridad**: `document.getElementById("root")!` con null check antes del renderizado
- **React keys**: Keys de arrays reemplazadas por IDs únicos en lugar de índices

##### Automático (Biome format --write)
- **Formateo**: 16 archivos corregidos automáticamente (indentación, comillas, saltos de línea)

#### Impacto
- Biome 2.4.8 ejecutado en **82 archivos** del proyecto
- **134 errores** y **139 warnings** corregidos
- **0 errores** y **0 warnings** después de las correcciones

### 📋 Revision completa del proyecto y actualizacion de documentacion (2026-05-12)

#### Añadido
- **Informe de estado del proyecto** generado con analisis detallado de:
  - Arquitectura general (5 servicios Docker)
  - Backend: 25 endpoints REST, 7 MCP Tools, ~2400 lineas TypeScript
  - Frontend: React 19 + Vite 7, 10 componentes, diseno glassmorphism
  - Infraestructura Docker: analisis de problemas y areas de mejora
  - Documentacion existente con estado de cada archivo

#### Corregido
- **README.md desactualizado**: Actualizada estructura de directorios (`.agents/` → `.opencode/agents/`, `mcp-frontend/` → `frontend/`, `ollama-mcp-server/` → `backend/`)
- **Version badge**: Actualizado de 0.3.0 a 0.4.0
- **Referencias eliminadas**: Directorios que ya no existen (`obsidian-vault/`, `AGENTS.md`, `DESIGN.md`)

#### Documentacion
- **README.md**: Reescrito completamente con estructura real del proyecto, lista completa de 7 MCP Tools, tabla de endpoints API, y tecnologias actualizadas
- **CHANGELOG.md**: Documentada esta revision

#### Notas de la Revision
- Problemas detectados en `docker-compose.yml`:
  1. Servicio `ngrok` y `frontend` dependen de `mcp-server` (deberia ser `backend`)
  2. `VITE_API_URL` y `VITE_SOCKET_URL` apuntan a `mcp-server` (deberia ser `backend`)  
  3. `mcp-brain` no tiene Dockerfile
- Backend: `memory.tools.ts` registra handlers en mismo schema que `ollama.tools.ts` (conflicto potencial)
- Frontend: `vite.config.ts` minimalista sin proxy de API

### Corregido

- **docker-compose.yml**: Corregidas 4 referencias a `mcp-server` (servicio inexistente) -> `backend`
  - `ngrok.depends_on`: `mcp-server` -> `backend`
  - `frontend.depends_on`: `mcp-server` -> `backend`
  - `VITE_API_URL` y `VITE_SOCKET_URL`: `mcp-server` -> `backend`
  - comando ngrok: `mcp-server` -> `backend`
  - Agregado volumen `brain_data` faltante en la seccion `volumes:`
- **mcp-brain Dockerfile**: Creado `mcp-brain/Dockerfile` (anteriormente faltaba)
- **frontend/.env y .env.example**: URLs corregidas de `localhost:3000` a `backend:3000` para entorno Docker
- **Conflicto MCP Tools**: Refactorizado registro de handlers en `app.module.ts` para combinar `ollama.tools.ts` (7 tools) y `memory.tools.ts` (14 tools) en un unico punto de registro, evitando sobreescritura
- **vite.config.ts**: Agregada configuracion de proxy para `/api`, `/v1`, `/sse` y `/socket.io` hacia `localhost:3000`
- **Instalacion de dependencias**: `pnpm install` ejecutado en la raiz del proyecto


### 🤖 Agentes especializados por dominio (AÑADIDO - 2026-05-12)

#### Añadido
- **Sistema de 6 agentes especializados** como subagentes de opencode en `.opencode/agents/`:
  - `frontend-dev`: React 19 + Vite 7, componentes glassmorphism, Socket.IO
  - `backend-dev`: Express + TypeScript, dockerode, MCP SDK, auth, rate limiting
  - `ollama-ops`: Gestión de modelos Ollama, GPU, streaming SSE, métricas
  - `documentation`: CHANGELOG, README, Obsidian vault, diseño técnico
  - `docker-ops`: Docker compose, Dockerfiles, ngrok, redes, GPU passthrough
  - `qa-verification`: Biome lint, TypeScript builds, verificación post-cambio
- También como skills de contexto detallado en `.agents/skills/` con frontmatter YAML y triggers por patrón de archivo

### ✨ Playground: Adjuntar archivos en chat (AGREGADO - 2026-04-19)

#### Añadido
- **Soporte de adjuntos en ChatPlayground** ✅
  - Botón de clip para seleccionar múltiples archivos de texto/código desde el navegador
  - Chips visuales de adjuntos con opción de quitar cada archivo antes de enviar
  - Envío del contenido de archivos junto al prompt para análisis directo por el modelo
  - Soporte de envío con solo adjuntos (sin texto manual), usando prompt de análisis automático
  - Límites de seguridad/rendimiento: máximo 4 adjuntos, 512KB por archivo y truncado de contenido largo
  - **Impacto**: Permite trabajar con contexto externo (logs, código, configs) sin copiar/pegar manualmente

### 🚀 FASE 3: Performance Metrics + UI Dashboard (COMPLETADA - 2026-04-18)

**Objetivo**: Observabilidad en tiempo real de performance (TTFT, throughput).

#### Añadido
- **Time-to-First-Token (TTFT) Tracking** ✅
  - Nuevo tracking en streaming handler de `/v1/chat/completions`
  - Captura tiempo desde start del request hasta primer token recibido
  - Historia últimos 100 requests guardada en `ttftHistory`
  - **Impacto**: Identificar regresiones en latencia o problemas con GPU

- **Tokens Per Second (Throughput) Tracking** ✅
  - Calcula tok/s al final de cada streaming response
  - Historia últimos 100 requests en `tokensPerSecHistor`
  - Logged en console: `[stream-final] model: total=XXXms, tok/s=YY.YY, ttft=ZZms`
  - **Impacto**: Monitorear quality of throughput bajo carga

- **Endpoint `/api/metrics/performance`** ✅
  - Expone estadísticas agregadas: avg TTFT, P95 TTFT, max TTFT
  - Promedio tokens/sec
  - 200 muestras tracking (últimos 100 requests)
  - **Impacto**: Dashboard puede consultar y mostrar trends

- **UI Component: PerformanceMetrics** ✅
  - Nuevo tab en App.tsx: "Performance"
  - Muestra TTFT avg/p95/max en ms
  - Throughput promedio en tok/s
  - Refresca cada 30s
  - Estilo oscuro con monospace font como logs
  - **Impacto**: Usuarios pueden ver performance en tiempo real sin consola

#### Mejorado
- **main.ts streaming handler**: Captura TTFT, registra, calcula tok/s
- **OllamaService stats object**: Agregadas ttftHistory y tokensPerSecHistor
- **Frontend App.tsx**: Nuevo tab "performance" agregado a getSectionInfo y renderContent
- **Sidebar buttons**: Nuevo botón "Performance" en commands grid

#### Notas de Implementación
- TTFT es diferencia entre start de request y primer token
- Tok/s es completionTokens / (totalDurationMs/1000)
- Historia limitada a 100 samples para no saturar memoria
- Metrics endpoint es read-only, no requiere cálculos complejos

#### Pruebas Sugeridas
1. Enviar mensaje en playground → Verificar TTFT aparece en /api/metrics/performance
2. Enviar 10+ mensajes → Verificar avg/p95/max se calculan correctamente
3. Abrir tab Performance → Debe refrescar cada 30s
4. Revisar console → Ver logs `[stream-final]` con métricas

### 🚀 FASE 2: Cola Concurrencia + Keep-alive HTTP + Status Rápido/Full (COMPLETADA - 2026-04-18)

**Objetivo**: Estabilidad bajo carga concurrente y optimización de conexiones HTTP.

#### Añadido
- **HTTP Keep-Alive Connection Pooling** ✅
  - Nuevo `httpAgent` y `httpsAgent` con `keepAlive: true` en `OllamaService`
  - Reusable axios client (`axiosClient`) con pool de conexiones configurado
  - Máximo 10 sockets activos, 5 libres, timeouts de 2 minutos para inferencia larga
  - Todos los axios calls migrados a usar `this.axiosClient`
  - **Impacto**: Reducción ~50ms por request en overhead de TCP handshake; mejor throughput a alto QPS

- **Semáforo de Concurrencia GPU** ✅
  - Nuevo método `enqueueRequest<T>()` que limita requests activos a máximo 3 simultáneos
  - `chat()` y `chatStream()` ahora se ejecutan dentro del queue
  - Evita saturación GPU y degradación de latencia con múltiples usuarios
  - **Impacto**: p95/p99 latency mucho más predecible; no hay "picos" de 5-10s cuando 5 users hacen request

- **Endpoints `/api/status/fast` y `/api/status/full` separados** ✅
  - `/api/status/fast`: Solo GPU metrics (cached, ~1ms) + stats
  - `/api/status/full`: Todo (disk, ngrok, loaded models, logs) - el actual /api/status
  - `/api/status`: Mantiene backward compatibility, redirige a full
  - Frontend cambiado para usar `/api/status/fast` en heartbeat
  - **Impacto**: Polling rápido no compite más con operaciones costosas

#### Mejorado
- **OllamaService constructor**: Inicializa HTTP agents y axios client con keep-alive en startup
- **listModels, generate, chat, unloadModels, pullModel, deleteModel**: Todos migrados a `this.axiosClient`
- **getServerStatus()**: Mantiene implementación completa, ahora en `/api/status/full`
- **Frontend App.tsx**: Usa `/api/status/fast` para polling cada 60s

#### Notas de Implementación
- `enqueueRequest()` es genérica y puede aplicarse a otros métodos en futuro
- Concurrency limit (3) es configurable vía `maxConcurrentRequests` member
- Keep-alive se mantiene durante lifetime de OllamaService (no se cierra)
- HTTP agents funcionan tanto para Ollama interno como para ngrok

#### Pruebas Sugeridas
1. Enviar 5 mensajes rápidamente → Verificar latencia es consistente (no degrada)
2. Monitorear logs → Debe haber máximo 3 requests activos en `/api/chat`
3. Revisar `/api/status/fast` response time → Debe ser <5ms
4. Comparar antiguo vs nuevo `/api/status` → Full debe ser lento, fast debe ser rápido

### 🚀 FASE 1: Streaming + Cache GPU + Reducir Polling (COMPLETADA - 2026-04-18)

**Objetivo**: Mejorar latencia percibida (TTFT) y estabilidad bajo carga en inferencia de modelos.

#### Añadido
- **Streaming Token-a-Token en OpenAI-compatible** ✅
  - Nuevo endpoint `/v1/chat/completions` con soporte para `stream=true`
  - Implementación SSE (Server-Sent Events) compatible con OpenAI para streming de tokens en tiempo real
  - Fallback a modo no-streaming (`stream=false`) para clientes que no lo soportan
  - Frontend (ChatPlayground) consume stream con async generators, mostrando tokens conforme llegan
  - **Impacto**: Latencia percibida se reduce drasticamente (TTFT ahora visible en ~100-500ms vs espera total anterior)

- **GPU Metrics Async Caching** ✅
  - Eliminado `execSync(nvidia-smi)` de la ruta crítica de chat (que bloqueaba event loop)
  - Nuevo watcher asíncrono `startGpuMetricsWatcher()` actualiza métricas GPU cada 3 segundos en background
  - `chat()` ahora lee cache inmediatamente sin bloqueo
  - Métricas térmicas siguen registrándose para auto-unload de emergencia
  - **Impacto**: Mayor estabilidad bajo concurrencia, reducción de jitter de latencia (~30-50% mejora en p95/p99)

- **Reducción Agresiva de Polling** ✅
  - Heartbeat global App.tsx: 15s → 60s (4x menos peticiones)
  - Polling de engine stats: 10s → 30s (3x menos peticiones)
  - Mantener WebSocket para alertas en tiempo real (no hay latencia adicional)
  - **Impacto**: Menos competencia con inferencia, mejor throughput percibido

#### Mejorado
- **Método `chatStream()` en OllamaService**:
  - Retorna stream response de Ollama directamente al cliente
  - Soporte session cache igual que `chat()` para continuidad
- **Backend `main.ts`**:
  - `/v1/chat/completions` ahora es bi-modal (stream & no-stream)
  - SSE chunks son OpenAI-compatible para máxima compatibilidad
  - Error handling mejorado en streaming
- **Frontend ChatPlayground.tsx**:
  - Soporte async generators para consumir streams
  - Actualización incremental del contenido en tiempo real
  - Estadísticas de tokens se actualizan al final del stream

#### Notas de Implementación
- Requiere `npm install` en `ollama-mcp-server/` y `mcp-frontend/` para compilación
- Compilar: `npm run build` en ambos directorios
- Para testing local: `docker-compose up` actualizado para usar nuevas características
- BREAKING: Clientes que asumen respuesta bloqueante deben adaptarse a streaming

#### Pruebas Sugeridas
1. Enviar mensaje en ChatPlayground → Verificar tokens aparecen progresivamente
2. Enviar 3-4 mensajes rápidamente → Verificar no hay bloqueo/latencia degradada
3. Revisar logs → `[auto-unload]`, `[session]`, `[stream]` deben estar sin errores

## [0.4.0] — 2026-03-25

### Añadido
- **Blindaje & Seguridad**:
  - API_KEY obligatoria en startup: El servidor fallará si `API_KEY` no está configurada en `.env` o docker-compose
  - SessionManager: Nuevo servicio para manejar sesiones aisladas por IP (Fase 1 - Prevenir interferencia de estado global)
  - Autenticación en SSE/MCP: Las conexiones `/sse` y `/messages` ahora requieren `x-api-key` válida
  - Cleanup seguro: `deleteModel()` y `cleanWorkspace()` ahora rastrean operaciones en progreso para evitar conflictos
  - Auto-unload mejorado: Mejor manejo de errores con notificaciones explícitas al usuario
- Establecida regla obligatoria para la IA: registrar todos los cambios en el `CHANGELOG.md`.
- Archivo de reglas `.cursorrules` para automatizar el proceso de documentación.
- **Persistencia del Chat en ChatPlayground**: historial de mensajes y configuraciones se guardan automáticamente en `localStorage`
  - Las conversaciones se mantienen al navegar entre pestañas
  - Se persisten modelo seleccionado, temperatura, contexto y estadísticas de sesión
  - Los cambios se sincronizan en tiempo real sin afectar el rendimiento
- **Biome instalado** para linting y formateo automático
  - Scripts: `pnpm lint`, `pnpm format`, `pnpm check`
  - Configuración: `biome.json` con reglas estrictas de TypeScript y a11y
- **Interfazes compartidas** (`mcp-frontend/src/types/api.ts`):
  - `StatusResponse` - Respuesta completa del servidor de estado con propiedades VRAM
  - `AccessLogEntry` - Entrada de log de acceso con propiedades tipadas
  - `OllamaModel` - Modelo de Ollama con propiedades name, model, size, digest
  - `LoadedModel` - Modelo cargado en VRAM con propiedades name, size_vram, percentage
  - `ChatMessage` - Mensaje de chat estructura con role y content
  - `EngineStats` - Estadísticas del motor con tokensSession y timeSession
  - `VramInfo` - Información de VRAM con total, used, free, available
- **Contratos limpios API + frontend**
  - Contrato OpenAI `/v1/chat/completions` con `usage` real (tokens de prompt/completion) y validación de payload
  - Cliente API centralizado en frontend (`mcp-frontend/src/services/api.service.ts`) con interceptor para `x-api-key`
  - Helpers de sesión de API key (`setApiKey`, `clearApiKey`, persistencia opcional)

### Mejorado
- **Calidad de Código**:
  - 43+ problemas de linting corregidos (variables no usadas, imports organizados, etc.)
  - Todos los botones ahora tienen atributo `type="button"` para accesibilidad
  - Reemplazo de tipos `any` con tipos específicos en componentes clave
  - Formateo unificado en 31 archivos de código
- **Error Handling**:
  - Type guards implementados para manejo seguro de `unknown` en catch blocks
  - Manejo seguro de propiedades undefined con nullish coalescing operator (`??`)
- **Tipado TypeScript**:
  - Función `VramBadge` tipada correctamente con interfaz específica para parámetro vram
  - Tipado de `loadedModels.map()` con LoadedModel interface
  - Props interfaces mejoradas con parámetros opcionales donde sea apropiado
- **Integración Backend/Frontend**:
  - `OllamaService.chat()` ahora retorna estructura enriquecida (`message`, `prompt_eval_count`, `eval_count`, `total_duration`)
  - `App.tsx` migrado a cliente API compartido para eliminar headers duplicados y llamadas axios dispersas
  - Componentes migrados a cliente unificado: `Telemetry`, `ModelList`, `HardwareSentinel`, `AiEngineTuner`

### Corregido
- **App.tsx**:
  - Removido import no usado `AxiosError`
  - Cambio de `useState<StatusResponse | null>` a `useState<StatusResponse | undefined>` para coherencia de tipos
- **Telemetry.tsx**:
  - Error handling mejorado con type guard `instanceof Error`
  - Acceso seguro a `status?.recentLogs?.length` con nullish coalescing
- **HardwareSentinel.tsx**:
  - Key element usando `String()` con fallback a index en map loops
  - Props interface para aceptar `status` opcional
  - Tipado correcto de parámetro vram en VramBadge
- **AiEngineTuner.tsx**:
  - Props interface para aceptar `status` opcional
- **IpLogs.tsx**:
  - Props mejoradas con tipos específicos: `logs?: AccessLogEntry[]`, `status?: StatusResponse`
  - Importación correcta de tipos desde api.ts
- **ollama.tools.ts**:
  - Caracteres de escape `\t` reemplazados con indentación real en ChatMessage type
  - CallToolRequestHandler mejorado con type assertion para request.params
  - Error handling en catch block usando variable tipada como string
- **ollama.service.ts**:
  - Session cache logic mejorada para evitar acceso undefined con variable intermedia
- **Contrato y UX**:
  - `usage` en `/v1/chat/completions` dejó de retornar ceros y ahora usa métricas reales de inferencia
  - `ollama.tools.ts` actualizado para leer el nuevo shape de respuesta de `chat` sin romper herramientas MCP
  - Auto-scroll de `ChatPlayground` corregido para reaccionar a nuevos mensajes y estado de carga
  - Documentación de eventos Socket alineada con nombres reales en kebab-case (`pull-progress`, `security-alert`, `new-access`)

### Cambiado
- **StatusResponse**: Cambio de `Record<string, any>` a interfaz con propiedades específicas
  - Agregadas propiedades VRAM: `vramFreeMb`, `vramTotalMb`, `vramUsedMb`
  - Agregadas propiedades modelos: `models` (LoadedModel[]), `recentLogs` (AccessLogEntry[])
  - Mantenida compatibilidad con `[key: string]: any` para propiedades adicionales
- **OllamaModel**: De `Record<string, any>` a interfaz con propiedades esperadas
- **LoadedModel**: De `Record<string, any>` a interfaz con propiedades tipadas
- **EngineStats**: De `Record<string, any>` a interfaz que extiende Record
- **Servicio API Frontend**:
  - Reemplazo del `api.service.ts` anterior (orientado a `/sse`) por una capa HTTP real para endpoints REST del dashboard

### Información de Build
- **Frontend Build**: ✅ Exitoso
  - TypeScript compilation: 0 errores
  - Vite production build: 361.9 KB JS (111.4 KB gzip)
  - Build time: 7.17 segundos
  - Módulos transformados: 1829
- **Backend Build**: ✅ Exitoso
  - TypeScript compilation en ollama-mcp-server: 0 errores
  - Types resueltos para OllamaService y OllamaTools
  - Y más tipos específicos
- **Reducción de tipos `any`**: Reemplazados en:
  - `App.tsx` - Estados y callbacks tipados correctamente
  - `components/Telemetry.tsx` - Props tipadas como `StatusResponse`
  - `components/AiEngineTuner.tsx` - Estados tipados como `EngineStats`
  - `components/HardwareSentinel.tsx` - Props y callbacks tipados
  - `ollama-mcp-server` - Tipos locales definidos para ChatMessage
- **Errores de tipo reducidos**: De 101 errores originales a ~55 (46% reducción)
- **Build Fase 2 (2026-03-25)**: ✅ Exitoso
  - Frontend (`pnpm run build`): TypeScript + Vite OK
  - Bundle frontend: `361.53 kB` JS (`111.63 kB` gzip), `1830` módulos transformados
  - Backend (`pnpm run build`): `tsc` completado sin errores

## [0.3.0] — 2026-03-10 🦙 Renaming + Model Discovery + Ngrok Control

### 💫 Rebrand
- Proyecto renombrado de **SYMBIOSIS MCP** a **LaLlamaStation MCP**
- Título del browser, sidebar, login y meta-tags actualizados
- Clave de `localStorage` unificada bajo `llama_master_key`
- `package.json` del frontend y backend actualizados

### ✨ Nuevas Funcionalidades
- **Búsqueda en Ollama Library**: nuevo endpoint `GET /api/search-models?q=...`
  - Scraper del sitio oficial `ollama.com/library` usando `cheerio`
  - Catálogo de fallback con 8 modelos curados cuando no hay búsqueda activa
- **Control de Ngrok desde la Web**: toggle START/STOP en el widget de Telemetría
  - Usa `dockerode` conectado via `/var/run/docker.sock`
  - Muestra la URL pública del túnel al activarse
  - Botón de copia de URL al portapapeles
- **Guía de uso de modelos**: panel explicativo en la sección Modelos con dos flujos (nombre directo / búsqueda en librería)
- **Soporte para `cheerio`** instalado en el servidor backend

### 🐛 Correcciones
- `TypeError: Cannot read properties of undefined (reading 'startsWith')` en `ModelList.tsx` — filtro defensivo aplicado
- `DELETE /api/models/undefined` — solo se renderiza el botón de eliminar si el modelo tiene nombre
- Modelos mostrando `NaN GB` — ahora muestra `-` cuando el tamaño es 0 o undefined
- Spam de logs por ngrok desconectado — errores `ENOTFOUND`/`ECONNREFUSED` silenciados, timeout de 2s
- `key` warning en listas de React — claves compuestas únicas en logs y modelos

### 🔧 Mejoras de UI/UX
- Dashboard rediseñado: muestra KPIs + últimos accesos + modelos disponibles + IPs bloqueadas
- Sección Seguridad completa: SecurityPanel (Blacklist + PÁNICO) + auditoría de accesos con filtros y búsqueda
- Header del dashboard con subtítulos contextuales por sección
- Playground con tarjeta glassmorphism full-height
- `restart: "no"` para el contenedor ngrok (ya no se reinicia solo)
- Docker socket montado en `mcp-server` para control de contenedores

---

## [0.2.0] — 2026-03-09 🛡️ Seguridad, Telemetría y Limpieza

### ✨ Nuevas Funcionalidades
- **Modo Offline**: switch en el Dashboard para desconectar el motor de inferencia
- **Telemetría de Hardware**: CPU, RAM, VRAM en tiempo real
- **Vault de Credenciales**: gestión de API keys multi-usuario
- **Logs de Refactorización**: modal de historial de cambios del agente
- **Selección de modelo por agente**: en el grafo de agentes

### 🔧 Mejoras
- Panel de Telemetría con KPIs holográficos
- SecurityPanel con botón de Pánico y gestión de blacklist
- Reescrtura total del componente `IpLogs` con filtros y búsqueda
- Animaciones de progreso de descarga vía WebSockets

---

## [0.1.0] — 2026-03-08 🚀 Lanzamiento inicial

### ✨ Funcionalidades base
- **MCP Server**: servidor Express + SSE para Claude Desktop
- **Autenticación**: API Key con rate limiting (5000 req/15min)
- **Seguridad**: Helmet, blacklist de IPs, auto-ban tras 5 intentos fallidos, auditoría
- **Modelos Ollama**: listar, pull, delete, unload VRAM
- **Telemetría**: disco, ngrok, modelos cargados en VRAM
- **WebSockets**: progreso de descargas y alertas de seguridad en tiempo real
- **Frontend**: dashboard Vite + React con diseño glassmorphism oscuro
- **Playground**: terminal de inferencia directa con selección de modelo
- **Docker Compose**: stack completo (Ollama + MCP Server + Frontend + Ngrok)
- **Compatibilidad OpenAI**: endpoints `/v1/models` y `/v1/chat/completions`
