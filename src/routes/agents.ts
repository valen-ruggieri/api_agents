import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import type { Agent, CreateAgentRequest } from '../types';

const router = express.Router();

// GET /api/agents - Listar todos los agentes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ agents: data || [] });
  } catch (error: any) {
    console.error('Error getting agents:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id - Obtener un agente específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    return res.json({ agent: data as Agent });
  } catch (error: any) {
    console.error('Error getting agent:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/agents - Crear un nuevo agente
router.post('/', async (req: Request<{}, {}, CreateAgentRequest>, res: Response) => {
  try {
    const {
      name,
      description,
      system_prompt,
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      tools = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { data, error } = await supabase
      .from('agents')
      .insert({
        user_id: 'default-user',
        name,
        description,
        system_prompt,
        model,
        temperature,
        tools
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ agent: data as Agent });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/agents/:id - Actualizar un agente
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    return res.json({ agent: data as Agent });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/agents/:id - Eliminar un agente
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true, message: 'Agent deleted' });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;