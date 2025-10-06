# 🎨 Deploy en Render - 100% GRATIS

## ✅ ¿Por qué Render?
- 🆓 **Completamente GRATIS** para proyectos personales
- 🚀 **Perfecto para Node.js** con TypeScript
- 🔄 **Auto-deploy** desde GitHub
- 🔒 **SSL** incluido
- 📊 **Logs** en tiempo real
- 🌐 **Dominio** automático

## 🚀 **Pasos súper simples:**

### **1. Preparar el proyecto**
```bash
# Crear render.yaml
cat > render.yaml << EOF
services:
  - type: web
    name: ai-agents-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
EOF
```

### **2. Subir a GitHub**
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### **3. Deploy en Render**
1. Ve a https://render.com
2. Sign up con GitHub
3. Click "New +" → "Web Service"
4. Conecta tu repositorio
5. Configura:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### **4. Variables de entorno**
En Render Dashboard → Environment:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NODE_ENV=production`

### **5. ¡Listo!**
Tu API estará en: `https://tu-proyecto.onrender.com`

## 💰 **Límites GRATIS de Render:**
- ✅ **750 horas/mes** (suficiente para desarrollo)
- ✅ **512MB RAM**
- ✅ **0.1 CPU**
- ✅ **SSL incluido**
- ✅ **Dominio personalizado**

## 🔄 **Deploy automático:**
Cada push a GitHub = deploy automático
