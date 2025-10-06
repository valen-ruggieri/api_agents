# Guía de Despliegue en Render

## Configuración del Proyecto

Este proyecto está configurado para desplegarse automáticamente en Render.

### Archivos de Configuración

- **`render.yaml`**: Archivo de configuración principal para Render
- **`backend/package.json`**: Scripts de build y start
- **`backend/tsconfig.json`**: Configuración de TypeScript

## Pasos para Desplegar

### Opción 1: Usando render.yaml (Recomendado)

El proyecto ya incluye un archivo `render.yaml` en la raíz que Render detectará automáticamente.

1. **Conecta tu repositorio en Render**
   - Ve a https://dashboard.render.com
   - Click en "New +" → "Blueprint"
   - Conecta tu repositorio de GitHub
   - Render detectará automáticamente el archivo `render.yaml`

2. **Configura las variables de entorno**
   En el dashboard de Render, agrega las siguientes variables:
   - `OPENAI_API_KEY`: Tu clave de API de OpenAI
   - `SUPABASE_URL`: URL de tu proyecto de Supabase
   - `SUPABASE_ANON_KEY`: Clave anónima de Supabase
   - `FRONTEND_URL`: URL de tu frontend (opcional)

3. **Despliega**
   - Click en "Apply" para crear el servicio
   - Render ejecutará automáticamente el build y deploy

### Opción 2: Configuración Manual

Si prefieres configurar manualmente:

1. **Crea un nuevo Web Service**
   - Ve a https://dashboard.render.com
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio

2. **Configuración del servicio**
   - **Name**: ai-agents-backend
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Variables de entorno**
   Agrega las mismas variables que en la Opción 1

## Comandos de Build

El proceso de build ejecuta:

```bash
npm install          # Instala todas las dependencias
npm run build        # Compila TypeScript a JavaScript (tsc)
```

Esto genera el directorio `dist/` con los archivos compilados.

## Comando de Start

El servidor se inicia con:

```bash
npm start            # Ejecuta: node dist/server.js
```

## Verificación

Una vez desplegado, puedes verificar que el servicio esté funcionando:

```bash
curl https://tu-servicio.onrender.com/health
```

Deberías recibir una respuesta como:

```json
{
  "status": "ok",
  "timestamp": "2025-10-06T...",
  "message": "AI Agents Backend (TypeScript) is running"
}
```

## Solución de Problemas

### Error: Cannot find module 'dist/server.js'

**Causa**: TypeScript no se compiló durante el build.

**Solución**: 
- Asegúrate de que TypeScript esté en `dependencies` (no en `devDependencies`)
- Verifica que el comando de build incluya `npm run build`
- Revisa los logs del build en Render para ver si hay errores de compilación

### Build exitoso pero el servidor no inicia

**Causa**: El comando de start está apuntando a la ruta incorrecta.

**Solución**:
- Verifica que el script `start` en `package.json` sea: `node dist/server.js`
- Confirma que el directorio `dist/` se creó durante el build

### Variables de entorno no definidas

**Causa**: Las variables de entorno no están configuradas en Render.

**Solución**:
- Ve a Settings → Environment en tu servicio de Render
- Agrega todas las variables necesarias
- Redespliega el servicio

## Notas Importantes

1. **TypeScript en producción**: TypeScript está en `dependencies` porque necesitamos compilar el código durante el despliegue.

2. **Directorio dist/**: Este directorio se genera durante el build y contiene el código JavaScript compilado. NO debe estar en el repositorio (está en `.gitignore`).

3. **Variables de entorno**: Nunca subas archivos `.env` al repositorio. Configura todas las variables sensibles directamente en Render.

4. **Logs**: Puedes ver los logs en tiempo real desde el dashboard de Render para depurar problemas.

## Recursos

- [Documentación de Render - Node.js](https://render.com/docs/deploy-node-express-app)
- [Documentación de Render - Blueprint](https://render.com/docs/infrastructure-as-code)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)

