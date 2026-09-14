import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Globe,
  Calculator,
  Clock,
  X,
  Radio,
  Send,
  MessageSquare,
  Zap,
  Info,
  Layers,
  ChevronDown,
  RefreshCw,
  Search,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';
import { VoiceGender, speakTextWithGender, stopSpeaking, isCurrentlySpeaking, subscribeAudioStatus } from '../engine/speechEngine';
import { MeteoryVoiceListener, isSpeechRecognitionSupported, SpeechState } from '../engine/speechRecognitionService';
import { WAKE_WORD_PATTERNS, detectWakeWord, WakeWordMatch, getSampleWakeWords } from '../engine/wakeWordDetector';
import { ChatMessage, ClassificationResult } from '../types';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuery: (text: string) => Promise<{
    reply: string;
    classification: ClassificationResult;
    searchTopic?: string;
    mathResult?: any;
    timeData?: any;
    webSearch?: any;
  }>;
  voiceGender: VoiceGender;
  onToggleVoiceGender: () => void;
  activeSessionTitle: string;
}

interface LiveExchange {
  id: string;
  sender: 'user' | 'meteory';
  text: string;
  timestamp: string;
  classification?: ClassificationResult;
  webSearch?: any;
  mathResult?: any;
  timeData?: any;
  wakeWordDetected?: string;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onSendQuery,
  voiceGender,
  onToggleVoiceGender,
  activeSessionTitle,
}) => {
  const [isHandsFree, setIsHandsFree] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [liveStatus, setLiveStatus] = useState<string>('Iniciando modo de voz en vivo...');
  const [soundLevel, setSoundLevel] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeWebSearch, setActiveWebSearch] = useState<any | null>(null);
  const [liveExchanges, setLiveExchanges] = useState<LiveExchange[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showWakeWordsList, setShowWakeWordsList] = useState<boolean>(false);
  const [wakeWordFilter, setWakeWordFilter] = useState<string>('');
  const [lastWakeWord, setLastWakeWord] = useState<string | null>(null);
  const [textFallbackInput, setTextFallbackInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const voiceListenerRef = useRef<MeteoryVoiceListener | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const wakeWordAlertTimeout = useRef<any>(null);

  isSpeakingRef.current = isSpeaking;
  isProcessingRef.current = isProcessing;

  const handleCloseModal = () => {
    stopSpeaking();
    cleanupLiveSession();
    onClose();
  };

  // Manejar tecla Escape para salir y apagar el micrófono de inmediato
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Inicializar listener de audio EXCLUSIVAMENTE cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) {
      cleanupLiveSession();
      return;
    }

    // Cerrar teclado móvil activo para que no estorbe en el modo en vivo
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);

    const listener = new MeteoryVoiceListener('es-ES');
    voiceListenerRef.current = listener;

    // Conectar eventos del listener
    listener.onTranscriptChange = (transcript, isFinal) => {
      if (isSpeakingRef.current) {
        // Interrupción por voz (Barge-in): Si el usuario habla mientras Meteory responde, parar TTS
        stopSpeaking();
        setIsSpeaking(false);
      }
      setCurrentTranscript(transcript);
      setLiveStatus(`Te escucho: "${transcript}"`);
    };

    // Callback de detección de Wake Words (+100 variaciones)
    listener.onWakeWordDetected = (match: WakeWordMatch) => {
      setLastWakeWord(match.matchedPhrase);
      if (wakeWordAlertTimeout.current) {
        clearTimeout(wakeWordAlertTimeout.current);
      }
      wakeWordAlertTimeout.current = setTimeout(() => {
        setLastWakeWord(null);
      }, 4000);
    };

    listener.onSpeechEnd = (finalTranscript) => {
      if (finalTranscript.trim() && !isProcessingRef.current) {
        processSpokenQuery(finalTranscript.trim());
      }
    };

    listener.onStateChange = (state: SpeechState, err?: string) => {
      if (state === 'error' && err) {
        setErrorMsg(err);
        setLiveStatus(err);
      } else if (state === 'listening') {
        setErrorMsg(null);
        if (!isSpeakingRef.current && !isProcessingRef.current) {
          setLiveStatus('Escuchando... Di "Hey Meteory" o haz tu consulta');
        }
      }
    };

    listener.onSoundLevel = (lvl) => {
      setSoundLevel(lvl);
    };

    // Subscribirse a eventos globales de audio TTS
    const unsubAudio = subscribeAudioStatus((playing) => {
      setIsSpeaking(playing);
      if (!playing && isHandsFree && !isProcessingRef.current && !isMuted) {
        // Cuando Meteory termina de hablar, reactivar la escucha en manos libres
        setTimeout(() => {
          if (!isSpeakingRef.current && !isProcessingRef.current && !isMuted) {
            startListening();
          }
        }, 300);
      }
    });

    // Iniciar micrófono y visualizador
    listener.startAudioVisualizer().then(() => {
      // Saludo inicial en vivo
      const initialGreeting = `Hola, estoy en vivo. Puedes llamarme diciendo "Hey Meteory" u "Hola Meteory" y hacer cualquier pregunta o cálculo.`;
      setLiveStatus('¡Modo en vivo activo! Di "Hey Meteory" o habla libremente.');
      setIsSpeaking(true);
      speakTextWithGender(initialGreeting, voiceGender, () => {
        setIsSpeaking(false);
        if (!isMuted) {
          startListening();
        }
      });
    });

    return () => {
      unsubAudio();
      cleanupLiveSession();
    };
  }, [isOpen, voiceGender]);

  const cleanupLiveSession = () => {
    stopSpeaking();
    if (voiceListenerRef.current) {
      voiceListenerRef.current.destroy();
      voiceListenerRef.current = null;
    }
    if (wakeWordAlertTimeout.current) {
      clearTimeout(wakeWordAlertTimeout.current);
      wakeWordAlertTimeout.current = null;
    }
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setLastWakeWord(null);
    setCurrentTranscript('');
    setSoundLevel(0);
  };

  const startListening = () => {
    if (isMuted || !voiceListenerRef.current) return;
    try {
      voiceListenerRef.current.startListening();
      setIsListening(true);
      setErrorMsg(null);
      setLiveStatus('Escuchando... Di "Hey Meteory" o lo que desees');
    } catch (e) {
      console.warn('Error iniciando escucha:', e);
    }
  };

  const stopListening = () => {
    if (voiceListenerRef.current) {
      voiceListenerRef.current.stopListening();
    }
    setIsListening(false);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      stopListening();
      setLiveStatus('Micrófono silenciado');
    }
  };

  const handleOrbClick = () => {
    if (isSpeaking) {
      // Si está hablando, interrumpir
      stopSpeaking();
      setIsSpeaking(false);
      setLiveStatus('Interrumpido. Te escucho...');
      if (!isMuted) startListening();
      return;
    }

    if (isProcessing) {
      return;
    }

    if (isListening) {
      // Forzar envío del texto actual o pausar
      const text = voiceListenerRef.current?.flushTranscript() || currentTranscript;
      if (text) {
        processSpokenQuery(text);
      } else {
        stopListening();
        setLiveStatus('En pausa. Toca para hablar');
      }
    } else {
      startListening();
    }
  };

  const processSpokenQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setCurrentTranscript('');
    stopListening();
    setIsProcessing(true);
    setErrorMsg(null);

    // Detección de Wake Word para limpiar la consulta o responder a la llamada
    const wakeMatch = detectWakeWord(queryText);
    let effectiveQuery = queryText;
    let wakeLabel: string | undefined;

    if (wakeMatch.detected) {
      wakeLabel = wakeMatch.matchedPhrase;
      setLastWakeWord(wakeMatch.matchedPhrase);

      // Si el usuario SOLO dijo la palabra de activación (ej: "Hey Meteory", "Hola Meteori")
      if (!wakeMatch.cleanQuery) {
        const greetings = [
          '¡Hola! Te escucho con atención. ¿En qué te puedo ayudar o qué deseas buscar?',
          '¡Aquí estoy! Dime qué necesitas saber, calcular o buscar en internet.',
          '¡Hola! Estoy listo. Puedes hacerme cualquier consulta ahora mismo.',
          '¡A tus órdenes! Cuéntame qué tema te gustaría explorar.',
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userItem: LiveExchange = {
          id: `live-u-${Date.now()}`,
          sender: 'user',
          text: queryText,
          timestamp: now,
          wakeWordDetected: wakeMatch.matchedPhrase,
        };
        const meteoryItem: LiveExchange = {
          id: `live-m-${Date.now()}`,
          sender: 'meteory',
          text: randomGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setLiveExchanges((prev) => [...prev, userItem, meteoryItem]);
        setIsProcessing(false);
        setIsSpeaking(true);
        setLiveStatus('Meteory respondió al llamado.');

        await speakTextWithGender(randomGreeting, voiceGender, () => {
          setIsSpeaking(false);
          if (isHandsFree && !isMuted) {
            startListening();
          }
        });
        return;
      } else {
        // Usar la consulta limpia si vino con pregunta (ej: "Hey Meteory ¿qué hora es en Madrid?" -> "¿qué hora es en Madrid?")
        effectiveQuery = wakeMatch.cleanQuery;
      }
    }

    // Agregar mensaje del usuario al historial en vivo
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userItem: LiveExchange = {
      id: `live-u-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: now,
      wakeWordDetected: wakeLabel,
    };
    setLiveExchanges((prev) => [...prev, userItem]);

    setLiveStatus(`Consultando: "${effectiveQuery}"...`);

    try {
      // Enviar la consulta al cerebro completo de Meteory
      const result = await onSendQuery(effectiveQuery);

      // Si hubo búsqueda web, mostrar el badge en vivo
      if (result.webSearch) {
        setActiveWebSearch(result.webSearch);
        setLiveStatus(`Información web encontrada. Respondiendo...`);
      } else if (result.mathResult) {
        setLiveStatus(`Cálculo resuelto. Respondiendo...`);
      } else if (result.timeData) {
        setLiveStatus(`Hora obtenida. Respondiendo...`);
      } else {
        setLiveStatus('Meteory respondiendo...');
      }

      const meteoryItem: LiveExchange = {
        id: `live-m-${Date.now()}`,
        sender: 'meteory',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        classification: result.classification,
        webSearch: result.webSearch,
        mathResult: result.mathResult,
        timeData: result.timeData,
      };

      setLiveExchanges((prev) => [...prev, meteoryItem]);
      setIsProcessing(false);

      // Reproducir en voz alta con síntesis neural hiperrealista
      setIsSpeaking(true);
      await speakTextWithGender(result.reply, voiceGender, () => {
        setIsSpeaking(false);
        setActiveWebSearch(null);
        if (isHandsFree && !isMuted) {
          startListening();
        }
      });
    } catch (err: any) {
      console.error('Error en consulta de voz en vivo:', err);
      setIsProcessing(false);
      setLiveStatus('Ocurrió un error al procesar la respuesta.');
      if (isHandsFree && !isMuted) {
        startListening();
      }
    }
  };

  const handleSendManualText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textFallbackInput.trim() || isProcessing) return;
    const text = textFallbackInput.trim();
    setTextFallbackInput('');
    processSpokenQuery(text);
  };

  if (!isOpen) return null;

  // Filtrado de la lista de más de 100 wake words para el inspector
  const filteredWakeWords = WAKE_WORD_PATTERNS.filter((pattern) =>
    pattern.toLowerCase().includes(wakeWordFilter.toLowerCase().trim())
  );

  // Determinar la animación y color del orbe central
  let orbGlowClass = 'from-amber-500/20 via-orange-500/30 to-indigo-600/40 border-amber-500/40';
  let statusBadgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/30';

  if (lastWakeWord) {
    orbGlowClass = 'from-amber-400/50 via-yellow-500/60 to-orange-500/60 border-amber-400 shadow-amber-400/50';
    statusBadgeColor = 'bg-amber-500/20 text-amber-200 border-amber-400/70 animate-pulse';
  } else if (isSpeaking) {
    orbGlowClass = 'from-amber-500/40 via-orange-500/50 to-rose-500/40 border-amber-500/70 shadow-orange-500/40';
    statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
  } else if (isProcessing) {
    orbGlowClass = 'from-indigo-500/30 via-purple-500/40 to-amber-500/30 border-indigo-500/60';
    statusBadgeColor = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40';
  } else if (isListening) {
    orbGlowClass = 'from-amber-500/30 via-emerald-500/40 to-indigo-500/30 border-amber-400/60 shadow-amber-500/20';
    statusBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
  }

  const lastExchange = liveExchanges[liveExchanges.length - 1];

  return (
    <div
      id="live-voice-modal-overlay"
      className="fixed inset-0 z-50 flex flex-col bg-[#050713]/98 backdrop-blur-2xl text-slate-100 animate-in fade-in duration-200 overflow-hidden select-none"
    >
      {/* Luces ambientales de fondo */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Barra superior de control */}
      <div className="relative z-10 flex items-center justify-between px-2 sm:px-6 py-2.5 sm:py-3 border-b border-indigo-950/80 bg-[#070914]/95 backdrop-blur-md gap-2">
        <div className="flex items-center gap-2">
          {/* Botón X Salir al Chat SIEMPRE VISIBLE en celular */}
          <button
            id="close-live-voice-top-btn"
            onClick={handleCloseModal}
            title="Salir al chat principal (X)"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/25 border border-rose-500/60 hover:bg-rose-600/40 text-rose-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95"
          >
            <X className="w-5 h-5 text-rose-200 stroke-[3]" />
            <span className="hidden md:inline font-['Space_Grotesk'] text-xs font-bold">Salir</span>
          </button>

          <div className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-base font-bold text-white font-['Space_Grotesk'] tracking-tight flex items-center gap-1">
                <span className="truncate">Meteory Live</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono uppercase font-bold tracking-widest shrink-0">
                  EN VIVO
                </span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[120px] sm:max-w-xs">
              {activeSessionTitle}
            </p>
          </div>
        </div>

        {/* Controles de Configuración de Voz */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botón Ver +100 Variaciones de Wake Words */}
          <button
            id="open-wake-words-list-btn"
            onClick={() => setShowWakeWordsList(!showWakeWordsList)}
            title="Ver las +100 frases de activación reconocidas"
            className={`px-2 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              showWakeWordsList
                ? 'bg-amber-500/25 border-amber-500/60 text-amber-200 shadow-sm shadow-amber-500/20'
                : 'bg-[#0c1024] border-indigo-950 text-amber-300 hover:border-amber-500/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline">+100 Wake Words</span>
            <span className="sm:hidden text-[10px]">100+</span>
          </button>

          {/* Botón cambiar de voz mujer/hombre */}
          <button
            id="live-voice-gender-btn"
            onClick={onToggleVoiceGender}
            title="Cambiar voz de Meteory"
            className="px-2 py-1.5 rounded-xl bg-[#0c1024] border border-indigo-950 hover:border-indigo-800 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <span>{voiceGender === 'female' ? '👩' : '👨'}</span>
            <span className="text-slate-300 hidden md:inline font-['Space_Grotesk']">
              {voiceGender === 'female' ? 'Mujer' : 'Hombre'}
            </span>
          </button>

          {/* Toggle Manos Libres vs Pulsar */}
          <button
            id="live-handsfree-toggle-btn"
            onClick={() => setIsHandsFree(!isHandsFree)}
            title={isHandsFree ? 'Modo Manos Libres (Auto-escucha)' : 'Modo Pulsar para Hablar'}
            className={`px-2 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isHandsFree
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-[#0c1024] border-indigo-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isHandsFree ? 'animate-pulse text-emerald-400' : ''}`} />
            <span className="hidden lg:inline">{isHandsFree ? 'Manos Libres' : 'Pulsar'}</span>
          </button>

          {/* Ver Historial de la llamada */}
          <button
            id="live-history-toggle-btn"
            onClick={() => setShowHistory(!showHistory)}
            title="Ver transcripción completa"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showHistory
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-[#0c1024] border-indigo-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta Destacada cuando se Detecta Wake Word */}
      {lastWakeWord && (
        <div className="relative z-20 bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 border-b border-amber-400/50 px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-amber-200 animate-in slide-in-from-top-2 duration-200">
          <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>¡Activado por voz! Frase reconocida: «{lastWakeWord}»</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono uppercase">
            +100 Patrones Activos
          </span>
        </div>
      )}

      {/* Modal/Drawer Flotante: Inspector de las +100 Variaciones de Activación */}
      {showWakeWordsList && (
        <div className="absolute top-16 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] max-h-[75vh] bg-[#070914]/98 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-950">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-200 font-['Space_Grotesk']">
                {WAKE_WORD_PATTERNS.length} Frases de Activación
              </span>
            </div>
            <button
              onClick={() => setShowWakeWordsList(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Di cualquiera de estas frases en voz alta para llamar la atención de Meteory o comenzar tu consulta:
          </p>

          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={wakeWordFilter}
              onChange={(e) => setWakeWordFilter(e.target.value)}
              placeholder="Buscar entre las 130+ combinaciones..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0c1024] border border-indigo-950 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[380px]">
            {filteredWakeWords.map((pattern, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setShowWakeWordsList(false);
                  processSpokenQuery(pattern);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#0c1024]/80 hover:bg-amber-500/20 border border-indigo-950 hover:border-amber-500/40 text-[11px] font-mono text-slate-300 hover:text-amber-200 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>"{pattern}"</span>
                <span className="text-[9px] text-slate-500 group-hover:text-amber-300 font-sans">Probar</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cuerpo principal del modo en vivo */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between p-3 sm:p-6 md:p-8 relative z-10 min-h-0 overflow-y-auto md:overflow-hidden max-w-6xl mx-auto w-full gap-4 md:gap-6">
        {/* Lado Central: Orbe Dinámico y Estado */}
        <div className="flex-1 flex flex-col items-center justify-center w-full h-full text-center my-auto min-h-0 py-2">
          {/* Badge de Estado Activo */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md mb-6 transition-all duration-300 shadow-md ${statusBadgeColor}`}
          >
            {lastWakeWord ? (
              <>
                <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Palabra clave detectada: "{lastWakeWord}"</span>
              </>
            ) : isSpeaking ? (
              <>
                <Volume2 className="w-4 h-4 animate-pulse text-amber-400" />
                <span>Meteory está hablando ({voiceGender === 'female' ? 'Mujer' : 'Hombre'})...</span>
              </>
            ) : isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                <span>Consultando y procesando...</span>
              </>
            ) : isListening ? (
              <>
                <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Escuchando... Di "Hey Meteory"</span>
              </>
            ) : isMuted ? (
              <>
                <MicOff className="w-4 h-4 text-slate-400" />
                <span>Micrófono en pausa</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Modo en vivo listo</span>
              </>
            )}
          </div>

          {/* Orbe Central de Voz Interactivo */}
          <div className="relative flex items-center justify-center my-4">
            {/* Ondas radiales reactivas al volumen */}
            {isListening && soundLevel > 10 && (
              <div
                className="absolute rounded-full border border-emerald-400/30 pointer-events-none transition-transform duration-75"
                style={{
                  width: `${180 + soundLevel * 1.5}px`,
                  height: `${180 + soundLevel * 1.5}px`,
                  opacity: Math.min(0.8, soundLevel / 80),
                }}
              />
            )}

            {lastWakeWord && (
              <div className="absolute w-60 h-60 rounded-full border-2 border-amber-400/60 animate-ping pointer-events-none" />
            )}

            {isSpeaking && (
              <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-amber-500/20 animate-ping pointer-events-none" />
            )}

            {/* Núcleo del Orbe */}
            <button
              id="live-central-orb-button"
              onClick={handleOrbClick}
              title={
                isSpeaking
                  ? 'Toca para interrumpir'
                  : isListening
                  ? 'Toca para enviar o pausar'
                  : 'Toca para comenzar a hablar'
              }
              className={`relative z-10 w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr ${orbGlowClass} p-[3px] shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center group`}
              style={{
                transform: isListening ? `scale(${1 + soundLevel / 350})` : 'scale(1)',
              }}
            >
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Visualizador de barras de onda sonora */}
                <div className="flex items-center gap-1 sm:gap-1.5 h-12 mb-1">
                  {[40, 70, 100, 60, 90, 50, 80, 45].map((height, i) => {
                    let barHeight = 8;
                    if (isSpeaking) {
                      barHeight = Math.max(10, Math.sin(Date.now() / 150 + i) * 35 + 20);
                    } else if (isListening) {
                      barHeight = Math.max(8, (soundLevel / 100) * height * 0.45);
                    }

                    return (
                      <span
                        key={i}
                        className={`w-1 sm:w-1.5 rounded-full transition-all duration-75 ${
                          lastWakeWord
                            ? 'bg-gradient-to-t from-amber-400 to-yellow-300'
                            : isSpeaking
                            ? 'bg-gradient-to-t from-amber-500 to-rose-400'
                            : isListening
                            ? 'bg-gradient-to-t from-emerald-400 to-cyan-400'
                            : 'bg-slate-700'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                    );
                  })}
                </div>

                <span className="text-[11px] font-bold text-slate-300 font-['Space_Grotesk'] tracking-wider uppercase">
                  {isSpeaking ? 'Interrumpir' : isListening ? 'Escuchando' : 'Toca para hablar'}
                </span>
              </div>
            </button>
          </div>

          {/* Subtítulo / Transcripción en tiempo real */}
          <div className="w-full max-w-xl mx-auto mt-4 px-4 min-h-[70px] flex flex-col items-center justify-center">
            {currentTranscript ? (
              <p className="text-sm sm:text-base text-amber-200 font-medium italic animate-in fade-in duration-150 font-['Space_Grotesk']">
                "{currentTranscript}"
              </p>
            ) : lastExchange?.sender === 'meteory' && isSpeaking ? (
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed font-['Plus_Jakarta_Sans']">
                {lastExchange.text}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                {liveStatus}
              </p>
            )}

            {/* Ejemplos de Wake Words sugeridos */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-md">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">
                Pruébame diciendo:
              </span>
              {getSampleWakeWords().map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => processSpokenQuery(sample)}
                  className="px-2 py-0.5 rounded-md bg-[#0c1024] border border-indigo-950 text-[10px] text-amber-300/90 hover:text-amber-200 hover:border-amber-500/40 transition-colors cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Si hubo búsqueda web, mostrar fuentes encontradas en vivo */}
            {activeWebSearch && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap justify-center text-[10px] text-amber-300 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/60 animate-in fade-in">
                <Globe className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Fuentes consultadas: {activeWebSearch.sourcesList?.slice(0, 3).join(', ') || 'Web Abierta'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral: Historial y Transcripción de la Conversación en Vivo */}
        {showHistory && (
          <div className="w-full md:w-80 h-72 md:h-full bg-[#070914]/95 border border-indigo-950 rounded-2xl flex flex-col p-3 shadow-xl backdrop-blur-md animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-950 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Transcripción de la llamada
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{liveExchanges.length} mensajes</span>
            </div>

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs text-slate-300"
            >
              {liveExchanges.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs p-4">
                  Habla por el micrófono para ver la transcripción en vivo.
                </div>
              ) : (
                liveExchanges.map((ex) => (
                  <div
                    key={ex.id}
                    className={`p-2.5 rounded-xl ${
                      ex.sender === 'user'
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100 ml-4'
                        : 'bg-[#0f1430] border border-indigo-950 text-slate-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <span>{ex.sender === 'user' ? 'Tú' : 'Meteory IA'}</span>
                        {ex.wakeWordDetected && (
                          <span className="px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono text-[8px]">
                            {ex.wakeWordDetected}
                          </span>
                        )}
                      </span>
                      <span>{ex.timestamp}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{ex.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Barra Inferior: Controles de Micrófono y Fallback Manual */}
      <div className="relative z-10 border-t border-indigo-950/80 bg-[#070914]/95 backdrop-blur-xl p-3 sm:p-4">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {/* Botón Silenciar / Activar Micrófono */}
          <button
            id="live-mute-toggle-btn"
            onClick={handleToggleMute}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-center shrink-0 min-w-[48px] min-h-[48px] cursor-pointer ${
              isMuted
                ? 'bg-rose-950/80 border-rose-600/60 text-rose-300 hover:bg-rose-900/60'
                : 'bg-[#0c1024] border-indigo-950 text-emerald-400 hover:border-emerald-500/40 hover:bg-[#141b3c]'
            }`}
            title={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Formulario Fallback de Entrada Rápida por Teclado */}
          <form onSubmit={handleSendManualText} className="flex-1 flex items-center gap-1.5 w-full">
            <input
              type="text"
              value={textFallbackInput}
              onChange={(e) => setTextFallbackInput(e.target.value)}
              placeholder="O escribe 'Hey Meteory...' o cualquier pregunta..."
              disabled={isProcessing}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0c1024] border border-indigo-950 focus:border-amber-500/60 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!textFallbackInput.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

