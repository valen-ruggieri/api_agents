// Types compartidos en toda la aplicación

export interface Agent {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    system_prompt: string | null;
    model: string;
    temperature: number;
    tools: string[];
    created_at: string;
  }
  
  export interface Conversation {
    id: string;
    agent_id: string;
    user_id: string;
    title: string;
    created_at: string;
  }
  
  export interface Message {
    id?: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, any>;
    created_at?: string;
  }
  
  export interface Document {
    id: string;
    agent_id: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    created_at: string;
  }
  
  export interface Embedding {
    id: string;
    document_id: string;
    content: string;
    embedding: number[];
    metadata?: Record<string, any>;
    created_at: string;
  }
  
  // Estado del agente en LangGraph
  export interface AgentState {
    messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;
    agentId: string;
    conversationId: string;
    context?: string;
    nextAction?: 'tools' | 'generate';
    toolResults?: Array<{
      tool: string;
      result: string;
    }>;
  }
  
  // Request/Response types para las APIs
  export interface CreateAgentRequest {
    name: string;
    description?: string;
    system_prompt?: string;
    model?: string;
    temperature?: number;
    tools?: string[];
  }
  
  export interface CreateConversationRequest {
    agent_id: string;
    title?: string;
  }
  
  export interface ChatRequest {
    conversation_id: string;
    message: string;
    agent_id: string;
  }
  
  export interface ChatResponse {
    response: {
      role: 'assistant';
      content: string;
      timestamp: string;
    };
  }