import React, { useState } from 'react';
import { BatteryInfo, getBatteryAnalysisReport } from '../engine/batteryMonitor';
import { BATTERY_QUESTIONS_100, BatteryQAPair } from '../engine/batteryQuestions';
import { speakTextWithGender, VoiceGender } from '../engine/speechEngine';
import {
  Battery,
  BatteryCharging,
  Zap,
  AlertTriangle,
  Volume2,
  Search,
  CheckCircle2,
  HelpCircle,
  X,
  Play,
  Send,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';

interface BatteryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  batteryInfo: BatteryInfo;
  voiceGender: VoiceGender;
  onSendQuery: (query: string) => void;
  onTriggerLowBatteryTest: () => void;
}

export const BatteryInspectorModal: React.FC<BatteryInspectorModalProps> = ({
  isOpen,
  onClose,
  batteryInfo,
  voiceGender,
  onSendQuery,
  onTriggerLowBatteryTest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'questions'>('diagnostic');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const pct = Math.round(batteryInfo.level * 100);

  // Determinar color según el porcentaje de batería
  let batteryColorClass = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
  let gaugeGradient = 'from-emerald-500 via-teal-400 to-emerald-600';
  if (pct <= 10) {
    batteryColorClass = 'text-rose-400 bg-rose-500/25 border-rose-500/50 animate-pulse';
    gaugeGradient = 'from-rose-600 via-red-500 to-amber-600';
  } else if (pct <= 30) {
    batteryColorClass = 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    gaugeGradient = 'from-amber-500 via-orange-400 to-amber-600';
  }

  // Filtrar las 100 preguntas
  const filteredQuestions = BATTERY_QUESTIONS_100.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'estado') return item.id <= 10;
    if (selectedCategory === 'quimica') return item.id >= 11 && item.id <= 20;
    if (selectedCategory === 'optimizacion') return item.id >= 21 && item.id <= 30;
    if (selectedCategory === 'salud') return item.id >= 31 && item.id <= 60;
    if (selectedCategory === 'avanzado') return item.id > 60;

    return true;
  });

  const handleSpeakQA = (item: BatteryQAPair) => {
    const speechText = `${item.question}. ${item.answer}`;
    speakTextWithGender(speechText, voiceGender);
  };

  const handleSendToChat = (questionText: string) => {
    onSendQuery(questionText);
    onClose();
  };

  const handleRunFullDiagnostic = () => {
    const report = getBatteryAnalysisReport(batteryInfo);
    onSendQuery('¿Cuánta batería tengo y cuál es el estado completo de mi dispositivo?');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0c1024] border border-indigo-950/90 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] text-slate-100">
        
        {/* Encabezado del Modal */}
        <div className="p-4 sm:p-5 border-b border-indigo-950/80 bg-[#070914] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-2xl border ${batteryColorClass} flex items-center justify-center shrink-0`}>
              {batteryInfo.charging ? (
                <BatteryCharging className="w-6 h-6 animate-pulse" />
              ) : (
                <Battery className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2 truncate">
                <span>Diagnóstico de Batería & Alerta 10%</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  XTTS v2
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Monitoreo en tiempo real • {BATTERY_QUESTIONS_100.length} Preguntas Frecuentes de Litio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-950/50 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 bg-[#080b1a] border-b border-indigo-950/60 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`px-4 py-2 rounded-xl font-bold font-['Space_Grotesk'] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'diagnostic'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-indigo-950/40'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Estado Actual ({pct}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl font-bold font-['Space_Grotesk'] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-indigo-950/40'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>100 Preguntas de Batería</span>
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
          
          {activeTab === 'diagnostic' ? (
            <div className="space-y-4">
              {/* Tarjeta Visual de Nivel de Batería */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#090d20] border border-indigo-950/90 relative overflow-hidden shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Nivel de Batería Actual</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl sm:text-5xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                        {pct}%
                      </span>
                      <span className="text-sm font-semibold text-slate-300">
                        {batteryInfo.charging ? '⚡ Cargando' : '🔋 Desconectado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleRunFullDiagnostic}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 hover:from-amber-500/40 hover:to-orange-500/40 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Analizar en Chat</span>
                    </button>

                    <button
                      onClick={onTriggerLowBatteryTest}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                      title="Probar Alerta en voz alta XTTS v2 y Notificación al 10%"
                    >
                      <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span>Probar Alerta 10% XTTS</span>
                    </button>
                  </div>
                </div>

                {/* Barra de Progreso del Nivel de Batería */}
                <div className="w-full bg-slate-950/80 rounded-full h-4 p-0.5 border border-indigo-950/80 mb-3 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gaugeGradient} transition-all duration-500`}
                    style={{ width: `${Math.max(5, pct)}%` }}
                  />
                </div>

                {/* Métricas Secundarias */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#0e132c] border border-indigo-950/80 flex flex-col justify-center">
                    <span className="text-slate-400 text-[11px]">Autonomía / Tiempo</span>
                    <span className="text-slate-200 font-bold mt-0.5">{batteryInfo.estimatedHoursLeft || 'Calculando...'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e132c] border border-indigo-950/80 flex flex-col justify-center">
                    <span className="text-slate-400 text-[11px]">Sensor de Hardware</span>
                    <span className="text-slate-200 font-bold mt-0.5">
                      {batteryInfo.supported ? '🟢 Battery API Nativa' : '🟡 Monitoreo Asistido'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e132c] border border-indigo-950/80 flex flex-col justify-center">
                    <span className="text-slate-400 text-[11px]">Salud Química Estimada</span>
                    <span className="text-emerald-300 font-bold mt-0.5">~{batteryInfo.healthScore || 95}% Óptima</span>
                  </div>
                </div>
              </div>

              {/* Alerta de 10% si se detecta crítico o para demostración */}
              {pct <= 10 && !batteryInfo.charging && (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-100 flex items-start gap-3 animate-pulse shadow-lg">
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-white font-['Space_Grotesk']">
                      ⚠️ Batería Crítica al 10% Detectada
                    </h3>
                    <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                      El dispositivo ha alcanzado el 10% de carga. Conéctelo urgentemente a la corriente eléctrica. Meteory IA ha activado la alerta por voz XTTS v2 y notificación de seguridad.
                    </p>
                  </div>
                </div>
              )}

              {/* Banner Informativo sobre Alertas Automáticas */}
              <div className="p-4 rounded-2xl bg-[#090d20] border border-indigo-950/90 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold font-['Space_Grotesk']">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>¿Cómo funciona el análisis automático de batería?</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  1. <strong>Reconocimiento Inteligente</strong>: Cuando preguntas &quot;cuánta batería tengo&quot;, &quot;cuál es mi porcentaje&quot; o cualquiera de las 100 preguntas frecuentes, Meteory IA responde inmediatamente con el nivel exacto del dispositivo.<br />
                  2. <strong>Alerta de Voz al 10% (XTTS v2)</strong>: Cuando el nivel baja al 10% sin estar cargando, se activa una locución clara con voz humana HD y se dispara una notificación de escritorio/móvil.<br />
                  3. <strong>Optimización de Litio</strong>: Puedes consultar consejos de salud, ciclos de carga y reglas de 20%-80% para maximizar la durabilidad del equipo.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Buscador de las 100 Preguntas */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar entre las 100 preguntas sobre batería..."
                    className="w-full bg-[#080b1a] border border-indigo-950/90 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Filtro por Categorías */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#080b1a] border border-indigo-950/90 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  <option value="all">Todas ({BATTERY_QUESTIONS_100.length})</option>
                  <option value="estado">Estado & Porcentaje (1-10)</option>
                  <option value="quimica">Química & Litio (11-20)</option>
                  <option value="optimizacion">Optimización & Consejos (21-30)</option>
                  <option value="salud">Salud & Cuidado (31-60)</option>
                  <option value="avanzado">Técnico & Ciencia (61-100)</option>
                </select>
              </div>

              {/* Contador de resultados */}
              <div className="text-[11px] text-slate-400 font-mono">
                Mostrando {filteredQuestions.length} de {BATTERY_QUESTIONS_100.length} preguntas disponibles
              </div>

              {/* Lista de Preguntas */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No se encontraron preguntas que coincidan con &quot;{searchTerm}&quot;. Pruebe con palabras como &quot;litio&quot;, &quot;10%&quot;, &quot;porcentaje&quot; o &quot;carga&quot;.
                  </div>
                ) : (
                  filteredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-[#090d20] border border-indigo-950/80 hover:border-indigo-800/60 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-amber-200 font-['Space_Grotesk'] leading-snug">
                          #{q.id}. {q.question}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleSpeakQA(q)}
                            title="Escuchar con voz XTTS v2"
                            className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSendToChat(q.question)}
                            title="Preguntar a Meteory IA en el chat"
                            className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed bg-[#060815] p-2.5 rounded-xl border border-indigo-950/50">
                        {q.answer}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Pie del Modal */}
        <div className="p-3 sm:p-4 border-t border-indigo-950/80 bg-[#070914] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px]">Sistema de Monitoreo Continuo Activo</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
