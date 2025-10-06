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

