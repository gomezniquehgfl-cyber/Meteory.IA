import { getBatteryInfo, getBatteryAnalysisReport } from './batteryMonitor';

export interface BatteryQAPair {
  id: number;
  keywords: string[];
  question: string;
  answer: string;
}

export const BATTERY_QUESTIONS_100: BatteryQAPair[] = [
  // 1-10: Estado y Porcentaje Actual
  { id: 1, keywords: ['cuanta', 'bateria', 'tengo', 'nivel', 'porcentaje', 'estado actual'], question: '¿Cuánta batería tengo en este momento?', answer: 'Analizando la batería del dispositivo actual...' },
  { id: 2, keywords: ['esta cargando', 'enchufado', 'carga', 'conectado al cargador'], question: '¿El dispositivo está cargando actualmente?', answer: 'Verificando estado de carga del dispositivo...' },
  { id: 3, keywords: ['cuanto falta', 'tiempo de carga', 'cuanto tarda en cargar'], question: '¿Cuánto tiempo falta para que cargue al 100%?', answer: 'Calculando el tiempo estimado de carga restante...' },
  { id: 4, keywords: ['cuanto dura', 'tiempo de descarga', 'autonomia restante'], question: '¿Cuánta autonomía estimada le queda a la batería?', answer: 'Evaluando el consumo actual y tiempo de descarga...' },
  { id: 5, keywords: ['salud de la bateria', 'vida util', 'desgaste'], question: '¿Cuál es el estado de salud de mi batería?', answer: 'El estado general de las celdas de iones de litio se mantiene óptimo con los ciclos de gestión de energía inteligentes.' },
  { id: 6, keywords: ['aviso 10%', 'alerta bateria baja', 'alarma 10 por ciento'], question: '¿Qué pasa si mi batería llega al 10%?', answer: 'Cuando el dispositivo alcanza el 10% de carga, Meteory IA emite una alerta de voz inmediata y notificación urgente para prevenir apagones.' },
  { id: 7, keywords: ['modo ahorro', 'ahorro de bateria', 'optimizar bateria'], question: '¿Cómo funciona el modo de ahorro de energía?', answer: 'El ahorro de energía limita la actividad en segundo plano, reduce el brillo de pantalla y suspende procesos no esenciales para extender la autonomía.' },
  { id: 8, keywords: ['temperatura', 'se calienta', 'calor bateria', 'sobrecalentamiento'], question: '¿Por qué se calienta la batería al usar el móvil?', answer: 'El calor se genera por la resistencia interna durante la carga rápida o procesos pesados. Es recomendable evitar usar juegos demandantes mientras se carga.' },
  { id: 9, keywords: ['carga rapida', 'fast charge', 'carga turbo'], question: '¿Daña la batería usar carga rápida?', answer: 'La carga rápida moderna está diseñada con sistemas inteligentes que regulan la potencia, reduciendo la velocidad al acercarse al 100% para proteger las celdas.' },
  { id: 10, keywords: ['cargar toda la noche', 'dejar enchufado', 'sobrecarga'], question: '¿Es malo dejar el teléfono cargando toda la noche?', answer: 'Los smartphones actuales tienen circuitos de protección que cortan el flujo de energía al llegar al 100%, evitando sobrecargas continuas.' },

  // 11-20: Química y Tecnología de Ion de Litio
  { id: 11, keywords: ['iones de litio', 'lithium ion', 'que es una bateria de litio'], question: '¿Qué es una batería de iones de litio?', answer: 'Es un dispositivo de almacenamiento electroquímico donde los iones de litio se desplazan entre el ánodo y el cátodo a través de un electrolito.' },
  { id: 12, keywords: ['ciclos de carga', 'vida util ciclos', 'cuantos ciclos dura'], question: '¿Qué es un ciclo de carga completo?', answer: 'Un ciclo completo equivale a consumir y recargar el 100% de la capacidad de la batería, aunque se divida en varias cargas parciales.' },
  { id: 13, keywords: ['efecto memoria', 'baterias antiguas niquel'], question: '¿Tienen efecto memoria las baterías de litio actuales?', answer: 'No. A diferencia de las antiguas baterías de Niquel-Cadmio, las de ion de litio no sufren de efecto memoria, por lo que se pueden cargar en cualquier porcentaje.' },
  { id: 14, keywords: ['descarga profunda', 'bateria a cero', 'se apago solo'], question: '¿Es malo dejar que la batería llegue al 0%?', answer: 'Llevar el dispositivo a descarga profunda frecuente estresa las celdas químicas. Es recomendable conectarlo antes de que baje del 15% o 20%.' },
  { id: 15, keywords: ['porcentaje ideal', 'regla 20 80', 'cargar hasta 80'], question: '¿Cuál es el rango ideal para prolongar la vida de la batería?', answer: 'Muchos expertos recomiendan mantener la batería entre el 20% y el 80% para maximizar la cantidad de ciclos de vida útil.' },
  { id: 16, keywords: ['voltaje de la bateria', 'cuantos voltios', 'tension'], question: '¿Cuál es el voltaje nominal de una celda de ion de litio?', answer: 'El voltaje nominal típico de una celda individual es de 3.6V a 3.7V, alcanzando hasta 4.2V o 4.35V cuando está completamente cargada.' },
  { id: 17, keywords: ['anodo y catodo', 'grafito', 'cobalto', 'litio'], question: '¿De qué materiales está hecha una batería de ion de litio?', answer: 'Usualmente constan de un ánodo de grafito, un cátodo de óxido de litio y cobalto y un electrolito líquido o polimérico.' },
  { id: 18, keywords: ['bateria de estado solido', 'solid state', 'futuro de las baterias'], question: '¿Qué son las baterías de estado sólido?', answer: 'Son la próxima generación de acumuladores que reemplazan el electrolito líquido por uno sólido, ofreciendo mayor densidad energética y seguridad.' },
  { id: 19, keywords: ['auto descarga', 'pierde carga sola', 'descarga fantasma'], question: '¿Por qué la batería pierde carga aunque no use el teléfono?', answer: 'Todas las baterías sufren de autodescarga natural debido a reacciones químicas internas y procesos en segundo plano del sistema.' },
  { id: 20, keywords: ['bateria hinchada', 'bateria inflada', 'peligro'], question: '¿Qué hacer si la batería de un dispositivo se hincha?', answer: 'Una batería hinchada indica acumulación de gas por descomposición interna. Debe reemplazarse inmediatamente en un servicio técnico autorizado.' },

  // 21-30: Consejos de Optimización
  { id: 21, keywords: ['brillo de pantalla', 'pantalla gasta bateria'], question: '¿Cómo afecta el brillo de la pantalla a la batería?', answer: 'La pantalla es uno de los componentes que más energía consume. Reducir el brillo automático o manual ahorra significativamente autonomía.' },
  { id: 22, keywords: ['gps', 'ubicacion', 'servicios de localizacion'], question: '¿El GPS consume mucha batería?', answer: 'Sí, el uso constante del chip GPS y consultas de ubicación satelital exigen gran consumo al procesador y módem.' },
  { id: 23, keywords: ['bluetooth', 'wifi', 'bluetooth gaston'], question: '¿Dejar el Bluetooth encendido gasta mucha batería hoy en día?', answer: 'Con los estándares modernos (Bluetooth Low Energy / BLE), el consumo en reposo es mínimo, casi imperceptible.' },
  { id: 24, keywords: ['red 5g', '4g', 'cobertura celular gasta bateria'], question: '¿Por qué la red 5G consume más batería que el 4G?', answer: 'Las señales 5G de alta frecuencia y la búsqueda constante de antenas en zonas con mala cobertura fuerzan al módem a transmitir con mayor potencia.' },
  { id: 25, keywords: ['aplicaciones en segundo plano', 'background apps'], question: '¿Cómo cerrar aplicaciones en segundo plano ayuda a la batería?', answer: 'Limita procesos activos que actualizan datos o mantienen conexiones de red innecesarias, reduciendo el desgaste energético.' },
  { id: 26, keywords: ['modo oscuro', 'dark mode', 'pantalla oled amoled'], question: '¿El modo oscuro realmente ahorra batería en pantallas OLED?', answer: 'Sí, en paneles OLED/AMOLED los píxeles negros se apagan por completo, consumiendo energía nula en esas zonas.' },
  { id: 27, keywords: ['clima frio', 'baja temperatura', 'se apaga con frio'], question: '¿Por qué el frío extremo reduce el rendimiento de la batería?', answer: 'Las bajas temperaturas ralentizan la cinética química interna del ion de litio, provocando caídas repentinas de voltaje y porcentaje.' },
  { id: 28, keywords: ['clima caliente', 'sol directo', 'exceso de calor'], question: '¿Cómo daña el calor excesivo a la batería?', answer: 'El calor acelera la degradación química permanente de las celdas y puede comprometer la seguridad de la batería.' },
  { id: 29, keywords: ['vibracion', 'motor haptico'], question: '¿El motor de vibración consume batería?', answer: 'Sí, accionar un motor mecánico o actuador háptico requiere energía electromecánica, aunque menor que la pantalla.' },
  { id: 30, keywords: ['notificaciones push', 'sincronizacion automatica'], question: '¿Cómo optimizar las notificaciones para ahorrar batería?', answer: 'Configurar la sincronización de correo y aplicaciones de mensajería a modo manual o por intervalos evita desperdiciar energía.' },

  // 31-100: Preguntas adicionales sobre ciencia, mitos y mantenimiento de baterías
  { id: 31, keywords: ['calibrar', 'calibracion bateria'], question: '¿Es necesario calibrar la batería?', answer: 'En smartphones modernos con sistemas inteligentes, el porcentaje se ajusta automáticamente de forma continua.' },
  { id: 32, keywords: ['cargador no original', 'pirata', 'generico'], question: '¿Daña usar un cargador no original?', answer: 'Cargadores económicos sin certificaciones pueden enviar picos de corriente inestables que degradan el circuito.' },
  { id: 33, keywords: ['power bank', 'banco de baterias', 'cargador portatil'], question: '¿Son seguros los power banks?', answer: 'Sí, siempre que cuenten con certificación contra cortocircuitos y sobretensiones.' },
  { id: 34, keywords: ['reciclaje', 'reciclar bateria', 'ecologia litio'], question: '¿Cómo se reciclan las baterías de litio?', answer: 'Se trituran y se aplican procesos hidrometalúrgicos para recuperar metales valiosos como litio, cobalto y níquel.' },
  { id: 35, keywords: ['mah', 'miliamperios hora'], question: '¿Qué significan los mAh?', answer: 'Miden la capacidad de carga eléctrica almacenada que la batería puede suministrar durante una hora.' },
  { id: 36, keywords: ['vatios hora', 'wh energia'], question: '¿Qué es un Wh?', answer: 'Es la unidad de energía total almacenada, equivalente a multiplicar voltaje por amperios-hora.' },
  { id: 37, keywords: ['nimh', 'niquel metal hidruro'], question: '¿Qué son las baterías NiMH?', answer: 'Acumuladores usados principalmente en pilas recargables AA/AAA tradicionales.' },
  { id: 38, keywords: ['supercondensadores'], question: '¿Qué son los supercondensadores?', answer: 'Dispositivos de carga y descarga ultrarrápida basados en almacenamiento electrostático.' },
  { id: 39, keywords: ['grafeno', 'baterias de grafeno'], question: '¿Qué ventajas aporta el grafeno en baterías?', answer: 'Mayor conductividad, cargas en minutos y mayor durabilidad.' },
  { id: 40, keywords: ['coche electrico', 'vehiculos electricos'], question: '¿Cómo se refrigeran las baterías de autos eléctricos?', answer: 'Utilizan sistemas avanzados de líquido refrigerante para mantener la temperatura óptima.' },
  { id: 41, keywords: ['bateria extraible', 'reemplazar bateria'], question: '¿Por qué los teléfonos ya no tienen batería extraíble?', answer: 'Para lograr diseños más delgados, resistencia al agua IP68 y mayor capacidad de batería en el mismo espacio.' },
  { id: 42, keywords: ['modo avion', 'modo avion ahorra bateria'], question: '¿El modo avión ahorra batería?', answer: 'Sí, desconecta las antenas celulares, Wi-Fi y Bluetooth, evitando el consumo por búsqueda constante de señal.' },
  { id: 43, keywords: ['almacenamiento bateria', 'guardar telefono apagado'], question: '¿Cómo almacenar un teléfono por mucho tiempo?', answer: 'Se recomienda guardarlo con un nivel de carga aproximado del 50% en un lugar fresco y seco.' },
  { id: 44, keywords: ['eficiencia energetica', 'procesador arquitectura'], question: '¿Cómo influye el procesador en la batería?', answer: 'Los procesadores con nodos de fabricación más pequeños (ej. 3nm) consumen mucha menos energía realizando las mismas tareas.' },
  { id: 45, keywords: ['carga inalambrica', 'qi charging'], question: '¿La carga inalámbrica daña más la batería?', answer: 'Genera un poco más de calor debido a la inducción electromagnética, lo cual puede influir levemente en la degradación si se usa en exceso.' },
  { id: 46, keywords: ['actualizacion de software', 'parche gasta bateria'], question: '¿Por qué a veces la batería dura menos tras una actualización?', answer: 'Tras actualizar, el sistema suele reindexar archivos y optimizar bases de datos en segundo plano durante unos días.' },
  { id: 47, keywords: ['bateria de portatil', 'laptop battery'], question: '¿Cómo cuidar la batería de un ordenador portátil?', answer: 'Evitar mantenerlo conectado al 100% de forma permanente si está sometido a altas temperaturas y usar modos de límite de carga al 80%.' },
  { id: 48, keywords: ['bateria de ion sodio', 'sodium ion'], question: '¿Qué son las baterías de sodio-ion?', answer: 'Una alternativa económica y ecológica al litio que no requiere cobalto ni níquel.' },
  { id: 49, keywords: ['efecto joule', 'resistencia electrica'], question: '¿Qué es el efecto Joule en las baterías?', answer: 'Es la conversión de energía eléctrica en calor al circular corriente a través de la resistencia interna de la celda.' },
  { id: 50, keywords: ['pila alcalina vs litio'], question: '¿En qué se diferencian las pilas alcalinas de las de litio?', answer: 'Las alcalinas son primarias (no recargables) y usan dióxido de manganeso y zinc, mientras las de litio son secundarias y recargables de alta densidad.' },
  { id: 51, keywords: ['rendimiento pico', 'apple peak performance'], question: '¿Qué es la gestión de rendimiento pico?', answer: 'Sistemas que reducen la velocidad del procesador para evitar apagones repentinos cuando la batería está muy degradada.' },
  { id: 52, keywords: ['carga inversa', 'reverse charging'], question: '¿Qué es la carga inalámbrica inversa?', answer: 'La capacidad de usar el teléfono como base de carga Qi para alimentar accesorios como auriculares o smartwatches.' },
  { id: 53, keywords: ['bateria estetica', 'durabilidad a largo plazo'], question: '¿Cuánto tiempo dura una batería en buen estado?', answer: 'Por lo general, retienen más del 80% de su capacidad original tras 500 a 1000 ciclos completos de carga.' },
  { id: 54, keywords: ['pantalla de 120hz', 'tasa de refresco alta'], question: '¿Cómo afecta una pantalla de 120Hz a la batería?', answer: 'Actualiza la imagen el doble de veces por segundo que una de 60Hz, consumiendo entre un 15% y un 25% más de energía.' },
  { id: 55, keywords: ['aplicaciones fantasma', 'draining apps'], question: '¿Cómo detectar qué aplicación gasta más batería?', answer: 'Revisando las estadísticas de uso de batería en los ajustes del sistema operativo para identificar consumos anómalos.' },
  { id: 56, keywords: ['modo linterna', 'flash led gasta bateria'], question: '¿La linterna LED gasta mucha batería?', answer: 'Consume una cantidad perceptible si se deja encendida por horas, aunque en periodos cortos el impacto es moderado.' },
  { id: 57, keywords: ['camara de fotos', 'grabacion de video gasta bateria'], question: '¿Por qué grabar vídeo en 4K gasta tanta batería?', answer: 'Exige el máximo rendimiento del sensor de imagen, procesamiento de señal de vídeo (ISP) y codificación en tiempo real.' },
  { id: 58, keywords: ['sensores de movimiento', 'giroscopio', 'acelerometro'], question: '¿Los sensores de movimiento consumen energía?', answer: 'Tienen un consumo sumamente bajo, gestionado por coprocesadores de bajo consumo dedicados.' },
  { id: 59, keywords: ['sensores biometricos', 'lector de huellas', 'reconocimiento facial'], question: '¿Desbloquear con biometría gasta batería?', answer: 'El consumo es efímero y ocurre únicamente durante el escaneo y validación instantánea.' },
  { id: 60, keywords: ['altavoces', 'volumen alto gasta bateria'], question: '¿Escuchar música a volumen alto gasta batería?', answer: 'Sí, mover las bobinas de los altavoces a alta potencia requiere amplificación de audio que demanda mayor energía del amplificador interno.' },
  // 61-100 preguntas técnicas complementarias
  { id: 61, keywords: ['impedancia interna', 'resistencia interna bateria'], question: '¿Qué es la impedancia interna de una batería?', answer: 'Es la resistencia al flujo de corriente dentro de la celda, la cual aumenta a medida que la batería se degrada o envejece.' },
  { id: 62, keywords: ['bms', 'battery management system'], question: '¿Qué es un sistema BMS (Battery Management System)?', answer: 'Es el circuito electrónico inteligente que supervisa el voltaje, temperatura, corriente y estado de carga para garantizar la seguridad.' },
  { id: 63, keywords: ['cortocircuito interno', 'thermal runaway'], question: '¿Qué es el fenómeno de fuga térmica (thermal runaway)?', answer: 'Una reacción en cadena descontrolada donde el aumento de temperatura genera más calor, pudiendo causar combustión si falla la protección.' },
  { id: 64, keywords: ['curva de carga', 'perfil de carga c'], question: '¿Qué es la tasa C (C-rate) en baterías?', answer: 'Es una medida de la velocidad a la que se carga o descarga una batería en relación con su capacidad máxima.' },
  { id: 65, keywords: ['densidad energetica', 'wh/kg'], question: '¿Qué es la densidad energética gravimétrica?', answer: 'La cantidad de energía almacenada por unidad de peso (Wh/kg), fundamental para dispositivos móviles y vehículos.' },
  { id: 66, keywords: ['polimero de litio', 'lipo'], question: '¿En qué se diferencian las baterías Li-Po de las Li-Ion tradicionales?', answer: 'Utilizan un electrolito de polímero semisólido o gel, permitiendo diseños ultrafinos y flexibles.' },
  { id: 67, keywords: ['eficiencia de carga', 'perdidas termicas'], question: '¿Es 100% eficiente el proceso de carga?', answer: 'No, parte de la energía eléctrica se disipa en forma de calor debido a la resistencia interna, con una eficiencia típica del 85% al 95%.' },
  { id: 68, keywords: ['pila de combustible', 'hidrogeno'], question: '¿Cómo funcionan las pilas de combustible de hidrógeno?', answer: 'Generan electricidad mediante una reacción electroquímica entre hidrógeno y oxígeno, emitiendo únicamente vapor de agua.' },
  { id: 69, keywords: ['energia solar', 'celdas fotovoltaicas portatiles'], question: '¿Sirven los paneles solares portátiles para cargar móviles?', answer: 'Sí, convierten la luz solar en corriente continua, aunque su eficiencia depende directamente de la intensidad solar directa.' },
  { id: 70, keywords: ['baterias de plomo acido', 'lead acid'], question: '¿Dónde se emplean las baterías de plomo-ácido?', answer: 'Son las tradicionales de arranque en automóviles de combustión interna y sistemas de respaldo UPS estacionarios.' },
  { id: 71, keywords: ['sulfatacion', 'bateria descargada plomo'], question: '¿Qué es la sulfatación en baterías de plomo?', answer: 'La formación de cristales de sulfato de plomo cuando la batería se deja descargada por mucho tiempo, arruinando su capacidad.' },
  { id: 72, keywords: ['baterias de niquel cadmio', 'nicad'], question: '¿Por qué se dejaron de usar las baterías NiCd?', answer: 'Debido a su fuerte efecto memoria y a la alta toxicidad del cadmio para el medio ambiente.' },
  { id: 73, keywords: ['optimizador de carga', 'carga adaptable software'], question: '¿Qué es la carga adaptable nocturna?', answer: 'Una función inteligente que pausa la carga al 80% durante la noche y la completa justo antes de que el usuario despierte.' },
  { id: 74, keywords: ['consumo en standby', 'consumo fantasma sistema'], question: '¿Por qué el sistema operativo consume batería en standby?', answer: 'Porque mantiene activos servicios de red, llamadas de radio celular, alarmas y núcleos de bajo consumo del procesador.' },
  { id: 75, keywords: ['bateria de litio azufre', 'lithium sulfur'], question: '¿Qué ventajas tienen las baterías de litio-azufre?', answer: 'Ofrecen una densidad teórica altísima y menor costo, aunque investigan su estabilidad a largo plazo.' },
  { id: 76, keywords: ['bateria de flujo', 'flow battery'], question: '¿Qué son las baterías de flujo redox?', answer: 'Sistemas donde la energía se almacena en tanques de electrolitos líquidos separados, ideales para almacenamiento estacionario a gran escala.' },
  { id: 77, keywords: ['carga rapida usb pd', 'power delivery'], question: '¿Qué es USB Power Delivery (USB-PD)?', answer: 'Un estándar universal de carga rápida que negocia voltajes y corrientes dinámicamente hasta 240W.' },
  { id: 78, keywords: ['qc qualcomm quick charge'], question: '¿Cómo funciona Qualcomm Quick Charge?', answer: 'Una tecnología patentada que aumenta el voltaje de carga para entregar más potencia manteniendo cables seguros.' },
  { id: 79, keywords: ['bateria inteligente', 'smart battery data'], question: '¿Qué es el protocolo Smart Battery Data (SMBus)?', answer: 'Un estándar de comunicación digital donde la batería reporta activamente su temperatura, voltaje y salud al equipo.' },
  { id: 80, keywords: ['apagado repentino', 'shutdown frio'], question: '¿Por qué un teléfono se apaga repentinamente con 20% de batería?', answer: 'Ocurre cuando la impedancia interna es alta y el voltaje cae por debajo del umbral mínimo al exigir potencia el procesador.' },
  { id: 81, keywords: ['autonomia real', 'screen on time'], question: '¿Qué es el tiempo de pantalla activa (SoT)?', answer: 'Es el indicador más preciso de la autonomía real, midiendo cuántas horas estuvo la pantalla encendida con una carga.' },
  { id: 82, keywords: ['modo ultra ahorro', 'super power saving'], question: '¿Qué hace el modo ultra ahorro extremo?', answer: 'Desactiva la interfaz gráfica avanzada, limitando el teléfono a llamadas, mensajes y pantalla en escala de grises para durar días con 5%.' },
  { id: 83, keywords: ['inductancia magnetica', 'cargador inalambrico bobinas'], question: '¿Cómo funciona la transferencia de energía inalámbrica?', answer: 'Mediante inducción electromagnética entre una bobina transmisora en la base y una receptora en el dispositivo.' },
  { id: 84, keywords: ['bateria de zinc aire', 'zinc air'], question: '¿Dónde se utilizan las baterías de zinc-aire?', answer: 'Principalmente en audífonos médicos y pequeños dispositivos que requieren oxígeno del aire como reactivo.' },
  { id: 85, keywords: ['energia cinetica', 'dinamo cargador'], question: '¿Se puede cargar un móvil con energía cinética?', answer: 'Existen generadores dinámicos manuales o de movimiento, aunque su potencia es muy baja para smartphones modernos.' },
  { id: 86, keywords: ['celdas de combustible microbianas', 'bioceldas'], question: '¿Qué son las bioceldas de combustible?', answer: 'Tecnologías experimentales que generan electricidad a partir de materia orgánica y bacterias.' },
  { id: 87, keywords: ['bateria de magnesio', 'magnesium battery'], question: '¿Qué promesa ofrecen las baterías de magnesio?',answer: 'El magnesio divalente permite transportar el doble de electrones por ión que el litio, mejorando la seguridad y capacidad.' },
  { id: 88, keywords: ['impacto de la senal', 'sin cobertura gasta bateria'], question: '¿Por qué tener poca señal de cobertura descarga rápido el móvil?', answer: 'El amplificador de RF del teléfono potencia al máximo la transmisión para alcanzar la antena lejana, consumiendo mucha energía.' },
  { id: 89, keywords: ['carga rapida de 120w', 'hypercharge'], question: '¿Es seguro cargar un teléfono en 15 minutos con 120W?', answer: 'Sí, utilizando bombas de carga duales, celdas divididas en paralelo y múltiples sensores térmicos de control.' },
  { id: 90, keywords: ['vida util de un power bank', 'cuanto dura una bateria externa'], question: '¿Cuántos años dura una batería externa portátil?', answer: 'Suelen mantener su rendimiento óptimo entre 300 y 500 ciclos de carga, equivalente a 2 o 3 años de uso regular.' },
  { id: 91, keywords: ['bateria de avion', 'normativa baterias litio aviones'], question: '¿Por qué las aerolíneas prohíben llevar power banks en la maleta facturada?', answer: 'Por prevención contra posibles cortocircuitos o fugas térmicas en la bodega de carga sin supervisión humana.' },
  { id: 92, keywords: ['ciclo de vida calendario', 'envejecimiento pasivo'], question: '¿Qué es el envejecimiento calendario de una batería?', answer: 'Es la degradación gradual de las celdas química con el simple paso del tiempo, incluso si el dispositivo no se utiliza.' },
  { id: 93, keywords: ['cargador con pantalla', 'smart charger'], question: '¿Para qué sirven los cargadores con indicador digital de potencia?', answer: 'Permiten visualizar en tiempo real los vatios exactos (W), voltios y amperios que está recibiendo el dispositivo.' },
  { id: 94, keywords: ['bateria y juegos', 'gaming gasta bateria'], question: '¿Por qué los videojuegos 3D descargan la batería tan rápido?', answer: 'Exigen el máximo rendimiento sostenido de la GPU, CPU y pantalla a altas frecuencias simultáneamente.' },
  { id: 95, keywords: ['optimizar aplicaciones pesadas', 'hibernacion'], question: '¿Qué es la hibernación de aplicaciones?', answer: 'Una función del sistema que congela totalmente las apps inactivas para impedir que consuman recursos en segundo plano.' },
  { id: 96, keywords: ['bateria de avion electrico', 'aviation battery'], question: '¿Cuáles son los retos de las baterías en aviación eléctrica?', answer: 'El peso elevado de las baterías en comparación con el queroseno es el principal desafío aeronáutico actual.' },
  { id: 97, keywords: ['reciclaje de cobalto', 'mineria etica litio'], question: '¿Por qué es importante reciclar el cobalto de las baterías?', answer: 'Para reducir la dependencia de la minería extractiva intensiva y mitigar el impacto ambiental y social.' },
  { id: 98, keywords: ['bateria inteligente de IA', 'machine learning power'], question: '¿Cómo usa la Inteligencia Artificial la gestión de energía?', answer: 'Predice los hábitos de uso del usuario para racionar los recursos del sistema y programar la carga nocturna.' },
  { id: 99, keywords: ['cargador solar de mochila', 'mochila con panel solar'], question: '¿Funcionan las mochilas solares para cargar dispositivos?', answer: 'Son útiles para emergencias al aire libre, aunque su velocidad de carga es lenta debido al área limitada del panel.' },
  { id: 100, keywords: ['futuro de la energia movil', 'proximas tecnologias bateria'], question: '¿Cuál es el futuro de las baterías para dispositivos móviles?', answer: 'Apunta hacia densidades energéticas el doble de altas, electrolitos sólidos incombustibles y tiempos de recarga inferiores a 5 minutos.' }
];

export function findBatteryAnswer(query: string, currentBatteryLevelStr?: string): string | null {
  if (!query) return null;
  
  // Normalizar la consulta eliminando tildes y signos
  const norm = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:"'()[\]{}<>_~`#@*\/\\|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!norm) return null;

  // Frases directas explícitas de batería del dispositivo
  const directPhrases = [
    'cuanta bateria tengo',
    'cuanto de bateria tengo',
    'cuanta bateria me queda',
    'que porcentaje de bateria tengo',
    'nivel de bateria',
    'porcentaje de bateria',
    'estado de mi bateria',
    'estado de la bateria',
    'cuanta pila tengo',
    'cuanta carga me queda',
    'cuanta carga tengo',
    'cuanta bateria',
    'mi bateria',
    'bateria actual',
    'tengo bateria',
    'cuanto me queda de bateria',
    'tengo carga',
    'bateria del celular',
    'bateria del movil',
    'bateria del telefono',
    'bateria del dispositivo',
  ];

  const matchesDirectPhrase = directPhrases.some(p => norm.includes(p));

  // Detectar intención de conocer el estado actual de la batería del dispositivo
  const isDeviceStatusQuery =
    matchesDirectPhrase ||
    ((norm.includes('cuanta') || norm.includes('cuanto') || norm.includes('porcentaje') || norm.includes('nivel') || norm.includes('estado') || norm.includes('tengo') || norm.includes('queda')) &&
     (norm.includes('bateria') || norm.includes('pila') || norm.includes('carga')));

  if (isDeviceStatusQuery) {
    const liveInfo = getBatteryInfo();
    const pct = Math.round(liveInfo.level * 100);
    const chargingStr = liveInfo.charging ? 'Cargando ⚡' : 'Desconectado de la corriente 🔋';
    const report = getBatteryAnalysisReport(liveInfo);

    return `🔋 **Batería Actual de tu Dispositivo**:\n\nTu dispositivo se encuentra al **${pct}%** (${chargingStr}).\n\n${report}`;
  }

  // Coincidencia con la base de 100 preguntas frecuentes sobre litio y energía
  for (const item of BATTERY_QUESTIONS_100) {
    const matchedKeyword = item.keywords.some(kw => {
      const normKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      return norm.includes(normKw);
    });

    if (matchedKeyword) {
      if (item.id === 1) {
        const liveInfo = getBatteryInfo();
        const pct = Math.round(liveInfo.level * 100);
        return `📊 **Estado de Batería de tu Dispositivo**:\n\nTu porcentaje actual es **${pct}%**.\n\n${getBatteryAnalysisReport(liveInfo)}`;
      }
      return `🔋 **Base de Conocimiento de Baterías (#${item.id}/100)**:\n\n*${item.question}*\n\n${item.answer}`;
    }
  }

  // Si menciona 'bateria', 'pila' o 'carga' en contexto energético y no musical
  if ((norm.includes('bateria') || norm.includes('pila') || norm.includes('carga')) &&
      !norm.includes('electronica') && !norm.includes('musical') && !norm.includes('instrumento') && !norm.includes('platillos')) {
    const liveInfo = getBatteryInfo();
    const pct = Math.round(liveInfo.level * 100);
    return `🔋 **Módulo de Batería & Energía Meteory IA**:\n\nTu dispositivo cuenta con un **${pct}% de carga**.\n\n${getBatteryAnalysisReport(liveInfo)}`;
  }

  return null;
}
