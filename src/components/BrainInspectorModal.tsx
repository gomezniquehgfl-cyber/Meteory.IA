import React, { useState } from 'react';
import { X, Cpu, Sparkles, Check, Database, Zap, BookOpen, ChevronDown, ChevronUp, Search, Terminal, Activity } from 'lucide-react';
import { GREETING_RULES } from '../engine/greetingsData';
import { processInput, normalizeText } from '../engine/meteoryBrain';

interface BrainInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestPhrase: (phrase: string) => void;
}

export const BrainInspectorModal: React.FC<BrainInspectorModalProps> = ({
  isOpen,
  onClose,
  onTestPhrase,
}) => {
  const [activeTab, setActiveTab] = useState<'reglas' | 'laboratorio' | 'arquitectura'>('reglas');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<ReturnType<typeof processInput> | null>(null);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  if (!isOpen) return null;

  const totalPatterns = GREETING_RULES.reduce((acc, rule) => acc + rule.patterns.length, 0);

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;
    const result = processInput(testInput);
    setTestResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#050713]/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#070914]/98 border border-indigo-950/90 w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] ring-1 ring-amber-500/20 backdrop-blur-xl">
        {/* Modal Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4.5 border-b border-indigo-950/80 flex items-center justify-between bg-[#0a0e24]/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <span>Cerebro Autónomo de Meteory IA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono hidden sm:inline">
                  V2.4 Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                NLP Local de Alta Fidelidad • Diálogo, Reloj y Matemáticas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#151c3d] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-indigo-950/80 px-3 sm:px-6 bg-[#070914]/90 text-xs overflow-x-auto gap-2 py-1">
          <button
            onClick={() => setActiveTab('reglas')}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 text-xs font-['Space_Grotesk'] cursor-pointer ${
              activeTab === 'reglas'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121838]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Patrones & Catálogo ({GREETING_RULES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('laboratorio')}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 text-xs font-['Space_Grotesk'] cursor-pointer ${
              activeTab === 'laboratorio'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121838]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Laboratorio de Inferencia</span>
          </button>
          <button
            onClick={() => setActiveTab('arquitectura')}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 text-xs font-['Space_Grotesk'] cursor-pointer ${
              activeTab === 'arquitectura'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121838]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Arquitectura Local</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 flex-1">
          {/* TAB 1: REGLAS Y CATEGORÍAS */}
          {activeTab === 'reglas' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#0c1024] border border-indigo-950 shadow-sm">
                  <span className="text-[11px] text-slate-400 block font-mono">Categorías</span>
                  <span className="text-xl font-black text-amber-400 font-['Space_Grotesk']">{GREETING_RULES.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0c1024] border border-indigo-950 shadow-sm">
                  <span className="text-[11px] text-slate-400 block font-mono">Patrones Activos</span>
                  <span className="text-xl font-black text-amber-300 font-['Space_Grotesk']">+{totalPatterns}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0c1024] border border-indigo-950 shadow-sm">
                  <span className="text-[11px] text-slate-400 block font-mono">Búsqueda Web</span>
                  <span className="text-xl font-black text-emerald-400 font-['Space_Grotesk']">Multifuente</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0c1024] border border-indigo-950 shadow-sm">
                  <span className="text-[11px] text-slate-400 block font-mono">Dependencias</span>
                  <span className="text-xl font-black text-slate-200 font-['Space_Grotesk']">0 APIs Ext.</span>
                </div>
              </div>

              {/* Buscador de patrones en el catálogo */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar entre los patrones de diálogo, modismos, reloj y matemáticas..."
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-[#0c1024] border border-indigo-950 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>

              <div className="space-y-3">
                {GREETING_RULES.map((rule) => {
                  const isExpanded = expandedRuleId === rule.id;
                  const filter = categoryFilter.trim().toLowerCase();
                  const filteredPatterns = filter
                    ? rule.patterns.filter((p) => p.toLowerCase().includes(filter))
                    : rule.patterns;

                  if (filter && filteredPatterns.length === 0) return null;

                  return (
                    <div
                      key={rule.id}
                      className="p-4 rounded-2xl bg-[#0c1024]/70 border border-indigo-950/80 hover:border-indigo-800/80 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-white flex items-center gap-2 font-['Space_Grotesk']">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          {rule.categoryName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20 font-bold">
                            {rule.patterns.length} patrones
                          </span>
                          <button
                            onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#151c3d] transition-colors cursor-pointer"
                            title={isExpanded ? 'Contraer' : 'Expandir todos los patrones'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-2.5">{rule.description}</p>

                      {/* Lista de patrones */}
                      <div className={`flex flex-wrap gap-1.5 ${isExpanded ? 'max-h-60 overflow-y-auto p-2.5 bg-[#070914] rounded-xl border border-indigo-950' : ''}`}>
                        {(isExpanded ? filteredPatterns : filteredPatterns.slice(0, 12)).map((p, i) => (
                          <span
                            key={i}
                            className={`px-2.5 py-0.8 rounded-lg border text-[11px] font-mono ${
                              filter && p.toLowerCase().includes(filter)
                                ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 font-bold'
                                : 'bg-[#0a0e24] border-indigo-950 text-slate-300'
                            }`}
                          >
                            {p}
                          </span>
                        ))}
                        {!isExpanded && filteredPatterns.length > 12 && (
                          <button
                            onClick={() => setExpandedRuleId(rule.id)}
                            className="px-2.5 py-0.8 rounded-lg bg-[#0a0e24] border border-indigo-900/60 text-[11px] font-mono text-amber-300 hover:text-amber-200 hover:border-amber-400/50 transition-colors cursor-pointer"
                          >
                            +{filteredPatterns.length - 12} más (Ver todos los {rule.patterns.length})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LABORATORIO DE PRUEBAS */}
          {activeTab === 'laboratorio' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Ingresa cualquier frase, modismo, pregunta o cálculo para inspeccionar en tiempo real
                la normalización léxica, extracción de tokens y cálculo de similitud difusa de Meteory.
              </p>

              <form onSubmit={handleRunTest} className="flex gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Ej: hooooola carnal, que hora es en tokio, calcula 15% de 250..."
                  className="flex-1 bg-[#0c1024] border border-indigo-950 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Zap className="w-4 h-4" /> Probar
                </button>
              </form>

              {testResult && (
                <div className="p-4 rounded-2xl bg-[#0c1024]/90 border border-indigo-950 space-y-3 font-mono text-xs shadow-xl">
                  <div className="flex items-center justify-between border-b border-indigo-950 pb-2.5">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 font-['Space_Grotesk']">
                      <Terminal className="w-4 h-4" /> Diagnóstico de Inferencia
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                      {testResult.classification.executionTimeMs} ms
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-[#070914] border border-indigo-950/80">
                      <span className="text-slate-500 block text-[10px]">CATEGORÍA</span>
                      <span className="text-amber-300 font-bold text-xs">{testResult.classification.categoryName}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#070914] border border-indigo-950/80">
                      <span className="text-slate-500 block text-[10px]">CONFIANZA MATEMÁTICA</span>
                      <span className="text-emerald-300 font-bold text-xs">{testResult.classification.confidence}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#070914] border border-indigo-950/80 sm:col-span-2">
                      <span className="text-slate-500 block text-[10px]">NORMALIZACIÓN</span>
                      <span className="text-white font-mono">"{testResult.classification.normalizedText}"</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#070914] border border-indigo-950/80 sm:col-span-2">
                      <span className="text-slate-500 block text-[10px]">TOKENS LÉXICOS</span>
                      <span className="text-amber-200 font-mono">[{testResult.classification.tokens.join(', ')}]</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-indigo-950 text-[11px]">
                    <span className="text-slate-400 block mb-1.5 font-bold font-['Space_Grotesk']">
                      Respuesta Generada por Meteory IA:
                    </span>
                    <div className="p-3 rounded-xl bg-[#070914] border border-amber-500/30 text-amber-200/95 font-sans leading-relaxed">
                      {testResult.reply}
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        onTestPhrase(testInput);
                        onClose();
                      }}
                      className="text-xs font-sans text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Enviar este mensaje directamente al chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARQUITECTURA */}
          {activeTab === 'arquitectura' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1024]/80 border border-indigo-950 space-y-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 font-['Space_Grotesk']">
                  <Check className="w-4 h-4 text-emerald-400" /> Motor Autónomo 100% Sin APIs de Pago
                </h3>
                <p>
                  Meteory IA no depende de la API de Gemini ni de servidores cerrados. Toda su lógica de diálogo, razonamiento, reloj y cálculo se ejecuta en tiempo real mediante un pipeline de NLP estructurado:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 pt-1 text-slate-400">
                  <li><strong className="text-slate-200">Normalización:</strong> Remueve diacríticos, acentos y comprime letras repetidas (ej. <em>"hooooolaaa" &rarr; "hola"</em>).</li>
                  <li><strong className="text-slate-200">Tokenización:</strong> Segmenta en unidades léxicas y gramaticales.</li>
                  <li><strong className="text-slate-200">Fuzzy Matching:</strong> Aplica distancia de Levenshtein para tolerancia a errores ortográficos.</li>
                  <li><strong className="text-slate-200">Rastreo Contextual:</strong> Rastreo de hilos previos para preguntas sucesivas y encadenamiento de cálculos.</li>
                  <li><strong className="text-slate-200">Búsqueda Web Multifuente:</strong> Enlace a fuentes abiertas de internet para preguntas de conocimiento actual.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-indigo-950/80 bg-[#070914]/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#151c3d] hover:bg-[#1d2754] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

