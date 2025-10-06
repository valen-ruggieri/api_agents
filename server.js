// Versión JavaScript pura para Render - Sin TypeScript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'AI Agents Backend (Render) is running',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: PORT,
      HAS_SUPABASE_URL: !!process.env.SUPABASE_URL,
      HAS_OPENAI_KEY: !!process.env.OPENAI_API_KEY
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Agents API - Render',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      agents: '/api/agents',
      conversations: '/api/conversations',
      chat: '/api/chat'
    }
  });
});

// Mock endpoints para testing
app.get('/api/agents', (req, res) => {
  res.json({
    message: 'Agents endpoint - Mock version',
    note: 'Full functionality requires Supabase configuration',
    agents: []
  });
});

app.post('/api/agents', (req, res) => {
  const { name, description, system_prompt } = req.body;
  
  res.json({
    message: 'Agent created - Mock version',
    note: 'Full functionality requires Supabase configuration',
    agent: {
      id: 'mock-' + Date.now(),
      name: name || 'Mock Agent',
      description: description || 'Mock description',
      system_prompt: system_prompt || 'Mock prompt',
      status: 'mock'
    }
  });
});

app.get('/api/conversations', (req, res) => {
  res.json({
    message: 'Conversations endpoint - Mock version',
    note: 'Full functionality requires Supabase configuration',
    conversations: []
  });
});

app.post('/api/conversations', (req, res) => {
  const { agent_id, title } = req.body;
  
  res.json({
    message: 'Conversation created - Mock version',
    note: 'Full functionality requires Supabase configuration',
    conversation: {
      id: 'conv-' + Date.now(),
      agent_id: agent_id || 'mock-agent',
      title: title || 'Mock Conversation',
      status: 'mock'
    }
  });
});

app.post('/api/chat', (req, res) => {
  const { conversation_id, agent_id, message } = req.body;
  
  res.json({
    message: 'Chat endpoint - Mock version',
    note: 'Full functionality requires Supabase configuration',
    response: {
      role: 'assistant',
      content: `Mock response to: "${message}". This is a test response.`,
      timestamp: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🤖 AI Agents Backend (Render)           ║
║   🚀 Server running on port ${PORT}         ║
║   📡 Ready to accept requests              ║
║   ✅ Mock version for testing              ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
