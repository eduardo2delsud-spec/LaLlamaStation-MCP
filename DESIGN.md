# 📐 Diseño y Arquitectura (DESIGN.md)

Este documento define las decisiones arquitectónicas, convenciones de diseño y estándares visuales/técnicos del sistema **LaLlamaStation MCP**.

## 1. Visión del Sistema
Proveer la capa de abstracción, seguridad y observabilidad que le falta a un motor de LLM crudo (Ollama), convirtiéndolo en un servidor listo para producción local que puede ser consumido por clientes externos de forma segura (a través de Ngrok) o por agentes MCP de forma estandarizada.

## 2. Decisiones de Arquitectura Backend
*   **Proxy-First:** Node.js no procesa texto (IA), actúa como un proxy inverso inteligente (`axios` hacia `ollama`). El stream de datos se parsea al vuelo para extraer métricas sin cortar el flujo hacia el cliente final.
*   **Hardware Sentinel:** Integración directa con el OS host para monitorear estrangulamiento térmico (Thermal Throttling) e intervenir proactivamente (ej. descargar modelos si la GPU > 90°C).
*   **Control de Flotas de Docker:** El Backend toma el control de los contenedores adyacentes (`mcp-ngrok-tunnel`, `mcp-ollama-motor`) mapeando `/var/run/docker.sock`. Esto permite un panel unificado sin obligar al usuario a usar la CLI.

## 3. Stack Tecnológico
| Capa | Tecnologías Clave |
| :--- | :--- |
| **Inferencia** | `ollama` (llama.cpp) |
| **Core API** | Node.js, Express.js, TypeScript |
| **Real-time** | Socket.IO, SSE (Server-Sent Events) |
| **Integración OS** | `dockerode`, `child_process` (`nvidia-smi`) |
| **Frontend UI** | React 19, Vite, TailwindCSS (opcional/Vanilla avanzado) |
| **Tunneling** | Ngrok |

## 4. Estándares de Frontend / UI-UX
El dashboard debe proyectar una estética **"Premium Hacking / Advanced AI"**.
1.  **Glassmorphism:** Paneles semitransparentes con desenfoque de fondo (`backdrop-filter: blur()`) sobre fondos oscuros o abstractos.
2.  **Dark Mode Nativo:** Interfaces predominantemente oscuras (grises profundos, negro espacial) con acentos de color vibrantes para métricas (Cian, Magenta, o Verde Neón para GPU stats).
3.  **Tipografía Moderna:** Uso de fuentes como `Inter`, `Roboto Mono` (para terminales/logs) o `Outfit` para encabezados limpios.
4.  **Micro-interacciones:** Retroalimentación visual inmediata. Las barras de uso de VRAM deben animarse fluidamente. El terminal de logs debe scrollear suavemente.
5.  **Data Viz:** Mostrar gráficas en tiempo real claras. Menos tablas aburridas, más indicadores visuales (gauges, progress bars, heatmaps).

## 5. Escalabilidad y Futuro (Roadmap)
El diseño contempla expandirse a:
*   **RAG Local:** Agregar servicios como ChromaDB al stack de Docker.
*   **Base de Datos Nativa:** Migrar el estado en memoria (`lallama_stats.json`) a SQLite para persistencia y reportería avanzada a largo plazo.
*   **Agrupación de GPUs:** Soporte para múltiples GPUs y balanceo de carga entre múltiples motores Ollama.
