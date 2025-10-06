# 🐳 Deploy en Fly.io - 100% GRATIS

## ✅ ¿Por qué Fly.io?
- 🆓 **Completamente GRATIS** para apps pequeñas
- 🚀 **Perfecto para Node.js**
- 🌍 **Global CDN**
- 🔒 **SSL** automático
- 📊 **Métricas** incluidas

## 🚀 **Pasos:**

### **1. Instalar Fly CLI**
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# O descargar desde: https://fly.io/docs/hands-on/install-flyctl/
```

### **2. Login y configurar**
```bash
fly auth login
fly launch
```

### **3. Crear fly.toml**
```toml
app = "ai-agents-backend"
primary_region = "mad"

[build]

[env]
  NODE_ENV = "production"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

### **4. Deploy**
```bash
fly deploy
```

### **5. Configurar variables**
```bash
fly secrets set SUPABASE_URL="tu_url"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="tu_key"
fly secrets set OPENAI_API_KEY="tu_key"
```

## 💰 **Límites GRATIS:**
- ✅ **3 apps** gratis
- ✅ **256MB RAM** por app
- ✅ **1 CPU** compartido
- ✅ **SSL** incluido
