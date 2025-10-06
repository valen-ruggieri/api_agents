# 📮 Guía para probar el Backend en Postman

## 🚀 Configuración Inicial

### 1. Iniciar el servidor
```bash
cd backend
npm run dev
```

Deberías ver el mensaje:
```
🤖 AI Agents Backend Server (TS)
🚀 Server running on port 4000
```

### 2. Abrir Postman
- Si no lo tenés, descargalo de: https://www.postman.com/downloads/
- También podés usar la versión web en: https://web.postman.com

## 📝 Flujo de Prueba Paso a Paso

### ✅ PASO 1: Verificar que el servidor funciona

**Método:** `GET`  
**URL:** `http://localhost:4000/health`

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T01:30:00.000Z",
  "message": "AI Agents Backend (TypeScript) is running"
}
```

---

### 🤖 PASO 2: Crear tu primer agente

**Método:** `POST`  
**URL:** `http://localhost:4000/api/agents`  
**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "name": "Mi Asistente",
  "description": "Un asistente útil para responder preguntas",
  "system_prompt": "Eres un asistente amigable y servicial.",
  "model": "gpt-4-turbo-preview",
  "temperature": 0.7,
  "tools": ["calculator", "datetime"]
}
```

**Respuesta esperada:**
```json
{
  "agent": {
    "id": "abc123-def456-ghi789",  ← ¡GUARDA ESTE ID!
    "name": "Mi Asistente",
    "description": "Un asistente útil para responder preguntas",
    "system_prompt": "Eres un asistente amigable y servicial.",
    "model": "gpt-4-turbo-preview",
    "temperature": 0.7,
    "tools": ["calculator", "datetime"],
    "user_id": "default-user",
    "created_at": "2025-10-06T01:30:00.000Z"
  }
}
```

**⚠️ IMPORTANTE:** Copiá el `id` del agente, lo vas a necesitar en los siguientes pasos.

---

### 💬 PASO 3: Crear una conversación

**Método:** `POST`  
**URL:** `http://localhost:4000/api/conversations`  
**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "agent_id": "abc123-def456-ghi789",  ← Pegá aquí el ID del PASO 2
  "title": "Mi primera conversación"
}
```

**Respuesta esperada:**
```json
{
  "conversation": {
    "id": "xyz789-uvw123-rst456",  ← ¡GUARDA ESTE ID TAMBIÉN!
    "agent_id": "abc123-def456-ghi789",
    "user_id": "default-user",
    "title": "Mi primera conversación",
    "created_at": "2025-10-06T01:31:00.000Z"
  }
}
```

**⚠️ IMPORTANTE:** Copiá el `id` de la conversación.

---

### 💭 PASO 4: Enviar un mensaje al agente

**Método:** `POST`  
**URL:** `http://localhost:4000/api/chat`  
**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "conversation_id": "xyz789-uvw123-rst456",  ← ID del PASO 3
  "agent_id": "abc123-def456-ghi789",         ← ID del PASO 2
  "message": "Hola! ¿Cómo estás? Presentate por favor"
}
```

**Respuesta esperada:**
```json
{
  "response": {
    "role": "assistant",
    "content": "¡Hola! Estoy muy bien, gracias por preguntar. Soy tu asistente de IA, creado para ayudarte con tus preguntas y tareas. Puedo realizar cálculos matemáticos y darte la fecha y hora actual. ¿En qué puedo ayudarte hoy?",
    "timestamp": "2025-10-06T01:32:00.000Z"
  }
}
```

---

### 📜 PASO 5: Ver el historial de mensajes

**Método:** `GET`  
**URL:** `http://localhost:4000/api/chat/messages/xyz789-uvw123-rst456`  
*(Reemplazá con tu conversation_id)*

**Respuesta esperada:**
```json
{
  "messages": [
    {
      "id": "msg-001",
      "conversation_id": "xyz789-uvw123-rst456",
      "role": "user",
      "content": "Hola! ¿Cómo estás? Presentate por favor",
      "created_at": "2025-10-06T01:32:00.000Z"
    },
    {
      "id": "msg-002",
      "conversation_id": "xyz789-uvw123-rst456",
      "role": "assistant",
      "content": "¡Hola! Estoy muy bien, gracias por preguntar...",
      "created_at": "2025-10-06T01:32:05.000Z"
    }
  ]
}
```

---

## 🧪 Pruebas Adicionales

### Probar la herramienta Calculator

**Método:** `POST`  
**URL:** `http://localhost:4000/api/chat`

**Body:**
```json
{
  "conversation_id": "tu_conversation_id",
  "agent_id": "tu_agent_id",
  "message": "¿Cuánto es 25 * 4 + 17?"
}
```

El agente debería usar la calculadora y responder: "117"

---

### Probar la herramienta DateTime

**Método:** `POST`  
**URL:** `http://localhost:4000/api/chat`

**Body:**
```json
{
  "conversation_id": "tu_conversation_id",
  "agent_id": "tu_agent_id",
  "message": "¿Qué fecha y hora es?"
}
```

---

### Listar todos los agentes

**Método:** `GET`  
**URL:** `http://localhost:4000/api/agents`

---

### Obtener un agente específico

**Método:** `GET`  
**URL:** `http://localhost:4000/api/agents/tu_agent_id`

---

### Actualizar un agente

**Método:** `PUT`  
**URL:** `http://localhost:4000/api/agents/tu_agent_id`

**Body:**
```json
{
  "name": "Nombre Actualizado",
  "temperature": 0.9
}
```

---

### Eliminar un agente

**Método:** `DELETE`  
**URL:** `http://localhost:4000/api/agents/tu_agent_id`

---

## 🎯 Tips para Postman

### 1. Usar Variables de Entorno
En Postman, podés crear variables para no copiar/pegar IDs todo el tiempo:

1. Click en "Environments" (arriba a la derecha)
2. Crear "New Environment" llamado "AI Agents Dev"
3. Agregar variables:
   - `baseUrl`: `http://localhost:4000`
   - `agentId`: (pegá el ID después de crear un agente)
   - `conversationId`: (pegá el ID después de crear una conversación)

4. Usar las variables en las requests: `{{baseUrl}}/api/agents`

### 2. Crear una Colección
1. Click en "New Collection"
2. Nombrarla "AI Agents API"
3. Agregar todas las requests organizadas en carpetas:
   - 📁 Health Check
   - 📁 Agents
   - 📁 Conversations
   - 📁 Chat

### 3. Tests Automáticos
Podés agregar tests en la pestaña "Tests" de cada request:

```javascript
// Guardar el ID del agente automáticamente
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

const response = pm.response.json();
pm.environment.set("agentId", response.agent.id);
```

### 4. Importar el archivo test-api.http
Si usas VS Code con REST Client, también podés importar el archivo `test-api.http` a Postman:
1. File → Import
2. Seleccioná el archivo `test-api.http`

---

## ❌ Errores Comunes

### Error: "Cannot read package.json"
**Solución:** Asegurate de estar en el directorio correcto:
```bash
cd backend
npm run dev
```

### Error: "Missing Supabase credentials"
**Solución:** Creá el archivo `.env` con tus credenciales:
```env
SUPABASE_URL=tu_url
SUPABASE_SERVICE_ROLE_KEY=tu_key
OPENAI_API_KEY=tu_key
```

### Error: "Agent not found" o "Conversation not found"
**Solución:** Verificá que los IDs sean correctos. Podés listar todos:
- GET `http://localhost:4000/api/agents`
- GET `http://localhost:4000/api/conversations`

### Error 500 en /api/chat
**Solución:** Verificá:
1. Que el `agent_id` exista
2. Que la `conversation_id` exista
3. Que tu `OPENAI_API_KEY` sea válida y tenga créditos
4. Revisa los logs en la consola del servidor

---

## 🎉 ¡Listo!

Ya podés probar tu backend completo en Postman. Si tenés algún problema, revisá:
1. Los logs en la consola del servidor
2. Que el `.env` esté bien configurado
3. Que la base de datos de Supabase esté creada con el schema correcto

Para más información, consultá el archivo `README.md` en el directorio `backend/`.

