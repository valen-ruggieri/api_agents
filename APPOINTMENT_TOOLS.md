# 📅 Herramientas de Gestión de Turnos

Sistema completo de herramientas para que los agentes de IA puedan gestionar turnos, citas y reservas de manera autónoma.

## 📋 Tabla de Contenidos

- [Configuración](#-configuración)
- [Herramientas Disponibles](#-herramientas-disponibles)
- [Uso en Agentes](#-uso-en-agentes)
- [Ejemplos](#-ejemplos)

---

## 🔧 Configuración

### 1. Variable de Entorno

Agrega la URL de tu API de N8N en las variables de entorno:

```env
N8N_APPOINTMENT_API_URL=https://tu-n8n-instance.com/webhook/appointments
```

### 2. Habilitar en el Agente

Al crear o actualizar un agente, incluye las herramientas de turnos en el array `tools`:

```json
{
  "name": "Asistente de Barbería",
  "tools": [
    "get_appointments_by_id",
    "get_appointments",
    "create_appointment",
    "edit_appointment",
    "confirm_appointment",
    "cancel_appointment"
  ]
}
```

---

## 🛠️ Herramientas Disponibles

### 1. `get_appointments_by_id`

**Descripción:** Consultar los turnos de un cliente específico.

**Cuándo usar:** Cuando el cliente quiere ver, cambiar, cancelar o confirmar sus turnos.

**Parámetros requeridos:**
```typescript
{
  user_id: string,
  contact_id: string,
  client_name: string,
  client_phone: string,
  instance_name: string,
  timeMin?: string,  // ISO format: 2025-10-01T00:00:00-03:00
  timeMax?: string   // ISO format: 2025-10-31T23:59:59-03:00
}
```

**Retorna:** Lista de turnos del cliente con `event_id` para otras acciones.

---

### 2. `get_appointments`

**Descripción:** Consultar disponibilidad de horarios para una fecha específica.

**Cuándo usar:** Cuando el cliente pregunta si hay disponibilidad.

**Parámetros requeridos:**
```typescript
{
  user_id: string,
  contact_id: string,
  client_name: string,
  client_phone: string,
  instance_name: string,
  timeMin: string,           // Primer horario del día
  timeMax: string,           // Último horario del día
  service_duration: number   // Duración en minutos
}
```

**Retorna:** Horarios disponibles para reservar.

---

### 3. `create_appointment`

**Descripción:** Crear un nuevo turno.

**⚠️ IMPORTANTE:** Antes de crear, ejecutar `get_appointments` para verificar disponibilidad.

**Parámetros requeridos:**
```typescript
{
  user_id: string,
  contact_id: string,
  client_name: string,
  client_phone: string,
  instance_name: string,
  admin_email: string,
  admin_whatsapp_number: string,
  instance_phone_number: string,
  title: string,                    // ej: "Turno Barbería - Juan Pérez"
  description: string,              // Servicio, barbero y precio
  service_name: string,
  service_professional: string,
  service_price: number,
  service_duration: number,         // En minutos
  start_time: string,               // ISO: 2025-10-15T14:00:00-03:00
  end_time: string,                 // ISO: 2025-10-15T14:30:00-03:00
  correo: string,                   // Email válido REQUERIDO
  payment_method: "local" | "link"  // Método de pago
}
```

**Retorna:** Confirmación del turno creado con `event_id`.

---

### 4. `edit_appointment`

**Descripción:** Modificar un turno existente (cambiar fecha/hora).

**⚠️ REQUIERE `event_id`:** Si no lo tienes, primero ejecuta `get_appointments_by_id`.

**Parámetros requeridos:**
```typescript
{
  user_id: string,
  contact_id: string,
  client_name: string,
  client_phone: string,
  instance_name: string,
  instance_phone_number: string,
  event_id: string,        // UUID del turno a editar
  start_time: string,      // Nueva hora de inicio
  end_time: string         // Nueva hora de fin
}
```

---

### 5. `confirm_appointment`

**Descripción:** Confirmar asistencia a un turno.

**⚠️ REQUIERE `event_id`:** Si no lo tienes, primero ejecuta `get_appointments_by_id`.

**Parámetros requeridos:**
```typescript
{
  user_id: string,
  contact_id: string,
  client_name: string,
  client_phone: string,
  instance_name: string,
  instance_phone_number: string,
  event_id: string  // UUID del turno a confirmar
}
```

---

### 6. `cancel_appointment`

**Descripción:** Cancelar un turno existente.

**⚠️ REQUIERE `event_id`:** Si no lo tienes, primero ejecuta `get_appointments_by_id`.

**Parámetros requeridos:**
```typescript
{
  user_id: string,
  contact_id: string,
  client_name: string,
  client_phone: string,
  instance_name: string,
  instance_phone_number: string,
  event_id: string  // UUID del turno a cancelar
}
```

---

### 7. `complete_appointment`

**Descripción:** Marcar un turno como completado.

**⚠️ REQUIERE `event_id`:** Si no lo tienes, primero ejecuta `get_appointments_by_id`.

**Parámetros requeridos:**
```typescript
{
  user_id: string,
  contact_id: string,
  client_name: string,
  client_phone: string,
  instance_name: string,
  instance_phone_number: string,
  event_id: string  // UUID del turno a completar
}
```

---

### 8. `verify_appointment_payment`

**Descripción:** Verificar si el pago de un turno fue completado.

**Cuándo usar:** Cuando el cliente dice que ya pagó su turno.

**Parámetros requeridos:**
```typescript
{
  payment_link: string  // URL del link de pago
}
```

---

## 💬 Uso en Agentes

### Ejemplo de Agente con Herramientas de Turnos

```http
POST http://localhost:4000/api/agents
Content-Type: application/json

{
  "name": "Asistente de Barbería",
  "description": "Gestiona turnos para la barbería",
  "system_prompt": "Eres un asistente de barbería. Ayudas a los clientes a reservar, modificar y cancelar turnos. Siempre verifica disponibilidad antes de crear un turno.",
  "model": "gpt-4-turbo-preview",
  "temperature": 0.7,
  "tools": [
    "get_appointments_by_id",
    "get_appointments",
    "create_appointment",
    "edit_appointment",
    "confirm_appointment",
    "cancel_appointment"
  ]
}
```

---

## 📝 Ejemplos

### Ejemplo 1: Consultar Turnos de un Cliente

**Usuario:** "Quiero ver mis turnos"

**Agente ejecuta:**
```javascript
{
  tool: "get_appointments_by_id",
  parameters: {
    user_id: "user_123",
    contact_id: "contact_456",
    client_name: "Juan Pérez",
    client_phone: "+543512345678",
    instance_name: "Barbería Central",
    timeMin: "2025-10-01T00:00:00-03:00",
    timeMax: "2025-10-31T23:59:59-03:00"
  }
}
```

---

### Ejemplo 2: Verificar Disponibilidad

**Usuario:** "¿Hay turnos disponibles el viernes 15 a la tarde?"

**Agente ejecuta:**
```javascript
{
  tool: "get_appointments",
  parameters: {
    user_id: "user_123",
    contact_id: "contact_456",
    client_name: "Juan Pérez",
    client_phone: "+543512345678",
    instance_name: "Barbería Central",
    timeMin: "2025-10-15T14:00:00-03:00",
    timeMax: "2025-10-15T20:00:00-03:00",
    service_duration: 30
  }
}
```

---

### Ejemplo 3: Crear un Turno

**Usuario:** "Quiero reservar para el viernes 15 a las 15:00"

**Agente ejecuta:**
1. Primero verifica disponibilidad con `get_appointments`
2. Si está disponible, crea el turno:

```javascript
{
  tool: "create_appointment",
  parameters: {
    user_id: "user_123",
    contact_id: "contact_456",
    client_name: "Juan Pérez",
    client_phone: "+543512345678",
    instance_name: "Barbería Central",
    admin_email: "admin@barberia.com",
    admin_whatsapp_number: "+543511111111",
    instance_phone_number: "+543512222222",
    title: "Turno Barbería - Juan Pérez",
    description: "Corte de pelo con Carlos - $5000",
    service_name: "Corte de pelo",
    service_professional: "Carlos",
    service_price: 5000,
    service_duration: 30,
    start_time: "2025-10-15T15:00:00-03:00",
    end_time: "2025-10-15T15:30:00-03:00",
    correo: "juan@email.com",
    payment_method: "local"
  }
}
```

---

### Ejemplo 4: Cancelar un Turno

**Usuario:** "Necesito cancelar mi turno"

**Agente ejecuta:**
1. Primero consulta los turnos con `get_appointments_by_id`
2. Muestra los turnos y pide confirmación
3. Cancela el turno seleccionado:

```javascript
{
  tool: "cancel_appointment",
  parameters: {
    user_id: "user_123",
    contact_id: "contact_456",
    client_name: "Juan Pérez",
    client_phone: "+543512345678",
    instance_name: "Barbería Central",
    instance_phone_number: "+543512222222",
    event_id: "abc123-def456-ghi789"
  }
}
```

---

## 🔐 Seguridad

- Todos los parámetros son validados antes de enviar a la API
- Los errores se manejan de forma segura y se reportan al agente
- Las credenciales sensibles (API URL) se manejan vía variables de entorno
- No se exponen detalles técnicos al usuario final

---

## 🐛 Solución de Problemas

### Error: "N8N_APPOINTMENT_API_URL no está configurada"

**Solución:** Agrega la variable de entorno en tu `.env` o en el dashboard de Render.

### Error: "Tool desconocida"

**Solución:** Verifica que el nombre de la herramienta esté en el array `tools` del agente.

### Error: "Invalid API key" o timeouts

**Solución:** 
1. Verifica que la URL de N8N sea correcta
2. Asegúrate de que el webhook de N8N esté activo
3. Revisa los logs del servidor para más detalles

---

## 📚 Recursos Adicionales

- [Documentación principal](README.md)
- [Configuración de deployment](DEPLOY.md)
- [API de N8N para turnos](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.

