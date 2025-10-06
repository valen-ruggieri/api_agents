import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import type { Conversation, CreateConversationRequest, Message } from '../types/index.js';

const router = express.Router();

// GET /api/conversations - Listar conversaciones
router.get('/', async (req: Request, res: Response) => {
  try {
    const { agent_id } = req.query;

    let query = supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (agent_id) {
      query = query.eq('agent_id', agent_id as string);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.json({ conversations: data as Conversation[] || [] });
  } catch (error: any) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/conversations/:id - Obtener una conversación específica
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Obtener también los mensajes
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    return res.json({ 
      conversation: data as Conversation,
      messages: messages as Message[] || []
    });
  } catch (error: any) {
    console.error('Error getting conversation:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/conversations - Crear una nueva conversación
router.post('/', async (req: Request<{}, {}, CreateConversationRequest>, res: Response) => {
  try {
    const { agent_id, title = 'Nueva conversación' } = req.body;

    if (!agent_id) {
      return res.status(400).json({ error: 'agent_id is required' });
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: 'default-user',
        agent_id,
        title
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ conversation: data as Conversation });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/conversations/:id - Actualizar una conversación
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const { data, error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.json({ conversation: data as Conversation });
  } catch (error: any) {
    console.error('Error updating conversation:', error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/conversations/:id - Eliminar una conversación
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true, message: 'Conversation deleted' });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;