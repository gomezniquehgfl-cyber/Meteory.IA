import { TimeData } from '../types';

interface TimezoneLocation {
  aliases: string[];
  displayName: string;
  timeZone: string;
}

const WORLD_LOCATIONS: TimezoneLocation[] = [
  // España / Europa
  { aliases: ['madrid', 'barcelona', 'espana', 'españa', 'valencia', 'sevilla'], displayName: 'Madrid, España', timeZone: 'Europe/Madrid' },
  { aliases: ['londres', 'london', 'inglaterra', 'reino unido', 'uk', 'gran bretana'], displayName: 'Londres, Reino Unido', timeZone: 'Europe/London' },
  { aliases: ['paris', 'parís', 'francia'], displayName: 'París, Francia', timeZone: 'Europe/Paris' },
  { aliases: ['berlin', 'berlín', 'alemania'], displayName: 'Berlín, Alemania', timeZone: 'Europe/Berlin' },
  { aliases: ['roma', 'italia', 'milan', 'milán'], displayName: 'Roma, Italia', timeZone: 'Europe/Rome' },
  { aliases: ['lisboa', 'portugal'], displayName: 'Lisboa, Portugal', timeZone: 'Europe/Lisbon' },
  { aliases: ['moscu', 'moscú', 'rusia'], displayName: 'Moscú, Rusia', timeZone: 'Europe/Moscow' },
  { aliases: ['amsterdam', 'holanda', 'paises bajos'], displayName: 'Ámsterdam, Países Bajos', timeZone: 'Europe/Amsterdam' },
  { aliases: ['bruselas', 'belgica', 'bélgica'], displayName: 'Bruselas, Bélgica', timeZone: 'Europe/Brussels' },
  { aliases: ['atenas', 'grecia'], displayName: 'Atenas, Grecia', timeZone: 'Europe/Athens' },

  // América del Norte
  { aliases: ['mexico', 'méxico', 'cdmx', 'ciudad de mexico', 'guadalajara', 'monterrey'], displayName: 'Ciudad de México, México', timeZone: 'America/Mexico_City' },
  { aliases: ['tijuana', 'baja california'], displayName: 'Tijuana, México', timeZone: 'America/Tijuana' },
  { aliases: ['cancun', 'cancún', 'quintana roo'], displayName: 'Cancún, México', timeZone: 'America/Cancun' },
  { aliases: ['nueva york', 'new york', 'nyc'], displayName: 'Nueva York, EE. UU.', timeZone: 'America/New_York' },
  { aliases: ['miami', 'florida', 'orlando'], displayName: 'Miami, EE. UU.', timeZone: 'America/New_York' },
  { aliases: ['los angeles', 'los ángeles', 'california', 'san francisco'], displayName: 'Los Ángeles, EE. UU.', timeZone: 'America/Los_Angeles' },
  { aliases: ['chicago', 'illinois'], displayName: 'Chicago, EE. UU.', timeZone: 'America/Chicago' },
  { aliases: ['houston', 'texas', 'dallas'], displayName: 'Houston, Texas, EE. UU.', timeZone: 'America/Chicago' },
  { aliases: ['washington', 'washington dc'], displayName: 'Washington D.C., EE. UU.', timeZone: 'America/New_York' },
  { aliases: ['toronto', 'canada', 'canadá', 'montreal', 'ottawa'], displayName: 'Toronto, Canadá', timeZone: 'America/Toronto' },
  { aliases: ['vancouver'], displayName: 'Vancouver, Canadá', timeZone: 'America/Vancouver' },

  // América Central & Caribe
  { aliases: ['bogota', 'bogotá', 'colombia', 'medellin', 'cali', 'barranquilla'], displayName: 'Bogotá, Colombia', timeZone: 'America/Bogota' },
  { aliases: ['buenos aires', 'argentina', 'cordoba', 'rosario'], displayName: 'Buenos Aires, Argentina', timeZone: 'America/Argentina/Buenos_Aires' },
  { aliases: ['santiago', 'chile', 'valparaiso'], displayName: 'Santiago de Chile, Chile', timeZone: 'America/Santiago' },
  { aliases: ['lima', 'peru', 'perú', 'arequipa', 'cusco'], displayName: 'Lima, Perú', timeZone: 'America/Lima' },
  { aliases: ['caracas', 'venezuela', 'maracaibo', 'valencia venezuela'], displayName: 'Caracas, Venezuela', timeZone: 'America/Caracas' },
  { aliases: ['quito', 'ecuador', 'guayaquil'], displayName: 'Quito, Ecuador', timeZone: 'America/Guayaquil' },
  { aliases: ['montevideo', 'uruguay'], displayName: 'Montevideo, Uruguay', timeZone: 'America/Montevideo' },
  { aliases: ['asuncion', 'asunción', 'paraguay'], displayName: 'Asunción, Paraguay', timeZone: 'America/Asuncion' },
  { aliases: ['la paz', 'bolivia', 'santa cruz bolivia'], displayName: 'La Paz, Bolivia', timeZone: 'America/La_Paz' },
  { aliases: ['san jose', 'san josé', 'costa rica'], displayName: 'San José, Costa Rica', timeZone: 'America/Costa_Rica' },
  { aliases: ['panama', 'panamá', 'ciudad de panama'], displayName: 'Ciudad de Panamá, Panamá', timeZone: 'America/Panama' },
  { aliases: ['santo domingo', 'republica dominicana', 'república dominicana'], displayName: 'Santo Domingo, Rep. Dominicana', timeZone: 'America/Santo_Domingo' },
  { aliases: ['la habana', 'cuba'], displayName: 'La Habana, Cuba', timeZone: 'America/Havana' },
  { aliases: ['san juan', 'puerto rico'], displayName: 'San Juan, Puerto Rico', timeZone: 'America/Puerto_Rico' },
  { aliases: ['guatemala', 'ciudad de guatemala'], displayName: 'Ciudad de Guatemala, Guatemala', timeZone: 'America/Guatemala' },
  { aliases: ['tegucigalpa', 'honduras'], displayName: 'Tegucigalpa, Honduras', timeZone: 'America/Tegucigalpa' },
  { aliases: ['san salvador', 'el salvador'], displayName: 'San Salvador, El Salvador', timeZone: 'America/El_Salvador' },
  { aliases: ['managua', 'nicaragua'], displayName: 'Managua, Nicaragua', timeZone: 'America/Managua' },
  { aliases: ['sao paulo', 'são paulo', 'brasil', 'rio de janeiro', 'brasilia'], displayName: 'São Paulo, Brasil', timeZone: 'America/Sao_Paulo' },

  // Asia / Oceanía / África
  { aliases: ['tokio', 'tokyo', 'japon', 'japón'], displayName: 'Tokio, Japón', timeZone: 'Asia/Tokyo' },
  { aliases: ['seul', 'seúl', 'corea', 'corea del sur'], displayName: 'Seúl, Corea del Sur', timeZone: 'Asia/Seoul' },
  { aliases: ['pekin', 'pekín', 'beijing', 'china', 'shanghai'], displayName: 'Pekín, China', timeZone: 'Asia/Shanghai' },
  { aliases: ['sydney', 'sidney', 'australia', 'melbourne'], displayName: 'Sídney, Australia', timeZone: 'Australia/Sydney' },
  { aliases: ['nueva zelanda', 'auckland'], displayName: 'Auckland, Nueva Zelanda', timeZone: 'Pacific/Auckland' },
  { aliases: ['dubai', 'dubái', 'emiratos arabes', 'emiratos árabes'], displayName: 'Dubái, Emiratos Árabes', timeZone: 'Asia/Dubai' },
  { aliases: ['el cairo', 'egipto'], displayName: 'El Cairo, Egipto', timeZone: 'Africa/Cairo' },
  { aliases: ['nueva delhi', 'india', 'mumbai'], displayName: 'Nueva Delhi, India', timeZone: 'Asia/Kolkata' },
  { aliases: ['bangkok', 'tailandia'], displayName: 'Bangkok, Tailandia', timeZone: 'Asia/Bangkok' },
  { aliases: ['singapur'], displayName: 'Singapur', timeZone: 'Asia/Singapore' },
];

/**
 * Normaliza texto para comparaciones de hora/fecha
 */
function cleanTemporalInput(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bhaora\b/g, 'ahora')
    .replace(/\baora\b/g, 'ahora')
    .replace(/\bahorita\b/g, 'ahora')
    .replace(/\bhorita\b/g, 'ahora')
    .replace(/[?¿!¡,.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evalúa si la entrada del usuario es una pregunta sobre la hora, fecha o día actual
 */
export function detectTimeIntent(input: string): {
  isTimeQuery: boolean;
  isDateOnly: boolean;
  targetLocation?: TimezoneLocation;
  reasoning: string;
} {
  const clean = cleanTemporalInput(input);

  // 1. Detección de consultas sobre la hora (incluyendo modismos, 'exactamente', 'ahora/haora', etc.)
  const isTimeQuestion =
    /^(que hora es|que hora tienes|dime la hora|la hora|hora actual|que hora sera|tienes hora|me das la hora|sabes que hora es|hora por favor|cual es la hora|que horas son|que hora tenemos|hora|a que hora estamos|hora exacta|que hora exactamente|que hora exactamente es|dame la hora)\b/.test(clean) ||
    /\b(que hora es|dime la hora|hora actual|que hora tienes|la hora por favor|what time is it|hora exacta|que hora exactamente|que hora tenemos|que horas son)\b/.test(clean) ||
    (/\bhora\b/.test(clean) && /\b(es|tienes|actual|tenemos|marca|dime|sabes|exacta|ahora)\b/.test(clean));

  // 2. Detección de consultas sobre la fecha o día
  const isDateQuestion =
    /^(que fecha es|que fecha es hoy|que dia es hoy|en que dia estamos|que dia de la semana es|en que ano estamos|que mes estamos|que fecha estamos|que fecha tenemos|fecha actual|fecha de hoy|dia de hoy|que ano es este)\b/.test(clean) ||
    /\b(que fecha es hoy|que dia es hoy|en que dia estamos|fecha de hoy|que fecha es)\b/.test(clean);

  if (!isTimeQuestion && !isDateQuestion) {
    return { isTimeQuery: false, isDateOnly: false, reasoning: '' };
  }

  // 3. Verificar si se pregunta por una ciudad, país o región específica
  let detectedLocation: TimezoneLocation | undefined = undefined;
  for (const loc of WORLD_LOCATIONS) {
    for (const alias of loc.aliases) {
      const aliasClean = cleanTemporalInput(alias);
      const regex = new RegExp(`\\b(en|de|para)\\s+${aliasClean}\\b|\\b${aliasClean}\\b`, 'i');
      if (regex.test(clean)) {
        detectedLocation = loc;
        break;
      }
    }
    if (detectedLocation) break;
  }

  return {
    isTimeQuery: true,
    isDateOnly: !isTimeQuestion && isDateQuestion,
    targetLocation: detectedLocation,
    reasoning: detectedLocation
      ? `Consulta horaria para ubicación: ${detectedLocation.displayName}`
      : isDateQuestion && !isTimeQuestion
      ? 'Consulta de fecha actual'
      : 'Consulta directa de hora actual',
  };
}

/**
 * Resuelve la consulta temporal devolviendo la respuesta y datos estructurados
 */
export function resolveTimeQuery(
  input: string,
  detection: ReturnType<typeof detectTimeIntent>
): {
  reply: string;
  data: TimeData;
} {
  const now = new Date();
  const timeZone = detection.targetLocation
    ? detection.targetLocation.timeZone
    : Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const locationName = detection.targetLocation
    ? detection.targetLocation.displayName
    : 'Hora local';

  // Formateadores usando Intl con soporte de zonas horarias
  const time12Formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const time24Formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const dayOfWeekFormatter = new Intl.DateTimeFormat('es-ES', {
    timeZone,
    weekday: 'long',
  });

  const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const yearFormatter = new Intl.DateTimeFormat('es-ES', {
    timeZone,
    year: 'numeric',
  });

  const rawTime12 = time12Formatter.format(now);
  const time24 = time24Formatter.format(now);
  const rawDayOfWeek = dayOfWeekFormatter.format(now);
  const fullDate = dateFormatter.format(now);
  const year = parseInt(yearFormatter.format(now), 10);

  // Capitalizar día de la semana
  const dayOfWeek = rawDayOfWeek.charAt(0).toUpperCase() + rawDayOfWeek.slice(1);

  // Limpiar formato 12h para que luzca estético (ej: 07:05 a.m.)
  const time12 = rawTime12.replace(/\s+/g, ' ');

  const isWorldTime = Boolean(detection.targetLocation);

  const data: TimeData = {
    time12,
    time24,
    fullDate,
    dayOfWeek,
    year,
    timeZone,
    locationName,
    isWorldTime,
  };

  // Formular respuesta conversacional
  let reply = '';

  if (detection.isDateOnly) {
    if (isWorldTime) {
      reply = `En **${locationName}** hoy es **${dayOfWeek}, ${fullDate}**, y allá son las **${time12}**.`;
    } else {
      reply = `Hoy es **${dayOfWeek}, ${fullDate}** y son las **${time12}**.`;
    }
  } else if (isWorldTime) {
    reply = `En **${locationName}** son las **${time12}** (las ${time24} en formato 24 horas), y hoy es **${dayOfWeek}, ${fullDate}**.`;
  } else {
    // Hora local
    reply = `Son las **${time12}** (${time24}). ¡Hoy es **${dayOfWeek}, ${fullDate}**!`;
  }

  return { reply, data };
}
