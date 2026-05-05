# 🦙 LaLlamaStation MCP

> **Panel de control local para modelos LLM de Ollama con seguridad avanzada, telemetría en tiempo real.**

[![Version](https://img.shields.io/badge/version-0.3.0-blue?style=flat-square)](./CHANGELOG.md)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?style=flat-square&logo=docker)](./docker-compose.yml)

---

## ¿Qué es LaLlamaStation MCP?

LaLlamaStation MCP es un servidor de control (**Model Control Panel**) que envuelve a [Ollama](https://ollama.com) con:

- 🖥️ **Dashboard Web**: interfaz de administración premium con glassmorphism
- 🔍 **Gestor de Modelos**: busca, descarga y elimina modelos directamente desde el dashboard
- 📊 **Telemetría**: monitor de disco, VRAM, tráfico y sesiones activas
- 🔐 **Seguridad**: autenticación por API Key, blacklist de IPs, auto-ban, rate limiting
- 🔌 **Túnel Ngrok**: expone el servidor al exterior con un click desde la web

---

## Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/lallama-station-mcp.git
cd lallama-station-mcp

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API_KEY y NGROK_AUTHTOKEN (opcional)

# 3. Levantar el stack completo
docker compose up -d

# 4. Acceder al Dashboard
open http://localhost:8080
```

> Para instalación detallada, ver [`Instalacion.md`](./obsidian-vault/01-Inicio/Instalacion.md)

---

## Estructura del Proyecto

```
MPC-Ollama-Local/

├── .agents/                    # Agentes de LaLlamaStation MCP
├── mcp-frontend/               # Frontend Vite + React
│    └── src/
│       ├── App.tsx             # Componente raíz + routing
│       ├── components/
│       │   ├── Telemetry.tsx   # KPIs + control ngrok
│       │   ├── ModelList.tsx   # Gestión de modelos
│       │   ├── ChatPlayground.tsx  # Terminal de inferencia
│       │   ├── SecurityPanel.tsx   # Blacklist + pánico
│       │   └── IpLogs.tsx      # Auditoría de accesos
│       └── services/
│           └── socket.service.ts   # WebSockets
├── obsidian-vault/             # Vault de Obsidian
├── ollama-mcp-server/          # Backend Node.js + MCP
│   └── src/
│       ├── main.ts             # Entry point Express + endpoints
│       ├── app.module.ts       # Módulo principal
│       ├── auth/               # Autenticación
│       └── ollama/             # Servicio de Ollama
├── postman-collection/         # Colección de Postman
├── .env.example                # Variables de entorno plantilla
├── .gitignore                  # Archivos ignorados por Git
├── AGENTS.md                   # Agentes de LaLlamaStation MCP
├── biome.json                  # Configuración de biome
├── CHANGELOG.md                # Historial de versiones
├── DESIGN.md                   # Diseño de LaLlamaStation MCP
├── docker-compose.yml          # Stack completo
├── package-lock.json           # Lock de dependencias del proyecto
├── package.json                # Dependencias del proyecto
├── pnpm-lock.yaml              # Lock de dependencias del proyecto
└── README.md                   # README del proyecto
```

---

## Tecnologías

| Capa | Stack |
|---|---|
| **Runtime LLM** | [Ollama](https://ollama.com) |
| **Backend** | Node.js, Express, TypeScript, Socket.io |
| **Protocolo MCP** | `@modelcontextprotocol/sdk` |
| **Frontend** | React 19, Vite, TypeScript |
| **Infraestructura** | Docker Compose, Ngrok |
| **Scraping** | Cheerio |
| **Control Docker** | Dockerode |

---

## Licencia

MIT © 2026 ARGenteIA
