import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { Sparkles, User, ChevronDown, ChevronUp, Cpu, Volume2, CheckCircle2, AlertCircle, Globe, ExternalLink, Calculator, Clock, Check, Copy } from 'lucide-react';
import { VoiceGender } from '../engine/speechEngine';

interface ChatMessageItemProps {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
  voiceGender?: VoiceGender;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onSpeak, voiceGender }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const classification = message.classification;
  const webSearch = message.webSearch;
  const mathResult = message.mathResult;
  const timeData = message.timeData;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Renderizar texto con soporte de formato negrita, cursiva, listas y enlaces
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Línea destacada de enlace al final
      if (line.startsWith('🔗 ')) {
        return (
          <div key={idx} className="mt-3 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <span>🔗</span>
              <span>{parseInlineStyles(line.replace('🔗 ', ''))}</span>
            </div>
          </div>
        );
      }
      // Títulos secundarios
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-white text-sm sm:text-base mt-2 mb-1 font-['Space_Grotesk']">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Puntos de lista
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-3 list-disc text-xs sm:text-[13px] text-slate-200 my-0.5">
            {parseInlineStyles(content)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-0.5 text-xs sm:text-[13px] leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  const parseInlineStyles = (content: string) => {
    // Manejar enlaces markdown [Texto](URL), negritas **texto** y cursivas _texto_
    const tokenRegex = /(\[.*?\]\(https?:\/\/.*?\)|\*\*.*?\*\*|_.*?_)/g;
    const parts = content.split(tokenRegex);

    return parts.map((part, i) => {
      // Enlace markdown [label](url)
      const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/.*?)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline font-medium hover:opacity-90 transition-colors mx-0.5 bg-amber-950/40 px-1 py-0.2 rounded border border-amber-500/30"
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
          </a>
        );
      }

      // Negrita **texto**
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-amber-300">{part.slice(2, -2)}</strong>;
      }

      // Cursiva _texto_
      if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={i} className="text-slate-300 italic text-xs">{part.slice(1, -1)}</em>;
      }

      return part;
    });
  };

  return (
    <div className={`flex w-full mb-3.5 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 sm:gap-3 max-w-[98%] sm:max-w-[88%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-950 border border-indigo-900/60 flex items-center justify-center text-slate-200 shadow-md">
              <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          ) : (
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-[1.5px] shadow-md shadow-orange-500/25">
              <div className="w-full h-full bg-[#070914] rounded-[10px] flex items-center justify-center overflow-hidden">
                {mathResult ? (
                  <Calculator className="w-4 h-4 text-amber-400" />
                ) : timeData ? (
                  <Clock className="w-4 h-4 text-indigo-400" />
                ) : webSearch ? (
                  <Globe className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message Bubble & Details */}
        <div className="flex flex-col gap-1 min-w-0 max-w-full">
          <div
            className={`px-3.5 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed transition-all break-words relative overflow-hidden ${
              isUser
                ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 text-white rounded-tr-none shadow-lg shadow-orange-950/40 border border-amber-400/30'
                : 'bg-[#0d1226]/95 border border-indigo-500/20 text-slate-100 rounded-tl-none shadow-md backdrop-blur-md'
            }`}
          >
            {renderFormattedText(message.text)}
          </div>

          {/* Tarjeta de Información Temporal en Tiempo Real */}
          {!isUser && timeData && (
            <div className="mt-1 px-3.5 py-2.5 rounded-xl bg-[#101736]/80 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-200 shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-indigo-900/50 border border-indigo-700/50 shrink-0">
                  <Clock className="w-4 h-4 text-indigo-300" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate text-xs sm:text-sm font-['Space_Grotesk']">
                    {timeData.locationName}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-indigo-300/80 block truncate">
                    {timeData.dayOfWeek}, {timeData.fullDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 font-mono ml-auto">
                <span className="text-xs sm:text-sm font-bold text-indigo-100 bg-indigo-950/90 px-2.5 py-1 rounded-lg border border-indigo-700/50 shadow-inner">
                  {timeData.time12}
                </span>
                <span className="text-[10px] text-slate-400 px-2 py-1 rounded-md bg-[#070914] border border-indigo-950/60 hidden sm:inline">
                  {timeData.timeZone}
                </span>
              </div>
            </div>
          )}

          {/* Tarjeta de Búsqueda Web en Tiempo Real Multifuente */}
          {!isUser && webSearch && (
            <div className="mt-1 px-3.5 py-2.5 rounded-xl bg-[#081220]/90 border border-cyan-500/30 text-xs text-slate-200 shadow-md space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/50 text-cyan-400 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm font-['Space_Grotesk']">
                      <span>Búsqueda Web en Vivo</span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                      {webSearch.totalResults} fuentes analizadas ({webSearch.executionTimeMs} ms)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap ml-auto">
                  <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800/60 font-medium">
                    Google • SearXNG • Web Abierta
                  </span>
                </div>
              </div>

              {/* Motores y Portales Consultados */}
              {webSearch.sourcesList && webSearch.sourcesList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-indigo-950/80">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Fuentes:</span>
                  {webSearch.sourcesList.slice(0, 4).map((src, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-[#0d1226] border border-indigo-900/60 text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 max-w-[130px] truncate"
                    >
                      <span>🌐</span>
                      <span className="truncate">{src}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tarjeta de Cálculo Matemático Profesional */}
          {!isUser && mathResult && (
            <div className="mt-1 px-3.5 py-2.5 rounded-xl bg-[#1a1408]/80 border border-amber-500/35 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200 shadow-sm">
              <span className="flex items-center gap-1.5 font-semibold">
                <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-['Space_Grotesk']">Calculadora Simbólica ({mathResult.type})</span>
              </span>
              <span className="font-mono font-bold text-amber-300 bg-[#0d1226] px-2.5 py-1 rounded-lg border border-amber-700/60 ml-auto shadow-inner">
                {mathResult.cleanedExpression} = {mathResult.formattedResult}
              </span>
            </div>
          )}

          {/* Action Bar & AI Metatags (for Meteory responses) */}
          {!isUser && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 px-0.5 pt-1">
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono">{message.timestamp}</span>

              {/* Botón de Copiar */}
              <button
                onClick={handleCopy}
                className="hover:text-amber-300 px-2 py-0.5 rounded-md hover:bg-[#141b38] transition-all flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 bg-[#0d1226]/80 border border-indigo-950/90 cursor-pointer"
                title="Copiar texto de la respuesta"
              >
                {copied ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              {onSpeak && (
                <button
                  onClick={() => onSpeak(message.text)}
                  className="hover:text-amber-300 px-2 py-0.5 rounded-md hover:bg-[#141b38] transition-all flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-300 bg-[#0d1226]/80 border border-indigo-950/90 cursor-pointer"
                  title={`Escuchar respuesta con voz humana realista XTTS v2 (${voiceGender === 'female' ? 'Mujer' : 'Hombre'})`}
                >
                  <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  <span className="font-medium">
                    {voiceGender === 'female' ? '👩 Escuchar (Mujer)' : '👨 Escuchar (Hombre)'}
                  </span>
                </button>
              )}

              {classification && (
                <div className="flex items-center gap-1 ml-auto flex-wrap">
                  {classification.isFollowUp && (
                    <span
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs"
                      title={classification.contextReasoning || 'Pregunta vinculada al contexto anterior'}
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      <span className="truncate max-w-[90px]">Memoria{classification.contextTopic ? ` • ${classification.contextTopic}` : ''}</span>
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border ${
                      classification.category === 'calculo_matematico'
                        ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                        : classification.category === 'informacion_temporal'
                        ? 'bg-indigo-950/50 text-indigo-300 border-indigo-800/60'
                        : classification.category === 'busqueda_web'
                        ? 'bg-cyan-950/50 text-cyan-300 border-cyan-800/50'
                        : classification.category === 'desconocido'
                        ? 'bg-[#0d1226] text-slate-400 border-indigo-950/90'
                        : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                    }`}
                  >
                    {classification.category === 'calculo_matematico' ? (
                      <Calculator className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                    ) : classification.category === 'informacion_temporal' ? (
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400" />
                    ) : classification.category === 'busqueda_web' ? (
                      <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                    ) : classification.category === 'desconocido' ? (
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                    )}
                    <span>{classification.categoryName}</span>
                  </span>

                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md text-slate-400 hover:text-amber-200 hover:bg-[#141b38] border border-transparent hover:border-indigo-950 transition-colors cursor-pointer"
                    title="Ver análisis del motor NLP"
                  >
                    <Cpu className="w-3 h-3 text-amber-400" />
                    <span>{showDetails ? 'Ocultar' : 'Inspeccionar'}</span>
                    {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Expanded AI Engine Inspection Box */}
          {!isUser && classification && showDetails && (
            <div className="mt-1.5 p-3 sm:p-4 rounded-xl bg-[#070914]/95 border border-indigo-900/60 text-xs font-mono space-y-2 text-slate-300 shadow-xl">
              <div className="flex items-center justify-between border-b border-indigo-950 pb-2 text-slate-400">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" /> Motor Autónomo Meteory v3.8
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">Latencia: {classification.executionTimeMs} ms</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Texto normalizado: </span>
                  <span className="text-slate-200 font-sans">"{classification.normalizedText || '(vacío)'}"</span>
                </div>
                <div>
                  <span className="text-slate-500">Tokens ({classification.tokens.length}): </span>
                  <span className="text-slate-200">[{classification.tokens.map(t => `"${t}"`).join(', ')}]</span>
                </div>
                {classification.matchedPattern && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Patrón emparejado: </span>
                    <span className="text-amber-300 font-semibold font-sans">{classification.matchedPattern}</span>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span>Certeza algorítmica:</span>
                    <span className="text-amber-300 font-bold">{classification.confidence}%</span>
                  </div>
                  <div className="w-full bg-[#0d1226] rounded-full h-1.5 overflow-hidden border border-indigo-950">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, classification.confidence)}%` }}
                    />
                  </div>
                </div>
              </div>
              {classification.isFollowUp && (
                <div className="pt-1.5 text-[11px] text-amber-300/90 border-t border-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Memoria Contextual Activa:</strong> {classification.contextReasoning || 'Continuación contextual detectada'}
                  </span>
                </div>
              )}
              <div className="pt-1.5 text-[11px] text-slate-400 border-t border-indigo-950">
                <span className="text-slate-500">Razonamiento: </span>
                <span className="text-slate-300 font-sans">{classification.reasoning}</span>
              </div>
            </div>
          )}

          {/* User timestamp */}
          {isUser && (
            <span className="text-[10px] sm:text-[11px] text-slate-500 text-right px-1 font-mono">
              {message.timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


