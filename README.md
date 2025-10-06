# Backend - Plataforma de Agentes IA

Backend desarrollado con TypeScript, Express, LangChain y Supabase.

## 📋 Requisitos Previos

1. **Node.js** (v18 o superior)
2. **Cuenta de Supabase** con base de datos configurada
3. **API Key de OpenAI**

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en este directorio con el siguiente contenido:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_supabase
OPENAI_API_KEY=tu_clave_openai
NODE_ENV=development
```

**Cómo obtener las credenciales:**

- **Supabase**: Ve a tu proyecto en https://supabase.com → Settings → API
  - `SUPABASE_URL`: En "Project URL"
  - `SUPABASE_SERVICE_ROLE_KEY`: En "Project API keys" → service_role (⚠️ mantén en secreto)

- **OpenAI**: Ve a https://platform.openai.com/api-keys

### 2. Base de Datos Supabase

Ejecuta este SQL en tu proyecto de Supabase (SQL Editor):

```sql
-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Tabla de agentes
create table agents (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  name text not null,
  description text,
  system_prompt text,
  model text default 'gpt-4-turbo-preview',
  temperature numeric default 0.7,
  tools text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla de conversaciones
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references agents(id) on delete cascade,
  user_id text not null,
  title text default 'Nueva conversación',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla de mensajes
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla de documentos (para RAG)
create table documents (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references agents(id) on delete cascade,
  title text not null,
  content text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla de embeddings (para búsqueda semántica)
create table embeddings (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references documents(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índice para búsqueda de vectores
create index embeddings_agent_id_idx on embeddings(agent_id);
create index embeddings_embedding_idx on embeddings using ivfflat (embedding vector_cosine_ops);

-- Función para búsqueda semántica
create or replace function match_embeddings (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  agent_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    embeddings.id,
    embeddings.content,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from embeddings
  where embeddings.agent_id = match_embeddings.agent_id
    and 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
$$;
```

### 3. Instalar Dependencias

```bash
npm install
```

## 🚀 Cómo Ejecutar

### Modo Desarrollo (recomendado)
```bash
npm run dev
```

### Compilar TypeScript
```bash
npm run build
```

### Modo Producción
```bash
npm run build
npm start
```

## 🧪 Cómo Probar

### 1. Verificar que el servidor está corriendo

```bash
curl http://localhost:4000/health
```

O abre en tu navegador: http://localhost:4000

### 2. Crear un Agente

```bash
curl -X POST http://localhost:4000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Asistente General",
    "description": "Un asistente útil para responder preguntas",
    "system_prompt": "Eres un asistente amigable y servicial.",
    "model": "gpt-4-turbo-preview",
    "temperature": 0.7,
    "tools": ["calculator", "datetime"]
  }'
```

### 3. Crear una Conversación

```bash
curl -X POST http://localhost:4000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "ID_DEL_AGENTE_CREADO",
    "title": "Mi primera conversación"
  }'
```

### 4. Enviar un Mensaje

```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "ID_DE_LA_CONVERSACION",
    "agent_id": "ID_DEL_AGENTE",
    "message": "Hola, ¿cómo estás?"
  }'
```

## 📡 Endpoints Disponibles

### Health Check
- `GET /health` - Verificar estado del servidor
- `GET /` - Información de la API

### Agentes
- `GET /api/agents` - Listar todos los agentes
- `GET /api/agents/:id` - Obtener un agente específico
- `POST /api/agents` - Crear un nuevo agente
- `PUT /api/agents/:id` - Actualizar un agente
- `DELETE /api/agents/:id` - Eliminar un agente

### Conversaciones
- `GET /api/conversations` - Listar conversaciones (query: ?agent_id=xxx)
- `GET /api/conversations/:id` - Obtener conversación con mensajes
- `POST /api/conversations` - Crear nueva conversación
- `PUT /api/conversations/:id` - Actualizar conversación
- `DELETE /api/conversations/:id` - Eliminar conversación

### Chat
- `POST /api/chat` - Enviar mensaje y obtener respuesta
- `GET /api/chat/messages/:conversationId` - Obtener mensajes

## 🛠️ Herramientas del Agente

Los agentes pueden usar estas herramientas:

- **calculator**: Realiza cálculos matemáticos
- **datetime**: Obtiene la fecha y hora actual
- **web_search**: Búsqueda web (placeholder por ahora)

## 📝 Notas

- El backend usa TypeScript con ES Modules (.js imports)
- LangGraph gestiona el flujo de conversación del agente
- Supabase almacena todos los datos persistentes
- Los embeddings permiten búsqueda semántica (RAG)
- Por defecto usa 'default-user' como user_id

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY sean correctos
- Asegúrate de que las tablas estén creadas

### Error de OpenAI
- Verifica que OPENAI_API_KEY sea válida
- Asegúrate de tener créditos en tu cuenta de OpenAI

### Errores de TypeScript
```bash
npm run type-check
```

