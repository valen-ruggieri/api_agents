# 🎨 Deploy en Render

## ¿Por qué Render?
- ✅ **Gratis** con límites generosos
- ✅ **Fácil** configuración
- ✅ **Auto-deploy** desde GitHub
- ✅ **SSL** automático

## Pasos:

### 1. **Crear archivo de configuración**
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

### 2. **Subir a GitHub**
```bash
git add .
git commit -m "Add render config"
git push
```

### 3. **Conectar con Render**
1. Ve a https://render.com
2. Sign up con GitHub
3. Click "New +" → "Web Service"
4. Conecta tu repositorio
5. Configura:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### 4. **Variables de Entorno**
En Render Dashboard → Environment:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NODE_ENV=production`

### 5. **Deploy**
Click "Create Web Service" y espera el deploy.

## ✅ ¡Listo!
Tu API estará en: `https://tu-proyecto.onrender.com`
