import { ClassificationResult } from '../types';

export interface AdvancedKnowledgeResult {
  hasAnswer: boolean;
  reply?: string;
  classification?: Partial<ClassificationResult>;
  contextTopic?: string;
}

interface KnowledgeCard {
  keywords: RegExp;
  category: string;
  topicName: string;
  generateReply: (userInput: string) => string;
}

const KNOWLEDGE_BASE: KnowledgeCard[] = [
  // 1. Programación: Python
  {
    keywords: /(?:que es|como aprender|para que sirve|explicame|hola mundo en)?\s*(?:python|lenguaje python)/i,
    category: 'programacion_tecnologia',
    topicName: 'Python',
    generateReply: () =>
      `¡Excelente tema! 🐍 **Python** es uno de los lenguajes de programación más populares y versátiles del planeta.

✨ **¿Por qué es tan querido?**
• **Sintaxis limpia y legible:** Se lee casi como inglés básico, ideal para aprender sin frustraciones.
• **Multipropósito:** Se usa para Inteligencia Artificial 🤖, ciencia de datos 📊, desarrollo web backend (Django/FastAPI) y automatización de tareas.
• **Ecosistema masivo:** Librerías como NumPy, Pandas, PyTorch y TensorFlow.

💡 **Tu primer Hola Mundo:**
\`\`\`python
print("¡Hola desde Python!")
\`\`\`

¿Te gustaría ver cómo crear una función, resolver un problema o explorar algún proyecto? ¡Con gusto te guío! 🚀`,
  },

  // 2. Programación: JavaScript / TypeScript
  {
    keywords: /(?:que es|diferencia entre|como funciona|aprender)?\s*(?:javascript|typescript|js|ts)\b/i,
    category: 'programacion_tecnologia',
    topicName: 'JavaScript y TypeScript',
    generateReply: () =>
      `¡El alma viva de la web! 🌐 **JavaScript** y **TypeScript** son las herramientas indispensables del desarrollo moderno.

🔥 **La diferencia clave:**
• **JavaScript (JS):** El lenguaje nativo que ejecutan todos los navegadores. Es de tipado dinámico, flexible y rápido para prototipar.
• **TypeScript (TS):** Es un superconjunto de JavaScript desarrollado por Microsoft que añade **tipado estático** estricto. Te ayuda a atrapar errores mientras escribes código antes de que llegue a producción.

💡 **Ejemplo en TypeScript:**
\`\`\`typescript
interface Usuario {
  nombre: string;
  edad: number;
}
const developer: Usuario = { nombre: "Meteory", edad: 1 };
\`\`\`

¿Estás trabajando en algún proyecto web o te gustaría aprender más de React o Node.js? ¡Dime y lo exploramos! 💻✨`,
  },

  // 3. IA y Machine Learning
  {
    keywords: /(?:como funciona|que es|como aprende|diferencia entre)?\s*(?:la inteligencia artificial|machine learning|aprendizaje automatico|redes neuronales|deep learning)\b/i,
    category: 'inteligencia_artificial',
    topicName: 'Inteligencia Artificial',
    generateReply: () =>
      `¡Un área fascinante que me toca de cerca! 🧠✨ La **Inteligencia Artificial (IA)** abarca sistemas informáticos capaces de realizar tareas que antes requerían inteligencia humana:

🔍 **Los tres niveles clave:**
1. **Inteligencia Artificial (IA):** El concepto amplio de crear máquinas que resuelven problemas, razonan o perciben.
2. **Machine Learning (ML):** En lugar de programar cada regla a mano, le damos datos al algoritmo para que encuentre patrones y aprenda de la experiencia.
3. **Deep Learning:** Redes neuronales profundas con múltiples capas (inspiradas en el cerebro), responsables del reconocimiento de voz, visión por computadora y modelos de lenguaje.

🌟 **Dato curioso:** ¡Yo misma (Meteory IA) funciono combinando motores de reglas sintácticas, lógica de inferencia contextual y búsquedas web en vivo para entenderte sin intermediarios! ¿Qué aspecto te causa más curiosidad? 😊`,
  },

  // 4. Ciencia y Universo: El Big Bang
  {
    keywords: /(?:que fue|como ocurrio|que es|origen del universo|teoria del)?\s*(?:el big bang|big bang)\b/i,
    category: 'ciencia_universo',
    topicName: 'El Big Bang',
    generateReply: () =>
      `¡Viajemos 13.800 millones de años al pasado! 🌌💥 La teoría del **Big Bang** es el modelo cosmológico que explica el inicio y la expansión del universo observable.

🔭 **Puntos fundamentales:**
• **No fue una explosión en el espacio:** Fue una expansión repentina y ultrarrápida del propio espacio-tiempo desde un punto de densidad y temperatura extremas (singularidad inicial).
• **La evidencia:** La *Radiación Cósmica de Fondo de Microondas* (el eco fósil de aquel instante) y el alejamiento continuo de las galaxias descubierto por Edwin Hubble.
• **¿Qué se formó primero?** En los primeros minutos surgieron los elementos más ligeros: hidrógeno y helio, los ladrillos de las primeras estrellas.

¡Es asombroso pensar que cada átomo de nuestro cuerpo se forjó en procesos cósmicos! ✨ ¿Te gustaría saber qué pasó después o sobre los primeros planetas? 🪐`,
  },

  // 5. Ciencia y Universo: Los Agujeros Negros
  {
    keywords: /(?:que es|como se forma|que pasa en|adentro de)?\s*(?:un agujero negro|los agujeros negros|agujero negro)\b/i,
    category: 'ciencia_universo',
    topicName: 'Los Agujeros Negros',
    generateReply: () =>
      `¡Uno de los mayores misterios de la física cuántica y relativista! 🕳️✨ Un **agujero negro** es una región del espacio donde la concentración de masa es tan descomunal que nada —ni siquiera la luz— tiene suficiente velocidad de escape para salir de él.

🌌 **Sus partes principales:**
• **Horizonte de sucesos:** La frontera invisible o punto de no retorno. Cruzarlo significa quedar atrapado irremisiblemente hacia el centro.
• **Singularidad:** El punto central donde la materia se comprime en un volumen infinitesimal y la gravedad tiende al infinito según la relatividad general.
• **Disco de acreción:** El gas y polvo girando a velocidades cercanas a la luz alrededor del agujero, calentándose a millones de grados y brillando intensamente.

Einstein predijo su existencia en 1915 y en 2019 el telescopio *Event Horizon Telescope* obtuvo la primera fotografía real de M87*. ¿Te gustaría saber qué ocurriría si alguien cayera en uno? 🚀`,
  },

  // 6. Consejos de estudio y productividad (Técnica Pomodoro, Feynman)
  {
    keywords: /(?:como estudiar mejor|tecnica pomodoro|metodo feynman|mejorar mi concentracion|como ser mas productivo|consejos para estudiar)/i,
    category: 'productividad_aprendizaje',
    topicName: 'Productividad y Aprendizaje',
    generateReply: () =>
      `¡Me encanta que quieras potenciar tu mente y tu tiempo! 🎯💡 Aquí tienes dos de los métodos más efectivos respaldados por la ciencia:

🍅 **1. Técnica Pomodoro:**
• Trabajas enfocado en una sola tarea durante **25 minutos** (sin celular ni distracciones).
• Tomas un descanso breve de **5 minutos** (estirarte, tomar agua).
• Tras 4 bloques pomodoro, tomas un descanso largo de **15 a 30 minutos**. Evita la fatiga mental.

🧠 **2. Método Feynman (para aprender cualquier cosa):**
1. Elige el concepto que quieras dominar.
2. Explícaselo a alguien (o a ti mismo) con palabras tan simples como si se lo contaras a un niño de 8 años.
3. Identifica dónde te trabaste o recurriste a palabras técnicas sin entenderlas a fondo.
4. Vuelve a tus apuntes, simplifica y usa metáforas.

¿Sobre qué tema estás estudiando o trabajando en este momento? ¡Puedo ayudarte a resumirlo o ponerte a prueba! 💪✨`,
  },

  // 7. Filosofía: El Estoicismo
  {
    keywords: /(?:que es el|filosofia del|quien fue marco aurelio|principios del)?\s*(?:estoicismo|filosofia estoica|los estoicos|marco aurelio|seneca|epicteto)\b/i,
    category: 'filosofia_humanidades',
    topicName: 'El Estoicismo',
    generateReply: () =>
      `¡Una filosofía práctica de vida que sigue más vigente que nunca! 🏛️🌿 El **Estoicismo**, fundado en Atenas por Zenón de Citio y popularizado por figuras como Marco Aurelio y Séneca, enseña a vivir con serenidad y virtud.

⚖️ **La Dicotomía del Control (el pilar maestro):**
• **Lo que está bajo tu control:** Tus pensamientos, tus intenciones, tus esfuerzos, tus juicios y cómo reaccionas ante lo que sucede.
• **Lo que no controlas:** Las opiniones ajenas, el clima, el pasado, el tráfico o los imprevistos del mundo.
• *La paz mental llega cuando dejas de angustiarte por lo que no depende de ti y te enfocas al 100% en lo que sí puedes hacer.*

Como decía Marco Aurelio: *"Tienes poder sobre tu mente, no sobre los acontecimientos externos. Entiende esto y encontrarás tu fuerza."* ✨ ¿Hay alguna situación que te preocupe hoy? Podemos reflexionar juntos. 🤝`,
  },
];

/**
 * Consulta si el input del usuario corresponde a un tema de conocimiento directo profundo
 */
export function checkAdvancedKnowledge(cleanInput: string): AdvancedKnowledgeResult {
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.test(cleanInput)) {
      return {
        hasAnswer: true,
        reply: item.generateReply(cleanInput),
        contextTopic: item.topicName,
        classification: {
          category: 'busqueda_web',
          categoryName: `Conocimiento: ${item.topicName}`,
          confidence: 99,
          reasoning: `Consulta resuelta directamente con la base de conocimiento avanzado de Meteory (${item.topicName}).`,
          isGreeting: false,
          isWebSearch: false,
        },
      };
    }
  }

  return { hasAnswer: false };
}
