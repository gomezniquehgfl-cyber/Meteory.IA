/**
 * Motor de Detección de Wake Words (Palabras de Activación) para Meteory IA
 * Incluye +100 combinaciones, variaciones fonéticas, regionalismos y tolerancia a errores de STT.
 */

export interface WakeWordMatch {
  detected: boolean;
  matchedPhrase: string;
  cleanQuery: string;
  confidence: number;
}

// Lista exhaustiva de más de 100 variaciones de frases de activación
export const WAKE_WORD_PATTERNS: string[] = [
  // 1-15: "Hey" y variantes
  'hey meteory',
  'hey meteory ia',
  'hey meteori',
  'hey meteori ia',
  'hey meteor y',
  'hey meteorio',
  'hey metiori',
  'hey metiory',
  'hey meteor',
  'hey metyori',
  'hey meteory ai',
  'hey metoeri',
  'hey meteyori',
  'hey meteo',
  'hey meteoric',

  // 16-30: "Hola" y saludos directos
  'hola meteory',
  'hola meteori',
  'hola meteory ia',
  'hola meteori ia',
  'hola meteor y',
  'hola meteorio',
  'hola metiori',
  'hola metiory',
  'hola meteor',
  'hola metyori',
  'hola meteory ai',
  'hola meteory dime',
  'hola meteory escucha',
  'hola meteory responde',
  'hola meteory ayudame',

  // 31-45: "Oye" / "Oi" y variantes
  'oye meteory',
  'oye meteori',
  'oye meteory ia',
  'oye meteori ia',
  'oye meteor y',
  'oye meteorio',
  'oye metiori',
  'oye metiory',
  'oye meteor',
  'oye metyori',
  'oye meteory dime',
  'oye meteory escucha',
  'oye meteory responde',
  'oye meteory estas ahi',
  'oye meteory ayudame',

  // 46-55: "Ey" / "Ay" / "Ei"
  'ey meteory',
  'ey meteori',
  'ey meteory ia',
  'ey meteori ia',
  'ey meteor y',
  'ey metiori',
  'ey metiory',
  'ei meteory',
  'ay meteory',
  'eey meteory',

  // 56-70: "Ok" / "Okay" / "Okey"
  'ok meteory',
  'okay meteory',
  'okey meteory',
  'ok meteori',
  'okay meteori',
  'okey meteori',
  'ok meteory ia',
  'okay meteory ia',
  'okey meteory ia',
  'ok meteor y',
  'ok metiori',
  'okay metiory',
  'okey meteor',
  'ok meteory dime',
  'okay meteory responde',

  // 71-85: "Buenas" / "Buenos días" / "Buenas tardes" / "Buenas noches"
  'buenas meteory',
  'buenas meteori',
  'buenos dias meteory',
  'buenas tardes meteory',
  'buenas noches meteory',
  'buenas meteory ia',
  'buenos dias meteori',
  'buenas tardes meteori',
  'buenas noches meteori',
  'buen dia meteory',
  'buenas noches meteory ia',
  'buenas tardes meteory ia',
  'buenos dias meteory ia',
  'saludos meteory',
  'saludos meteori',

  // 86-100: Comandos de atención directos ("Meteory...", "Dime Meteory...")
  'meteory',
  'meteori',
  'meteory ia',
  'meteori ia',
  'meteory ai',
  'dime meteory',
  'dime meteori',
  'dime meteory ia',
  'escucha meteory',
  'escucha meteori',
  'escuchame meteory',
  'atiende meteory',
  'responde meteory',
  'responde meteori',
  'despierta meteory',

  // 101-115: Errores fonéticos comunes producidos por Speech-To-Text en español
  'metió y',
  'hey metió y',
  'hola metió y',
  'oye metió y',
  'mateo ri',
  'hey mateo ri',
  'hola mateo ri',
  'meteoro ia',
  'hey meteoro',
  'hola meteoro',
  'oye meteoro',
  'mi teoria ia',
  'hey mi teoria',
  'hola mi teoria',
  'mete or y',

  // 116-130: Variaciones adicionales en conversación continua
  'meteory estas ahi',
  'meteory me escuchas',
  'meteory necesito ayuda',
  'meteory quiero saber',
  'meteory busca',
  'meteory calcula',
  'meteory dime la hora',
  'meteory que sabes',
  'meteory pregunta',
  'hola meteory buenas',
  'hola meteory como estas',
  'hey meteory que tal',
  'oye meteory puedes',
  'ok meteory dime algo',
  'meteory por favor',
];

// Lista ordenada por longitud descendente para emparejamiento prioritario
const SORTED_WAKE_PATTERNS = [...WAKE_WORD_PATTERNS].sort((a, b) => b.length - a.length);

/**
 * Normaliza una cadena de texto para comparación fonética e insensible a acentos/puntuación
 */
export function normalizeWakeWordText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[¿?¡!.,;:#$%&/\\()="'-]/g, ' ') // Quitar signos
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detecta si el texto hablado contiene alguna de las +100 combinaciones de Wake Word
 */
export function detectWakeWord(rawText: string): WakeWordMatch {
  if (!rawText || !rawText.trim()) {
    return { detected: false, matchedPhrase: '', cleanQuery: '', confidence: 0 };
  }

  const normalized = normalizeWakeWordText(rawText);

  // 1. Búsqueda exacta y por prefijo de las frases de activación ordenadas por especificidad
  for (const pattern of SORTED_WAKE_PATTERNS) {
    const normPattern = normalizeWakeWordText(pattern);

    // Caso A: El texto empieza con el patrón (ej: "Hey Meteory qué hora es")
    if (normalized.startsWith(normPattern)) {
      let rest = normalized.slice(normPattern.length).trim();
      // Quitar palabras de relleno opcionales al inicio de la pregunta
      rest = rest.replace(/^(dime|por favor|me puedes decir|puedes decirme|sabes|me dices)\s+/i, '').trim();

      return {
        detected: true,
        matchedPhrase: pattern,
        cleanQuery: rest,
        confidence: 0.98,
      };
    }

    // Caso B: El patrón está contenido en cualquier lugar
    const idx = normalized.indexOf(normPattern);
    if (idx !== -1) {
      // Si está al inicio o rodeado de espacios
      const beforeChar = idx > 0 ? normalized[idx - 1] : ' ';
      const afterChar = idx + normPattern.length < normalized.length ? normalized[idx + normPattern.length] : ' ';

      if (beforeChar === ' ' && afterChar === ' ') {
        let cleanQuery = (normalized.slice(0, idx) + ' ' + normalized.slice(idx + normPattern.length))
          .replace(/\s+/g, ' ')
          .trim();
        cleanQuery = cleanQuery.replace(/^(dime|por favor|me puedes decir|puedes decirme|sabes|me dices)\s+/i, '').trim();

        return {
          detected: true,
          matchedPhrase: pattern,
          cleanQuery,
          confidence: 0.95,
        };
      }
    }
  }

  // 2. Comprobación Regex difusa para "meteory" o sus variantes fonéticas
  const fuzzyRegex = /\b(hey|hola|oye|ey|ok|okay|buenas|dime|escucha|despierta)?\s*(meteory|meteori|metiory|metiori|meteorio|meteor\s*y|metio\s*y|mateo\s*ri)\b/i;
  const match = normalized.match(fuzzyRegex);

  if (match) {
    const matchedPhrase = match[0].trim();
    let cleanQuery = normalized.replace(match[0], '').replace(/\s+/g, ' ').trim();
    cleanQuery = cleanQuery.replace(/^(dime|por favor|me puedes decir|puedes decirme|sabes|me dices)\s+/i, '').trim();
    return {
      detected: true,
      matchedPhrase,
      cleanQuery,
      confidence: 0.90,
    };
  }

  return { detected: false, matchedPhrase: '', cleanQuery: '', confidence: 0 };
}

/**
 * Retorna una lista formateada para mostrar al usuario los ejemplos de frases admitidas
 */
export function getSampleWakeWords(): string[] {
  return [
    '¡Hey Meteory!',
    '¡Hola Meteory!',
    'Oye Meteory...',
    'Ok Meteory',
    'Buenas Meteory',
    'Meteory dime...',
    'Meteory busca...',
    'Despierta Meteory',
  ];
}
