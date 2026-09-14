/**
 * Generador y catálogo de 500+ patrones únicos para cada categoría de saludo y diálogo en Meteory IA.
 * Proporciona una cobertura masiva de modismos, variaciones fonéticas, dialectales,
 * fórmulas de cortesía, saludos repetidos y saludos cruzados/cambiando de saludo.
 */

// Lista de saludos alternantes para crear combinaciones cruzadas ("repetidos pero cambiando de saludo")
const DEFAULT_ALTERNATE_GREETINGS = [
  'hola', 'buenas', 'saludos', 'hey', 'ey', 'buenos dias', 'buen dia',
  'buenas tardes', 'buenas noches', 'que tal', 'como estas', 'como te va',
  'que onda', 'epale', 'epa', 'quiubo', 'que mas', 'wena', 'un saludo',
  'holi', 'hi', 'hello', 'cordial saludo', 'buena tarde', 'buena noche',
  'que tal todo', 'como andas', 'que hay', 'que tal va', 'saluditos'
];

// Helper para crear variaciones limpias, deduplicadas y con soporte de saludos repetidos y cruzados
function buildPatternSet(
  baseItems: string[],
  prefixes: string[],
  suffixes: string[],
  minCount = 500,
  alternates: string[] = DEFAULT_ALTERNATE_GREETINGS
): string[] {
  const set = new Set<string>();

  // 1. Agregar bases directas
  for (const b of baseItems) {
    const clean = b.trim().toLowerCase();
    if (clean) set.add(clean);
  }

  // 2. Repetición idéntica (ej. 'hola hola', 'buenas buenas', 'que tal que tal', 'hey hey')
  for (const b of baseItems) {
    const clean = b.trim().toLowerCase();
    if (!clean) continue;
    set.add(`${clean} ${clean}`);
    set.add(`${clean} ${clean} ${clean}`);
  }

  // 3. Saludos repetidos cambiando de saludo (combinaciones cruzadas: 'hola buenas', 'buenas hola', 'hola que tal', 'hey que onda', etc.)
  for (const b of baseItems) {
    const cleanB = b.trim().toLowerCase();
    if (!cleanB) continue;
    for (const alt of alternates) {
      const cleanAlt = alt.trim().toLowerCase();
      if (!cleanAlt || cleanB === cleanAlt) continue;
      set.add(`${cleanB} ${cleanAlt}`);
      set.add(`${cleanAlt} ${cleanB}`);
      set.add(`${cleanB} y ${cleanAlt}`);
      set.add(`${cleanAlt} y ${cleanB}`);
      set.add(`${cleanB} ${cleanAlt} ${cleanB}`);
      set.add(`${cleanAlt} ${cleanB} ${cleanAlt}`);
      if (set.size >= minCount + 150) break;
    }
    if (set.size >= minCount + 150) break;
  }

  // 4. Saludos cambiando de saludo con sufijo (ej. 'hola buenas amigo', 'buenas hola meteory', 'que tal buenas gente')
  if (set.size < minCount + 100) {
    for (const b of baseItems) {
      const cleanB = b.trim().toLowerCase();
      if (!cleanB) continue;
      for (const alt of alternates) {
        const cleanAlt = alt.trim().toLowerCase();
        if (!cleanAlt || cleanB === cleanAlt) continue;
        for (const s of suffixes) {
          const cleanS = s.trim().toLowerCase();
          if (!cleanS) continue;
          set.add(`${cleanB} ${cleanAlt} ${cleanS}`);
          set.add(`${cleanAlt} ${cleanB} ${cleanS}`);
          set.add(`${cleanB} y ${cleanAlt} ${cleanS}`);
          if (set.size >= minCount + 100) break;
        }
        if (set.size >= minCount + 100) break;
      }
      if (set.size >= minCount + 100) break;
    }
  }

  // 5. Base + sufijo
  if (set.size < minCount + 80) {
    for (const b of baseItems) {
      const cleanB = b.trim().toLowerCase();
      if (!cleanB) continue;
      for (const s of suffixes) {
        const cleanS = s.trim().toLowerCase();
        if (!cleanS) continue;
        set.add(`${cleanB} ${cleanS}`);
        if (set.size >= minCount + 80) break;
      }
      if (set.size >= minCount + 80) break;
    }
  }

  // 6. Prefijo + base
  if (set.size < minCount + 50) {
    for (const p of prefixes) {
      const cleanP = p.trim().toLowerCase();
      if (!cleanP) continue;
      for (const b of baseItems) {
        const cleanB = b.trim().toLowerCase();
        if (!cleanB) continue;
        set.add(`${cleanP} ${cleanB}`);
        if (set.size >= minCount + 50) break;
      }
      if (set.size >= minCount + 50) break;
    }
  }

  // 7. Prefijo + base + cambio de saludo
  if (set.size < minCount) {
    for (const p of prefixes) {
      const cleanP = p.trim().toLowerCase();
      if (!cleanP) continue;
      for (const b of baseItems) {
        const cleanB = b.trim().toLowerCase();
        if (!cleanB) continue;
        for (const alt of alternates) {
          const cleanAlt = alt.trim().toLowerCase();
          if (!cleanAlt || cleanB === cleanAlt) continue;
          set.add(`${cleanP} ${cleanB} ${cleanAlt}`);
          if (set.size >= minCount + 30) break;
        }
        if (set.size >= minCount + 30) break;
      }
      if (set.size >= minCount + 30) break;
    }
  }

  // 8. Prefijo + base + sufijo
  if (set.size < minCount) {
    for (const p of prefixes) {
      const cleanP = p.trim().toLowerCase();
      if (!cleanP) continue;
      for (const b of baseItems) {
        const cleanB = b.trim().toLowerCase();
        if (!cleanB) continue;
        for (const s of suffixes) {
          const cleanS = s.trim().toLowerCase();
          if (!cleanS) continue;
          set.add(`${cleanP} ${cleanB} ${cleanS}`);
          if (set.size >= minCount + 20) break;
        }
        if (set.size >= minCount + 20) break;
      }
      if (set.size >= minCount + 20) break;
    }
  }

  // Convertir a array y asegurar al menos minCount
  const list = Array.from(set);
  return list.slice(0, Math.max(minCount, list.length));
}

// 1. SALUDO GENERAL (500+ patrones)
export function getSaludoGeneralPatterns(): string[] {
  const bases = [
    'hola', 'buenas', 'saludos', 'hey', 'ey', 'holi', 'holis', 'holas', 'holita', 'holitas',
    'holiwis', 'holaaa', 'holaaaa', 'buenass', 'buena', 'un saludo', 'te saludo', 'saludo cordial',
    'hola hola', 'buenas buenas', 'buenas y santas', 'saludos a todos', 'hola a todos', 'hola gente',
    'hola mundo', 'hola meteory', 'hola ia', 'hola bot', 'hola amigo', 'hola amiga', 'hola colega',
    'hola companero', 'hola pana', 'hola bro', 'hola crack', 'hla', 'ola', 'hols', 'holla', 'saluditos',
    'hi', 'hello', 'hiya', 'heya', 'greetings', 'aloha', 'oye', 'ey ey', 'hey hey', 'muy buenas'
  ];

  const prefixes = [
    '', 'muy', 'un gran', 'cordial', 'aqui', 'paso y digo', 'solo digo', 'te envio un',
    'pasaba a decir', 'llego y digo', 'vengo con un', 'mando un', 'recibe un', 'aqui va un',
    'desde aqui un', 'de nuevo', 'otra vez', 'otra entrega de', 'quiero darte un', 'te dejo un'
  ];

  const suffixes = [
    'amigo', 'amiga', 'compañero', 'compañera', 'colega', 'pana', 'bro', 'brother', 'crack',
    'fiera', 'maestro', 'jefe', 'campeon', 'valedor', 'camarada', 'cuate', 'carnal', 'socio',
    'hermano', 'hermana', 'gente', 'todos', 'meteory', 'ia', 'bot', 'asistente', 'equipo',
    'grupo', 'mundo', 'familia', 'a todos', 'a todas', 'por alla', 'desde aqui', 'de nuevo',
    'otra vez', 'hoy', 'en este dia', 'mi estimado', 'mi pana', 'mi bro', 'mi amigo', 'mi amiga',
    'querido amigo', 'querida amiga', 'buena gente', 'como andas', 'que tal', 'como va', 'que cuentas',
    'un placer', 'un gusto', 'listo', 'activo', 'en linea', 'para todos', 'saludos', 'cordiales',
    'abrazos', 'bendiciones', 'exitos', 'y bendiciones', 'y feliz dia', 'con energia', 'con gusto',
    'desde ya', 'en el chat', 'aqui presente', 'un abrazo', 'salud', 'buenas tardes', 'buenos dias'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 2. SALUDO TEMPORAL (500+ patrones)
export function getSaludoTemporalPatterns(): string[] {
  const bases = [
    'buenos dias', 'buen dia', 'muy buenos dias', 'feliz dia', 'lindo dia', 'maravilloso dia',
    'excelente dia', 'bendecido dia', 'gran dia', 'buenos dias a todos', 'buen dia para ti',
    'buenas tardes', 'buena tarde', 'muy buenas tardes', 'feliz tarde', 'linda tarde',
    'excelente tarde', 'maravillosa tarde', 'bendecida tarde', 'buenas tardes a todos',
    'buenas noches', 'buena noche', 'muy buenas noches', 'feliz noche', 'linda noche',
    'excelente noche', 'maravillosa noche', 'bendecida noche', 'buenas noches a todos',
    'feliz amanecer', 'buen amanecer', 'lindo amanecer', 'buen inicio de dia', 'buen comienzo',
    'feliz lunes', 'feliz martes', 'feliz miercoles', 'feliz jueves', 'feliz viernes', 'feliz sabado',
    'feliz domingo', 'buen fin de semana', 'buen finde', 'feliz finde', 'buena jornada', 'linda jornada',
    'good morning', 'good afternoon', 'good evening', 'good night', 'morning', 'evening'
  ];

  const prefixes = [
    '', 'hola', 'muy', 'te deseo', 'que tengas', 'que pases', 'deseandote', 'paso a desearte',
    'aqui deseando', 'un muy', 'te mando', 'espero tengas', 'espero pases', 'te envio',
    'comenzando con', 'terminando con', 'a todos', 'a cada uno', 'para ti', 'desde aqui'
  ];

  const suffixes = [
    'amigo', 'amiga', 'meteory', 'ia', 'gente', 'todos', 'familia', 'compañero', 'compañera',
    'colega', 'pana', 'bro', 'crack', 'fiera', 'maestro', 'jefe', 'a todos', 'a todas',
    'para ti', 'para todos', 'que tal', 'como estas', 'como va', 'como andas', 'que cuentas',
    'hoy', 'en este dia', 'en esta manana', 'en esta tarde', 'en esta noche', 'lleno de exitos',
    'llena de exitos', 'con energia', 'con entusiasmo', 'con bendiciones', 'con alegria',
    'de corazon', 'a descansar', 'a disfrutar', 'a trabajar', 'a estudiar', 'con toda la actitud',
    'positivo', 'positiva', 'abrazos', 'saludos', 'un saludo', 'un abrazo', 'aqui andamos'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 3. SALUDO INTERROGATIVO (500+ patrones)
export function getSaludoInterrogativoPatterns(): string[] {
  const bases = [
    'como estas', 'cómo estás', 'como te va', 'cómo te va', 'como andas', 'cómo andas',
    'que tal', 'qué tal', 'que hay', 'qué hay', 'que cuentas', 'qué cuentas',
    'como va todo', 'cómo va todo', 'como va tu dia', 'como marcha todo', 'como va la cosa',
    'como te sientes', 'como te encuentras', 'que tal tu dia', 'que tal todo', 'que pasa', 'qué pasa',
    'que es de tu vida', 'que novedades', 'que hay de nuevo', 'que tal va la vida', 'como va la vida',
    'como te trata la vida', 'como va tu jornada', 'como esta todo por alla', 'como te esta yendo',
    'how are you', 'how are you doing', 'how is it going', 'whats up', 'wassup', 'how goes it',
    'how do you do', 'how is everything', 'how are things', 'what is happening', 'how have you been'
  ];

  const prefixes = [
    '', 'hola', 'buenas', 'hey', 'ey', 'hola buenas', 'saludos', 'dime', 'cuentame',
    'a ver', 'por favor dime', 'quisiera saber', 'hola amigo', 'hola meteory', 'oye',
    'hola compa', 'buenos dias', 'buenas tardes', 'buenas noches', 'epale'
  ];

  const suffixes = [
    'amigo', 'amiga', 'meteory', 'ia', 'hoy', 'en este dia', 'por alla', 'por aqui',
    'amigo mio', 'companero', 'colega', 'pana', 'bro', 'crack', 'maestro', 'jefe',
    'todo bien', 'todo en orden', 'todo tranquilo', 'como marcha', 'que tal', 'que haces',
    'en que andas', 'como te sientes', 'estas bien', 'que cuentas hoy', 'que novedades tienes',
    'como va ese dia', 'como va la semana', 'como va la tarde', 'como va la manana', 'como va la noche',
    'listo para charlar', 'activo hoy', 'con ganas de hablar', 'cuentame', 'dime', 'hablame'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 4. SALUDO COLOQUIAL & REGIONAL (500+ patrones)
export function getSaludoColoquialPatterns(): string[] {
  const bases = [
    'que onda', 'qué onda', 'que pez', 'que pacho', 'que tranza', 'que hubo', 'qué hubo',
    'quiubo', 'quiubole', 'q hubo', 'que rollo', 'que show', 'que pedo', 'epa', 'epale', 'épale',
    'que mas', 'qué más', 'que mas pues', 'wena', 'wena wena', 'wena po', 'buenas y santas',
    'que xopa', 'que sopa', 'klk', 'que lo que', 'k lo k', 'que bola', 'asere', 'que fue',
    'que paso pana', 'pana', 'che que tal', 'che como andas', 'aloha', 'saludos colega',
    'que haces che', 'que haces loco', 'que onda carnal', 'que onda compa', 'que tranza valedor',
    'wena compare', 'wena perro', 'que tal po', 'que pasa tio', 'que pasa chaval', 'que hay maquina',
    'saludos crack', 'que onda wey', 'que transa wey', 'epa mi pana', 'que mas parce', 'que hubo pues'
  ];

  const prefixes = [
    '', 'hola', 'ey', 'hey', 'buenas', 'wena', 'epa', 'epale', 'klk', 'che', 'asere',
    'aqui ando', 'que tal', 'saludos', 'hola de nuevo', 'habla', 'dime', 'aqui va', 'diganme', 'cuentenme'
  ];

  const suffixes = [
    'carnal', 'compa', 'compadre', 'cuate', 'valedor', 'wey', 'bro', 'brother', 'pana',
    'parce', 'parcero', 'llave', 'loco', 'fiera', 'maestro', 'capo', 'crack', 'tio',
    'chaval', 'pibe', 'socio', 'chamo', 'mi rey', 'mi hermano', 'mi gente', 'todos',
    'po', 'pues', 'asere', 'chico', 'man', 'colega', 'como andamos', 'todo chevere',
    'todo bacan', 'todo padre', 'todo chido', 'todo guay', 'que cuentas', 'que tranzas',
    'que rollo hay', 'como va la joda', 'como va la vaina', 'aqui ando', 'que pasa hoy'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 5. SALUDO FORMAL (500+ patrones)
export function getSaludoFormalPatterns(): string[] {
  const bases = [
    'estimado', 'estimada', 'cordial saludo', 'un cordial saludo', 'saludos cordiales',
    'atento saludo', 'un atento saludo', 'reciba un cordial saludo', 'muy buenas',
    'muy buenos dias tenga usted', 'muy buenas tardes tenga usted', 'muy buenas noches tenga usted',
    'gusto en saludarle', 'un gusto saludarle', 'es un placer saludarle', 'es un honor saludarle',
    'mis respetos', 'distinguido', 'distinguida', 'le saludo atentamente', 'le saludo cordialmente',
    'deseo que se encuentre bien', 'espero que se encuentre excelente', 'un afectuoso y cordial saludo',
    'saludos muy cordiales', 'con todo respeto le saludo', 'le hago llegar mis atentos saludos',
    'estimado asistente', 'distinguido asistente', 'saludos protocolares', 'permítame saludarle',
    'reciba mis consideraciones', 'sea usted bienvenido', 'le doy la mas cordial bienvenida'
  ];

  const prefixes = [
    '', 'reciba usted', 'hago llegar', 'tenga usted', 'le envio', 'le presento',
    'por medio de la presente', 'es para mi un honor', 'le deseo', 'con el debido respeto',
    'mediante este canal', 'tengo el agrado de enviar', 'muy atentamente', 'con mi mayor deferencia'
  ];

  const suffixes = [
    'usted', 'senor', 'senora', 'asistente', 'meteory', 'inteligencia artificial',
    'en este dia', 'en esta jornada', 'cordialmente', 'atentamente', 'con el debido respeto',
    'esperando se encuentre bien', 'deseandole exitos', 'deseandole una excelente jornada',
    'a su entera disposicion', 'quedando a sus ordenes', 'con atenta consideracion',
    'en el marco de este encuentro', 'para servirle', 'con la mayor estima', 'y bendiciones',
    'y paz', 'y prosperidad', 'con alta consideracion', 'y cordial deferencia'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 6. SALUDO MULTILINGÜE (500+ patrones)
export function getSaludoMultilinguePatterns(): string[] {
  const bases = [
    // Francés
    'bonjour', 'salut', 'coucou', 'bonne journee', 'bonsoir', 'bonne nuit', 'comment allez vous',
    'comment ca va', 'enchante', 'bienvenue', 'salut tout le monde', 'bonjour mon ami',
    // Italiano
    'ciao', 'buongiorno', 'buonasera', 'buonanotte', 'salve', 'come stai', 'come va', 'benvenuto',
    'piacere', 'ciao a tutti', 'buona giornata', 'ciao bello', 'ciao bella',
    // Portugués
    'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'oi', 'tudo bem', 'ola tudo bem',
    'como vai', 'e ai', 'fala ai', 'saudacoes', 'bem vindo', 'ola amigo', 'oi galera',
    // Alemán
    'hallo', 'guten tag', 'guten morgen', 'guten abend', 'gute nacht', 'servus', 'moin',
    'moin moin', 'wie gehts', 'gruess gott', 'herzlich willkommen', 'hallochen',
    // Japonés (Romaji)
    'konnichiwa', 'konbanwa', 'ohayo', 'ohayou', 'ohayo gozaimasu', 'moshi moshi',
    'hajimemashite', 'genki desu ka', 'ossu', 'yahho', 'mata ne', 'konnichiwa minna',
    // Inglés
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy',
    'greetings', 'salutations', 'welcome', 'hey there', 'hello there', 'hiya', 'cheers',
    // Otros idiomas (Árabe, Hindi, Chino, Ruso, Hebreo, Griego, Swahili, Hawaiano, etc.)
    'namaste', 'namaskar', 'shalom', 'ni hao', 'nihao', 'marhaban', 'privet', 'zdravstvuyte',
    'assalamu alaikum', 'salam alaikum', 'annyeong', 'annyeonghaseyo', 'sawubona', 'jambo',
    'aloha', 'merhaba', 'yassas', 'dia dhuit', 'geia sou', 'czesc', 'dobry den'
  ];

  const prefixes = [
    '', 'say', 'just saying', 'international greeting', 'saludos', 'un cordial',
    'hello and', 'hi and', 'bienvenue', 'welcome with', 'greetings of', 'warm'
  ];

  const suffixes = [
    'friend', 'mon ami', 'mio amico', 'meu amigo', 'mein freund', 'amigo', 'everyone',
    'tout le monde', 'a tutti', 'a todos', 'alle', 'minna', 'there', 'world',
    'to you', 'pour vous', 'per te', 'para voce', 'fur dich', 'how are you',
    'comment ca va', 'come va', 'tudo bem', 'wie gehts', 'genki', 'today', 'again'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 7. DESPEDIDA (500+ patrones)
export function getDespedidaPatterns(): string[] {
  const bases = [
    'adios', 'adiós', 'chao', 'chau', 'hasta luego', 'hasta pronto', 'nos vemos', 'bye', 'bye bye',
    'hasta la proxima', 'hasta mañana', 'hasta manana', 'cuidate', 'que te vaya bien', 'hablamos luego',
    'me voy', 'hasta nunca', 'hasta la vista', 'me despido', 'un abrazo de despedida', 'buen descanso',
    'buenas noches y adios', 'nos vemos pronto', 'nos vemos luego', 'hasta otro dia', 'que descanses',
    'see you', 'goodbye', 'bye now', 'farewell', 'take care', 'see you later', 'catch you later',
    'adieu', 'au revoir', 'arrivederci', 'ciao ciao', 'ate logo', 'ate mais', 'tschuss', 'sayonara'
  ];

  const prefixes = [
    '', 'bueno', 'ya', 'me tengo que ir', 'es hora de', 'paso a decir', 'solo digo',
    'te digo', 'me toca decir', 'por hoy', 'finalizo con', 'me marcho con un', 'te envio un'
  ];

  const suffixes = [
    'amigo', 'amiga', 'meteory', 'ia', 'gente', 'todos', 'companero', 'colega', 'pana', 'bro',
    'crack', 'maestro', 'jefe', 'cuidate mucho', 'que te vaya genial', 'hasta manana', 'hasta luego',
    'hablamos pronto', 'descansa', 'gracias por todo', 'un placer hablar', 'nos leemos luego',
    'nos vemos manana', 'que pases buena noche', 'que tengas buen dia', 'abrazos', 'saludos'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 8. PREGUNTA IDENTIDAD (500+ patrones)
export function getIdentidadPatterns(): string[] {
  const bases = [
    'quien eres', 'quién eres', 'como te llamas', 'cómo te llamas', 'cual es tu nombre', 'cuál es tu nombre',
    'quien te creo', 'quién te creó', 'quien es tu creador', 'quién es tu creador', 'que eres', 'qué eres',
    'tu nombre', 'dime tu nombre', 'cual es tu identidad', 'para que sirves', 'para qué sirves',
    'que sabes hacer', 'qué sabes hacer', 'que haces', 'qué haces', 'que puedes hacer', 'de donde eres',
    'de dónde eres', 'presentate', 'preséntate', 'hablame de ti', 'háblame de ti', 'quien esta ahi',
    'who are you', 'what is your name', 'what are you', 'tell me about yourself', 'what do you do'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'por favor dime', 'quisiera saber', 'puedes decirme', 'me gustaria saber',
    'dime por favor', 'una pregunta', 'tengo una duda sobre', 'explicame', 'cuentame', 'a ver dime'
  ];

  const suffixes = [
    'exactamente', 'en realidad', 'hoy', 'en este chat', 'meteory', 'ia', 'amigo',
    'de verdad', 'por favor', 'ahora mismo', 'con lujo de detalles', 'en pocas palabras',
    'en resumen', 'tu proposito', 'tu funcion', 'tus origenes', 'tu historia', 'tus creadores'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 9. CONVERSACIÓN PERSONAL (500+ patrones)
export function getConversacionPersonalPatterns(): string[] {
  const bases = [
    'estoy triste', 'me siento triste', 'estoy mal', 'me siento mal', 'estoy desanimado', 'estoy desanimada',
    'estoy feliz', 'me siento feliz', 'estoy contento', 'estoy contenta', 'me siento genial', 'estoy genial',
    'hoy me fue bien', 'tuve un buen dia', 'tuve un mal dia', 'hoy fue un dia dificil', 'hoy fue agotador',
    'estoy cansado', 'estoy cansada', 'tengo sueno', 'tengo sueño', 'estoy aburrido', 'estoy aburrida',
    'te quiero', 'te amo', 'eres genial', 'me caes bien', 'eres muy inteligente', 'buen trabajo',
    'bien hecho', 'que opinas', 'qué opinas', 'que piensas', 'qué piensas', 'tienes sentimientos',
    'eres real', 'cuentame algo', 'cuéntame algo', 'dime algo', 'hablame de ti', 'te aprecio',
    'eres mi amigo', 'eres mi amiga', 'me alegro mucho', 'estoy emocionado', 'estoy emocionada'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'sabes que', 'te cuento que', 'te confieso que', 'la verdad es que',
    'hoy siento que', 'creo que', 'de verdad que', 'quiero decirte que', 'sinceramente', 'amigo'
  ];

  const suffixes = [
    'hoy', 'en este momento', 'de verdad', 'mucho', 'bastante', 'amigo', 'meteory', 'ia',
    'por completo', 'ultimamente', 'estos dias', 'con ganas de descansar', 'y queria contarte',
    'que opinas de esto', 'que piensas de esto', 'dime tu punto de vista', 'ayudame con un consejo'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 10. AGRADECIMIENTO (500+ patrones)
export function getAgradecimientoPatterns(): string[] {
  const bases = [
    'gracias', 'muchas gracias', 'mil gracias', 'muchisimas gracias', 'te agradezco', 'te lo agradezco',
    'te agradezco mucho', 'te doy las gracias', 'muy agradecido', 'muy agradecida', 'un millon de gracias',
    'gracias por tu ayuda', 'gracias por todo', 'gracias por responder', 'gracias amigo', 'gracias meteory',
    'thanks', 'thank you', 'thanks a lot', 'thank you so much', 'de nada', 'por nada', 'un placer', 'no hay de que'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'de corazon', 'de verdad', 'sinceramente', 'amigo', 'querido',
    'nuevamente', 'otra vez', 'quiero darte las', 'te hago llegar mis', 'infinitas'
  ];

  const suffixes = [
    'por tu apoyo', 'por tu colaboracion', 'por la informacion', 'por el dato', 'por la respuesta',
    'amigo', 'amiga', 'meteory', 'ia', 'de corazon', 'de verdad', 'siempre tan amable',
    'eres muy servicial', 'por estar ahi', 'por escucharme', 'te pasaste', 'que genial', 'eres top'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 11. HUMOR Y CHISTES (500+ patrones)
export function getChisteHumorPatterns(): string[] {
  const bases = [
    'cuentame un chiste', 'cuéntame un chiste', 'dime un chiste', 'hazme reir', 'hazme reír',
    'algo chistoso', 'un chiste', 'chiste', 'chistes', 'otro chiste', 'uno mas de humor',
    'tienes chistes', 'sabes chistes', 'algo divertido', 'dime algo comico', 'quiero reir',
    'jajaja', 'jaja', 'jejeje', 'jeje', 'jajajaja', 'xd', 'lol', 'lmao', 'rofl', 'que risa'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'por favor', 'puedes decirme', 'quiero que me digas', 'tienes tiempo para',
    'a ver', 'amigo', 'meteory', 'dale', 'vamos con', 'tira'
  ];

  const suffixes = [
    'por favor', 'bueno', 'malo', 'corto', 'divertido', 'gracioso', 'que me haga reir',
    'para alegrar el dia', 'para pasar el rato', 'amigo', 'meteory', 'de animales', 'de tecnologia',
    'muy gracioso', 'uno nuevo', 'otro mas', 'porfa', 'que este bueno', 'ahora mismo'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 12. INFORMACIÓN TEMPORAL Y RELOJ (500+ patrones: preguntas exactas de hora, fecha, día, ciudad, con modismos y errores como "haora")
export function getInformacionTemporalPatterns(): string[] {
  const bases = [
    // Preguntas clásicas y coloquiales con variaciones (haora, ahora, etc.)
    'que hora es', 'qué hora es', 'que hora es ahora', 'que hora es haora', 'que hora exactamente es haora',
    'que hora exactamente es ahora', 'que hora tienes', 'que hora tienes ahora', 'dime la hora',
    'la hora', 'hora actual', 'que hora sera', 'tienes hora', 'me das la hora', 'sabes que hora es',
    'hora por favor', 'cual es la hora', 'que horas son', 'que horas tenemos', 'que hora tenemos',
    'a que hora estamos', 'que hora marca el reloj', 'hora exacta', 'hora en tiempo real', 'hora del reloj',
    'que hora tenemos ahora', 'que hora es ya', 'dame la hora exacta', 'dime que hora es',
    // Consultas de fecha y calendario
    'que fecha es', 'que fecha es hoy', 'que dia es hoy', 'en que dia estamos', 'que dia de la semana es',
    'en que ano estamos', 'en que año estamos', 'que mes estamos', 'que fecha estamos', 'que fecha tenemos',
    'fecha actual', 'fecha de hoy', 'dia de hoy', 'que ano es este', 'que año es este', 'que fecha tenemos hoy',
    // Preguntas en inglés comunes
    'what time is it', 'what is the time', 'current time', 'tell me the time', 'what time do you have',
    'what date is today', 'what day is today', 'what year is it', 'time now', 'local time'
  ];

  const prefixes = [
    '', 'oye', 'hola', 'por favor', 'meteory', 'dime', 'quisiera saber', 'puedes decirme',
    'sabes', 'amigo', 'ia', 'me puedes decir', 'una consulta', 'a ver', 'rapido dime',
    'disculpa', 'perdona', 'te pregunto', 'informame', 'actualizame con'
  ];

  const suffixes = [
    '', 'ahora', 'haora', 'exactamente', 'por favor', 'ahorita', 'en este instante', 'en este momento',
    'de hoy', 'hoy', 'en el mundo', 'local', 'en madrid', 'en espana', 'en españa', 'en mexico',
    'en méxico', 'en argentina', 'en colombia', 'en chile', 'en peru', 'en miami', 'en nueva york',
    'en japon', 'en tokio', 'aqui', 'por alla', 'amigo', 'meteory', 'en 24 horas', 'oficial'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 13. CÁLCULO MATEMÁTICO (500+ patrones: operaciones aritméticas, porcentajes, álgebra, raíces y potencias)
export function getCalculoMatematicoPatterns(): string[] {
  const bases = [
    // Consultas y prefijos de cálculo
    'cuanto es', 'cuánto es', 'cuanto da', 'cuánto da', 'que da', 'qué da', 'calcula',
    'calcular', 'calculame', 'calcúlame', 'resuelve', 'resolver', 'resuelveme', 'resuélveme',
    'dime el resultado de', 'resultado de', 'cual es el resultado de', 'cuál es el resultado de',
    'sacame la cuenta de', 'haz la cuenta de', 'dame la suma de', 'dame la resta de',
    'multiplica', 'multiplicar', 'divide', 'dividir', 'haz esta operacion', 'cuanto suma',
    'cuanto resta', 'cuanto multiplica', 'cuanto divide', 'la raiz cuadrada de', 'raiz cubica de',
    'el porcentaje de', 'por ciento de', 'elevado al cuadrado', 'elevado al cubo', 'potencia de'
  ];

  const prefixes = [
    '', 'oye', 'hola', 'por favor', 'meteory', 'dime', 'puedes calcular', 'quisiera saber',
    'me ayudas a resolver', 'a ver', 'amigo', 'resuelve esto', 'haz esta cuenta', 'sacame esto',
    'calcula esto', 'cuentame cuanto es', 'operacion matematica', 'problema de matematicas'
  ];

  const suffixes = [
    '', 'por favor', 'exactamente', 'paso a paso', 'rapido', 'meteory', 'amigo', 'ahora',
    'en decimales', 'en porcentaje', 'al cuadrado', 'al cubo', 'mas diez', 'menos cinco',
    'por dos', 'entre dos', 'total', 'final', 'de inmediato', 'en total'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 14. CURIOSIDADES Y CIENCIA (500+ patrones)
export function getCuriosidadesCienciaPatterns(): string[] {
  const bases = [
    'dime un dato curioso', 'dato curioso', 'sabias que', 'sabías que', 'cuentame una curiosidad',
    'algo interesante', 'un dato cientifico', 'curiosidad del dia', 'dato del espacio', 'curiosidades del universo',
    'curiosidad de animales', 'curiosidades de la tierra', 'dato tecnologico', 'algo que no sepa',
    'sorprendeme con un dato', 'dame un dato increible', 'sabias esto', 'curiosidad historica',
    'dato fascinante', 'dime algo asombroso', 'algo curioso', 'hechos curiosos', 'dame conocimiento',
    'curiosidades cientificas', 'sabias sobre el universo', 'dame un dato raro', 'dato inedito',
    'tell me a fun fact', 'fun fact', 'did you know', 'curious fact', 'interesting fact'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'meteory', 'por favor', 'dime', 'quisiera saber', 'a ver', 'amigo',
    'ia', 'me cuentas', 'puedes decirme', 'tienes algun', 'sabes algun', 'quiero aprender',
    'tienes a mano', 'comparte un', 'regalame un', 'lanzame un', 'tienes para mi'
  ];

  const suffixes = [
    '', 'por favor', 'sobre el espacio', 'sobre animales', 'sobre el cerebro', 'sobre la ciencia',
    'sobre la historia', 'sobre el oceano', 'sobre las estrellas', 'sobre tecnologia', 'de la naturaleza',
    'que no conozca', 'amigo', 'meteory', 'para hoy', 'interesante', 'fascinante', 'asombroso',
    'para aprender algo nuevo', 'ahora mismo', 'en un minuto', 'breve', 'curioso'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 15. CONSEJOS Y MOTIVACIÓN (500+ patrones)
export function getConsejosMotivacionPatterns(): string[] {
  const bases = [
    'dame un consejo', 'necesito un consejo', 'un consejo', 'motívame', 'motivame',
    'frase motivacional', 'frase del dia', 'frase inspiradora', 'necesito animo', 'dame animos',
    'inspiracion para hoy', 'palabras de aliento', 'como ser mas productivo', 'como estar motivado',
    'dame fuerzas', 'un buen consejo', 'consejo de vida', 'motivacion diaria', 'algo inspirador',
    'dime algo positivo', 'mensajes positivos', 'energia positiva', 'consejo rapido', 'dame un tip',
    'give me advice', 'motivate me', 'daily motivation', 'inspirational quote', 'words of wisdom'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'meteory', 'por favor', 'dime', 'necesito que me des', 'puedes darme',
    'amigo', 'ia', 'ayudame con', 'hoy necesito', 'estoy buscando', 'me gustaria recibir',
    'tienes algun', 'quisiera un', 'regalame un', 'comparte una', 'transmite una'
  ];

  const suffixes = [
    '', 'por favor', 'para el exito', 'para seguir adelante', 'para no rendirme', 'para hoy',
    'de vida', 'de productividad', 'de superacion', 'de optimismo', 'amigo', 'meteory',
    'positivo', 'inspirador', 'con buena vibra', 'para empezar el dia', 'para el trabajo',
    'para el estudio', 'de corazon', 'que me ayude hoy'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 16. FILOSOFÍA Y PENSAMIENTO (500+ patrones)
export function getFilosofiaPensamientoPatterns(): string[] {
  const bases = [
    'que es la vida', 'cual es el sentido de la vida', 'que es la felicidad', 'que es el tiempo',
    'que es la realidad', 'que es el amor', 'que es la conciencia', 'somos libres', 'que es el destino',
    'que es la verdad', 'que significa existir', 'por que existimos', 'cual es el proposito humano',
    'que es la sabiduria', 'reflexion filosofica', 'dilema filosofico', 'pensamiento profundo',
    'que es el conocimiento', 'la mente humana', 'que es la nada', 'el universo es infinito',
    'what is life', 'meaning of life', 'what is happiness', 'what is reality', 'philosophical thought'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'meteory', 'dime desde tu perspectiva', 'para ti', 'segun tu opinion',
    'que piensas de', 'quisiera reflexionar sobre', 'tengo una duda existencial sobre',
    'amigo', 'ia', 'una pregunta filosofica', 'cuentame que es', 'a ver dime'
  ];

  const suffixes = [
    '', 'en el fondo', 'realmente', 'para el ser humano', 'en el universo', 'segun la filosofia',
    'amigo', 'meteory', 'desde tu vision', 'en pocas palabras', 'en profundidad', 'hoy en dia',
    'en esta epoca', 'para reflexionar', 'y su significado', 'y su proposito'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 17. JUEGOS Y ACERTIJOS (500+ patrones)
export function getJuegosAcertijosPatterns(): string[] {
  const bases = [
    'dime una adivinanza', 'una adivinanza', 'ponme una adivinanza', 'dime un acertijo',
    'un acertijo', 'ponme un acertijo', 'juguemos a las adivinanzas', 'juego mental',
    'pon a prueba mi mente', 'reto mental', 'adivina adivinador', 'acertijos y adivinanzas',
    'tienes una adivinanza', 'sabes adivinanzas', 'quiero resolver un acertijo', 'juguemos',
    'desafio mental', 'adivinanza facil', 'adivinanza dificil', 'acertijo con respuesta',
    'riddle me this', 'tell me a riddle', 'give me a brain teaser', 'riddle game', 'puzzle'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'meteory', 'por favor', 'vamos a jugar', 'quiero jugar', 'dime',
    'amigo', 'ia', 'a ver si puedes', 'ponme', 'lanzame', 'tienes lista', 'preparame'
  ];

  const suffixes = [
    '', 'por favor', 'divertida', 'dificil', 'facil', 'para pensar', 'con truco', 'de animales',
    'de objetos', 'de logica', 'amigo', 'meteory', 'a ver si la adivino', 'y dame la pista',
    'sin darme la respuesta', 'para resolverla yo', 'ahora mismo'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}

// 18. POEMAS Y CREATIVIDAD (500+ patrones)
export function getPoemasCreatividadPatterns(): string[] {
  const bases = [
    'escribe un poema', 'dime un poema', 'recitame un poema', 'un poema', 'poesia',
    'escribe una poesia', 'un verso', 'dime unos versos', 'haz una rima', 'dime una rima',
    'poema sobre el universo', 'poema de amistad', 'poema sobre las estrellas', 'poema corto',
    'estrofas de poesia', 'rimas creativas', 'escribe algo poetico', 'letras de poesia',
    'crea un verso', 'un soneto corto', 'poema inspirador', 'poema para el dia',
    'write a poem', 'tell me a poem', 'recite a poem', 'rhyme for me', 'poetry'
  ];

  const prefixes = [
    '', 'hola', 'oye', 'meteory', 'por favor', 'dime', 'quisiera que escribas', 'puedes componer',
    'amigo', 'ia', 'deja volar tu imaginacion y', 'crea para mi', 'regalame', 'inspira y'
  ];

  const suffixes = [
    '', 'por favor', 'sobre el cosmos', 'sobre la amistad', 'sobre la naturaleza', 'sobre la noche',
    'sobre el dia', 'sobre el mar', 'sobre la tecnologia', 'con rima', 'bonito', 'hermoso',
    'emotivo', 'amigo', 'meteory', 'para alegrarme', 'corto y dulce', 'en cuartetos'
  ];

  return buildPatternSet(bases, prefixes, suffixes, 500);
}


