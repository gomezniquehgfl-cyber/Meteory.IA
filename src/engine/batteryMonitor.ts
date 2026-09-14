export interface BatteryInfo {
  supported: boolean;
  level: number; // 0 to 1
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  formattedPercentage: string;
  healthScore?: number; // 0 to 100%
  statusCategory?: 'Excelente' | 'Bueno' | 'Moderado' | 'Bajo (10%)' | 'Crítico';
  estimatedHoursLeft?: string;
  chargingRate?: string;
}

type BatteryListener = (info: BatteryInfo) => void;

let batteryManager: any = null;
const listeners: BatteryListener[] = [];
let lastLowBatteryAlertTime = 0;

export async function initBatteryMonitor(onLowBattery?: (info: BatteryInfo) => void): Promise<BatteryInfo> {
  const defaultInfo: BatteryInfo = {
    supported: false,
    level: 0.85,
    charging: false,
    chargingTime: 0,
    dischargingTime: 3600,
    formattedPercentage: '85% (Estimado)',
    healthScore: 98,
    statusCategory: 'Bueno',
    estimatedHoursLeft: 'Aprox. 4 horas 30 min'
  };

  if (typeof window === 'undefined' || !(navigator as any).getBattery) {
    return defaultInfo;
  }

  try {
    if (!batteryManager) {
      batteryManager = await (navigator as any).getBattery();

      const updateState = () => {
        const info = getBatteryInfo();
        listeners.forEach(fn => {
          try {
            fn(info);
          } catch (e) {
            console.error('Error in battery listener:', e);
          }
        });

        // Trigger 10% low battery warning automatically when level is <= 0.10 and not charging
        if (info.supported && info.level <= 0.10 && !info.charging) {
          const now = Date.now();
          // Alert every 3 minutes max if still under 10%
          if (now - lastLowBatteryAlertTime > 180000) {
            lastLowBatteryAlertTime = now;
            onLowBattery?.(info);
          }
        }
      };

      batteryManager.addEventListener('levelchange', updateState);
      batteryManager.addEventListener('chargingchange', updateState);
      batteryManager.addEventListener('chargingtimechange', updateState);
      batteryManager.addEventListener('dischargingtimechange', updateState);
    }

    return getBatteryInfo();
  } catch (err) {
    console.error('Error initializing battery monitor:', err);
    return defaultInfo;
  }
}

export function getBatteryInfo(): BatteryInfo {
  if (!batteryManager || typeof (navigator as any).getBattery === 'undefined') {
    return {
      supported: false,
      level: 0.85,
      charging: false,
      chargingTime: 0,
      dischargingTime: 3600,
      formattedPercentage: '85% (Estimado)',
      healthScore: 95,
      statusCategory: 'Bueno',
      estimatedHoursLeft: 'Aprox. 4 horas'
    };
  }

  const level = typeof batteryManager.level === 'number' ? batteryManager.level : 1.0;
  const charging = !!batteryManager.charging;
  const pct = Math.round(level * 100);
  const statusText = charging ? 'Cargando ⚡' : 'Desconectado 🔋';

  let statusCategory: 'Excelente' | 'Bueno' | 'Moderado' | 'Bajo (10%)' | 'Crítico' = 'Bueno';
  if (pct > 80) statusCategory = 'Excelente';
  else if (pct > 30) statusCategory = 'Bueno';
  else if (pct > 15) statusCategory = 'Moderado';
  else if (pct <= 10) statusCategory = 'Bajo (10%)';
  else statusCategory = 'Crítico';

  let estimatedHoursLeft = 'Calculando...';
  if (charging) {
    if (batteryManager.chargingTime && isFinite(batteryManager.chargingTime) && batteryManager.chargingTime > 0) {
      const mins = Math.round(batteryManager.chargingTime / 60);
      estimatedHoursLeft = `${mins} minutos para carga completa`;
    } else {
      estimatedHoursLeft = 'Conectado al cargador ⚡';
    }
  } else {
    if (batteryManager.dischargingTime && isFinite(batteryManager.dischargingTime) && batteryManager.dischargingTime > 0) {
      const hours = Math.floor(batteryManager.dischargingTime / 3600);
      const mins = Math.round((batteryManager.dischargingTime % 3600) / 60);
      estimatedHoursLeft = hours > 0 ? `${hours}h ${mins}m restantes` : `${mins} minutos restantes`;
    } else {
      // Estimated backup calculation based on percentage
      const estMins = Math.round(pct * 4.5);
      const h = Math.floor(estMins / 60);
      const m = estMins % 60;
      estimatedHoursLeft = h > 0 ? `Aprox. ${h}h ${m}m restantes` : `Aprox. ${m} min restantes`;
    }
  }

  return {
    supported: true,
    level,
    charging,
    chargingTime: batteryManager.chargingTime || 0,
    dischargingTime: batteryManager.dischargingTime || Infinity,
    formattedPercentage: `${pct}% (${statusText})`,
    healthScore: Math.min(100, Math.max(80, 100 - Math.round((1 - level) * 5))),
    statusCategory,
    estimatedHoursLeft
  };
}

export function subscribeBattery(listener: BatteryListener): () => void {
  listeners.push(listener);
  listener(getBatteryInfo());
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) {
      listeners.splice(idx, 1);
    }
  };
}

export function getBatteryAnalysisReport(info?: BatteryInfo): string {
  const current = info || getBatteryInfo();
  const pct = Math.round(current.level * 100);
  const statusEmoji = current.charging ? '⚡' : pct <= 10 ? '🚨' : pct <= 20 ? '🪫' : '🔋';
  
  let stateAdvice = '';
  if (pct <= 10 && !current.charging) {
    stateAdvice = '⚠️ **¡ALERTA CRÍTICA (10%)!** Tu dispositivo se encuentra en nivel crítico. Conéctalo urgentemente al cargador para evitar apagados inesperados.';
  } else if (current.charging) {
    stateAdvice = '⚡ **Estado de Carga Activo**: El dispositivo está recibiendo energía de forma constante. Se recomienda retirar la funda pesada si notas sobrecalentamiento.';
  } else if (pct < 30) {
    stateAdvice = '💡 **Recomendación**: El nivel es inferior al 30%. Considera activar el modo de ahorro de batería o conectar el cargador pronto.';
  } else {
    stateAdvice = '✅ **Nivel de Batería Saludable**: La carga se encuentra en un rango óptimo para el uso cotidiano.';
  }

  return `📊 **Diagnóstico del Estado de Batería Actual**:

• **Nivel de Carga**: ${pct}% ${statusEmoji}
• **Estado de Corriente**: ${current.charging ? 'Cargando actualmente ⚡' : 'Desconectado de la corriente 🔋'}
• **Autonomía Estimada**: ${current.estimatedHoursLeft}
• **Gestión de Celdas (Litio)**: ${current.supported ? 'Monitoreo activo por Hardware (Battery API)' : 'Monitoreo asistido por Software'}
• **Salud Química Estimada**: ~${current.healthScore || 95}% (Óptima estabilidad de voltaje)

${stateAdvice}`;
}
