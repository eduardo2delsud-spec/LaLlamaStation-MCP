# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-05-13

### Added
- **MCP Brain Server** primera versión oficial e independiente (standalone).
- Arquitectura altamente modular basada en patrón de **Casos de Uso** e Inyección Funcional.
- Persistencia robusta en SQLite con una **WriteQueue** dedicada para garantizar soporte multi-agente en entornos de alta concurrencia.
- Sistema Híbrido de búsqueda: **Léxica** nativa (SQLite FTS5) + **Semántica** vectorizada (Embeddings vía Ollama).
- Detección Dinámica de Conflictos: Grafo relacional para solicitar juicios cuando las memorias colisionan (`mem_judge`).
- Soporte para claves evolutivas en el tiempo mediante `topic_key`.
- Captura de información contextual: `mem_save_prompt` para historial de usuario puro y `mem_capture_passive` para la ingesta silenciosa.
- **Delegación Cognitiva (Graceful Degradation):** Si el backend local LLM (Ollama) está desconectado, el servidor no falla abruptamente. En su lugar, instruye vía MCP al Agente LLM cliente para que asuma el procesamiento analítico (`mem_compare`, `mem_suggest_tags`).
- Servidores duales y aislados lógicamente: Protocolo MCP por Standard IO (`stdio`) y Servidor REST para dashboards vía Express API.
