import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Cpu, Volume2, VolumeX, Plus, Zap, Battery, BatteryCharging } from 'lucide-react';
import { VoiceGender } from '../engine/speechEngine';
import { liveChatEngine } from '../engine/liveChatEngine';
import { BatteryInfo } from '../engine/batteryMonitor';

interface HeaderProps {
  onResetChat: () => void;
  onToggleInspector: () => void;
  isInspectorOpen: boolean;
  isSpeechEnabled: boolean;
  onToggleSpeech: () => void;
  totalInteractions: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewSession: () => void;
  voiceGender: VoiceGender;
  onToggleVoiceGender: () => void;
  isAudioPlaying?: boolean;
  batteryInfo?: BatteryInfo;
  onOpenBatteryInspector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetChat,
  onToggleInspector,
  isInspectorOpen,
  isSpeechEnabled,
  onToggleSpeech,
  totalInteractions,
  isSidebarOpen,
  onToggleSidebar,
  onNewSession,
  voiceGender,
  onToggleVoiceGender,
  isAudioPlaying = false,
  batteryInfo,
  onOpenBatteryInspector,
}) => {
  const [onlineCount, setOnlineCount] = useState<number>(liveChatEngine.onlineCount);

  useEffect(() => {
    liveChatEngine.connect();
    const unsub = liveChatEngine.onPresenceChange(({ count }) => {
      setOnlineCount(count);
    });
    return unsub;
  }, []);

  const pct = batteryInfo ? Math.round(batteryInfo.level * 100) : 85;
  const isLow = pct <= 10;

  return (
    <header className="border-b border-indigo-950/80 bg-[#070914]/90 backdrop-blur-xl sticky top-0 z-30 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2.5 px-3 sm:px-6 w-full max-w-full overflow-hidden shadow-2xl shadow-black/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Brand identity & Sidebar trigger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Ocultar sesiones y chat en vivo' : 'Mostrar sesiones y chat en vivo'}
            className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-all duration-200 text-xs flex items-center justify-center shrink-0 min-w-[38px] min-h-[38px] cursor-pointer relative ${
              isSidebarOpen
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-sm shadow-indigo-500/20'
                : 'bg-[#0e1329]/90 border-indigo-950/90 text-slate-300 hover:bg-[#151c3d] hover:text-white hover:border-indigo-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-medium ml-1.5 font-['Space_Grotesk']">Sesiones & Chat</span>
            {onlineCount > 0 && (
              <span className="ml-1.5 hidden md:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {onlineCount}
              </span>
            )}
          </button>

          <div className="relative group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-[1.5px] shadow-md shadow-orange-500/30 shrink-0">
            <div className="w-full h-full bg-[#070914] rounded-[10px] flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-rose-500/15" />
              <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 animate-pulse" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#070914] shadow-xs shadow-amber-400 animate-pulse" />
          </div>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white font-['Space_Grotesk'] truncate flex items-center gap-1">
                <span>Meteory</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 font-extrabold">
                  IA
                </span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-300 border border-amber-500/30 shadow-xs">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                V3.8 Neural
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 truncate font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 shrink-0"></span>
              <span className="hidden sm:inline text-slate-400">100% Autónoma • Memoria Cósmica & Batería</span>
              <span className="sm:hidden text-amber-400 font-medium">En línea</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Botón Indicador de Batería */}
          {onOpenBatteryInspector && (
            <button
              id="open-battery-inspector-btn"
              onClick={onOpenBatteryInspector}
              title={`Batería del dispositivo: ${pct}% - Ver análisis de batería y 100 preguntas`}
              className={`px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                isLow
                  ? 'bg-rose-500/30 border-rose-500/60 text-rose-200 animate-pulse shadow-md shadow-rose-950'
                  : 'bg-[#0d1226] border-indigo-950/90 text-emerald-300 hover:bg-[#141b38] hover:border-emerald-500/40'
              }`}
            >
              {batteryInfo?.charging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Battery className={`w-4 h-4 ${isLow ? 'text-rose-400' : 'text-emerald-400'}`} />
              )}
              <span className="font-mono text-xs">{pct}%</span>
            </button>
          )}

          <button
            id="quick-new-chat-btn"
            onClick={onNewSession}
            title="Iniciar un nuevo chat desde cero"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 border-amber-500/40 hover:border-amber-400/80 text-amber-200 hover:text-white active:scale-95 text-xs font-semibold flex items-center justify-center min-w-[38px] min-h-[38px] transition-all shadow-sm shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline ml-1 font-semibold font-['Space_Grotesk']">Nuevo</span>
          </button>

          {/* Selector de Voz TTS Mujer / Hombre con Visualizador */}
          <div className="flex items-center bg-[#0d1226] border border-indigo-950/90 rounded-xl p-0.5 shrink-0 shadow-inner">
            <button
              id="toggle-voice-gender-btn"
              onClick={onToggleVoiceGender}
              title={`Alternar voz: ${voiceGender === 'female' ? 'Voz Femenina (Elvira/Dalia Neural)' : 'Voz Masculina (Álvaro/Jorge Neural)'} - Motor XTTS v2`}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 min-h-[32px] cursor-pointer ${
                voiceGender === 'female'
                  ? 'bg-rose-500/25 border border-rose-500/50 text-rose-200 shadow-xs'
                  : 'bg-indigo-500/25 border border-indigo-500/50 text-indigo-200 shadow-xs'
              }`}
            >
              <span className="text-xs">{voiceGender === 'female' ? '👩' : '👨'}</span>
              <span className="font-semibold text-[11px] sm:text-xs tracking-tight font-['Space_Grotesk']">
                {voiceGender === 'female' ? 'Mujer' : 'Hombre'}
              </span>
            </button>

            {/* Visualizador de audio o badge XTTS */}
            <div
              className={`hidden md:flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-mono ml-0.5 ${
                isAudioPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-[#070914] text-amber-400/90 border border-indigo-950/60'
              }`}
              title="Motor de voz realista XTTS v2"
            >
              {isAudioPlaying ? (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2.5 bg-amber-400 animate-pulse" />
                  <span className="w-0.5 h-3.5 bg-amber-300 animate-bounce" />
                  <span className="w-0.5 h-2 bg-amber-400 animate-pulse" />
                  <span className="w-0.5 h-3 bg-amber-300 animate-bounce" />
                </div>
              ) : (
                <span className="tracking-wider">XTTS v2</span>
              )}
            </div>
          </div>

          {/* Activar / Desactivar lectura por voz TTS */}
          <button
            id="toggle-speech-btn"
            onClick={onToggleSpeech}
            title={isSpeechEnabled ? 'Lectura automática activada' : 'Lectura automática desactivada'}
            className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-all duration-200 text-xs flex items-center justify-center min-w-[38px] min-h-[38px] cursor-pointer ${
              isSpeechEnabled
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 hover:bg-amber-500/30 shadow-xs shadow-amber-500/20'
                : 'bg-[#0d1226] border-indigo-950/90 text-slate-400 hover:text-slate-200 hover:bg-[#141b38]'
            }`}
          >
            {isSpeechEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="hidden lg:inline ml-1.5 font-medium font-['Space_Grotesk']">
              {isSpeechEnabled ? 'Voz ON' : 'Voz OFF'}
            </span>
          </button>

          {/* Inspector de Cerebro */}
          <button
            id="open-brain-inspector-btn"
            onClick={onToggleInspector}
            title="Inspeccionar cerebro y reglas NLP de Meteory IA"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center justify-center min-w-[38px] min-h-[38px] cursor-pointer ${
              isInspectorOpen
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-sm shadow-amber-500/30'
                : 'bg-[#0d1226] border-indigo-950/90 text-slate-300 hover:bg-[#141b38] hover:text-white hover:border-amber-500/40'
            }`}
          >
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline ml-1.5 font-['Space_Grotesk']">Cerebro</span>
          </button>
        </div>
      </div>
    </header>
  );
};
