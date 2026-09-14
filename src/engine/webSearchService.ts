import { WebSearchData } from '../types';

/**
 * Servicio para consultar el endpoint local /api/search
 * que realiza búsquedas en tiempo real en la web sin depender de Gemini API.
 */
export async function executeWebSearch(query: string): Promise<WebSearchData> {
  const startTime = performance.now();

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

    if (!res.ok) {
      throw new Error(`Error en el servidor de búsqueda: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      query: data.query || query,
      results: data.results || [],
      searchedAt: data.searchedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalResults: data.totalResults || (data.results ? data.results.length : 0),
      executionTimeMs: data.executionTimeMs || Math.round(performance.now() - startTime),
      sourceProvider: data.sourceProvider || 'Web en tiempo real (Múltiples Fuentes)',
      sourcesList: data.sourcesList || [],
      enginesUsed: data.enginesUsed || [],
    };
  } catch (error) {
    console.error('Error al ejecutar búsqueda web en tiempo real:', error);
    return {
      query,
      results: [],
      searchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalResults: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
      sourceProvider: 'Web en tiempo real (Conexión limitada)',
      sourcesList: [],
      enginesUsed: [],
    };
  }
}

/**
 * Limpia y suaviza textos de la web para que suenen naturales y hablados.
 */
function cleanAndNaturalizeText(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // Quitar citas entre corchetes tipo [1], [2], [editar], etc.
    .replace(/\[\d+\]|\[editar\]|\[cita requerida\]/gi, '')
    // Quitar aclaraciones etimológicas y de pronunciación tipo "(del griego...)", "(latín...)"
    .replace(/\s*\((?:del\s+(?:latín|griego|árabe|inglés|francés)|etimología|pronunciación|en\s+[a-záéíóú]+)[^)]*\)/gi, '')
    // Quitar fechas y años en paréntesis al inicio
    .replace(/\s*\((?:nacido|nacida|nac\.|m\.|c\.|fl\.)[^)]*\)/gi, '')
    // Quitar paréntesis que contengan solo años o números
    .replace(/\s*\(\d{4}(?:\s*-\s*\d{4})?\)/gi, '')
    // Quitar subtérminos secundarios tipo "o función clorofílica", "también conocido como..."
    .replace(/\s+o\s+función\s+[a-záéíóú]+/i, '')
    // Colapsar espacios dobles
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Transforma una definición rígida y robótica de enciclopedia ("La fotosíntesis es un proceso...")
 * en una explicación fluida, cercana y cálida como si una persona real te lo estuviera explicando.
 */
function humanizeExplanation(rawText: string, topic: string): string {
  if (!rawText) return '';
  let s = cleanAndNaturalizeText(rawText);

  // 1. Detectar inicios robóticos típicos de diccionarios / Wikipedia:
  // Ej: "La fotosíntesis es un proceso que..."
  // Ej: "El cambio climático es la variación..."
  // Ej: "Los agujeros negros son regiones..."
  const match = s.match(/^((?:la|el|los|las|un|una)\s+[^,.]+?)\s+(?:es|son)\s+(un|una|el|la|los|las)?\s*(.+)/i);
  if (match) {
    const subject = match[1].toLowerCase().trim(); // "la fotosíntesis"
    const article = match[2] ? match[2].toLowerCase().trim() + ' ' : ''; // "un "
    const rest = match[3].trim(); // "proceso que realizan las plantas..."

    const conversationalStarters = [
      `Te explico de forma sencilla: ${subject} viene a ser ${article}${rest}`,
      `Mira, para entenderlo fácil, ${subject} consiste en ${article}${rest}`,
      `Básicamente, cuando hablamos de ${subject}, se trata de ${article}${rest}`,
      `En palabras sencillas, ${subject} es ${article}${rest}`,
      `Es muy interesante: ${subject} se refiere a ${article}${rest}`,
    ];

    s = conversationalStarters[Math.floor(Math.random() * conversationalStarters.length)];
  } else if (/^(?:es|son)\s+(un|una|el|la|los|las)?\s*/i.test(s)) {
    s = s.replace(/^(?:es|son)\s+(un|una|el|la|los|las)?\s*/i, (_m, art) => {
      return `Se trata de ${art || ''} `;
    });
    s = `Mira, ${s.charAt(0).toLowerCase() + s.slice(1)}`;
  } else {
    // Si no empieza con "es/son", darle un conector conversacional humano
    const softOpeners = [
      'Mira, lo principal sobre esto es que ',
      'Te cuento: ',
      'Básicamente, ',
      'Para ponerlo en palabras claras, ',
    ];
    s = softOpeners[Math.floor(Math.random() * softOpeners.length)] + (s.charAt(0).toLowerCase() + s.slice(1));
  }

  // 2. Reemplazar giros robóticos y burocráticos de enciclopedias por lenguaje hablado
  s = s.replace(/\bhace referencia a\b/gi, 'se refiere a');
  s = s.replace(/\bpuede ser definido como\b/gi, 'es en realidad');
  s = s.replace(/\bse denomina como\b/gi, 'se le conoce como');
  s = s.replace(/\bcon el objeto de\b/gi, 'con el fin de');
  s = s.replace(/\bcabe destacar que\b/gi, 'algo muy interesante es que');
  s = s.replace(/\bes menester señalar que\b/gi, 'también vale la pena notar que');
  s = s.replace(/\bpor ende\b/gi, 'por eso');
  s = s.replace(/\basimismo\b/gi, 'además');
  s = s.replace(/\ben aras de\b/gi, 'para');
  s = s.replace(/\ba través de la cual\b/gi, 'donde');
  s = s.replace(/\bmediante el cual\b/gi, 'donde');
  s = s.replace(/\bse caracteriza por\b/gi, 'lo que hace es');

  // Asegurar mayúscula al inicio
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

/**
 * Genera una introducción humana y cercana, como si un amigo te respondiera.
 */
function getHumanIntro(topic: string, contextTopic?: string, originalQuestion?: string): string {
  if (contextTopic) {
    if (originalQuestion) {
      const qLower = originalQuestion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (qLower.includes('brillante') || qLower.includes('brilla')) {
        return `Sobre por qué **${contextTopic}** es tan brillante, te cuento lo que ocurre:`;
      }
      if (qLower.includes('temperatura') || qLower.includes('caliente')) {
        return `Respecto a la temperatura y el calor de **${contextTopic}**:`;
      }
      if (qLower.includes('mide') || qLower.includes('tamano') || qLower.includes('grande')) {
        return `Sobre el tamaño y las dimensiones de **${contextTopic}**:`;
      }
      if (qLower.includes('distancia') || qLower.includes('lejos')) {
        return `Respecto a la distancia a la que está **${contextTopic}**:`;
      }
      if (qLower.includes('anos') || qLower.includes('edad') || qLower.includes('antiguo')) {
        return `En cuanto a la edad y el tiempo de **${contextTopic}**:`;
      }
      if (qLower.includes('hecho') || qLower.includes('compuesto') || qLower.includes('composicion')) {
        return `Sobre de qué está compuesto **${contextTopic}**:`;
      }
      if (qLower.includes('formo') || qLower.includes('origen') || qLower.includes('creo') || qLower.includes('nacio')) {
        return `Sobre cómo se formó y el origen de **${contextTopic}**:`;
      }
      if (qLower.includes('apagar') || qLower.includes('morir') || qLower.includes('desaparece') || qLower.includes('fin')) {
        return `Sobre qué pasará en el futuro con **${contextTopic}**:`;
      }
      if (qLower.includes('peligroso') || qLower.includes('dano') || qLower.includes('mirar')) {
        return `Sobre si **${contextTopic}** representa un peligro:`;
      }
    }

    const contextualIntros = [
      `Siguiendo con lo que veníamos hablando de **${contextTopic}**:`,
      `Respecto a tu duda sobre **${contextTopic}**:`,
      `Continuando con **${contextTopic}**, te explico cómo va eso:`,
      `¡Buen punto sobre **${contextTopic}**! Mira lo que encontré:`,
    ];
    return contextualIntros[Math.floor(Math.random() * contextualIntros.length)];
  }

  const intros = [
    `¡Claro! Con gusto te cuento sobre **${topic}**:`,
    `¡Buena pregunta! Te explico lo que estuve investigando sobre **${topic}**:`,
    `¡Por supuesto! Mira lo que encontré sobre **${topic}**:`,
    `¡Qué buen tema! Te resumo lo más importante de **${topic}**:`,
  ];
  return intros[Math.floor(Math.random() * intros.length)];
}

/**
 * Cierre conversacional empático y humano.
 */
function getHumanOutro(): string {
  const outros = [
    '¿Te queda claro o quieres que profundicemos en algún detalle en particular?',
    'Cuéntame si te llama la atención alguna parte y lo charlamos más a fondo.',
    '¿Cómo lo ves? Si tienes cualquier otra curiosidad sobre esto, dime con confianza.',
    'Dime si quieres que veamos algún ejemplo práctico o alguna duda que te surja.',
  ];
  return outros[Math.floor(Math.random() * outros.length)];
}

/**
 * Sintetiza los resultados de búsqueda web en una respuesta humana, fluida
 * y hablada como una persona de verdad, con enlaces a las fuentes al final.
 */
export function synthesizeWebResponse(
  query: string,
  searchData: WebSearchData,
  contextTopic?: string,
  originalQuestion?: string
): string {
  if (!searchData.results || searchData.results.length === 0) {
    const fallbackSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    return `Estuve buscando información sobre "${query}", pero no encontré datos directos en este momento.\n\nSi quieres puedes echarle un ojo a la búsqueda en la web aquí:\n🔗 [Buscar "${query}" en la web abierta](${fallbackSearchUrl})`;
  }

  const results = searchData.results;
  const primaryResult = results[0];
  const otherResults = results.slice(1, 3);

  // 1. Saludo humano y empático (considerando contexto si existe)
  const intro = getHumanIntro(query, contextTopic, originalQuestion);

  // 2. Explicación principal humanizada (evita "La fotosíntesis es...")
  const humanPrimary = humanizeExplanation(primaryResult.snippet, query);
  const primarySentences = humanPrimary.split(/(?<=[.?!])\s+/).filter(Boolean);
  let mainExplanation = primarySentences.slice(0, 3).join(' ');

  // 3. Añadir detalles de otras fuentes de forma hilada y conversacional (no como lista robótica)
  const additionalThoughts: string[] = [];
  for (const item of otherResults) {
    const cleanSnippet = cleanAndNaturalizeText(item.snippet);
    if (cleanSnippet && cleanSnippet.length > 25) {
      const firstSentence = cleanSnippet.split(/(?<=[.?!])\s+/)[0];
      if (
        firstSentence &&
        !mainExplanation.toLowerCase().includes(firstSentence.slice(0, 20).toLowerCase()) &&
        !additionalThoughts.some((t) => t.toLowerCase().includes(firstSentence.slice(0, 20).toLowerCase()))
      ) {
        // Enlazar de forma conversacional
        additionalThoughts.push(`En **${item.source}** también destacan que ${firstSentence.charAt(0).toLowerCase() + firstSentence.slice(1)}`);
      }
    }
  }

  let fullBody = mainExplanation;
  if (additionalThoughts.length > 0) {
    fullBody += '\n\n' + additionalThoughts.slice(0, 2).join(' ');
  }

  // 4. Pregunta de cierre empática
  const outro = getHumanOutro();

  // 5. Enlaces sutiles y ordenados al final
  const distinctPageLinks = results.slice(0, 3).map((r) => {
    return `- 🌐 [${r.title} (*${r.source}*)](${r.url})`;
  });

  const linksSection = `**Fuentes consultadas:**\n${distinctPageLinks.join('\n')}`;

  // Ensamblar respuesta final como una charla natural
  return `${intro}\n\n${fullBody}\n\n${outro}\n\n${linksSection}`;
}
