/**
 * Definición de tools/functions para que el agente de IA pueda gestionar turnos
 * Compatible con OpenAI Function Calling y Claude Tools
 */

export const appointmentTools = [
  {
    name: "get_appointments_by_id",
    description: "Consultar los turnos de un cliente específico. Usar cuando el cliente quiere ver, cambiar, cancelar o confirmar sus turnos. Devuelve todos los turnos del cliente con sus event_id necesarios para otras acciones.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "ID del usuario/negocio"
        },
        contact_id: {
          type: "string",
          description: "ID del contacto del cliente"
        },
        client_name: {
          type: "string",
          description: "Nombre del cliente"
        },
        client_phone: {
          type: "string",
          description: "Teléfono del cliente (usado como query)"
        },
        instance_name: {
          type: "string",
          description: "Nombre de la instancia/negocio"
        },
        timeMin: {
          type: "string",
          description: "Fecha/hora mínima en formato ISO (ej: 2025-10-01T00:00:00-03:00). Por defecto: primer día del mes"
        },
        timeMax: {
          type: "string",
          description: "Fecha/hora máxima en formato ISO (ej: 2025-10-31T23:59:59-03:00). Por defecto: último día del mes"
        }
      },
      required: ["user_id", "contact_id", "client_name", "client_phone", "instance_name"]
    }
  },
  {
    name: "get_appointments",
    description: "Consultar disponibilidad de turnos para una fecha y hora específicas. Usar cuando el cliente pregunta si hay disponibilidad. NO hace falta pedir confirmación, solo mostrar la disponibilidad.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "ID del usuario/negocio"
        },
        contact_id: {
          type: "string",
          description: "ID del contacto del cliente"
        },
        client_name: {
          type: "string",
          description: "Nombre del cliente"
        },
        client_phone: {
          type: "string",
          description: "Teléfono del cliente"
        },
        instance_name: {
          type: "string",
          description: "Nombre de la instancia/negocio"
        },
        timeMin: {
          type: "string",
          description: "Primer horario del día seleccionado en ISO (ej: 2025-10-15T09:30:00-03:00)"
        },
        timeMax: {
          type: "string",
          description: "Último horario del día seleccionado en ISO (ej: 2025-10-15T20:30:00-03:00)"
        },
        service_duration: {
          type: "number",
          description: "Duración del servicio en minutos"
        }
      },
      required: ["user_id", "contact_id", "client_name", "client_phone", "instance_name", "timeMin", "timeMax", "service_duration"]
    }
  },
  {
    name: "create_appointment",
    description: "Crear un nuevo turno. IMPORTANTE: Antes de crear, ejecutar get_appointments para verificar disponibilidad. Requiere fecha/hora válidas (09:30-20:30), servicio, profesional y email válido.",
    parameters: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "ID del usuario/negocio" },
        contact_id: { type: "string", description: "ID del contacto" },
        client_name: { type: "string", description: "Nombre del cliente" },
        client_phone: { type: "string", description: "Teléfono del cliente" },
        instance_name: { type: "string", description: "Nombre de la instancia" },
        admin_email: { type: "string", description: "Email del administrador" },
        admin_whatsapp_number: { type: "string", description: "WhatsApp del admin" },
        instance_phone_number: { type: "string", description: "Teléfono de la instancia" },
        title: {
          type: "string",
          description: "Título del turno (ej: 'Turno Barbería - Juan Pérez')"
        },
        description: {
          type: "string",
          description: "Descripción con servicio, barbero y precio"
        },
        service_name: { type: "string", description: "Nombre del servicio" },
        service_professional: { type: "string", description: "Nombre del profesional" },
        service_price: { type: "number", description: "Precio del servicio" },
        service_duration: { type: "number", description: "Duración en minutos" },
        start_time: {
          type: "string",
          description: "Hora de inicio en ISO (ej: 2025-10-15T14:00:00-03:00)"
        },
        end_time: {
          type: "string",
          description: "Hora de fin en ISO (start_time + duración)"
        },
        correo: {
          type: "string",
          description: "Email del cliente (REQUERIDO y debe ser válido)"
        },
        payment_method: {
          type: "string",
          enum: ["local", "link"],
          description: "Método de pago: 'local' para pago en el lugar, 'link' para enviar link de pago"
        }
      },
      required: ["user_id", "contact_id", "client_name", "client_phone", "instance_name", "title", "service_name", "service_professional", "service_price", "service_duration", "start_time", "end_time", "correo", "payment_method"]
    }
  },
  {
    name: "verify_appointment_payment",
    description: "Verificar si el pago de un turno con link de pago fue completado. Usar cuando el cliente dice que ya pagó.",
    parameters: {
      type: "object",
      properties: {
        payment_link: {
          type: "string",
          description: "URL del link de pago a verificar"
        }
      },
      required: ["payment_link"]
    }
  },
  {
    name: "edit_appointment",
    description: "Editar/modificar un turno existente (cambiar fecha/hora). REQUIERE event_id. Si no lo tenés, primero ejecutar get_appointments_by_id para obtenerlo.",
    parameters: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        contact_id: { type: "string" },
        client_name: { type: "string" },
        client_phone: { type: "string" },
        instance_name: { type: "string" },
        instance_phone_number: { type: "string" },
        event_id: {
          type: "string",
          description: "ID del evento/turno a editar (UUID)"
        },
        start_time: {
          type: "string",
          description: "Nueva hora de inicio en ISO"
        },
        end_time: {
          type: "string",
          description: "Nueva hora de fin en ISO"
        }
      },
      required: ["user_id", "contact_id", "client_name", "client_phone", "instance_name", "event_id", "start_time", "end_time"]
    }
  },
  {
    name: "confirm_appointment",
    description: "Confirmar un turno existente. REQUIERE event_id. Si no lo tenés, primero ejecutar get_appointments_by_id.",
    parameters: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        contact_id: { type: "string" },
        client_name: { type: "string" },
        client_phone: { type: "string" },
        instance_name: { type: "string" },
        instance_phone_number: { type: "string" },
        event_id: {
          type: "string",
          description: "ID del evento/turno a confirmar (UUID)"
        }
      },
      required: ["user_id", "contact_id", "client_name", "client_phone", "instance_name", "event_id"]
    }
  },
  {
    name: "cancel_appointment",
    description: "Cancelar un turno existente. REQUIERE event_id. Si no lo tenés, primero ejecutar get_appointments_by_id.",
    parameters: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        contact_id: { type: "string" },
        client_name: { type: "string" },
        client_phone: { type: "string" },
        instance_name: { type: "string" },
        instance_phone_number: { type: "string" },
        event_id: {
          type: "string",
          description: "ID del evento/turno a cancelar (UUID)"
        }
      },
      required: ["user_id", "contact_id", "client_name", "client_phone", "instance_name", "event_id"]
    }
  },
  {
    name: "complete_appointment",
    description: "Marcar un turno como completado. REQUIERE event_id. Si no lo tenés, primero ejecutar get_appointments_by_id.",
    parameters: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        contact_id: { type: "string" },
        client_name: { type: "string" },
        client_phone: { type: "string" },
        instance_name: { type: "string" },
        instance_phone_number: { type: "string" },
        event_id: {
          type: "string",
          description: "ID del evento/turno a completar (UUID)"
        }
      },
      required: ["user_id", "contact_id", "client_name", "client_phone", "instance_name", "event_id"]
    }
  }
];

/**
 * Mapeo de nombres de tools a actions de la API
 */
export const toolToActionMap: Record<string, string> = {
  "get_appointments_by_id": "get-appointments-by-id",
  "get_appointments": "get-appointments",
  "create_appointment": "create-appointment",
  "verify_appointment_payment": "verify-appointment-payment-link",
  "edit_appointment": "edit-appointment",
  "confirm_appointment": "confirm-appointment",
  "cancel_appointment": "cancel-appointment",
  "complete_appointment": "complete-appointment"
};

