# 🚂 Deploy en Railway - Guía Completa

## 🎯 ¿Por qué Railway?
- ✅ **Perfecto para Node.js** con TypeScript
- ✅ **Gratis** hasta cierto límite
- ✅ **Auto-deploy** desde GitHub
- ✅ **Variables de entorno** fáciles
- ✅ **Base de datos** incluida (opcional)
- ✅ **Dominio** automático
- ✅ **Logs** en tiempo real

## 🚀 **Paso 1: Preparar el proyecto**

### 1.1 **Restaurar package.json original**
```bash
cd backend
# Restaurar el package.json con todas las dependencias
cp package-full.json package.json
```

### 1.2 **Crear archivo de configuración para Railway**
```bash
# Crear railway.json (opcional, Railway detecta automáticamente)
cat > railway.json << EOF
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

### 1.3 **Subir a GitHub**
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

## 🚂 **Paso 2: Deploy en Railway**

### 2.1 **Crear cuenta en Railway**
1. Ve a https://railway.app
2. Click "Start a New Project"
3. Sign up con GitHub
4. Autoriza Railway a acceder a tus repositorios

### 2.2 **Importar proyecto**
1. Click "Deploy from GitHub repo"
2. Selecciona tu repositorio `ai-agents-backend`
3. Railway detectará automáticamente que es Node.js
4. Click "Deploy Now"

### 2.3 **Configurar variables de entorno**
En Railway Dashboard → Variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `PORT` | `4000` | Puerto del servidor |
| `NODE_ENV` | `production` | Entorno de producción |
| `SUPABASE_URL` | `https://tu-proyecto.supabase.co` | URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `tu_service_role_key` | Service role key |
| `OPENAI_API_KEY` | `sk-tu_openai_key` | API key de OpenAI |
| `FRONTEND_URL` | `https://tu-frontend.vercel.app` | URL del frontend (opcional) |

### 2.4 **Configurar build settings**
Railway detectará automáticamente:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend/` (si está en subdirectorio)

## 🔧 **Paso 3: Configurar el proyecto**

### 3.1 **Settings del proyecto**
En Railway Dashboard → Settings:
- **Name**: `ai-agents-backend`
- **Description**: `Backend para plataforma de agentes IA`
- **Health Check**: `/health`

### 3.2 **Configurar dominio**
Railway te dará un dominio como:
```
https://ai-agents-backend-production.up.railway.app
```

### 3.3 **Configurar dominio personalizado (opcional)**
1. Ve a Settings → Domains
2. Agrega tu dominio personalizado
3. Configura los DNS records

## 🧪 **Paso 4: Probar el deploy**

### 4.1 **Health check**
```bash
curl https://tu-proyecto.railway.app/health
```

### 4.2 **Crear agente**
```bash
curl -X POST https://tu-proyecto.railway.app/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "description": "Agent for testing",
    "system_prompt": "You are a helpful assistant",
    "tools": ["calculator", "datetime"]
  }'
```

### 4.3 **Crear conversación**
```bash
curl -X POST https://tu-proyecto.railway.app/api/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "uuid-del-agente",
    "title": "Test Conversation"
  }'
```

### 4.4 **Enviar mensaje**
```bash
curl -X POST https://tu-proyecto.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "uuid-conversacion",
    "agent_id": "uuid-agente",
    "message": "Hola, ¿cómo estás?"
  }'
```

## 📊 **Paso 5: Monitoreo**

### 5.1 **Ver logs en tiempo real**
En Railway Dashboard → Deployments → View Logs

### 5.2 **Métricas del proyecto**
- 📊 **CPU Usage**
- 💾 **Memory Usage**
- 🌐 **Network I/O**
- 📈 **Request Count**

### 5.3 **Health monitoring**
Railway monitorea automáticamente:
- ✅ Health check endpoint
- ✅ Restart automático si falla
- ✅ Escalado automático

## 🔄 **Paso 6: Deploy automático**

Cada vez que hagas push a GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway automáticamente:
- ✅ Detecta los cambios
- ✅ Hace build del proyecto
- ✅ Deploya la nueva versión
- ✅ Te notifica por email

## 🛠️ **Configuraciones avanzadas**

### 6.1 **Environment variables por entorno**
- **Production**: Variables para producción
- **Preview**: Variables para branches de desarrollo

### 6.2 **Resource limits**
En Railway Dashboard → Settings → Resources:
- **CPU**: 0.5 vCPU (gratis)
- **Memory**: 1GB (gratis)
- **Storage**: 1GB (gratis)

### 6.3 **Custom build commands**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  }
}
```

## 🐛 **Solución de problemas**

### **Error: "Build failed"**
- Verifica que `package.json` tenga todos los scripts
- Revisa los logs en Railway Dashboard
- Asegúrate de que todas las dependencias estén en `package.json`

### **Error: "Environment variables not found"**
- Verifica que las variables estén configuradas en Railway Dashboard
- Asegúrate de que los nombres coincidan exactamente

### **Error: "Port not found"**
- Railway usa automáticamente la variable `PORT`
- No necesitas configurar puerto manualmente

## ✅ **Checklist Final**

- [ ] ✅ Proyecto subido a GitHub
- [ ] ✅ Railway conectado al repositorio
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Deploy exitoso
- [ ] ✅ Health check funcionando
- [ ] ✅ API endpoints respondiendo
- [ ] ✅ Deploy automático configurado

## 🎉 **¡Listo!**

Tu backend estará disponible en:
```
https://tu-proyecto.railway.app
```

**Ventajas de Railway:**
- 🚀 **Deploy automático** en cada push
- 📊 **Monitoreo** en tiempo real
- 🔧 **Fácil configuración** de variables
- 💰 **Gratis** para proyectos personales
- 🔒 **Seguro** y confiable

## 🚀 **Próximos pasos**

1. **Configurar dominio personalizado** (opcional)
2. **Configurar monitoreo** con Railway Analytics
3. **Optimizar performance** si es necesario
4. **Configurar CI/CD** para testing automático

¡Tu backend estará funcionando perfectamente en Railway! 🎯
