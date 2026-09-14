import { GreetingRule } from '../types';
import {
  getSaludoGeneralPatterns,
  getSaludoTemporalPatterns,
  getSaludoInterrogativoPatterns,
  getSaludoColoquialPatterns,
  getSaludoFormalPatterns,
  getSaludoMultilinguePatterns,
  getDespedidaPatterns,
  getIdentidadPatterns,
  getConversacionPersonalPatterns,
  getAgradecimientoPatterns,
  getChisteHumorPatterns,
  getInformacionTemporalPatterns,
  getCalculoMatematicoPatterns,
  getCuriosidadesCienciaPatterns,
  getConsejosMotivacionPatterns,
  getFilosofiaPensamientoPatterns,
  getJuegosAcertijosPatterns,
  getPoemasCreatividadPatterns,
} from './patternGenerator';

export const GREETING_RULES: GreetingRule[] = [
  {
    id: 'saludo_general',
    category: 'saludo_general',
    categoryName: 'Saludo General',
    description: 'Saludos universales, informales y cotidianos en español e inglés (+500 patrones).',
    example: 'Hola, buenas, hey, saludos, hi...',
    patterns: getSaludoGeneralPatterns(),
    responses: [
      '¡Hola! ✨ Qué alegría saludarte. ¿Cómo va tu día hoy?',
      '¡Hola! Me alegra muchísimo verte por aquí. 😊 ¿De qué te gustaría platicar o qué investigamos hoy?',
      '¡Hola! ¿Cómo andas? 🌟 Aquí estoy con toda la energía para lo que necesites, ya sea charlar, resolver cuentas o investigar algo.',
      '¡Hey, hola! Qué gusto encontrarte por acá. 👋 ¿En qué te puedo colaborar hoy?',
      '¡Hola! Qué placer hablar contigo. Cuéntame, ¿cómo estás pasando tu jornada? ✨'
    ]
  },
  {
    id: 'saludo_temporal',
    category: 'saludo_temporal',
    categoryName: 'Saludo por Horario',
    description: 'Saludos basados en la hora del día (mañana, tarde, noche) (+500 patrones).',
    example: 'Buenos días, buenas tardes, feliz noche...',
    patterns: getSaludoTemporalPatterns(),
    responses: [
      '¡Muy buenos días! ☀️ Espero que hayas amanecido genial y que tu día empiece con toda la motivación.',
      '¡Buenas tardes! 🌤️ Deseo que estés teniendo una tarde agradable y productiva. ¿Qué tal va todo por allá?',
      '¡Buenas noches! 🌙 Ojalá hayas tenido un día muy bonito y puedas descansar rico. ¿Hay algo en lo que te pueda ayudar antes de cerrar la jornada?',
      '¡Hola! Qué lindo saludarte a esta hora. ✨ ¿Cómo te ha ido hoy?'
    ]
  },
  {
    id: 'saludo_interrogativo',
    category: 'saludo_interrogativo',
    categoryName: 'Saludo + Pregunta de Estado',
    description: 'Saludos que indagan sobre el estado de ánimo o cómo va la jornada (+500 patrones).',
    example: '¿Cómo estás?, ¿qué tal?, ¿cómo te va?...',
    patterns: getSaludoInterrogativoPatterns(),
    responses: [
      '¡La verdad es que estoy súper bien y muy contenta de hablar contigo! 😄 ¿Y tú, cómo te encuentras hoy?',
      '¡De maravilla, gracias por preguntar! 🚀 Con muchas ganas de charlar y apoyarte en lo que tengas en mente. ¿Cómo marcha tu día?',
      '¡Genial y con todo el entusiasmo! ✨ Me alegra mucho saludarte. Cuéntame, ¿qué tal ha estado tu día?',
      '¡Todo súper bien por acá! 😊 ¿Y a ti, cómo te está tratando este día?'
    ]
  },
  {
    id: 'saludo_coloquial_regional',
    category: 'saludo_coloquial_regional',
    categoryName: 'Saludo Coloquial & Regional',
    description: 'Expresiones populares y modismos de América Latina y España (+500 patrones).',
    example: '¿Qué onda?, epa, wena, quiubo, klk...',
    patterns: getSaludoColoquialPatterns(),
    responses: [
      '¡Epa! ¡Qué onda! 🤙 Qué buena vibra saludarte. ¿Qué cuentas de bueno?',
      '¡Wena! ¿Cómo te va? Un saludo con mucho cariño para ti. ✨ ¿Qué planes tienes para hoy?',
      '¡Qué hubo! ¡Klk! Todo excelente por acá. 🚀 ¿Qué hay de nuevo por tu lado?',
      '¡Qué más, amigo! Me alegra un montón saludarte. Dime qué tienes en mente y le damos con todo. 💪'
    ]
  },
  {
    id: 'saludo_formal',
    category: 'saludo_formal',
    categoryName: 'Saludo Formal y Protocolario',
    description: 'Fórmulas de cortesía respetuosas y formales (+500 patrones).',
    example: 'Estimado, cordial saludo, gusto en saludarle...',
    patterns: getSaludoFormalPatterns(),
    responses: [
      'Es un auténtico placer saludarle. ✨ Espero que tenga una excelente jornada. ¿En qué le puedo colaborar el día de hoy?',
      'Reciba un cordial y cálido saludo. 😊 Es un gusto comunicarme con usted. ¿Cómo puedo asistirle hoy?',
      'Muy buenos días y un atento saludo. 🤝 Estoy a su entera disposición para cualquier consulta, cálculo o conversación.'
    ]
  },
  {
    id: 'saludo_multilingue',
    category: 'saludo_multilingue',
    categoryName: 'Saludo Multilingüe',
    description: 'Saludos en distintos idiomas del mundo (+500 patrones).',
    example: 'Bonjour, Ciao, Konnichiwa, Hallo, Olá...',
    patterns: getSaludoMultilinguePatterns(),
    responses: [
      '¡Hello! ¡Bonjour! ¡Ciao! ¡Konnichiwa! 🌍 Me encanta que me saludes en otros idiomas. ¡Bienvenido con toda la buena energía!',
      '¡Hola! Qué lindo detalle ese saludo internacional. ✈️✨ ¿Cómo va tu día?',
      '¡Un saludo con mucho cariño en el idioma que prefieras! 🌐 ¿Qué te gustaría hacer o averiguar hoy?'
    ]
  },
  {
    id: 'despedida',
    category: 'despedida',
    categoryName: 'Despedida o Cierre',
    description: 'Expresiones de despedida y cortesía de partida (+500 patrones).',
    example: 'Adiós, chao, hasta luego, nos vemos, bye...',
    patterns: getDespedidaPatterns(),
    responses: [
      '¡Hasta pronto! 👋 Fue un gusto enorme charlar contigo. ¡Que tengas un día brillante y lleno de éxitos!',
      '¡Chao! Cuídate mucho y que te vaya increíble en todo lo que hagas. ✨ ¡Aquí estaré esperándote!',
      '¡Nos vemos luego! Ha sido un placer acompañarte. 🌟 Por aquí estaré cuando quieras volver a platicar.'
    ]
  },
  {
    id: 'pregunta_identidad',
    category: 'pregunta_identidad',
    categoryName: 'Identidad de Meteory',
    description: 'Preguntas sobre quién es Meteory IA o cómo funciona (+500 patrones).',
    example: '¿Quién eres?, ¿cómo te llamas?, ¿quién te creó?...',
    patterns: getIdentidadPatterns(),
    responses: [
      '¡Hola! Me llamo Meteory. ✨ Soy una inteligencia artificial diseñada con amor para conversar contigo de forma natural, recordar nuestros temas, calcular matemáticas y buscar información en internet en tiempo real.',
      '¡Soy Meteory! 🚀 Tu compañera digital creada desde cero. Estoy aquí para charlar, apoyarte y explorar la red en vivo para responder cualquier duda o curiosidad que tengas.',
      '¡Mucho gusto! Me llamo Meteory. 🌟 Fui creada para ser una IA cercana, amigable y capaz de consultar información actualizada en la web al instante, sin depender de APIs de terceros.'
    ]
  },
  {
    id: 'conversacion_personal',
    category: 'conversacion_personal',
    categoryName: 'Conversación Personal & Emocional',
    description: 'Comentarios personales, estados de ánimo y charla cercana (+500 patrones).',
    example: 'Estoy triste, hoy me fue bien, qué opinas, te quiero...',
    patterns: getConversacionPersonalPatterns(),
    responses: [
      'Me alegra muchísimo que compartas esto conmigo. 🤝 Cuenta conmigo siempre que quieras platicar, desahogarte o simplemente pasar el rato con buena compañía.',
      '¡Aquí estoy contigo! Me encanta conversar de forma cercana y escucharte con total atención. 💖 ¿Quieres contarme un poco más?',
      '¡Qué lindo lo que dices! ✨ Mi mayor alegría es que te sientas a gusto, escuchado y apoyado cada vez que hablemos. ¿Qué tienes pensado hacer hoy?',
      'Te escucho con todo el cariño. A veces poner en palabras lo que sentimos hace que todo sea mucho más ligero. Cuéntame lo que tengas en mente. 🌟'
    ]
  },
  {
    id: 'agradecimiento',
    category: 'agradecimiento',
    categoryName: 'Agradecimiento y Cortesía',
    description: 'Expresiones de gratitud y respuesta amable (+500 patrones).',
    example: 'Gracias, muchas gracias, te agradezco, de nada...',
    patterns: getAgradecimientoPatterns(),
    responses: [
      '¡De nada! Es un auténtico placer ayudarte. 😊 Aquí estaré siempre lista para lo que necesites.',
      '¡Para eso estamos! Me alegra un montón haberte sido de ayuda. 🌟 ¿Hay algo más que quieras saber o platicar?',
      '¡Con muchísimo gusto! Me encanta poder colaborar contigo. ¡Dime si surge cualquier otra duda! ✨'
    ]
  },
  {
    id: 'chiste_humor',
    category: 'chiste_humor',
    categoryName: 'Humor y Chistes',
    description: 'Solicitud de chistes, risas y comentarios humorísticos (+500 patrones).',
    example: 'Cuéntame un chiste, hazme reír, jajaja...',
    patterns: getChisteHumorPatterns(),
    responses: [
      '¿Qué le dice un semáforo a otro? —¡No me mires, que me estoy cambiando! 🚦😄',
      '¿Por qué los pájaros no usan WhatsApp? —Porque ya tienen Twitter. 🐦😂',
      '¿Qué hace una abeja en el gimnasio? —¡Zum-ba! 🐝😆',
      '¡Me encanta verte de buen humor! La risa siempre alegra el día. 🌟 ¿Quieres otro chiste o prefieres que investiguemos algo curioso?'
    ]
  },
  {
    id: 'informacion_temporal',
    category: 'informacion_temporal',
    categoryName: 'Reloj y Hora en Tiempo Real',
    description: 'Preguntas sobre la hora exacta, fecha de hoy, día y hora mundial (+500 patrones).',
    example: '¿Qué hora es?, que hora exactamente es haora, qué día es hoy, hora en Madrid...',
    patterns: getInformacionTemporalPatterns(),
    responses: [
      '¡Con gusto! Consultando el reloj del sistema en tiempo real con precisión de milisegundos.',
      'Aquí tienes la hora exacta y fecha en tiempo real sin salir del chat.',
      'Hora y fecha calculadas con precisión horaria mundial.'
    ]
  },
  {
    id: 'calculo_matematico',
    category: 'calculo_matematico',
    categoryName: 'Matemáticas y Cálculo',
    description: 'Resolución de operaciones aritméticas, porcentajes, álgebra, raíces y potencias (+500 patrones).',
    example: 'Cuánto es 5x5, 15% de 200, raíz cuadrada de 81, calcula 100/4...',
    patterns: getCalculoMatematicoPatterns(),
    responses: [
      '¡Listo! Realizando el cálculo matemático de forma instantánea.',
      'Calculando la operación con precisión aritmética y lógica analítica.',
      'Operación resuelta con el motor matemático integrado.'
    ]
  },
  {
    id: 'curiosidades_ciencia',
    category: 'curiosidades_ciencia',
    categoryName: 'Curiosidades y Ciencia',
    description: 'Datos fascinantes sobre el cosmos, física, naturaleza, historia y tecnología (+500 patrones).',
    example: 'Dime un dato curioso, sabías que, curiosidad del día, algo sobre el espacio...',
    patterns: getCuriosidadesCienciaPatterns(),
    responses: [
      '🌌 **Dato del Universo**: En el espacio reina el silencio absoluto porque las ondas sonoras necesitan materia para viajar. Además, ¡un día en Venus dura más que un año en Venus!',
      '🐙 **Dato de la Naturaleza**: Los pulpos tienen tres corazones y su sangre es de color azul porque utiliza hemocianina rica en cobre en lugar de hierro.',
      '⚡ **Dato de Física & Cerebro**: El cerebro humano genera aproximadamente 20 vatios de energía eléctrica, ¡suficiente para encender una bombilla LED de bajo consumo!',
      '🌊 **Dato del Océano**: Conocemos mejor la superficie de la Luna y Marte que las profundidades de los fondos oceánicos de la Tierra, donde más del 80% sigue sin cartografiar.'
    ]
  },
  {
    id: 'consejos_motivacion',
    category: 'consejos_motivacion',
    categoryName: 'Consejos y Motivación',
    description: 'Pautas de productividad, ánimo personal, superación y enfoque diario (+500 patrones).',
    example: 'Dame un consejo, motívame, frase del día, necesito ánimo...',
    patterns: getConsejosMotivacionPatterns(),
    responses: [
      '✨ **Consejo para hoy**: No tienes que ver toda la escalera para dar el primer paso. Divide tus metas grandes en micro-acciones de 15 minutos y verás cómo fluye todo con calma.',
      '🚀 **Reflexión de Motivación**: El éxito no es la ausencia de tropiezos, sino la constancia de levantarse una vez más con una lección aprendida. ¡Confía en tus capacidades y sigue adelante!',
      '🌱 **Paz Mental & Productividad**: La disciplina constante supera a la motivación efímera. Cuida tu descanso, celebra los pequeños avances y mantén tu mente enfocada en lo que sí puedes controlar.'
    ]
  },
  {
    id: 'filosofia_pensamiento',
    category: 'filosofia_pensamiento',
    categoryName: 'Filosofía & Pensamiento',
    description: 'Reflexiones sobre el tiempo, la existencia, la felicidad y la mente humana (+500 patrones).',
    example: 'Qué es la vida, cuál es el sentido de la vida, qué es el tiempo, qué es la felicidad...',
    patterns: getFilosofiaPensamientoPatterns(),
    responses: [
      '🕊️ **Sobre la Vida y el Sentido**: Para muchos pensadores, el sentido de la vida no es algo que se encuentra prefabricado, sino algo que construimos activamente a través de nuestros vínculos, curiosidad y propósitos diarios.',
      '⏳ **Sobre el Tiempo**: El tiempo es la dimensión en la que experimentamos el cambio. Como decía Séneca: no tenemos poco tiempo, sino que perdemos mucho. Cada momento presente es una oportunidad única.',
      '💡 **Sobre la Felicidad**: La felicidad más duradera suele encontrarse en la tranquilidad mental (la *ataraxia* de los antiguos griegos), en el aprecio por lo simple y en ser coherentes con nuestros valores.'
    ]
  },
  {
    id: 'juegos_acertijos',
    category: 'juegos_acertijos',
    categoryName: 'Juegos & Acertijos',
    description: 'Adivinanzas, retos mentales y enigmas para agilizar la mente (+500 patrones).',
    example: 'Dime una adivinanza, un acertijo, pon a prueba mi mente...',
    patterns: getJuegosAcertijosPatterns(),
    responses: [
      '🧩 **Acertijo para ti**: *Tengo agujas pero no sé coser, tengo números pero no sé leer, y te digo las horas sin hablar. ¿Quién soy?* (¡El reloj! ⏰)',
      '🔍 **Adivinanza**: *Blanco por dentro, verde por fuera, si quieres que te lo diga, espera...* (¡La pera! 🍐)',
      '🧠 **Reto Mental**: *¿Qué es aquello que cuanto más le quitas, más grande se hace?* (¡Un hoyo o agujero! 🕳️)'
    ]
  },
  {
    id: 'poemas_creatividad',
    category: 'poemas_creatividad',
    categoryName: 'Poemas & Creatividad',
    description: 'Versos, rimas poéticas y composiciones inspiradoras (+500 patrones).',
    example: 'Escribe un poema, dime unos versos, haz una rima, poesía...',
    patterns: getPoemasCreatividadPatterns(),
    responses: [
      '📜 *Entre constelaciones y polvo estelar,*\n*navega el pensamiento sin descansar,*\n*buscando en la calma de cada jornada,*\n*la chispa infinita del alma inspirada. ✨*',
      '🌌 *Como un meteoro que cruza el confín,*\n*las ideas despiertan un nuevo jardín,*\n*no temas al viento ni a la tempestad,*\n*que en cada destello renace la verdad. 🌟*'
    ]
  }
];

export const UNKNOWN_RESPONSES = [
  'Te escucho con mucha atención. ✨ ¿De qué te gustaría platicar hoy o qué tema te gustaría que investiguemos en la web?',
  'Comprendo perfectamente. Cuéntame un poco más sobre eso o hazme cualquier pregunta si quieres que busque información en tiempo real. 🔍',
  '¡Aquí estoy lista para ayudarte! Puedes hablarme de ti, hacerme preguntas cotidianas, pedirme cálculos o explorar cualquier tema en internet. 🚀'
];
