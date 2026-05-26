# 🎬 MovieTracker

Tracker personal de películas y series. Busca contenido en TMDB, arma tu watchlist, califica lo que viste y chatea con un agente de IA que conoce tu historial.

---

## 📋 Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **API Key de TMDB** — Obtenerla gratis en [themoviedb.org](https://www.themoviedb.org)
- **API Key de OpenAI** — Proporcionada por la empresa

---

## ⚙️ Configuración de Variables de Entorno

### 1. Backend (`MovieTrackerBack/.env`)

Copiar el archivo de ejemplo y configurar las API keys:

```bash
cp MovieTrackerBack/.env.example MovieTrackerBack/.env
```

Variables requeridas:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `host` | Host de PostgreSQL | `postgres` (en Docker) / `localhost` (local) |
| `port` | Puerto de PostgreSQL | `5432` |
| `user` | Usuario de PostgreSQL | `sistema` |
| `password` | Contraseña de PostgreSQL | `sistema` |
| `dbname` | Nombre de la base de datos | `sistema` |
| `app_port` | Puerto del servidor Go | `8080` |
| `TMDB_API_KEY` | API Key de TMDB (Bearer token) | `eyJhbGci...` |
| `TMDB_BASE_URL` | URL base de la API de TMDB | `https://api.themoviedb.org/3` |
| `REDIS_HOST` | Host de Redis | `redis` (en Docker) / `localhost` (local) |
| `REDIS_PORT` | Puerto de Redis | `6379` |
| `REDIS_PASSWORD` | Contraseña de Redis | (vacío por defecto) |
| `OPENAI_API_KEY` | API Key de OpenAI | `sk-proj-...` |
| `OPENAI_MODEL` | Modelo de OpenAI a usar | `gpt-4o-mini` |

### 2. Frontend (`MovieTrackerFront/.env`)

```bash
cp MovieTrackerFront/.env.example MovieTrackerFront/.env
```

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `VITE_API_URL` | URL del API | `/api` (usa proxy de Vite o nginx) |

> **⚠️ Importante:** Los archivos `.env` con valores reales **NO deben subirse** al repositorio.

---

## 🚀 Levantar el Proyecto

### Con Docker Compose (producción)

```bash
# 1. Configurar las variables de entorno del backend
cp ../MovieTrackerBack/.env.example ../MovieTrackerBack/.env
# Editar ../MovieTrackerBack/.env con tus API keys reales

# 2. Desde la carpeta MovieTrackerFront, levantar todos los servicios
cd MovieTrackerFront
docker-compose up --build
```

Esto levanta 4 servicios:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `postgres` | 5432 | Base de datos PostgreSQL 16 |
| `redis` | 6379 | Caché Redis 7 |
| `backend` | 8080 | API REST en Go |
| `frontend` | 3000 | React + Nginx |

Acceder a la aplicación en: **http://localhost:3000**

### Desarrollo local (sin Docker)

```bash
# Terminal 1: Backend (requiere PostgreSQL y Redis corriendo localmente)
cd MovieTrackerBack
go run cmd/main.go

# Terminal 2: Frontend
cd MovieTrackerFront
npm install
npm run dev
```

El frontend en desarrollo usa un proxy de Vite que redirige `/api` → `http://localhost:8080`.

---

## 🗄️ Esquema de Base de Datos

La base de datos consta de **3 tablas** con relaciones entre ellas:

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│       ITEMS         │     │   LIST_ITEMS      │     │       LISTA         │
├─────────────────────┤     ├──────────────────┤     ├─────────────────────┤
│ id (PK, SERIAL)     │◄────│ item_id (FK)     │     │ id (PK, SERIAL)     │
│ tmdb_id (INT)       │     │ list_id (FK)     │────►│ name (VARCHAR)      │
│ adult (BOOLEAN)     │     │ added_at         │     │ description (TEXT)  │
│ backdrop_path       │     │ id (PK, SERIAL)  │     │ created_at          │
│ name (VARCHAR)      │     └──────────────────┘     └─────────────────────┘
│ original_name       │
│ overview (TEXT)      │
│ poster_path         │
│ media_type          │
│ original_language   │
│ popularity          │
│ first_air_date      │
│ genre_ids (TEXT)     │
│ origin_country      │
│ vote_average        │
│ vote_count          │
│ list_id (INT, NULL) │
│ status (VARCHAR)    │  ← 'pending' | 'watched'
│ comentary_user      │
│ calification_user   │  ← 1 a 10
│ watched_at          │
│ added_at            │
└─────────────────────┘
```

**Relaciones:**
- `LIST_ITEMS.item_id` → `ITEMS.id` (ON DELETE CASCADE)
- `LIST_ITEMS.list_id` → `LISTA.id` (ON DELETE CASCADE)

Las migraciones se ejecutan automáticamente al levantar el backend usando `golang-migrate`.

---

## 📡 Listado de Endpoints

### TMDB — Búsqueda

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/search?query={texto}` | Buscar películas y series en TMDB. Resultados cacheados en Redis (TTL 10 min) |
| `GET` | `/api/recomendations` | Obtener contenido en tendencia de TMDB. Cacheado en Redis |

### Items — Watchlist

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/items` | Listar items con filtros opcionales: `status`, `media_type`, `order_by`, `order_dir` |
| `GET` | `/api/items/:id` | Obtener detalle de un item por ID |
| `POST` | `/api/items` | Agregar un item a la watchlist |
| `PATCH` | `/api/items/:id/watched` | Marcar como visto con `rating` (1-10) y `commentary` |
| `DELETE` | `/api/items/:id` | Eliminar un item de la watchlist |

**Filtros disponibles en `GET /api/items`:**

| Parámetro | Valores | Ejemplo |
|-----------|---------|---------|
| `status` | `pending`, `watched` | `?status=pending` |
| `media_type` | `movie`, `tv` | `?media_type=movie` |
| `order_by` | `added_at`, `name`, `vote_average`, `popularity` | `?order_by=name` |
| `order_dir` | `ASC`, `DESC` | `?order_dir=ASC` |

### Listas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/lists` | Listar todas las listas del usuario |
| `GET` | `/api/lists/:id` | Obtener una lista por ID |
| `POST` | `/api/lists` | Crear nueva lista (`name`, `description`) |
| `PUT` | `/api/lists/:id` | Actualizar una lista existente |
| `DELETE` | `/api/lists/:id` | Eliminar una lista |

### Chat — Agente IA

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/chat` | Enviar mensaje al agente. Body: `{ session_id, role, content }` |

---

## 🤖 Agente de Chat con OpenAI

### Descripción

El agente es un asistente personal experto en cine y series, integrado con la base de datos del usuario mediante **function calling (tools)** de OpenAI.

### Tools Definidas

| Tool | Descripción | Cuándo se usa |
|------|-------------|---------------|
| `obtener_items` | Obtiene todas las películas y series del usuario (vistas y pendientes) con calificaciones | Cuando el usuario pregunta sobre su watchlist, pide recomendaciones basadas en gustos, o consulta estadísticas |
| `obtener_listas` | Obtiene las listas personalizadas del usuario | Cuando el usuario pregunta por sus listas o quiere organizar contenido |

### Cómo Funciona

1. El usuario envía un mensaje con un `session_id`
2. El agente recupera el historial de la conversación desde **Redis** (TTL 2 horas)
3. Construye el contexto con un system prompt y el historial
4. Envía la solicitud a OpenAI con las tools disponibles
5. Si OpenAI solicita ejecutar una tool, el backend la ejecuta consultando **PostgreSQL directamente** y devuelve el resultado
6. El agente procesa el resultado y genera una respuesta final en **Markdown**
7. El historial actualizado se guarda en Redis

### Historial de Conversación

- Se mantiene **durante la sesión activa** usando Redis con TTL de 2 horas
- Cada sesión se identifica con un `session_id` único generado por el frontend
- No persiste entre sesiones del navegador

> **Nota:** El agente **NO** recibe toda la watchlist en el system prompt. Usa function calling para consultar la base de datos solo cuando lo necesita, cumpliendo el requisito técnico obligatorio.

---

## 🏗️ Decisiones de Arquitectura

### 1. Frontend servido como servicio separado vía Nginx

El frontend se sirve como un **contenedor independiente con Nginx** en lugar de embeberlo en el proceso de Go. Razones:

- **Separación de responsabilidades:** El backend Go se enfoca en la lógica de negocio y el frontend en la UI
- **Escalabilidad independiente:** Cada servicio puede escalar por separado
- **Caché de assets:** Nginx maneja eficientemente el cache de archivos estáticos (JS, CSS, imágenes) con headers de expiración
- **Proxy reverso:** Nginx redirige las peticiones `/api/*` al backend, eliminando problemas de CORS
- **Rendimiento:** Nginx sirve archivos estáticos más eficientemente que Go

### 2. Estrategia de caché con Redis

- **Búsquedas TMDB:** TTL de 10 minutos. Las búsquedas son frecuentes y los resultados de TMDB cambian con poca frecuencia. 10 minutos es un buen balance entre frescura y reducción de llamadas externas.
- **Detalles de contenido:** Cacheados con el mismo TTL. La información de películas/series no cambia frecuentemente.
- **Historial de chat:** TTL de 2 horas. Suficiente para una sesión de uso activo sin consumir memoria indefinidamente.
- Redis se usa **exclusivamente como caché**, nunca como base de datos principal.

### 3. Estructura del backend — Arquitectura Hexagonal

El backend sigue una **arquitectura hexagonal (ports & adapters)**:

```
internal/
├── domain/          → Modelos de dominio y puertos (interfaces)
├── application/     → Servicios de aplicación (lógica de negocio)
└── infrastructure/  → Adaptadores (implementaciones)
    ├── http/        → Handlers HTTP (Gin)
    ├── postgres/    → Repositorios SQL
    ├── redis/       → Caché
    ├── tmdb/        → Cliente TMDB
    └── openai/      → Cliente OpenAI con function calling
```

Esta estructura permite:
- **Inversión de dependencias:** Los servicios dependen de interfaces, no de implementaciones concretas
- **Testabilidad:** Cada capa puede probarse de forma aislada
- **Flexibilidad:** Cambiar una implementación (ej. de Redis a Memcached) sin afectar la lógica de negocio
