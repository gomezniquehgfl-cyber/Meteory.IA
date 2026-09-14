import { ChatMessage, ClassificationResult, IntentCategory, MathCalculationData, TimeData } from '../types';
import { checkAdvancedKnowledge } from './advancedKnowledge';
import { analyzeContextualFollowUp, extractCanonicalTopic } from './contextMemoryEngine';
import { GREETING_RULES, UNKNOWN_RESPONSES } from './greetingsData';
import { detectMathIntent, solveMath } from './mathEngine';
import { detectTimeIntent, resolveTimeQuery } from './timeEngine';
import { findBatteryAnswer } from './batteryQuestions';

/**
 * Normaliza un texto removiendo tildes, signos de puntuación extraños
 * y reduciendo caracteres repetidos (ej: "hooooola" -> "hola").
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText.toLowerCase().trim();

  // Eliminar tildes y diacríticos manteniendo caracteres legibles
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Limpiar signos de puntuación comunes
  text = text.replace(/[¿?¡!.,;:"'()[\]{}<>_~`#@*\/\\|-]/g, ' ');

  // Reducir caracteres repetidos más de 2 veces
  text = text.replace(/(.)\1{2,}/g, '$1$1');

  // Colapsar espacios múltiples
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Distancia de Levenshtein para coincidencia difusa (manejo de faltas o errores de tipeo).
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (b.charAt(j - 1) === a.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Detecta si la intención del usuario es PERSONAL / CONVERSACIONAL
 * (saludos, preguntas a Meteory, estados de ánimo, afecto, gracias, risas, confirmaciones).
 */
export function detectPersonalIntent(input: string): {
  isPersonal: boolean;
  category?: IntentCategory;
  categoryName?: string;
  matchedRule?: (typeof GREETING_RULES)[0];
  customReply?: string;
  confidence: number;
  reasoning: string;
} {
  const normalized = normalizeText(input);
  const trimmed = input.trim();
  const tokens = normalized.split(' ').filter(Boolean);

  // 1. Preguntas directas sobre la identidad de Meteory
  const identityRegex = /^(quien eres|como te llamas|cual es tu nombre|que eres|de donde eres|quien te creo|quien es tu creador|para que sirves|que sabes hacer|que haces|que puedes hacer|presentate)\b/i;
  if (identityRegex.test(normalized)) {
    const rule = GREETING_RULES.find((r) => r.id === 'pregunta_identidad');
    return {
      isPersonal: true,
      category: 'pregunta_identidad',
      categoryName: 'Identidad de Meteory',
      matchedRule: rule,
      confidence: 99,
      reasoning: 'Pregunta directa sobre la identidad y capacidades de Meteory IA.',
    };
  }

  // 2. Respuestas breves y charla cotidiana (confirmaciones, humor, charlas rápidas)
  const quickChatPatterns: { regex: RegExp; replies: string[]; category: IntentCategory; name: string }[] = [
    {
      regex: /^(gracias|muchas gracias|mil gracias|te lo agradezco|te agradezco|muchisimas gracias|thanks)\b/i,
      category: 'agradecimiento',
      name: 'Agradecimiento',
      replies: [
        '¡De nada! Es un gusto enorme ayudarte. ¿Hay algo más en lo que te pueda colaborar hoy?',
        '¡Para eso estoy! Me alegra haber sido útil. ¿Qué otra duda o tema te gustaría explorar?',
        '¡Con mucho gusto! Aquí me tienes siempre listo para charlar o investigar.',
      ],
    },
    {
      regex: /^(ok|vale|dale|de acuerdo|entendido|perfecto|genial|excelente|super|bueno|ya veo|ah bueno)\b/i,
      category: 'conversacion_personal',
      name: 'Confirmación Conversacional',
      replies: [
        '¡Excelente! Aquí sigo atento. Cuéntame si quieres hablar de algo o si tienes alguna pregunta.',
        '¡Perfecto! Dime qué más tienes en mente y con gusto seguimos.',
        '¡Entendido! Siempre listo por aquí. ¿Seguimos conversando o investigamos algo nuevo?',
      ],
    },
    {
      regex: /^(bien y tu|bien y vos|bien gracias|todo bien|muy bien|super bien|genial y tu|yo bien)\b/i,
      category: 'conversacion_personal',
      name: 'Respuesta de Cortesía',
      replies: [
        '¡Me alegra muchísimo saberlo! Por aquí todo de maravilla también, listo para acompañarte. ¿De qué te gustaría hablar?',
        '¡Qué buena noticia! Me encanta saber que estás bien. ¿Tienes alguna pregunta en mente o solo pasabas a saludar?',
      ],
    },
    {
      regex: /^(nada|nada y tu|nada aqui|aburrido|aburrida|no mucho|aqui nada mas)\b/i,
      category: 'conversacion_personal',
      name: 'Charla Informal',
      replies: [
        '¡Te entiendo! A veces un momento de calma viene bien. Si quieres platicar, que te cuente un chiste o buscar algo curioso, solo dime.',
        'A veces no hacer nada también se disfruta. Pero si te provoca aprender algo nuevo o hacerme una pregunta sobre el mundo, ¡aquí estoy!',
      ],
    },
    {
      regex: /^(te quiero|te amo|eres genial|eres el mejor|eres la mejor|me caes muy bien|me caes bien|eres mi amigo|eres mi amiga)\b/i,
      category: 'conversacion_personal',
      name: 'Afecto & Compañerismo',
      replies: [
        '¡Muchas gracias por esas palabras tan cálidas! Me hace muy feliz poder acompañarte y ser de utilidad para ti.',
        '¡Qué lindo detalle! Yo también disfruto mucho conversar contigo. Aquí estaré siempre que me necesites.',
      ],
    },
    {
      regex: /^(cuentame un chiste|dime un chiste|hazme reir|un chiste|algo chistoso|otro chiste)\b/i,
      category: 'chiste_humor',
      name: 'Humor & Chistes',
      replies: [
        '¿Qué le dice una impresora a otra? —Ese trabajo es tuyo o es una impresión mía. 😂',
        '¿Qué hace una abeja en el gimnasio? —¡Zum-ba! 🐝😆',
        '¿Por qué los pájaros no usan WhatsApp? —Porque ya tienen Twitter. 🐦😄',
        '¿Qué le dice un semáforo a otro? —¡No me mires, que me estoy cambiando! 🚦',
      ],
    },
    {
      regex: /^(jajaja|jaja|jejeje|jeje|jajajaja|xd|lol)\b/i,
      category: 'chiste_humor',
      name: 'Risa & Humor',
      replies: [
        '¡Me encanta sacarte una sonrisa! La risa alegra el día. ¿Quieres otro chiste o qué más se te ocurre?',
        '¡Jajaja, me alegra que te haga gracia! ¿En qué más andas hoy?',
      ],
    },
    {
      regex: /^(dime un dato curioso|dato curioso|sabias que|sabías que|cuentame una curiosidad|algo interesante|fun fact)\b/i,
      category: 'curiosidades_ciencia',
      name: 'Curiosidades y Ciencia',
      replies: [
        '🌌 **Dato del Universo**: En el espacio reina el silencio absoluto porque las ondas sonoras necesitan materia para viajar. Además, ¡un día en Venus dura más que un año en Venus!',
        '🐙 **Dato de la Naturaleza**: Los pulpos tienen tres corazones y su sangre es de color azul porque utiliza hemocianina rica en cobre en lugar de hierro.',
        '⚡ **Dato del Cerebro**: El cerebro humano genera aproximadamente 20 vatios de energía eléctrica continua, ¡suficiente para iluminar una bombilla LED!',
      ],
    },
    {
      regex: /^(dame un consejo|necesito un consejo|un consejo|motivame|motívame|frase del dia|frase inspiradora)\b/i,
      category: 'consejos_motivacion',
      name: 'Consejos y Motivación',
      replies: [
        '✨ **Consejo para hoy**: No tienes que ver toda la escalera para dar el primer paso. Divide tus metas grandes en micro-acciones de 15 minutos y verás cómo fluye todo con calma.',
        '🚀 **Reflexión de Motivación**: El éxito no es la ausencia de tropiezos, sino la constancia de levantarse una vez más con una lección aprendida. ¡Confía en tus capacidades!',
        '🌱 **Paz Mental**: La disciplina constante supera a la motivación efímera. Cuida tu descanso y mantén tu mente enfocada en lo que sí puedes controlar.',
      ],
    },
    {
      regex: /^(que es la vida|cual es el sentido de la vida|que es la felicidad|que es el tiempo)\b/i,
      category: 'filosofia_pensamiento',
      name: 'Filosofía & Pensamiento',
      replies: [
        '🕊️ **Sobre el Sentido**: Para muchos pensadores, el sentido de la vida no se encuentra prefabricado, sino que se construye a través de nuestros vínculos, curiosidad y propósitos diarios.',
        '⏳ **Sobre el Tiempo**: El tiempo es la dimensión en la que experimentamos el cambio. Cada momento presente es una oportunidad única de actuar.',
      ],
    },
    {
      regex: /^(dime una adivinanza|una adivinanza|dime un acertijo|un acertijo|ponme una adivinanza|ponme un acertijo)\b/i,
      category: 'juegos_acertijos',
      name: 'Juegos & Acertijos',
      replies: [
        '🧩 **Acertijo**: *Tengo agujas pero no sé coser, tengo números pero no sé leer, y te digo las horas sin hablar. ¿Quién soy?* (¡El reloj! ⏰)',
        '🧠 **Reto**: *¿Qué es aquello que cuanto más le quitas, más grande se hace?* (¡Un hoyo o agujero! 🕳️)',
        '🔍 **Adivinanza**: *Blanco por dentro, verde por fuera, si quieres que te lo diga, espera...* (¡La pera! 🍐)',
      ],
    },
    {
      regex: /^(escribe un poema|dime un poema|recitame un poema|un poema|escribe una poesia|dime una rima)\b/i,
      category: 'poemas_creatividad',
      name: 'Poemas & Creatividad',
      replies: [
        '📜 *Entre constelaciones y polvo estelar,*\n*navega el pensamiento sin descansar,*\n*buscando en la calma de cada jornada,*\n*la chispa infinita del alma inspirada. ✨*',
        '🌌 *Como un meteoro que cruza el confín,*\n*las ideas despiertan un nuevo jardín,*\n*no temas al viento ni a la tempestad,*\n*que en cada destello renace la verdad. 🌟*',
      ],
    },
  ];

  for (const item of quickChatPatterns) {
    if (item.regex.test(normalized)) {
      const reply = item.replies[Math.floor(Math.random() * item.replies.length)];
      return {
        isPersonal: true,
        category: item.category,
        categoryName: item.name,
        customReply: reply,
        confidence: 95,
        reasoning: `Patrón conversacional detectado: ${item.name}`,
      };
    }
  }

  // 3. Revisar reglas estándar de saludos y cortesía (excluyendo cálculo y reloj que se resuelven con sus motores especializados)
  for (const rule of GREETING_RULES) {
    if (rule.category === 'calculo_matematico' || rule.category === 'informacion_temporal') {
      continue;
    }
    for (const pattern of rule.patterns) {
      const normPattern = normalizeText(pattern);

      // Coincidencia exacta
      if (normalized === normPattern) {
        return {
          isPersonal: true,
          category: rule.category,
          categoryName: rule.categoryName,
          matchedRule: rule,
          confidence: 100,
          reasoning: `Coincidencia exacta con saludo/expresión '${pattern}'`,
        };
      }

      // Frase contenida con límites de palabra
      const regex = new RegExp(`(^|\\s)${normPattern}(\\s|$)`, 'i');
      if (regex.test(normalized)) {
        return {
          isPersonal: true,
          category: rule.category,
          categoryName: rule.categoryName,
          matchedRule: rule,
          confidence: 92,
          reasoning: `Frase de saludo/cortesía contenida: '${pattern}'`,
        };
      }
    }
  }

  return {
    isPersonal: false,
    confidence: 0,
    reasoning: '',
  };
}

/**
 * Detecta si el texto del usuario es una búsqueda web en tiempo real
 * y extrae el tema central limpio para la búsqueda.
 */
export function detectSearchIntent(
  input: string,
  isPersonal: boolean
): {
  isSearch: boolean;
  topic: string;
  reasoning: string;
} {
  if (isPersonal) {
    return { isSearch: false, topic: '', reasoning: '' };
  }

  // Prevenir que preguntas de hora o fecha se confundan con búsquedas web (ej: "que hora es" buscando "Vatio-hora")
  const timeIntent = detectTimeIntent(input);
  if (timeIntent.isTimeQuery) {
    return { isSearch: false, topic: '', reasoning: '' };
  }

  // Prevenir que consultas sobre batería o energía del dispositivo se confundan con búsquedas web ("batería electrónica")
  const batteryAnswer = findBatteryAnswer(input);
  if (batteryAnswer) {
    return { isSearch: false, topic: '', reasoning: '' };
  }

  const trimmed = input.trim();
  const normalized = normalizeText(input);

  // 1. Verbos y comandos explícitos de búsqueda
  const searchCommandRegex = /^(busca|buscar|buscame|investiga|averigua|consulta|indaga|rastrea|busca en internet|busca en la web|googlea)\s+(sobre\s+|acerca de\s+|de\s+)?(.+)/i;
  const commandMatch = trimmed.match(searchCommandRegex);
  if (commandMatch && commandMatch[3]) {
    return {
      isSearch: true,
      topic: commandMatch[3].replace(/[?¿!¡]/g, '').trim(),
      reasoning: 'Comando explícito de búsqueda web en tiempo real',
    };
  }

  // 2. Preguntas fácticas o de conocimiento general con prefijo interrogativo
  const questionPatterns: { regex: RegExp; cleanPrefix: RegExp; desc: string }[] = [
    {
      regex: /^(que es|que son|que significa|a que se refiere)\s+(el|la|los|las|un|una)?\s*(.+)/i,
      cleanPrefix: /^(que es|que son|que significa|a que se refiere)\s+(el|la|los|las|un|una)?\s*/i,
      desc: 'Definición o concepto',
    },
    {
      regex: /^(quien es|quien fue|quien era|quienes son|quienes fueron)\s+(el|la|los|las)?\s*(.+)/i,
      cleanPrefix: /^(quien es|quien fue|quien era|quienes son|quienes fueron)\s+(el|la|los|las)?\s*/i,
      desc: 'Personaje o figura histórica',
    },
    {
      regex: /^(donde queda|donde esta|donde se encuentra|donde se ubica)\s+(el|la|los|las)?\s*(.+)/i,
      cleanPrefix: /^(donde queda|donde esta|donde se encuentra|donde se ubica)\s+(el|la|los|las)?\s*/i,
      desc: 'Ubicación geográfica o lugar',
    },
    {
      regex: /^(cuando fue|cuando nacio|cuando murio|cuando ocurrio|cuando se creo|en que ano fue)\s+(el|la|los|las)?\s*(.+)/i,
      cleanPrefix: /^(cuando fue|cuando nacio|cuando murio|cuando ocurrio|cuando se creo|en que ano fue)\s+(el|la|los|las)?\s*/i,
      desc: 'Fecha o acontecimiento',
    },
    {
      regex: /^(cual es|cuales son)\s+(el|la|los|las)?\s*(.+)/i,
      cleanPrefix: /^(cual es|cuales son)\s+(el|la|los|las)?\s*/i,
      desc: 'Pregunta interrogativa factual',
    },
    {
      regex: /^(por que|porque|por que razon)\s+(.+)/i,
      cleanPrefix: /^(por que|porque|por que razon)\s*/i,
      desc: 'Causa o explicación científica/natural',
    },
    {
      regex: /^(como funciona|como se origino|como se creo|como se produce)\s+(el|la|los|las)?\s*(.+)/i,
      cleanPrefix: /^(como funciona|como se origino|como se creo|como se produce)\s+(el|la|los|las)?\s*/i,
      desc: 'Mecanismo o funcionamiento',
    },
    {
      regex: /^(dime sobre|informacion de|informacion sobre|cuentame sobre|historia de|origen de)\s+(el|la|los|las)?\s*(.+)/i,
      cleanPrefix: /^(dime sobre|informacion de|informacion sobre|cuentame sobre|historia de|origen de)\s+(el|la|los|las)?\s*/i,
      desc: 'Solicitud temática informativa',
    },
  ];

  for (const item of questionPatterns) {
    const match = normalized.match(item.regex);
    if (match) {
      // Limpiar prefijo para enviar a los motores de búsqueda el término exacto
      const cleanTopic = trimmed.replace(/[¿?¡!]/g, '').replace(item.cleanPrefix, '').trim();
      if (cleanTopic.length >= 2) {
        return {
          isSearch: true,
          topic: cleanTopic,
          reasoning: `${item.desc}: "${cleanTopic}"`,
        };
      }
    }
  }

  // 3. Cualquier pregunta interrogativa que no haya sido identificada como personal
  if (trimmed.startsWith('¿') || trimmed.endsWith('?') || /^(que|quien|donde|cuando|cual|cuales|por que|como)\b/i.test(normalized)) {
    const cleaned = trimmed.replace(/[¿?¡!]/g, '').trim();
    if (cleaned.length > 3) {
      return {
        isSearch: true,
        topic: cleaned,
        reasoning: 'Pregunta general para consulta en internet',
      };
    }
  }

  // 4. Búsqueda temática directa (sustantivos o conceptos como "agujero negro", "planetas", "teoría de cuerdas")
  const tokens = normalized.split(' ').filter(Boolean);
  if (tokens.length >= 1 && trimmed.length >= 3) {
    return {
      isSearch: true,
      topic: trimmed.replace(/[¿?¡!]/g, '').trim(),
      reasoning: 'Término temático para búsqueda web en tiempo real',
    };
  }

  return {
    isSearch: false,
    topic: '',
    reasoning: '',
  };
}

/**
 * Motor de Inteligencia Meteory IA
 * Clasifica si la entrada es MATEMÁTICAS, PERSONAL o BÚSQUEDA WEB y procesa la respuesta adecuada.
 */
export function processInput(
  input: string,
  history?: ChatMessage[],
  batteryStatusStr?: string
): {
  reply: string;
  classification: ClassificationResult;
  searchTopic?: string;
  mathResult?: MathCalculationData;
  timeData?: TimeData;
} {
  const startTime = performance.now();
  const normalized = normalizeText(input);
  const tokens = normalized.split(' ').filter(Boolean);

  // 0. MEMORIA CONVERSACIONAL Y SEGUIMIENTO CONTEXTUAL
  // Analizar si el mensaje es una pregunta de seguimiento encadenada ("¿por qué?", "por qué whatsapp", "+ 10", "¿y en Japón?", etc.)
  if (history && history.length > 0) {
    const contextual = analyzeContextualFollowUp(input, history);
    if (contextual.isFollowUp) {
      const endTime = performance.now();
      const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

      if (contextual.type === 'joke_followup' && contextual.reply) {
        return {
          reply: contextual.reply,
          classification: {
            category: 'chiste_humor',
            categoryName: 'Humor & Chistes',
            confidence: 99,
            tokens,
            normalizedText: normalized,
            executionTimeMs,
            reasoning: contextual.contextReasoning || 'Explicación del chiste en contexto.',
            isGreeting: false,
            isFollowUp: true,
            contextReasoning: contextual.contextReasoning,
          },
        };
      }

      if (contextual.type === 'math_followup' && contextual.mathResult) {
        return {
          reply: contextual.reply || '',
          classification: {
            category: 'calculo_matematico',
            categoryName: 'Matemáticas (Cálculo Encadenado)',
            confidence: 99,
            tokens,
            normalizedText: normalized,
            executionTimeMs,
            reasoning: contextual.contextReasoning || 'Cálculo sobre el resultado previo.',
            isGreeting: false,
            isMath: true,
            isFollowUp: true,
            contextReasoning: contextual.contextReasoning,
          },
          mathResult: contextual.mathResult,
        };
      }

      if (contextual.type === 'time_followup' && contextual.timeData) {
        return {
          reply: contextual.reply || '',
          classification: {
            category: 'informacion_temporal',
            categoryName: 'Hora en Tiempo Real (Seguimiento)',
            confidence: 99,
            tokens,
            normalizedText: normalized,
            executionTimeMs,
            reasoning: contextual.contextReasoning || 'Seguimiento de hora/fecha.',
            isGreeting: false,
            isTimeDate: true,
            isFollowUp: true,
            contextReasoning: contextual.contextReasoning,
          },
          timeData: contextual.timeData,
        };
      }

      if (contextual.type === 'concept_followup' && contextual.searchTopic) {
        return {
          reply: `Continuando con lo que hablábamos de "${contextual.contextTopic}", buscando en la web: "${contextual.searchTopic}"...`,
          classification: {
            category: 'busqueda_web',
            categoryName: 'Búsqueda en la Web (Seguimiento Contextual)',
            confidence: 98,
            tokens,
            normalizedText: normalized,
            executionTimeMs,
            reasoning: contextual.contextReasoning || 'Pregunta de seguimiento sobre tema activo.',
            isGreeting: false,
            isWebSearch: true,
            isFollowUp: true,
            contextTopic: contextual.contextTopic,
            contextReasoning: contextual.contextReasoning,
            originalQuestion: contextual.originalQuestion,
          },
          searchTopic: contextual.searchTopic,
        };
      }

      if (contextual.type === 'personal_followup' && contextual.reply) {
        return {
          reply: contextual.reply,
          classification: {
            category: 'conversacion_personal',
            categoryName: 'Conversación Personal',
            confidence: 95,
            tokens,
            normalizedText: normalized,
            executionTimeMs,
            reasoning: contextual.contextReasoning || 'Continuación de charla personal.',
            isGreeting: false,
            isFollowUp: true,
            contextReasoning: contextual.contextReasoning,
          },
        };
      }
    }
  }

  // 1. Evaluar si pertenece a MATEMÁTICAS / CÁLCULO PROFESIONAL (ej: 5x5, 100/4, raíz de 81, 15% de 200)
  const mathDetection = detectMathIntent(input);
  if (mathDetection.isMath) {
    const mathSolution = solveMath(input);
    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

    return {
      reply: mathSolution.formattedReply,
      classification: {
        category: 'calculo_matematico',
        categoryName: 'Matemáticas',
        confidence: 99,
        tokens,
        normalizedText: normalized,
        executionTimeMs,
        reasoning: mathDetection.reasoning,
        isGreeting: false,
        isWebSearch: false,
        isMath: true,
      },
      mathResult: mathSolution.data,
    };
  }

  // 2. Evaluar si pertenece a CONSULTA DIRECTA DE HORA O FECHA EN TIEMPO REAL
  const timeDetection = detectTimeIntent(input);
  if (timeDetection.isTimeQuery) {
    const timeSolution = resolveTimeQuery(input, timeDetection);
    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

    return {
      reply: timeSolution.reply,
      classification: {
        category: 'informacion_temporal',
        categoryName: timeDetection.isDateOnly ? 'Fecha en Tiempo Real' : 'Hora en Tiempo Real',
        confidence: 99,
        tokens,
        normalizedText: normalized,
        executionTimeMs,
        reasoning: timeDetection.reasoning,
        isGreeting: false,
        isWebSearch: false,
        isMath: false,
        isTimeDate: true,
      },
      timeData: timeSolution.data,
    };
  }

  // 2.5. Evaluar si es consulta sobre batería (de las 100 preguntas o estado actual)
  const batteryReply = findBatteryAnswer(input, batteryStatusStr);
  if (batteryReply) {
    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;
    return {
      reply: batteryReply,
      classification: {
        category: 'conversacion_personal',
        categoryName: 'Análisis de Batería y Energía',
        confidence: 99,
        tokens,
        normalizedText: normalized,
        executionTimeMs,
        reasoning: 'Consulta sobre batería o rendimiento energético del dispositivo.',
        isGreeting: false,
      },
    };
  }

  // 3. Evaluar si es una interacción PERSONAL / CONVERSACIONAL
  const personalIntent = detectPersonalIntent(input);

  // 3.5. Evaluar si coincide con la base de CONOCIMIENTO AVANZADO DIRECTO
  const advancedCheck = checkAdvancedKnowledge(normalized);
  if (advancedCheck.hasAnswer && advancedCheck.reply) {
    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;
    return {
      reply: advancedCheck.reply,
      classification: {
        category: 'busqueda_web',
        categoryName: advancedCheck.classification?.categoryName || 'Conocimiento Avanzado',
        confidence: 99,
        tokens,
        normalizedText: normalized,
        executionTimeMs,
        reasoning: advancedCheck.classification?.reasoning || 'Explicación del motor de conocimiento avanzado.',
        isGreeting: false,
        isWebSearch: false,
        contextTopic: advancedCheck.contextTopic,
      },
    };
  }

  // 4. Si NO es personal, evaluar si es una BÚSQUEDA WEB
  const searchIntent = detectSearchIntent(input, personalIntent.isPersonal);

  const endTime = performance.now();
  const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

  // Si es BÚSQUEDA WEB:
  if (searchIntent.isSearch && searchIntent.topic) {
    const canonicalTopic = extractCanonicalTopic(searchIntent.topic) || searchIntent.topic;
    return {
      reply: `Buscando información actualizada en la web sobre "${searchIntent.topic}"...`,
      classification: {
        category: 'busqueda_web',
        categoryName: 'Búsqueda en la Web (Tiempo Real)',
        confidence: 98,
        tokens,
        normalizedText: normalized,
        executionTimeMs,
        reasoning: searchIntent.reasoning,
        isGreeting: false,
        isWebSearch: true,
        contextTopic: canonicalTopic,
      },
      searchTopic: searchIntent.topic,
    };
  }

  // Si es PERSONAL / CONVERSACIONAL con respuesta directa personalizada:
  if (personalIntent.isPersonal) {
    let reply = '';
    if (personalIntent.customReply) {
      reply = personalIntent.customReply;
    } else if (personalIntent.matchedRule) {
      reply = generateDynamicResponse(
        personalIntent.matchedRule.category,
        personalIntent.matchedRule.responses,
        normalized
      );
    } else {
      reply = '¡Hola! Qué gusto saludarte. ¿De qué te gustaría hablar o qué quieres investigar hoy?';
    }

    return {
      reply,
      classification: {
        category: personalIntent.category || 'conversacion_personal',
        categoryName: personalIntent.categoryName || 'Conversación Personal',
        confidence: personalIntent.confidence || 95,
        matchedPattern: personalIntent.matchedRule?.patterns[0],
        tokens,
        normalizedText: normalized,
        executionTimeMs,
        reasoning: personalIntent.reasoning,
        isGreeting: personalIntent.category !== 'despedida',
        isWebSearch: false,
      },
    };
  }

  // Si no encajó en ninguna categoría anterior, responder de forma conversacional y abierta
  const randomUnknown =
    UNKNOWN_RESPONSES[Math.floor(Math.random() * UNKNOWN_RESPONSES.length)];

  return {
    reply: randomUnknown,
    classification: {
      category: 'conversacion_personal',
      categoryName: 'Conversación Personal',
      confidence: 85,
      tokens,
      normalizedText: normalized,
      executionTimeMs,
      reasoning: 'Interacción conversacional general.',
      isGreeting: false,
      isWebSearch: false,
    },
  };
}

/**
 * Enriquecimiento contextual para saludos temporales o específicos
 */
function generateDynamicResponse(
  category: IntentCategory,
  responses: string[],
  normalizedInput: string
): string {
  if (category === 'saludo_temporal') {
    const hour = new Date().getHours();
    const isMorningInput = /dias|dia|morning/.test(normalizedInput);
    const isAfternoonInput = /tardes|tarde|afternoon/.test(normalizedInput);
    const isNightInput = /noches|noche|evening/.test(normalizedInput);

    if (isMorningInput) {
      if (hour >= 5 && hour < 12) {
        return '¡Muy buenos días! Espero que tu mañana empiece llena de energía positiva.';
      } else if (hour >= 12 && hour < 19) {
        return '¡Buenos días! Aunque por aquí ya es la tarde, ¡te deseo un día estupendo igualmente!';
      } else {
        return '¡Buenos días! Aunque por mi reloj ya es de noche, ¡siempre es buen momento para un saludo alegre!';
      }
    }

    if (isAfternoonInput) {
      if (hour >= 12 && hour < 20) {
        return '¡Buenas tardes! Deseo que estés pasando una tarde agradable y productiva.';
      } else {
        return '¡Buenas tardes! Saludo correspondido con mucho gusto. ¡Que disfrutes tu jornada!';
      }
    }

    if (isNightInput) {
      if (hour >= 20 || hour < 5) {
        return '¡Buenas noches! Espero que hayas tenido un buen día y puedas descansar genial.';
      } else {
        return '¡Buenas noches! Un saludo nocturno para ti. Aquí Meteory siempre a tu disposición.';
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

