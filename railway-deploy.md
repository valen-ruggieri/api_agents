# 🚂 Deploy en Railway

## ¿Por qué Railway?
- ✅ **Gratis** hasta cierto límite
- ✅ **Fácil** de configurar
- ✅ **Automático** con GitHub
- ✅ **Base de datos** incluida
- ✅ **Dominio** automático

## Pasos:

### 1. **Preparar el proyecto**
```bash
# Crear archivo de configuración para Railway
echo "PORT=4000" > .env.production
```

### 2. **Subir a GitHub**
```bash
git init
git add .
git commit -m "Backend AI Agents ready for deploy"
git branch -M main
git remote add origin https://github.com/tu-usuario/ai-agents-backend.git
git push -u origin main
```

### 3. **Conectar con Railway**
1. Ve a https://railway.app
2. Sign up con GitHub
3. Click "New Project"
4. Selecciona tu repositorio
5. Railway detectará automáticamente que es Node.js

### 4. **Configurar Variables de Entorno**
En Railway Dashboard:
- `PORT` = `4000`
- `NODE_ENV` = `production`
- `SUPABASE_URL` = tu URL de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = tu key
- `OPENAI_API_KEY` = tu key de OpenAI

### 5. **Deploy automático**
Railway hará el deploy automáticamente. Tu API estará en:
`https://tu-proyecto.railway.app`

## ✅ ¡Listo!
Tu backend estará disponible en la URL que te dé Railway.
