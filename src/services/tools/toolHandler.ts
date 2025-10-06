import { AppointmentService } from '../AppointmentService';
import { toolToActionMap } from './appointmentTools';

export class ToolHandler {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  /**
   * Ejecutar una tool llamada por el agente de IA
   */
  async executeTool(toolName: string, parameters: any): Promise<any> {
    try {
      // Mapear el nombre de la tool a la acción de la API
      const action = toolToActionMap[toolName];
      
      if (!action) {
        throw new Error(`Tool desconocida: ${toolName}`);
      }

      // Validar parámetros requeridos antes de preparar payload
      this.validateRequiredParams(toolName, parameters);

      // Preparar el payload según la tool
      const payload = this.preparePayload(toolName, action, parameters);

      // Llamar a la API de N8N
      const result = await this.appointmentService.callAppointmentAPI(payload);

      return {
        success: true,
        data: result,
        tool: toolName
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        tool: toolName
      };
    }
  }

  private validateRequiredParams(toolName: string, params: any): void {
    const missing: string[] = [];

    const requireAll = (keys: string[]) => {
      for (const k of keys) {
        if (params == null || params[k] == null || params[k] === '') {
          missing.push(k);
        }
      }
    };

    switch (toolName) {
      case 'get_appointments_by_id':
        requireAll(['user_id', 'contact_id', 'client_name', 'client_phone', 'instance_name']);
        break;
      case 'get_appointments':
        requireAll(['user_id', 'contact_id', 'client_name', 'client_phone', 'instance_name', 'timeMin', 'timeMax', 'service_duration']);
        break;
      case 'create_appointment':
        requireAll([
          'user_id','contact_id','client_name','client_phone','instance_name','title','service_name','service_professional','service_price','service_duration','start_time','end_time','correo','payment_method'
        ]);
        break;
      case 'edit_appointment':
        requireAll(['user_id','contact_id','client_name','client_phone','instance_name','event_id','start_time','end_time']);
        break;
      case 'confirm_appointment':
        requireAll(['user_id','contact_id','client_name','client_phone','instance_name','event_id']);
        break;
      case 'cancel_appointment':
        requireAll(['user_id','contact_id','client_name','client_phone','instance_name','event_id']);
        break;
      case 'complete_appointment':
        requireAll(['user_id','contact_id','client_name','client_phone','instance_name','event_id']);
        break;
      case 'verify_appointment_payment':
        requireAll(['payment_link']);
        break;
      default:
        break;
    }

    if (missing.length > 0) {
      throw new Error(`Faltan campos requeridos para ${toolName}: ${missing.join(', ')}`);
    }
  }

  /**
   * Preparar el payload según el tipo de acción
   */
  private preparePayload(toolName: string, action: string, params: any): any {
    const payload: any = {
      action,
      ...params
    };

    // Para get_appointments_by_id, el query es el teléfono
    if (toolName === 'get_appointments_by_id') {
      payload.query = params.client_phone;
    }

    // Para verify_payment, solo necesita payment_link
    if (toolName === 'verify_appointment_payment') {
      return {
        action,
        payment_link: params.payment_link
      };
    }

    // Para create_appointment, agregar profesional (es el mismo que service_professional)
    if (toolName === 'create_appointment') {
      payload.profesional = params.service_professional;
    }

    return payload;
  }

  /**
   * Ejecutar múltiples tools en secuencia
   */
  async executeMultipleTools(toolCalls: Array<{ name: string; parameters: any }>): Promise<any[]> {
    const results = [];
    
    for (const toolCall of toolCalls) {
      const result = await this.executeTool(toolCall.name, toolCall.parameters);
      results.push(result);
    }

    return results;
  }
}

