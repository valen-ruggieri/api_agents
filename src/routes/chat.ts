import express, { Request, Response } from 'express';
import { AIAgent } from '../services/AIAgent.js';
import { supabase } from '../config/supabase.js';
import type { ChatRequest, ChatResponse, Message } from '../types/index.js';

const router = express.Router();

// POST /api/chat - Enviar mensaje y obtener respuesta
router.post('/', async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  try {
    const { conversation_id, message, agent_id } = req.body;

    // Validar campos requeridos
    if (!conversation_id || !message || !agent_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: conversation_id, message, agent_id' 
      });
    }

    // Verificar que la conversación existe
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .single();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Crear y configurar agente
    const agent = new AIAgent(agent_id);
    await agent.initialize();

    // Procesar mensaje
    const response = await agent.chat(
      conversation_id,
      message,
      'default-user'
    );

    const chatResponse: ChatResponse = { response };
    return res.json(chatResponse);
  } catch (error: any) {
    console.error('Error in chat:', error);
    return res.status(500).json({ 
      error: 'Error processing message',
      message: error.message 
    });
  }
});

// GET /api/chat/messages/:conversationId - Obtener mensajes de una conversación
router.get('/messages/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.json({ messages: data as Message[] || [] });
  } catch (error: any) {
    console.error('Error getting messages:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;