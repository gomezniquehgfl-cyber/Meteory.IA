import { ChatMessage, ChatSession } from '../types';

const STORAGE_KEY = 'meteory_sessions_v1';
const ACTIVE_SESSION_KEY = 'meteory_active_session_id_v1';

export const DEFAULT_INITIAL_MESSAGE: ChatMessage = {
  id: 'initial-welcome',
  sender: 'meteory',
  text: '¡Hola! Qué gusto saludarte. Soy Meteory ✨, tu IA compañera con memoria conversacional, búsqueda web en vivo, reloj mundial y calculadora científica.\n\n¿De qué te gustaría platicar o qué tema te gustaría investigar hoy? 🚀',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  classification: {
    category: 'saludo_general',
    categoryName: 'Personal',
    confidence: 100,
    tokens: ['hola'],
    normalizedText: 'hola',
    executionTimeMs: 0.1,
    reasoning: 'Saludo de bienvenida natural y entusiasta.',
    isGreeting: true,
  },
};

export function createNewSession(title = 'Nueva conversación'): ChatSession {
  const now = Date.now();
  return {
    id: `session-${now}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    createdAt: now,
    updatedAt: now,
    messages: [], // Nuevo chat limpio desde cero
  };
}

export function loadSessions(): { sessions: ChatSession[]; activeSessionId: string } {
  try {
    const rawSessions = localStorage.getItem(STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);

    if (rawSessions) {
      const parsed: ChatSession[] = JSON.parse(rawSessions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const found = parsed.find((s) => s.id === activeId);
        return {
          sessions: parsed,
          activeSessionId: found ? found.id : parsed[0].id,
        };
      }
    }
  } catch (err) {
    console.error('Error reading sessions from localStorage:', err);
  }

  // Si no hay sesiones previas, inicializamos una por defecto
  const initial = createNewSession('Conversación principal');
  saveSessions([initial], initial.id);
  return {
    sessions: [initial],
    activeSessionId: initial.id,
  };
}

export function saveSessions(sessions: ChatSession[], activeSessionId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
  } catch (err) {
    console.error('Error saving sessions to localStorage:', err);
  }
}

/**
 * Genera un título inteligente y representativo basado en los primeros intercambios.
 */
export function deriveSessionTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.sender === 'user');
  if (!firstUserMsg) return 'Nueva conversación';

  const clean = firstUserMsg.text.trim().replace(/[¿?¡!]/g, '');
  if (clean.length > 32) {
    return clean.slice(0, 30) + '...';
  }
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
