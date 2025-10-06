-- ==========================================
-- SCHEMA SQL PARA SUPABASE
-- Plataforma de Agentes IA
-- ==========================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ==========================================
-- TABLA: agents
-- Almacena la configuración de cada agente IA
-- ==========================================
create table if not exists agents (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  name text not null,
  description text,
  system_prompt text,
  model text default 'gpt-4-turbo-preview',
  temperature numeric default 0.7 check (temperature >= 0 and temperature <= 2),
  tools text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para agents
create index if not exists agents_user_id_idx on agents(user_id);
create index if not exists agents_created_at_idx on agents(created_at desc);

-- ==========================================
-- TABLA: conversations
-- Almacena las conversaciones entre usuarios y agentes
-- ==========================================
create table if not exists conversations (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references agents(id) on delete cascade,
  user_id text not null,
  title text default 'Nueva conversación',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para conversations
create index if not exists conversations_agent_id_idx on conversations(agent_id);
create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists conversations_created_at_idx on conversations(created_at desc);

-- ==========================================
-- TABLA: messages
-- Almacena los mensajes de cada conversación
-- ==========================================
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para messages
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists messages_created_at_idx on messages(created_at);

-- ==========================================
-- TABLA: documents
-- Almacena documentos para RAG (Retrieval Augmented Generation)
-- ==========================================
create table if not exists documents (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references agents(id) on delete cascade,
  title text not null,
  content text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para documents
create index if not exists documents_agent_id_idx on documents(agent_id);
create index if not exists documents_created_at_idx on documents(created_at desc);

-- ==========================================
-- TABLA: embeddings
-- Almacena vectores de embeddings para búsqueda semántica
-- ==========================================
create table if not exists embeddings (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references documents(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  content text not null,
  embedding vector(1536), -- Tamaño para OpenAI text-embedding-ada-002
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para embeddings
create index if not exists embeddings_agent_id_idx on embeddings(agent_id);
create index if not exists embeddings_document_id_idx on embeddings(document_id);

-- Índice de vectores para búsqueda semántica (IVFFlat)
-- Ajusta 'lists' según tu volumen de datos
create index if not exists embeddings_embedding_idx 
  on embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ==========================================
-- FUNCIÓN: match_embeddings
-- Búsqueda semántica de embeddings similares
-- ==========================================
create or replace function match_embeddings (
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5,
  p_agent_id uuid default null
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
  where 
    (p_agent_id is null or embeddings.agent_id = p_agent_id)
    and 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
$$;

-- ==========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- Descomentar para insertar datos de prueba
-- ==========================================

-- Insertar un agente de ejemplo
-- insert into agents (user_id, name, description, system_prompt, model, temperature, tools)
-- values (
--   'default-user',
--   'Asistente General',
--   'Un asistente útil para responder preguntas generales',
--   'Eres un asistente amigable y servicial que ayuda a los usuarios con sus preguntas.',
--   'gpt-4-turbo-preview',
--   0.7,
--   array['calculator', 'datetime']
-- );

-- ==========================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- Descomentar si quieres implementar seguridad a nivel de filas
-- ==========================================

-- Habilitar RLS
-- alter table agents enable row level security;
-- alter table conversations enable row level security;
-- alter table messages enable row level security;
-- alter table documents enable row level security;
-- alter table embeddings enable row level security;

-- Política de ejemplo: usuarios solo pueden ver sus propios datos
-- create policy "Users can view their own agents"
--   on agents for select
--   using (auth.uid()::text = user_id);

-- create policy "Users can create their own agents"
--   on agents for insert
--   with check (auth.uid()::text = user_id);

-- create policy "Users can update their own agents"
--   on agents for update
--   using (auth.uid()::text = user_id);

-- create policy "Users can delete their own agents"
--   on agents for delete
--   using (auth.uid()::text = user_id);

-- ==========================================
-- FIN DEL SCHEMA
-- ==========================================

-- Verificar que todo se creó correctamente
select 'Schema creado exitosamente!' as message;

