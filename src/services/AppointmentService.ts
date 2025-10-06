import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Servicio para interactuar con la API de N8N para gestión de turnos
 */
export class AppointmentService {
  private client: AxiosInstance;
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.N8N_APPOINTMENT_API_URL || '';
    
    if (!this.apiUrl) {
      console.warn('⚠️  N8N_APPOINTMENT_API_URL no está configurada en las variables de entorno');
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📤 Llamando a API de turnos: ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`📦 Payload:`, JSON.stringify(config.data, null, 2));
        return config;
      },
      (error) => {
        console.error('❌ Error en request:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Respuesta de API de turnos [${response.status}]`);
        console.log(`📥 Data:`, JSON.stringify(response.data, null, 2));
        return response;
      },
      (error) => {
        console.error('❌ Error en response:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Llamar a la API de N8N con el payload especificado
   */
  async callAppointmentAPI(payload: any): Promise<any> {
    try {
      if (!this.apiUrl) {
        throw new Error('N8N_APPOINTMENT_API_URL no está configurada');
      }

      const response = await this.client.post('/', payload);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Error de la API
        throw new Error(
          `Error de API (${error.response.status}): ${JSON.stringify(error.response.data)}`
        );
      } else if (error.request) {
        // No hubo respuesta
        throw new Error('No se recibió respuesta de la API de turnos. Verifica la conexión.');
      } else {
        // Error en la configuración
        throw new Error(`Error al llamar a la API: ${error.message}`);
      }
    }
  }

  /**
   * Verificar que la API está disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.apiUrl) {
        return false;
      }
      
      // Intentar una llamada simple
      await this.client.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      console.warn('⚠️  API de turnos no disponible:', error);
      return false;
    }
  }
}

