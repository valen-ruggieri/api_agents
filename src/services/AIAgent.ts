import { StateGraph, END } from '@langchain/langgraph';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import type { Agent, AgentState, Message } from '../types/index.js';

export class AIAgent {
  private agentId: string;
  private config: Agent | null = null;
  private llm: ChatOpenAI | null = null;
  private embeddings: OpenAIEmbeddings;
  private graph: any = null;
  private tools: DynamicStructuredTool[] = [];

  constructor(agentId: string) {
    this.agentId = agentId;
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initialize(): Promise<this> {
    this.config = await this.loadConfig();
    
    this.llm = new ChatOpenAI({
      modelName: this.config.model || 'gpt-4-turbo-preview',
      temperature: this.config.temperature || 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.tools = this.loadTools(this.config.tools || []);
    this.graph = this.buildGraph();
    
    return this;
  }

  private async loadConfig(): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', this.agentId)
      .single();

    if (error || !data) {
      throw new Error('Agent not found');
    }

    return data as Agent;
  }

  private loadTools(enabledTools: string[]): DynamicStructuredTool[] {
    const availableTools: Record<string, DynamicStructuredTool> = {
      calculator: new DynamicStructuredTool({
        name: 'calculator',
        description: 'Calcula expresiones matemáticas. Input debe ser una expresión matemática válida.',
        schema: z.object({
          expression: z.string().describe('Expresión matemática a evaluar')
        }),
        func: async ({ expression }: { expression: string }) => {
          try {
            const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
            const result = eval(sanitized);
            return `Resultado: ${result}`;
          } catch (error) {
            return `Error al calcular: ${error}`;
          }
        },
      }),

      datetime: new DynamicStructuredTool({
        name: 'datetime',
        description: 'Obtiene la fecha y hora actual',
        schema: z.object({}),
        func: async () => {
          return new Date().toLocaleString('es-ES');
        },
      }),

      web_search: new DynamicStructuredTool({
        name: 'web_search',
        description: 'Busca información en la web',
        schema: z.object({
          query: z.string().describe('Consulta de búsqueda')
        }),
        func: async ({ query }: { query: string }) => {
          return `Resultados de búsqueda para: ${query}`;
        },
      }),
    };

    return enabledTools
      .filter(name => name in availableTools)
      .map(name => availableTools[name]);
  }

  private buildGraph() {
    const workflow = new StateGraph<AgentState>({
      channels: {
        messages: { value: null },
        agentId: { value: null },
        conversationId: { value: null },
        context: { value: null },
        nextAction: { value: null },
        toolResults: { value: null },
      }
    });

    workflow.addNode('retrieve_context', this.retrieveContext.bind(this));
    workflow.addNode('process_message', this.processMessage.bind(this));
    workflow.addNode('execute_tools', this.executeTools.bind(this));
    workflow.addNode('generate_response', this.generateResponse.bind(this));

    workflow.setEntryPoint('retrieve_context');
    workflow.addEdge('retrieve_context', 'process_message');
    
    workflow.addConditionalEdges(
      'process_message',
      this.shouldUseTools.bind(this),
      {
        tools: 'execute_tools',
        generate: 'generate_response'
      }
    );

    workflow.addEdge('execute_tools', 'generate_response');
    workflow.addEdge('generate_response', END);

    return workflow.compile();
  }

  private async retrieveContext(state: AgentState): Promise<Partial<AgentState>> {
    try {
      const lastMessage = state.messages[state.messages.length - 1]?.content;
      if (!lastMessage) return { context: '' };

      const queryEmbedding = await this.embeddings.embedQuery(lastMessage);

      const { data, error } = await supabase.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5,
        p_agent_id: this.agentId
      });

      if (error) {
        console.error('Error retrieving context:', error);
        return { context: '' };
      }

      const context = data?.map((doc: any) => doc.content).join('\n\n') || '';
      return { context };
    } catch (error) {
      console.error('Error in retrieveContext:', error);
      return { context: '' };
    }
  }

  private async processMessage(state: AgentState): Promise<Partial<AgentState>> {
    if (this.tools.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1]?.content.toLowerCase();
      
      // Detectar si necesita tools
      const needsCalculator = 
        lastMessage.includes('calcula') ||
        lastMessage.includes('suma') ||
        lastMessage.includes('resta') ||
        lastMessage.includes('multiplica') ||
        lastMessage.includes('divide') ||
        /\d+\s*[\+\-\*\/]\s*\d+/.test(lastMessage) ||
        /cuánto es|cuanto es|resultado|operación/.test(lastMessage);

      const needsDateTime = 
        lastMessage.includes('fecha') ||
        lastMessage.includes('hora') ||
        lastMessage.includes('tiempo') ||
        lastMessage.includes('ahora') ||
        lastMessage.includes('qué hora') ||
        lastMessage.includes('que hora');

      const needsWebSearch = 
        lastMessage.includes('busca') ||
        lastMessage.includes('buscar') ||
        lastMessage.includes('información') ||
        lastMessage.includes('informacion');

      const needsTools = needsCalculator || needsDateTime || needsWebSearch;

      console.log('🔍 Tool detection:', { 
        needsCalculator, 
        needsDateTime, 
        needsWebSearch, 
        needsTools,
        message: lastMessage 
      });

      return { nextAction: needsTools ? 'tools' : 'generate' };
    }

    return { nextAction: 'generate' };
  }

  private shouldUseTools(state: AgentState): string {
    return state.nextAction || 'generate';
  }

  private async executeTools(state: AgentState): Promise<Partial<AgentState>> {
    try {
      const lastMessage = state.messages[state.messages.length - 1]?.content.toLowerCase();
      const toolResults: Array<{ tool: string; result: string }> = [];

      console.log('🔧 Executing tools for message:', lastMessage);

      for (const tool of this.tools) {
        try {
          let shouldExecute = false;
          let toolInput: any = {};

          // Calculator tool
          if (tool.name === 'calculator') {
            const mathPattern = /\d+\s*[\+\-\*\/]\s*\d+/;
            const mathWords = /calcula|suma|resta|multiplica|divide|cuánto es|cuanto es|resultado|operación/;
            
            if (mathPattern.test(lastMessage) || mathWords.test(lastMessage)) {
              const match = lastMessage.match(/(\d+\s*[\+\-\*\/]\s*\d+)/);
              if (match) {
                toolInput = { expression: match[1] };
                shouldExecute = true;
              }
            }
          }

          // DateTime tool
          if (tool.name === 'datetime') {
            const timeWords = /fecha|hora|tiempo|ahora|qué hora|que hora/;
            if (timeWords.test(lastMessage)) {
              toolInput = {};
              shouldExecute = true;
            }
          }

          // Web search tool
          if (tool.name === 'web_search') {
            const searchWords = /busca|buscar|información|informacion/;
            if (searchWords.test(lastMessage)) {
              // Extraer la consulta de búsqueda
              const searchQuery = lastMessage.replace(/busca|buscar|información|informacion/gi, '').trim();
              toolInput = { query: searchQuery || 'búsqueda general' };
              shouldExecute = true;
            }
          }

          if (shouldExecute) {
            console.log(`🔧 Executing ${tool.name} with input:`, toolInput);
            const result = await tool.func(toolInput);
            toolResults.push({ tool: tool.name, result });
            console.log(`✅ Tool ${tool.name} result:`, result);
          }
        } catch (error) {
          console.error(`❌ Error executing tool ${tool.name}:`, error);
        }
      }

      console.log('🔧 Tool results:', toolResults);
      return { toolResults };
    } catch (error) {
      console.error('❌ Error executing tools:', error);
      return { toolResults: [] };
    }
  }

  private async generateResponse(state: AgentState): Promise<Partial<AgentState>> {
    try {
      if (!this.llm) {
        throw new Error('LLM not initialized');
      }

      const messages: BaseMessage[] = [];

      let systemPrompt = this.config?.system_prompt || 'Eres un asistente útil y amigable.';
      
      if (state.context) {
        systemPrompt += `\n\nContexto relevante:\n${state.context}`;
      }

      if (state.toolResults && state.toolResults.length > 0) {
        systemPrompt += `\n\nResultados de herramientas:\n${JSON.stringify(state.toolResults, null, 2)}`;
      }

      messages.push(new SystemMessage(systemPrompt));

      for (const msg of state.messages) {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
      }

      // Solución al error de tipos: convertir BaseMessage[] a BaseMessageLike[]
      // Esto puede requerir importar BaseMessageLike y mapear los mensajes si es necesario.
      // Pero si los mensajes ya cumplen con la interfaz, simplemente castear:
      const response = await this.llm.invoke(messages as any);

      const newMessages = [
        ...state.messages,
        {
          role: 'assistant' as const,
          content: response.content as string,
        }
      ];

      return { messages: newMessages };
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Lo siento, ocurrió un error al generar la respuesta.',
      };

      return { messages: [...state.messages, errorMessage] };
    }
  }

  async chat(
    conversationId: string, 
    message: string, 
    _userId: string
  ): Promise<{ role: 'assistant'; content: string; timestamp: string }> {
    try {
      // Guardar mensaje del usuario
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
      });

      // Obtener historial
      const { data: history } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      // Estado inicial
      const initialState: AgentState = {
        messages: (history as Message[] || []).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        agentId: this.agentId,
        conversationId,
      };

      // Ejecutar el grafo
      const finalState = await this.graph.invoke(initialState);

      // Guardar respuesta del asistente
      const assistantMessage = finalState.messages[finalState.messages.length - 1];
      
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantMessage.content,
      });

      return {
        role: 'assistant',
        content: assistantMessage.content,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
}

export default AIAgent;