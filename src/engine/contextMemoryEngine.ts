import { ChatMessage, ClassificationResult, MathCalculationData, TimeData } from '../types';
import { solveMath } from './mathEngine';
import { detectTimeIntent, resolveTimeQuery } from './timeEngine';

export interface ContextualAnalysis {
  isFollowUp: boolean;
  type: 'joke_followup' | 'concept_followup' | 'math_followup' | 'time_followup' | 'personal_followup' | 'none';
  reply?: string;
  contextTopic?: string;
  contextReasoning?: string;
  searchTopic?: string;
  originalQuestion?: string;
  mathResult?: MathCalculationData;
  timeData?: TimeData;
}

/**
 * Catálogo de chistes y sus explicaciones de remate para cuando el usuario pregunta
 * "¿Por qué?", "¿Por qué WhatsApp?", "¿No entendí?", etc.
 */
interface JokeExplanation {
  patterns: RegExp;
  punchlineKeywords: RegExp;
  explanation: string;
}

const JOKE_EXPLANATIONS: JokeExplanation[] = [
  {
    // Chiste de los pájaros, WhatsApp y Twitter
    patterns: /pajaros|pájaros|whatsapp|twitter|red social/i,
    punchlineKeywords: /whatsapp|twitter|pajaros|aves|piar|tweet/i,
    explanation:
      '¡Jajaja! Te explico el chiste: se trata de un juego de palabras. Antes de que se llamara X, el logo y símbolo de Twitter era un pajarito azul (y además en inglés "tweet" significa el trinar o piar de las aves). Por eso la broma dice que los pájaros ya tenían su propia red social hecha para ellos y que por eso no necesitaban WhatsApp. 😂 ¿Te gustó la explicación o te cuento otro mejor?',
  },
  {
    // Chiste del semáforo
    patterns: /semaforo|semáforo|cambiando/i,
    punchlineKeywords: /semaforo|cambiando|ropa|mirar/i,
    explanation:
      '¡Jajaja! El chiste juega con el doble sentido de la palabra "cambiando". Cuando una persona dice que se está cambiando, pensamos en cambiarse de ropa. Pero los semáforos cambian de luz (verde, amarillo y rojo). Por eso el semáforo se apena y dice que no lo miren porque "se está cambiando". 😂 ¿Quieres que te cuente otro?',
  },
  {
    // Chiste de la abeja en el gimnasio
    patterns: /abeja|gimnasio|zumba|zum-ba/i,
    punchlineKeywords: /abeja|gimnasio|zumba|zum/i,
    explanation:
      '¡Jajaja! Es un juego de palabras entre el sonido de las abejas (el "zumbido" o zummm) y el baile aeróbico de ejercicio llamado "Zumba". Por eso al ir al gimnasio la abeja hace ¡Zum-ba! 🐝😆 ¿Quieres otro chiste?',
  },
  {
    // Chiste del pez
    patterns: /pez|agua|nada/i,
    punchlineKeywords: /pez|agua|nada|nadar/i,
    explanation:
      '¡Jajaja! Es un juego de palabras clásico: "nada" del verbo nadar, y "nada" de vacío o no hacer ninguna cosa. ¡Por eso cuando preguntan qué hace en el agua, la respuesta es "nada"! 🐟😂',
  },
  {
    // Chiste del 0 y el 8
    patterns: /cinturon|cinturón|cero|ocho/i,
    punchlineKeywords: /cinturon|cero|ocho|numero/i,
    explanation:
      '¡Jajaja! Es porque visualmente el número 8 parece un número 0 bien apretado por la cintura con un cinturón. 😂',
  },
];

const FRESH_JOKES = [
  '¿Por qué los pájaros no usan WhatsApp? —Porque ya tienen Twitter. 🐦😂',
  '¿Qué le dice un semáforo a otro? —¡No me mires, que me estoy cambiando! 🚦😄',
  '¿Qué hace una abeja en el gimnasio? —¡Zum-ba! 🐝😆',
  '¿Qué le dijo el número 0 al 8? —¡Oye, me gusta tu cinturón! ♾️😂',
  '¿Cómo se despiden los químicos? —Ácido un placer. 🧪😄',
  '¿Qué hace un perro con un taladro? —Taladrando. 🐕😂',
  '¿Qué le dice una taza a otra? —¿Qué taza-cierto? ☕😆',
];

/**
 * Normaliza texto eliminando acentos y signos de puntuación
 */
export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrae y estandariza el tema canónico (entidad o sujeto principal) de cualquier frase o pregunta.
 * Ejemplos:
 * "que es el sol" -> "el Sol"
 * "que es la fotosintesis" -> "la fotosíntesis"
 * "por que es tan brillante el sol" -> "el Sol"
 * "quien fue albert einstein" -> "Albert Einstein"
 * "sol" -> "el Sol"
 */
export function extractCanonicalTopic(rawText: string): string {
  if (!rawText) return '';

  let s = rawText
    .replace(/[¿?¡!.,;:"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Quitar prefijos de preguntas frecuentes
  const prefixRegexes = [
    /^(?:que|cual|cuales|quien|quienes|donde|cuando|como|por que|porque|cuanto|cuantos)\s+(?:es|son|era|eran|fue|fueron|queda|esta|significa|ocurre|pasa|se llama|se origino|se creo|lo creo|lo descubrio|mide|pesa|se produce)\s+(?:el|la|los|las|un|una|unos|unas)?\s*/i,
    /^(?:por que es tan brillante|por que es tan caliente|por que brilla|por que no se cae|por que es|por que ocurre|como funciona el proceso de|como funciona|donde queda|donde esta|de que esta hecho|cuando se descubrio|quien invento)\s+(?:el|la|los|las)?\s*/i,
    /^(?:definicion de|concepto de|informacion sobre|informacion de|cuentame sobre|cuentame de|historia de|origen de|dime sobre|que sabes de|que sabes sobre|hablame de|acerca de|sobre)\s+(?:el|la|los|las)?\s*/i,
  ];

  for (const reg of prefixRegexes) {
    s = s.replace(reg, '').trim();
  }

  // Si quedó algo limpio
  if (s.length < 2) return '';

  // Limpiar palabras residuales comunes
  s = s.replace(/\s+(?:en internet|en wikipedia|en google|hoy|en el mundo)$/i, '').trim();

  // Agregar artículo o capitalizar según el caso
  const lower = s.toLowerCase();
  if (lower === 'sol') return 'el Sol';
  if (lower === 'luna') return 'la Luna';
  if (lower === 'tierra') return 'la Tierra';
  if (lower === 'universo') return 'el Universo';
  if (lower === 'fotosintesis') return 'la fotosíntesis';
  if (lower === 'gravedad') return 'la gravedad';
  if (lower === 'marte') return 'Marte';
  if (lower === 'jupiter') return 'Júpiter';

  // Capitalizar primera letra de cada palabra clave si es nombre propio, o primera general
  if (/^[a-záéíóúñ]/i.test(s)) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  return s;
}

/**
 * Detecta si el usuario está introduciendo explícitamente un NUEVO tema
 * (ej: "qué es la luna" cuando se hablaba de "el sol").
 */
export function isExplicitNewTopic(userInput: string, currentTopic?: string): { isNew: boolean; newTopic?: string } {
  const clean = cleanText(userInput);

  // Patrones directos de definición de un nuevo tema
  const newTopicPatterns = [
    /^(?:que es|que son|que significa|definicion de|concepto de)\s+(?:el|la|los|las|un|una)?\s*([a-z\s]{3,30})/i,
    /^(?:quien fue|quien es|quienes fueron)\s+([a-z\s]{3,30})/i,
    /^(?:donde queda|donde se encuentra|donde esta ubicado)\s+(?:el|la|los|las)?\s*([a-z\s]{3,30})/i,
    /^(?:hablame de|cuentame de|cuentame sobre|dime sobre|informacion de)\s+(?:el|la|los|las)?\s*([a-z\s]{3,30})/i,
    /^(?:cambiando de tema|ahora|hablemos de)\s+(?:sobre|de)?\s*(?:el|la|los|las)?\s*([a-z\s]{3,30})/i,
  ];

  for (const pat of newTopicPatterns) {
    const match = clean.match(pat);
    if (match && match[1]) {
      const extracted = match[1].trim();
      const currentNorm = currentTopic ? cleanText(currentTopic) : '';
      // Si la nueva entidad no contiene el tema actual y tiene al menos 3 letras, es nuevo tema
      if (extracted.length >= 3 && (!currentNorm || !extracted.includes(currentNorm))) {
        return { isNew: true, newTopic: extractCanonicalTopic(extracted) };
      }
    }
  }

  return { isNew: false };
}

/**
 * Extrae el estado y contexto más reciente de la conversación
 */
export function extractConversationContext(history: ChatMessage[]): {
  lastBotMessage?: ChatMessage;
  lastUserMessage?: ChatMessage;
  lastCategory?: string;
  activeTopic?: string;
  lastMathResult?: MathCalculationData;
  lastTimeData?: TimeData;
  lastJokeText?: string;
} {
  if (!history || history.length === 0) return {};

  let lastBotMessage: ChatMessage | undefined;
  let lastUserMessage: ChatMessage | undefined;

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.sender === 'meteory' && !lastBotMessage) {
      lastBotMessage = msg;
    } else if (msg.sender === 'user' && !lastUserMessage) {
      lastUserMessage = msg;
    }
    if (lastBotMessage && lastUserMessage) break;
  }

  const lastCategory = lastBotMessage?.classification?.category;
  const lastMathResult = lastBotMessage?.mathResult;
  const lastTimeData = lastBotMessage?.timeData;

  // Buscar el tema activo más reciente en el historial
  let activeTopic = '';

  // 1. Prioridad: contextTopic explícito en los últimos mensajes de Meteory
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.sender === 'meteory' && msg.classification?.contextTopic) {
      activeTopic = msg.classification.contextTopic;
      break;
    }
  }

  // 2. Si no hay contextTopic, revisar webSearch.query del último mensaje
  if (!activeTopic && lastBotMessage?.webSearch?.query) {
    activeTopic = extractCanonicalTopic(lastBotMessage.webSearch.query);
  }

  // 3. Si no hay webSearch.query, revisar si el usuario preguntó "que es X" en el último mensaje
  if (!activeTopic && lastUserMessage?.text) {
    const userClean = cleanText(lastUserMessage.text);
    const m = userClean.match(/^(?:que es|que son|quien es|quien fue|donde queda|cuentame de)\s+(?:el|la|los|las)?\s*([a-z\s]{3,30})/i);
    if (m && m[1]) {
      activeTopic = extractCanonicalTopic(m[1]);
    }
  }

  // 4. Fallback: extraer de negritas en el texto del bot (ej: "**el Sol**")
  if (!activeTopic && lastBotMessage?.text) {
    const boldMatch = lastBotMessage.text.match(/\*\*([a-záéíóúñ\s]{3,30})\*\*/i);
    if (boldMatch && boldMatch[1]) {
      activeTopic = extractCanonicalTopic(boldMatch[1]);
    }
  }

  // Detectar si el último mensaje del bot fue un chiste
  let lastJokeText: string | undefined;
  if (lastCategory === 'chiste_humor' || (lastBotMessage && /chiste|—porque|😄|😂|😆/i.test(lastBotMessage.text))) {
    lastJokeText = lastBotMessage?.text;
  }

  return {
    lastBotMessage,
    lastUserMessage,
    lastCategory,
    activeTopic,
    lastMathResult,
    lastTimeData,
    lastJokeText,
  };
}

/**
 * Analiza si el mensaje del usuario es una pregunta de seguimiento ("¿por qué?", "por que whatsapp", etc.)
 * relacionada con lo que se acaba de hablar.
 */
export function analyzeContextualFollowUp(
  userInput: string,
  history: ChatMessage[]
): ContextualAnalysis {
  if (!history || history.length === 0) {
    return { isFollowUp: false, type: 'none' };
  }

  const context = extractConversationContext(history);
  const { lastBotMessage, lastCategory, activeTopic, lastMathResult, lastTimeData, lastJokeText } = context;

  if (!lastBotMessage) {
    return { isFollowUp: false, type: 'none' };
  }

  const clean = cleanText(userInput);
  const words = clean.split(' ').filter(Boolean);

  // =========================================================================
  // CASO 1: SEGUIMIENTO A UN CHISTE (HUMOR & CHISTES)
  // Ejemplos: "por que whatsapp", "por que twitter", "¿por qué?", "no entendí", "explícame"
  // =========================================================================
  if (lastCategory === 'chiste_humor' || lastJokeText) {
    // Si el usuario pide otro chiste
    const asksAnotherJoke =
      /^(otro|otro chiste|cuentame otro|dime otro|uno mas|otro mas|mas chistes|echate otro|tienes otro)\b/.test(clean);

    if (asksAnotherJoke) {
      const currentJoke = lastJokeText || '';
      const available = FRESH_JOKES.filter((j) => !currentJoke.includes(j.slice(0, 15)));
      const nextJoke = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : FRESH_JOKES[0];

      return {
        isFollowUp: true,
        type: 'joke_followup',
        reply: `¡Claro, aquí va otro para ti! 😄\n\n${nextJoke}\n\n¿Qué tal ese? ¿Te gustó?`,
        contextReasoning: 'Solicitud de continuación de chistes en la conversación.',
      };
    }

    // Si el usuario pregunta "por qué...", "por que...", "no entendí", "explícame", "cómo así", etc.
    const isWhyOrExplain =
      clean === 'por que' ||
      clean === 'porque' ||
      clean === 'por que razon' ||
      clean === 'como' ||
      clean === 'como asi' ||
      clean === 'no entendi' ||
      clean === 'no entiendo' ||
      clean === 'explicamelo' ||
      clean === 'explica' ||
      clean === 'explicame' ||
      clean === 'que significa' ||
      clean === 'a que te refieres' ||
      clean === 'por que dices eso' ||
      clean.startsWith('por que ') ||
      clean.startsWith('porque ') ||
      clean.startsWith('como que ') ||
      clean.startsWith('por que no ') ||
      clean.startsWith('no entendi lo de');

    if (isWhyOrExplain) {
      const botJoke = lastJokeText || '';

      // Buscar si el chiste corresponde a alguna explicación de nuestro catálogo
      for (const item of JOKE_EXPLANATIONS) {
        if (item.patterns.test(botJoke) || item.punchlineKeywords.test(clean)) {
          return {
            isFollowUp: true,
            type: 'joke_followup',
            reply: item.explanation,
            contextReasoning: `Explicación contextual del remate del chiste previo (${item.punchlineKeywords.source}).`,
          };
        }
      }

      // Explicación genérica si no está en el catálogo específico
      return {
        isFollowUp: true,
        type: 'joke_followup',
        reply: `¡Jajaja! Es un juego de palabras o una situación absurda propia del humor. A veces estos chistes son tan malos o simples que justamente de ahí viene la gracia. 😂 ¿Te cuento otro mejor estructurado?`,
        contextReasoning: 'Explicación general sobre el chiste anterior.',
      };
    }
  }

  // =========================================================================
  // CASO 2: SEGUIMIENTO A CÁLCULOS MATEMÁTICOS ENCADENADOS
  // Ejemplos: "+ 10", "- 5", "por 2", "dividido 4", "mas 15", "x 3"
  // =========================================================================
  if (lastMathResult !== undefined && lastMathResult.result !== undefined) {
    const prevNum = typeof lastMathResult.result === 'number' ? lastMathResult.result : parseFloat(String(lastMathResult.result));

    if (!isNaN(prevNum)) {
      const addMatch = clean.match(/^(?:\+|mas|suma|sumale)\s*(\d+(?:\.\d+)?)$/i);
      if (addMatch) {
        const operand = parseFloat(addMatch[1]);
        const res = prevNum + operand;
        return {
          isFollowUp: true,
          type: 'math_followup',
          reply: `Tomando el resultado anterior (**${prevNum}**) y sumándole **${operand}**, obtenemos **${res}**.`,
          contextReasoning: `Cálculo encadenado: ${prevNum} + ${operand} = ${res}`,
          mathResult: {
            rawExpression: `${prevNum} + ${operand}`,
            cleanedExpression: `${prevNum} + ${operand}`,
            result: res,
            formattedResult: String(res),
            type: 'Cálculo Encadenado',
            steps: [`Resultado previo: ${prevNum}`, `Operación: + ${operand}`, `Total: ${res}`],
            executionTimeMs: 1,
          },
        };
      }

      const subMatch = clean.match(/^(?:-|menos|resta|restale)\s*(\d+(?:\.\d+)?)$/i);
      if (subMatch) {
        const operand = parseFloat(subMatch[1]);
        const res = prevNum - operand;
        return {
          isFollowUp: true,
          type: 'math_followup',
          reply: `Tomando el resultado anterior (**${prevNum}**) y restándole **${operand}**, obtenemos **${res}**.`,
          contextReasoning: `Cálculo encadenado: ${prevNum} - ${operand} = ${res}`,
          mathResult: {
            rawExpression: `${prevNum} - ${operand}`,
            cleanedExpression: `${prevNum} - ${operand}`,
            result: res,
            formattedResult: String(res),
            type: 'Cálculo Encadenado',
            steps: [`Resultado previo: ${prevNum}`, `Operación: - ${operand}`, `Total: ${res}`],
            executionTimeMs: 1,
          },
        };
      }

      const mulMatch = clean.match(/^(?:\*|x|por|multiplicado por|multiplica por)\s*(\d+(?:\.\d+)?)$/i);
      if (mulMatch) {
        const operand = parseFloat(mulMatch[1]);
        const res = prevNum * operand;
        return {
          isFollowUp: true,
          type: 'math_followup',
          reply: `Tomando el resultado anterior (**${prevNum}**) y multiplicándolo por **${operand}**, obtenemos **${res}**.`,
          contextReasoning: `Cálculo encadenado: ${prevNum} * ${operand} = ${res}`,
          mathResult: {
            rawExpression: `${prevNum} * ${operand}`,
            cleanedExpression: `${prevNum} * ${operand}`,
            result: res,
            formattedResult: String(res),
            type: 'Cálculo Encadenado',
            steps: [`Resultado previo: ${prevNum}`, `Operación: * ${operand}`, `Total: ${res}`],
            executionTimeMs: 1,
          },
        };
      }

      const divMatch = clean.match(/^(?:\/|entre|dividido entre|divide entre|dividelo por)\s*(\d+(?:\.\d+)?)$/i);
      if (divMatch) {
        const operand = parseFloat(divMatch[1]);
        if (operand === 0) {
          return {
            isFollowUp: true,
            type: 'math_followup',
            reply: `No es posible dividir entre cero. El resultado anterior sigue siendo **${prevNum}**.`,
            contextReasoning: 'Intento de división por cero sobre resultado anterior.',
          };
        }
        const res = Math.round((prevNum / operand) * 10000) / 10000;
        return {
          isFollowUp: true,
          type: 'math_followup',
          reply: `Dividiendo el resultado anterior (**${prevNum}**) entre **${operand}**, nos da **${res}**.`,
          contextReasoning: `Cálculo encadenado: ${prevNum} / ${operand} = ${res}`,
          mathResult: {
            rawExpression: `${prevNum} / ${operand}`,
            cleanedExpression: `${prevNum} / ${operand}`,
            result: res,
            formattedResult: String(res),
            type: 'Cálculo Encadenado',
            steps: [`Resultado previo: ${prevNum}`, `Operación: / ${operand}`, `Total: ${res}`],
            executionTimeMs: 1,
          },
        };
      }
    }
  }

  // =========================================================================
  // CASO 3: SEGUIMIENTO A CONSULTAS TEMPORALES (HORA / FECHA)
  // Ejemplos: "¿Y en Japón?", "¿Y en Tokio?", "¿Y qué día es allá?", "¿Y en España?"
  // =========================================================================
  if (lastTimeData || lastCategory === 'informacion_temporal') {
    const timeFollowUpMatch = clean.match(/^(?:y\s+en|y\s+para|que\s+hora\s+es\s+en|hora\s+en)\s+([a-z\s]+)$/i);
    if (timeFollowUpMatch) {
      const location = timeFollowUpMatch[1].trim();
      const directCheck = detectTimeIntent(`que hora es en ${location}`);
      if (directCheck.isTimeQuery) {
        const timeSolution = resolveTimeQuery(`que hora es en ${location}`, directCheck);
        return {
          isFollowUp: true,
          type: 'time_followup',
          reply: `Siguiendo con la hora mundial, ${timeSolution.reply.charAt(0).toLowerCase() + timeSolution.reply.slice(1)}`,
          timeData: timeSolution.data,
          contextReasoning: `Consulta temporal de seguimiento para ubicación: ${location}`,
        };
      }
    }
  }

  // =========================================================================
  // CASO 4: SEGUIMIENTO UNIVERSAL A CONCEPTOS & PREGUNTAS CONTINUAS
  // Ejemplo dado por el usuario:
  // Usuario: "que es el sol" -> Meteory responde sobre el Sol.
  // Usuario: "porque es tan brillante" -> Meteory reconoce que pregunta "¿Por qué es tan brillante el Sol?"
  // Y lo aplica a CUALQUIER pregunta de seguimiento (temperatura, origen, tamaño, etc.).
  // =========================================================================
  if (activeTopic && activeTopic.length >= 2) {
    // 1. Verificar si el usuario está cambiando explícitamente a un tema diferente
    const newTopicCheck = isExplicitNewTopic(userInput, activeTopic);
    if (newTopicCheck.isNew) {
      // El usuario inició una nueva pregunta sobre otro concepto diferente
      return { isFollowUp: false, type: 'none' };
    }

    // 2. Comprobar si es un cálculo nuevo o una consulta de hora explícita
    if (/^(?:calcula|cuanto es \d|\d+\s*[\+\-\*\/]\s*\d)/i.test(clean)) {
      return { isFollowUp: false, type: 'none' };
    }
    if (/^(?:que hora es|que fecha es|que dia es)/i.test(clean)) {
      return { isFollowUp: false, type: 'none' };
    }
    if (/^(?:cuentame un chiste|dime un chiste|chiste)/i.test(clean)) {
      return { isFollowUp: false, type: 'none' };
    }

    // 3. Normalizar la pregunta del usuario
    let questionText = userInput
      .replace(/[¿?¡!]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Estandarizar "porque" al inicio a "por que" para búsquedas más precisas
    let standardizedQuery = clean;
    if (standardizedQuery.startsWith('porque ')) {
      standardizedQuery = 'por que ' + standardizedQuery.slice(7);
    } else if (standardizedQuery === 'porque') {
      standardizedQuery = 'por que';
    }

    // 4. Identificar si la pregunta es un seguimiento al tema activo
    // Revisar patrones de preguntas frecuentes donde se omite el sujeto (anáfora)
    const isTopicFollowUp =
      // ¿Por qué...?
      /^por que\b/i.test(standardizedQuery) ||
      // ¿Cómo...?
      /^como\b/i.test(standardizedQuery) ||
      // ¿Dónde...?
      /^donde\b/i.test(standardizedQuery) ||
      // ¿Cuándo...?
      /^cuando\b/i.test(standardizedQuery) ||
      // ¿Cuánto / Cuántos / Cuánta / Cuántas / A qué distancia / A qué temperatura...?
      /^(?:cuanto|cuantos|cuanta|cuantas|a que distancia|a que temperatura|a que velocidad|que tamano|que tan)\b/i.test(standardizedQuery) ||
      // ¿Quién / Quiénes...?
      /^quien(?:es)?\b/i.test(standardizedQuery) ||
      // ¿De qué...?
      /^de que\b/i.test(standardizedQuery) ||
      // ¿Para qué...?
      /^para que\b/i.test(standardizedQuery) ||
      // ¿Qué pasa si / Qué pasaría si / Qué ocurre si...?
      /^que pasa si\b|^que pasaria si\b|^que ocurre si\b|^que sucederia si\b/i.test(standardizedQuery) ||
      // ¿Es / Son / Era / Sería...? (ej: "¿es peligroso?", "¿es una estrella?", "¿es infinito?")
      /^(?:es|son|era|eran|seria|serian)\s+/i.test(standardizedQuery) ||
      // ¿Tiene / Tienen...? (ej: "¿tiene agua?", "¿tiene fin?", "¿tiene manchas?")
      /^(?:tiene|tienen|tenia|tenian)\s+/i.test(standardizedQuery) ||
      // ¿Se puede...? (ej: "¿se puede viajar?", "¿se puede tocar?", "¿se puede apagar?")
      /^(?:se puede|se podria|se podrian)\s+/i.test(standardizedQuery) ||
      // ¿Hay...? (ej: "¿hay vida?", "¿hay oxigeno?")
      /^(?:hay|habia|existiria)\s+/i.test(standardizedQuery) ||
      // ¿Cuál es su...? / ¿Cuáles son sus...? (ej: "¿cuál es su masa?", "¿cuál es su origen?")
      /^(?:cual es su|cuales son sus|cual seria su)\s+/i.test(standardizedQuery) ||
      // ¿Y [algo]...? (ej: "¿y en la noche?", "¿y la corona?", "¿y los eclipses?")
      /^y\s+(?:el|la|los|las|en|de|con|su|sus)?\s*[a-z]/i.test(standardizedQuery) ||
      // Preguntas cortas de profundización: "explícame más", "no entendí", "por qué?", "cómo?"
      /^(?:explicame mas|cuentame mas|dime mas|detalles|mas info|mas informacion|no entendi|no me quedo claro|por que|como|cuando|donde|cuanto)$/i.test(standardizedQuery);

    if (isTopicFollowUp) {
      // 5. Construir la consulta combinada enriquecida:
      // Si el usuario ya mencionó el tema en su pregunta, la dejamos intacta.
      // Si NO lo mencionó (caso típico: "porque es tan brillante"), incorporamos el tema activo de forma natural.
      const activeTopicNorm = cleanText(activeTopic);
      const userMentionsTopic = clean.includes(activeTopicNorm);

      let enrichedSearchQuery = '';

      if (userMentionsTopic) {
        // Ya tiene el sujeto
        enrichedSearchQuery = standardizedQuery;
      } else {
        // Enlazar de acuerdo a la estructura de la duda
        if (standardizedQuery === 'por que') {
          enrichedSearchQuery = `por que ocurre y como funciona ${activeTopic}`;
        } else if (standardizedQuery === 'como' || standardizedQuery === 'como funciona') {
          enrichedSearchQuery = `como funciona el proceso de ${activeTopic}`;
        } else if (standardizedQuery === 'donde' || standardizedQuery === 'donde esta') {
          enrichedSearchQuery = `donde se encuentra o donde esta ubicado ${activeTopic}`;
        } else if (standardizedQuery === 'cuando') {
          enrichedSearchQuery = `cuando se origino o cuando ocurre ${activeTopic}`;
        } else if (standardizedQuery === 'cuanto mide') {
          enrichedSearchQuery = `cuanto mide el tamano de ${activeTopic}`;
        } else if (standardizedQuery === 'a que temperatura esta') {
          enrichedSearchQuery = `temperatura de ${activeTopic}`;
        } else if (/^(?:explicame mas|cuentame mas|dime mas|detalles)/i.test(standardizedQuery)) {
          enrichedSearchQuery = `detalles y caracteristicas completas de ${activeTopic}`;
        } else if (/^y\s+/i.test(standardizedQuery)) {
          const subterm = standardizedQuery.replace(/^y\s+(?:el|la|los|las)?\s*/i, '').trim();
          enrichedSearchQuery = `${subterm} en relacion con ${activeTopic}`;
        } else {
          // Para "porque es tan brillante" -> "por que es tan brillante el Sol"
          enrichedSearchQuery = `${standardizedQuery} ${activeTopic}`;
        }
      }

      return {
        isFollowUp: true,
        type: 'concept_followup',
        contextTopic: activeTopic,
        searchTopic: enrichedSearchQuery,
        originalQuestion: questionText,
        contextReasoning: `Pregunta de seguimiento sobre "${activeTopic}". Consulta enriquecida contextual: "${enrichedSearchQuery}".`,
      };
    }
  }

  // =========================================================================
  // CASO 5: SEGUIMIENTO CONVERSACIONAL / PERSONAL
  // Ejemplos: "¿Por qué dices eso?", "¿En serio?", "¿De verdad?", "¿Por qué?", "¿Y tú qué opinas?"
  // =========================================================================
  if (
    clean === 'por que' ||
    clean === 'porque' ||
    clean === 'en serio' ||
    clean === 'de verdad' ||
    clean === 'por que dices eso' ||
    clean === 'a que te refieres' ||
    clean === 'y tu que opinas'
  ) {
    if (lastCategory === 'conversacion_personal' || lastCategory === 'pregunta_identidad') {
      return {
        isFollowUp: true,
        type: 'personal_followup',
        reply:
          'Te lo digo porque me gusta ser muy sincera contigo y darte respuestas útiles y con buena onda. 😊 ¿Hay algo puntual en lo que quieras que profundicemos o que busquemos juntos?',
        contextReasoning: 'Continuación conversacional en hilo personal.',
      };
    }
  }

  return { isFollowUp: false, type: 'none' };
}
