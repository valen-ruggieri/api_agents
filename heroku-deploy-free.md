# 🌐 Deploy en Heroku - Opción GRATIS

## ⚠️ **Nota:** Heroku eliminó su tier gratuito, pero tiene opciones económicas

## 💰 **Opciones de Heroku:**
- **Eco**: $5/mes (más económico)
- **Basic**: $7/mes
- **Standard**: $25/mes

## 🚀 **Si eliges Heroku:**

### **1. Instalar Heroku CLI**
```bash
# Descargar desde: https://devcenter.heroku.com/articles/heroku-cli
```

### **2. Login y configurar**
```bash
heroku login
heroku create ai-agents-backend
```

### **3. Configurar variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL="tu_url"
heroku config:set SUPABASE_SERVICE_ROLE_KEY="tu_key"
heroku config:set OPENAI_API_KEY="tu_key"
```

### **4. Deploy**
```bash
git push heroku main
```

## 💡 **Recomendación:**
Mejor usar **Render** que es 100% gratis
