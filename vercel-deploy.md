# ▲ Deploy en Vercel

## ¿Por qué Vercel?
- ✅ **Gratis** para proyectos personales
- ✅ **Ultra rápido** deploy
- ✅ **Edge functions**
- ✅ **Auto-scaling**

## Pasos:

### 1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

### 2. **Configurar proyecto**
```bash
# En el directorio backend/
vercel login
vercel init
```

### 3. **Configurar variables de entorno**
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add NODE_ENV production
```

### 4. **Deploy**
```bash
vercel --prod
```

### 5. **O desde GitHub**
1. Ve a https://vercel.com
2. Importa tu repositorio
3. Configura las variables de entorno
4. Deploy automático

## ✅ ¡Listo!
Tu API estará en: `https://tu-proyecto.vercel.app`
