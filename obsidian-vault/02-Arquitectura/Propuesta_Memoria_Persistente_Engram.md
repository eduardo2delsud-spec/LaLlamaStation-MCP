# 🧠 Propuesta Técnica: Sistema de Memoria Persistente (Estilo Engram) en LaLlamaStation

Este documento detalla la viabilidad, el diseño y la arquitectura para dotar a **LaLlamaStation MCP** de un sistema de **memoria persistente a largo plazo** para agentes de IA, potenciando la plataforma de un simple panel de control a un **Middleware de Orquestación y Memoria Cognitiva Universal**.

---

## 1. Visión General: ¿Por qué en LaLlamaStation?

Los agentes de IA (como Claude Code, Cursor, OpenCode, Antigravity o el propio Gemini) olvidan el contexto de desarrollo al cerrar la sesión o reiniciar el hilo de chat, con esta propuesta de memoria persistente se resolvería este problema exponiendo un servidor MCP con herramientas de persistencia y búsqueda en SQLite y SQL.

Al integrar este concepto en **LaLlamaStation**, obtenemos beneficios únicos que un binario aislado no puede ofrecer:

1. **Servidor MCP Universal**: LaLlamaStation no solo controlará a Ollama, sino que actuará como el "Cerebro" central. **Cualquier agente (OpenCode, Cursor, etc.)** puede conectarse al puerto MCP de LaLlamaStation y usar las herramientas de memoria, independientemente de si usan Ollama o una API externa para generar código.
2. **Superpoder Semántico (Ollama Embeddings)**: Mientras que algunas implementaciones de memoria persistente para agentes de IA dependen exclusivamente de búsqueda léxica (FTS5), LaLlamaStation puede generar **vectores de embeddings** usando modelos locales en Ollama (ej. `nomic-embed-text`) para ofrecer búsquedas semánticas híbridas ultra-precisas.
3. **Consola Visual "Cerebro" (Frontend)**: Interfaz premium con glassmorphism en el dashboard de React, permitiendo al usuario auditar, buscar, editar, borrar y categorizar los recuerdos de todos sus agentes de manera gráfica.

---

## 2. Arquitectura de Componentes

El sistema se compone de tres capas perfectamente integradas en el ecosistema actual de LaLlamaStation:

```mermaid
graph TD
    subgraph Clientes_MCP [Agentes MCP (OpenCode, Cursor, Claude Code)]
        A[Llamadas MCP (stdio o SSE)]
    end

    subgraph Backend [mcp-server (Node.js + TS)]
        B[MCP Server Router] -->|Ollama Tools| C[Ollama Service]
        B -->|Brain Tools| D[Memory Service]
        D -->|SQL & FTS5| E[(SQLite DB: ./brain)]
        D -->|Genera Vectors| C
    end

    subgraph Frontend [mcp-frontend (React)]
        F[Dashboard Web] -->|Socket.IO| G[Real-time Events]
        F -->|REST API| D
    end

    C -->|Inferencia / Embeddings| H[(Ollama Engine)]
```

### A. Capa de Datos (SQLite + FTS5 en `./brain`)
* **Motor**: Usaremos `sqlite3` combinado con `sqlite` (wrapper de promesas). Es la opción más robusta y compatible para Node.js/Docker, evitando problemas de compilación de binarios C++ en diferentes sistemas operativos.
* **Ubicación de la BD**: Se montará un volumen en la ruta `./brain/lallama-memory.db`, asegurando que los recuerdos persistan al reiniciar o reconstruir los contenedores Docker.
* **FTS5**: Activación de tabla virtual FTS5 para indexar y buscar rápidamente de forma léxica.

### B. Capa de Inferencia Semántica (Ollama Vector Embeddings)
* Cada vez que un agente llama a `mem_save`, el `MemoryService` extrae el contenido clave y hace una llamada interna asíncrona a Ollama para generar embeddings vectoriales del recuerdo.
* **Cálculo de Similitud**: Se realiza una comparación de distancia coseno en memoria (Node.js) al buscar. Es instantáneo y evita depender de bases de datos vectoriales pesadas.

---

## 3. Catálogo de Herramientas MCP

| Herramienta | Propósito |
|---|---|
| `mem_save` | Guarda un nuevo recuerdo (decisión, bugfix, arquitectura, regla). |
| `mem_update` | Actualiza un recuerdo existente. |
| `mem_delete` | Elimina un recuerdo. |
| `mem_search` | Busca recuerdos usando FTS5 o similitud de vectores de Ollama. |
| `mem_context` | Recupera recuerdos recientes para inyectar contexto automático. |
| `mem_timeline` | Obtiene una vista cronológica de los hitos del proyecto. |
| `mem_session_start` | Inicia una sesión lógica de trabajo para agrupar recuerdos. |
| `mem_session_end` | Finaliza la sesión y guarda un resumen estructurado. |
| `mem_stats` | Devuelve métricas (número de recuerdos, distribución de tipos). |
| `mem_suggest_tags` | Analiza el texto para proponer etiquetas adecuadas. |

### Las 9 Herramientas Restantes 
Para igualar al 100% las capacidades de otros MCPs o superarlas, podemos agregar estas herramientas. **Recomendamos fuertemente agregar las marcadas con ⭐**:

| Herramienta Faltante | Propósito de otros MCPs | Recomendación para LaLlamaStation |
|---|---|---|
| ⭐ `mem_get_observation` | Recupera un recuerdo específico por su ID. | **Agregar**. Muy útil cuando el agente ya conoce el ID y necesita el texto exacto rápido. |
| ⭐ `mem_current_project` | Obtiene/establece el nombre del proyecto activo actual. | **Agregar**. Simplifica el flujo para no tener que enviar el nombre del proyecto en cada llamada. |
| ⭐ `mem_judge` (Beta) | Usa un LLM para evaluar conflictos entre recuerdos similares. | **Agregar (¡Mejorada!)**. Al tener a Ollama localmente, podemos hacer que LaLlamaStation evalúe los conflictos usando un modelo local asíncronamente, sin consumir tokens de la API del agente. |
| `mem_session_summary` | Obtiene el resumen de la sesión actual o pasada. | *Opcional*. Útil si el agente quiere recordar en qué quedó ayer. |
| `mem_compare` | Compara dos proyectos o recuerdos distintos. | *Opcional*. Se puede implementar fácilmente. |
| `mem_doctor` | Diagnóstico de salud de la base de datos de memoria. | *No necesaria*. Tendremos el Dashboard de React ("Cerebro") para hacer diagnósticos visuales. |
| `mem_merge_projects` | Fusiona recuerdos de dos proyectos distintos. | *Opcional*. Se puede hacer mejor desde la interfaz visual de React. |
| `mem_save_prompt` | Devuelve instrucciones sobre cómo estructurar un buen recuerdo. | *No necesaria*. Se puede inyectar en las descripciones de los esquemas de las herramientas. |
| `mem_capture_passive` | Captura pasiva de datos en segundo plano. | *No aplicable*. Para servidores MCP orientados a chat interactivo, la captura activa es suficiente. |

---

## 4. Diseño del Frontend: La Consola "Cerebro" (React + Glassmorphism)

Se propone agregar una pestaña **"Cerebro" (o "Memoria")** en el Dashboard actual.
* **Timeline y Dashboard**: Estadísticas y línea de tiempo de lo que el agente ha estado recordando en la carpeta `./brain`.
* **Buscador Híbrido**: Toggle entre Búsqueda Léxica (FTS5) y Semántica (Vectores).
* **Editor Visual**: El usuario podrá borrar recuerdos basura o editar el conocimiento del agente manualmente.

---

> [!IMPORTANT]
> **Estado Actual**: Seguimos en fase de diseño y planificación. No se ha escrito código.
> **Decisión Pendiente**: De las 9 herramientas analizadas en la sección 3, ¿deseas incluir `mem_get_observation`, `mem_current_project` y `mem_judge`, o prefieres agregar alguna otra?
