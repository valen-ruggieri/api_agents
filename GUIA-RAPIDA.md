# 🚀 Guía Rápida - Configurar y Probar el Backend

## ✅ Lista de verificación

- [ ] Cuenta de Supabase creada
- [ ] API Key de OpenAI
- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install`)

## 📝 Paso 1: Configurar Supabase

1. Ve a https://supabase.com y crea un proyecto (gratis)
2. Una vez creado, ve a **SQL Editor** en el menú lateral
3. Copia todo el contenido del archivo `supabase-schema.sql` 
4. Pégalo en el editor SQL y ejecuta (botón "Run")
5. Deberías ver el mensaje "Schema creado exitosamente!"

## 🔑 Paso 2: Obtener las credenciales

### Supabase:
1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL** → será tu `SUPABASE_URL`
   - **service_role** (en Project API keys) → será tu `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI:
1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Cópiala (¡no la perderás, guárdala!)

## 🔧 Paso 3: Crear archivo .env

Crea un archivo llamado `.env` en la carpeta `backend/` con este contenido:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-clave-super-secreta-aqui
OPENAI_API_KEY=sk-tu-clave-de-openai-aqui
NODE_ENV=development
```

⚠️ **Importante**: Reemplaza los valores con tus credenciales reales.

## 🎬 Paso 4: Iniciar el servidor

```bash
npm run dev
```

Deberías ver algo como:

```
╔════════════════════════════════════════════╗
║   🤖 AI Agents Backend Server (TS)        ║
║   🚀 Server running on port 4000          ║
║   📡 http://localhost:4000                ║
║   ✅ Ready to accept requests             ║
╚════════════════════════════════════════════╝
```

## 🧪 Paso 5: Probar que funciona

### Opción A: Desde el navegador

Abre en tu navegador: http://localhost:4000

Deberías ver un JSON con información de la API.

### Opción B: Con PowerShell (Windows)

```powershell
# Ver estado del servidor
Invoke-RestMethod -Uri "http://localhost:4000/health"

# Crear un agente
$body = @{
    name = "Mi Primer Agente"
    description = "Agente de prueba"
    system_prompt = "Eres un asistente útil"
    tools = @("calculator", "datetime")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/agents" -Method Post -Body $body -ContentType "application/json"
```

### Opción C: Con curl (si lo tienes instalado)

```bash
# Ver estado
curl http://localhost:4000/health

# Crear un agente
curl -X POST http://localhost:4000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Primer Agente",
    "description": "Agente de prueba",
    "system_prompt": "Eres un asistente útil",
    "tools": ["calculator", "datetime"]
  }'
```

### Opción D: Con extensión REST Client de VS Code

Si usas VS Code, instala la extensión "REST Client" y usa el archivo `test-api.http`.

## 📝 Paso 6: Flujo completo de prueba

1. **Crear un agente** (guarda el `id` que te devuelve)
2. **Crear una conversación** (guarda el `id`)
3. **Enviar un mensaje**

### Ejemplo con PowerShell:

```powershell
# 1. Crear agente
$agente = Invoke-RestMethod -Uri "http://localhost:4000/api/agents" -Method Post -ContentType "application/json" -Body (@{
    name = "Asistente Matemático"
    system_prompt = "Eres un experto en matemáticas"
    tools = @("calculator")
} | ConvertTo-Json)

$agentId = $agente.agent.id
Write-Host "Agente creado con ID: $agentId"

# 2. Crear conversación
$conversacion = Invoke-RestMethod -Uri "http://localhost:4000/api/conversations" -Method Post -ContentType "application/json" -Body (@{
    agent_id = $agentId
    title = "Mi conversación de prueba"
} | ConvertTo-Json)

$conversationId = $conversacion.conversation.id
Write-Host "Conversación creada con ID: $conversationId"

# 3. Enviar mensaje
$respuesta = Invoke-RestMethod -Uri "http://localhost:4000/api/chat" -Method Post -ContentType "application/json" -Body (@{
    conversation_id = $conversationId
    agent_id = $agentId
    message = "¿Cuánto es 15 + 27?"
} | ConvertTo-Json)

Write-Host "Respuesta del agente:"
Write-Host $respuesta.response.content
```

## 🎉 ¡Listo!

Si llegaste hasta aquí, tu backend está funcionando correctamente.

## 🐛 Problemas comunes

### "Missing Supabase credentials"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor después de crear el `.env`

### "Agent not found"
- Asegúrate de que el `agent_id` que usas existe
- Puedes listar todos los agentes: `http://localhost:4000/api/agents`

### Error de OpenAI
- Verifica que tu API key es válida
- Asegúrate de tener créditos en tu cuenta de OpenAI
- Revisa que el modelo especificado está disponible para tu cuenta

### El servidor no inicia
- Verifica que el puerto 4000 no esté en uso
- Ejecuta: `npm install` para asegurarte de que todas las dependencias estén instaladas

## 📚 Próximos pasos

- Lee el `README.md` completo para más detalles
- Explora el código en `src/`
- Prueba diferentes herramientas (tools)
- Implementa el frontend para tener una interfaz visual

## 💡 Tips

- Usa la extensión REST Client de VS Code para probar la API fácilmente
- Revisa los logs en la consola del servidor para debug
- Consulta la documentación de Supabase y LangChain para funcionalidades avanzadas

