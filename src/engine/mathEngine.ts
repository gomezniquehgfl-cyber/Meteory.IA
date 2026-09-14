import { evaluate, format } from 'mathjs';
import { MathCalculationData } from '../types';

/**
 * Normaliza y detecta si una entrada del usuario corresponde a un problema matemático o cálculo.
 */
export function detectMathIntent(rawInput: string): {
  isMath: boolean;
  expression: string;
  type: string;
  reasoning: string;
} {
  const trimmed = rawInput.trim();
  if (!trimmed) return { isMath: false, expression: '', type: '', reasoning: '' };

  let text = trimmed.toLowerCase();
  // Quitar signos de apertura y cierre de interrogación/exclamación
  text = text.replace(/[¿?¡!]/g, '').trim();

  // 1. Detección de patrones explícitos de preguntas matemáticas en lenguaje natural
  // Ejemplos: "cuanto es 5x5", "cuanto da 10 + 20", "calcula 50 / 2", "resuelve 4^2"
  const mathPrefixRegex = /^(cuanto es|cuánto es|cuanto da|cuánto da|que da|qué da|calcula|calcular|calculame|calcúlame|resuelve|resolver|dime el resultado de|resultado de|cual es el resultado de|cuál es el resultado de)\s+(.+)/i;
  const prefixMatch = text.match(mathPrefixRegex);
  let candidateExpr = prefixMatch ? prefixMatch[2].trim() : text;

  // 2. Patrones de Porcentajes: "el 15% de 200", "20% de 500", "10 por ciento de 80"
  const percentageRegex = /(?:el\s+)?(\d+(?:[.,]\d+)?)\s*(?:%|por ciento)\s+de\s+(\d+(?:[.,]\d+)?)/i;
  const percentMatch = candidateExpr.match(percentageRegex);
  if (percentMatch) {
    const rate = percentMatch[1].replace(',', '.');
    const total = percentMatch[2].replace(',', '.');
    return {
      isMath: true,
      expression: `(${rate} / 100) * ${total}`,
      type: 'Porcentaje',
      reasoning: `Cálculo de porcentaje: ${rate}% de ${total}`,
    };
  }

  // 3. Patrones de Raíz cuadrada o cúbica
  const sqrtRegex = /^(?:la\s+)?ra[ií]z\s+(?:cuadrada\s+)?(?:de\s+)?(\d+(?:[.,]\d+)?)/i;
  const sqrtMatch = candidateExpr.match(sqrtRegex);
  if (sqrtMatch) {
    const num = sqrtMatch[1].replace(',', '.');
    return {
      isMath: true,
      expression: `sqrt(${num})`,
      type: 'Raíz Cuadrada',
      reasoning: `Raíz cuadrada de ${num}`,
    };
  }

  const cbrtRegex = /^(?:la\s+)?ra[ií]z\s+c[uú]bica\s+(?:de\s+)?(\d+(?:[.,]\d+)?)/i;
  const cbrtMatch = candidateExpr.match(cbrtRegex);
  if (cbrtMatch) {
    const num = cbrtMatch[1].replace(',', '.');
    return {
      isMath: true,
      expression: `cbrt(${num})`,
      type: 'Raíz Cúbica',
      reasoning: `Raíz cúbica de ${num}`,
    };
  }

  // 4. Patrones de Potencias en palabras: "5 al cuadrado", "3 al cubo", "2 elevado a la 8"
  if (/al\s+cuadrado/i.test(candidateExpr)) {
    const baseMatch = candidateExpr.match(/(\d+(?:[.,]\d+)?)\s+al\s+cuadrado/i);
    if (baseMatch) {
      return {
        isMath: true,
        expression: `(${baseMatch[1].replace(',', '.')}) ^ 2`,
        type: 'Potenciación',
        reasoning: `${baseMatch[1]} elevado al cuadrado`,
      };
    }
  }

  if (/al\s+cubo/i.test(candidateExpr)) {
    const baseMatch = candidateExpr.match(/(\d+(?:[.,]\d+)?)\s+al\s+cubo/i);
    if (baseMatch) {
      return {
        isMath: true,
        expression: `(${baseMatch[1].replace(',', '.')}) ^ 3`,
        type: 'Potenciación',
        reasoning: `${baseMatch[1]} elevado al cubo`,
      };
    }
  }

  const powerRegex = /(\d+(?:[.,]\d+)?)\s+(?:elevado\s+a\s+(?:la\s+)?|potencia\s+de\s+)(\d+(?:[.,]\d+)?)/i;
  const powerMatch = candidateExpr.match(powerRegex);
  if (powerMatch) {
    const base = powerMatch[1].replace(',', '.');
    const exp = powerMatch[2].replace(',', '.');
    return {
      isMath: true,
      expression: `${base} ^ ${exp}`,
      type: 'Potenciación',
      reasoning: `${base} elevado a la ${exp}`,
    };
  }

  // 5. Patrón de operaciones directas tipo "5x5", "5 x 5", "5 * 5", "100 + 40", "50 - 20", "80 / 4"
  // Reemplazar palabras en español por operadores
  let parsed = candidateExpr
    .replace(/\bmultiplicado\s+por\b|\bpor\b/gi, '*')
    .replace(/\bdividido\s+entre\b|\bdividido\s+por\b|\bdividido\b|\bentre\b/gi, '/')
    .replace(/\bm[aá]s\b/gi, '+')
    .replace(/\bmenos\b/gi, '-')
    .replace(/(\d)\s*x\s*(\d)/gi, '$1 * $2') // 5x5 -> 5 * 5
    .replace(/(\d)\s*X\s*(\d)/g, '$1 * $2')
    .replace(/,/g, '.');

  // Funciones trigonométricas / logarítmicas en palabras
  parsed = parsed
    .replace(/\bseno\s+de\s+(\d+(?:\.\d+)?)/gi, 'sin($1 deg)')
    .replace(/\bcoseno\s+de\s+(\d+(?:\.\d+)?)/gi, 'cos($1 deg)')
    .replace(/\btangente\s+de\s+(\d+(?:\.\d+)?)/gi, 'tan($1 deg)')
    .replace(/\blogaritmo\s+de\s+(\d+(?:\.\d+)?)/gi, 'log10($1)')
    .replace(/\bfactorial\s+de\s+(\d+)/gi, 'factorial($1)');

  // Verificar si la expresión contiene operadores matemáticos y números
  // O si tenía el prefijo "cuanto es" + números y operadores
  const hasMathSymbols = /[\d]\s*[\+\-\*\/\^%]\s*[\d]/i.test(parsed) ||
    /^(sqrt|cbrt|sin|cos|tan|log|factorial)\s*\(/i.test(parsed) ||
    /\d+!/.test(parsed);

  const containsOnlyMathChars = /^[\d\s\+\-\*\/\^\(\)\.\,%a-zA-Z]+$/.test(parsed);

  if (hasMathSymbols && containsOnlyMathChars) {
    return {
      isMath: true,
      expression: parsed.trim(),
      type: 'Aritmética Profesional',
      reasoning: `Expresión matemática identificada: ${parsed.trim()}`,
    };
  }

  // Si comenzó con "cuanto es" o "calcula" y contiene números y operaciones
  if (prefixMatch && /\d/.test(parsed) && /[\+\-\*\/\^xX]|por|entre|mas|menos/i.test(candidateExpr)) {
    return {
      isMath: true,
      expression: parsed.trim(),
      type: 'Cálculo Numérico',
      reasoning: `Consulta de cálculo procesada: ${parsed.trim()}`,
    };
  }

  return {
    isMath: false,
    expression: '',
    type: '',
    reasoning: '',
  };
}

/**
 * Resuelve una expresión matemática utilizando el motor profesional Math.js.
 */
export function solveMath(rawInput: string): {
  success: boolean;
  data?: MathCalculationData;
  formattedReply: string;
  error?: string;
} {
  const startTime = performance.now();
  const detection = detectMathIntent(rawInput);

  if (!detection.isMath || !detection.expression) {
    return {
      success: false,
      formattedReply: 'No pude identificar una operación matemática válida.',
      error: 'No se detectó expresión matemática',
    };
  }

  try {
    const cleanExpr = detection.expression;
    // Evaluar con el motor profesional de Math.js
    const evaluated = evaluate(cleanExpr);

    // Formatear el resultado para precisión adecuada
    let formattedResult = '';
    if (typeof evaluated === 'number') {
      // Redondear decimales largos pero preservar enteros exactos
      if (Number.isInteger(evaluated)) {
        formattedResult = evaluated.toLocaleString('es-ES');
      } else {
        formattedResult = format(evaluated, { precision: 10 });
      }
    } else {
      formattedResult = String(evaluated);
    }

    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

    // Crear explicación y pasos legibles
    const readableOriginal = rawInput
      .replace(/[¿?¡!]/g, '')
      .replace(/^(cuanto es|cuánto es|calcula|resuelve)\s+/i, '')
      .trim();

    const steps: string[] = [];
    if (detection.type === 'Porcentaje') {
      steps.push(`Operación: ${cleanExpr}`);
      steps.push(`Paso: División entre 100 y multiplicación`);
    } else if (cleanExpr.includes('^')) {
      steps.push(`Cálculo de potencia: ${cleanExpr}`);
    } else if (cleanExpr.includes('sqrt')) {
      steps.push(`Extracción de raíz cuadrada exacta`);
    }

    // Generar respuesta natural de Meteory
    const formattedReply = generateNaturalMathResponse(
      readableOriginal,
      cleanExpr,
      formattedResult,
      detection.type
    );

    const calculationData: MathCalculationData = {
      rawExpression: rawInput,
      cleanedExpression: cleanExpr,
      result: evaluated,
      formattedResult,
      type: detection.type,
      steps,
      executionTimeMs,
    };

    return {
      success: true,
      data: calculationData,
      formattedReply,
    };
  } catch (err: any) {
    console.error('Error al resolver cálculo matemático:', err);
    return {
      success: false,
      formattedReply: `Intenté realizar el cálculo para "${rawInput}", pero la expresión matemática contiene una sintaxis no admitida o división por cero.`,
      error: err?.message || 'Error de evaluación',
    };
  }
}

/**
 * Redacta la respuesta matemática al estilo conversacional y claro de Meteory IA.
 */
function generateNaturalMathResponse(
  originalExpr: string,
  cleanExpr: string,
  result: string,
  type: string
): string {
  // Presentación limpia del problema original
  const cleanDisplay = originalExpr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\s+/g, ' ')
    .trim();

  const responses = [
    `¡Listo! El resultado de **${cleanDisplay}** es **${result}**.`,
    `Haciendo la cuenta, para **${cleanDisplay}** te da exactamente **${result}**.`,
    `¡Claro! El cálculo de **${cleanDisplay}** da **${result}**.`,
    `Para **${cleanDisplay}**, la respuesta es **${result}**.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
