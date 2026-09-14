/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatSession } from './types';
import { processInput } from './engine/meteoryBrain';
import { executeWebSearch, synthesizeWebResponse } from './engine/webSearchService';
import {
  loadSessions,
  saveSessions,
  createNewSession,
  deriveSessionTitle,
} from './engine/sessionManager';
import { Header } from './components/Header';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { BrainInspectorModal } from './components/BrainInspectorModal';
import { SessionSidebar } from './components/SessionSidebar';
import { SuggestedPrompts } from './components/SuggestedPrompts';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import {
  VoiceGender,
  getSavedVoiceGender,
  saveVoiceGender,
  speakTextWithGender,
  stopSpeaking,
  subscribeAudioStatus,
} from './engine/speechEngine';
import { Sparkles, ShieldCheck, Globe, Calculator, Clock, MessageSquare, Volume2, VolumeX, Trash2, RotateCcw, Mic } from 'lucide-react';

export default function App() {
  // Inicialización de sesiones desde localStorage
  const [{ sessions, activeSessionId }, setSessionState] = useState<{
    sessions: ChatSession[];
    activeSessionId: string;
  }>(() => loadSessions());

  const [voiceGender, setVoiceGender] = useState<VoiceGender>(() => getSavedVoiceGender());
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('Meteory IA está procesando...');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [confirmDeleteActive, setConfirmDeleteActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suscripción al estado de reproducción de audio neural
  useEffect(() => {
    const unsubscribe = subscribeAudioStatus((playing) => {
      setIsAudioPlaying(playing);
    });
    return () => unsubscribe();
  }, []);

  // Sesión activa actual
  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createNewSession();
  const messages = currentSession.messages;

  // Persistir en localStorage cuando cambian las sesiones o la sesión activa
  useEffect(() => {
    saveSessions(sessions, activeSessionId);
  }, [sessions, activeSessionId]);

  // Auto-scroll hacia el último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isProcessing]);

  // Actualizar mensajes de la sesión activa
  const updateCurrentSessionMessages = (
    updater: (prevMessages: ChatMessage[]) => ChatMessage[]
  ) => {
    setSessionState((prev) => {
      const updatedSessions = prev.sessions.map((s) => {
        if (s.id === prev.activeSessionId) {
          const nextMessages = updater(s.messages);
          const autoTitle =
            s.title === 'Nueva conversación' || s.title === 'Conversación principal'
              ? deriveSessionTitle(nextMessages)
              : s.title;

          return {
            ...s,
            title: autoTitle,
            updatedAt: Date.now(),
            messages: nextMessages,
          };
        }
        return s;
      });

      return {
        ...prev,
        sessions: updatedSessions,
      };
    });
  };

  // Crear nueva sesión de chat desde cero
  const handleCreateSession = () => {
    stopSpeaking();
    setIsProcessing(false);
    setProcessingStatus('');
    setConfirmDeleteActive(false);
    const newSession = createNewSession();
    setSessionState((prev) => ({
      sessions: [newSession, ...prev.sessions],
      activeSessionId: newSession.id,
    }));
    setIsSidebarOpen(false);
  };

  // Cambiar de sesión
  const handleSelectSession = (id: string) => {
    stopSpeaking();
    setConfirmDeleteActive(false);
    setSessionState((prev) => ({
      ...prev,
      activeSessionId: id,
    }));
    setIsSidebarOpen(false);
  };

  // Eliminar sesión
  const handleDeleteSession = (id: string) => {
    stopSpeaking();
    setIsProcessing(false);
    setConfirmDeleteActive(false);
    setSessionState((prev) => {
      const filtered = prev.sessions.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh = createNewSession();
        return {
          sessions: [fresh],
          activeSessionId: fresh.id,
        };
      }
      return {
        sessions: filtered,
        activeSessionId: prev.activeSessionId === id ? filtered[0].id : prev.activeSessionId,
      };
    });
  };

  // Vaciar todo el historial de conversaciones
  const handleClearAllSessions = () => {
    stopSpeaking();
    setIsProcessing(false);
    setConfirmDeleteActive(false);
    const fresh = createNewSession();
    setSessionState({
      sessions: [fresh],
      activeSessionId: fresh.id,
    });
    setIsSidebarOpen(false);
  };

  // Renombrar sesión
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessionState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s)),
    }));
  };

  // Alternar entre voz femenina y voz masculina
  const handleToggleVoiceGender = () => {
    const nextGender: VoiceGender = voiceGender === 'female' ? 'male' : 'female';
    setVoiceGender(nextGender);
    saveVoiceGender(nextGender);

    // Reproducir una confirmación corta en voz alta con la nueva voz
    const greetingConfirmation =
      nextGender === 'female'
        ? 'Voz femenina activada para Meteory.'
        : 'Voz masculina activada para Meteory.';

    speakTextWithGender(greetingConfirmation, nextGender);
  };

  // Síntesis de voz TTS ajustable a mujer u hombre
  const speakText = (text: string) => {
    speakTextWithGender(text, voiceGender);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Añadir mensaje del usuario a la sesión activa
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeString,
    };

    updateCurrentSessionMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    const { reply, classification, searchTopic, mathResult, timeData } = processInput(
      userText,
      messages
    );

    // 2. Si se detectó una consulta o cálculo matemático
    if (classification.isMath && mathResult) {
      setProcessingStatus('Resolviendo con la calculadora matemática profesional...');
      setTimeout(() => {
        const meteoryMsg: ChatMessage = {
          id: `meteory-${Date.now()}`,
          sender: 'meteory',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification,
          mathResult,
        };

        updateCurrentSessionMessages((prev) => [...prev, meteoryMsg]);
        setIsProcessing(false);

        if (isSpeechEnabled) {
          speakText(reply);
        }
      }, 120);
      return;
    }

    // 3. Si se detectó una consulta de hora o fecha en tiempo real
    if (classification.isTimeDate && timeData) {
      setProcessingStatus('Consultando hora en tiempo real...');
      setTimeout(() => {
        const meteoryMsg: ChatMessage = {
          id: `meteory-${Date.now()}`,
          sender: 'meteory',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification,
          timeData,
        };

        updateCurrentSessionMessages((prev) => [...prev, meteoryMsg]);
        setIsProcessing(false);

        if (isSpeechEnabled) {
          speakText(reply);
        }
      }, 100);
      return;
    }

    // 4. Si se detectó una solicitud de búsqueda web en tiempo real
    if (classification.isWebSearch && searchTopic) {
      setProcessingStatus(
        classification.isFollowUp && classification.contextTopic
          ? `Investigando detalles sobre "${classification.contextTopic}" en la red...`
          : `Consultando en internet (DuckDuckGo, Wikipedia y SearXNG) sobre "${searchTopic}"...`
      );

      try {
        const searchData = await executeWebSearch(searchTopic);
        const synthesizedReply = synthesizeWebResponse(
          searchTopic,
          searchData,
          classification.contextTopic,
          classification.originalQuestion
        );

        const meteoryMsg: ChatMessage = {
          id: `meteory-${Date.now()}`,
          sender: 'meteory',
          text: synthesizedReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification,
          webSearch: searchData,
        };

        updateCurrentSessionMessages((prev) => [...prev, meteoryMsg]);
        setIsProcessing(false);

        if (isSpeechEnabled) {
          speakText(synthesizedReply);
        }
      } catch (error) {
        console.error('Error al ejecutar búsqueda:', error);
        const fallbackMsg: ChatMessage = {
          id: `meteory-${Date.now()}`,
          sender: 'meteory',
          text: `Intenté realizar la búsqueda en tiempo real sobre "${searchTopic}", pero ocurrió un inconveniente momentáneo con la conexión. ¡Por favor intenta nuevamente!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification,
        };
        updateCurrentSessionMessages((prev) => [...prev, fallbackMsg]);
        setIsProcessing(false);
      }
      return;
    }

    // 5. Conversación personal, conocimiento avanzado directo o saludo
    setProcessingStatus('Meteory IA está formulando la respuesta...');
    setTimeout(() => {
      const meteoryMsg: ChatMessage = {
        id: `meteory-${Date.now()}`,
        sender: 'meteory',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        classification,
      };

      updateCurrentSessionMessages((prev) => [...prev, meteoryMsg]);
      setIsProcessing(false);

      if (isSpeechEnabled) {
        speakText(reply);
      }
    }, 150);
  };

  // Ejecutar consultas en vivo para el Modo de Voz en Tiempo Real
  const handleLiveQuery = async (userText: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Añadir mensaje de usuario a la sesión activa
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeString,
    };
    updateCurrentSessionMessages((prev) => [...prev, userMsg]);

    const { reply, classification, searchTopic, mathResult, timeData } = processInput(
      userText,
      messages
    );

    // 2. Si es consulta matemática
    if (classification.isMath && mathResult) {
      const meteoryMsg: ChatMessage = {
        id: `meteory-${Date.now()}`,
        sender: 'meteory',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        classification,
        mathResult,
      };
      updateCurrentSessionMessages((prev) => [...prev, meteoryMsg]);
      return { reply, classification, mathResult };
    }

    // 3. Si es consulta de hora o fecha
    if (classification.isTimeDate && timeData) {
      const meteoryMsg: ChatMessage = {
        id: `meteory-${Date.now()}`,
        sender: 'meteory',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        classification,
        timeData,
      };
      updateCurrentSessionMessages((prev) => [...prev, meteoryMsg]);
      return { reply, classification, timeData };
    }

    // 4. Si requiere búsqueda web en tiempo real
    if (classification.isWebSearch && searchTopic) {
      try {
        const searchData = await executeWebSearch(searchTopic);
        const synthesizedReply = synthesizeWebResponse(
          searchTopic,
          searchData,
          classification.contextTopic,
          classification.originalQuestion
        );
        const meteoryMsg: ChatMessage = {
          id: `meteory-${Date.now()}`,
          sender: 'meteory',
          text: synthesizedReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification,
          webSearch: searchData,
        };
        updateCurrentSessionMessages((prev) => [...prev, meteoryMsg]);
        return { reply: synthesizedReply, classification, webSearch: searchData, searchTopic };
      } catch (err) {
        const fallbackReply = `Intenté consultar en internet sobre "${searchTopic}", pero ocurrió un fallo momentáneo con la conexión.`;
        const fallbackMsg: ChatMessage = {
          id: `meteory-${Date.now()}`,
          sender: 'meteory',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification,
        };
        updateCurrentSessionMessages((prev) => [...prev, fallbackMsg]);
        return { reply: fallbackReply, classification, searchTopic };
      }
    }

    // 5. Conversación general, conocimiento profundo o saludo
    const meteoryMsg: ChatMessage = {
      id: `meteory-${Date.now()}`,
      sender: 'meteory',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      classification,
    };
    updateCurrentSessionMessages((prev) => [...prev, meteoryMsg]);
    return { reply, classification };
  };

  const handleResetCurrentChat = () => {
    stopSpeaking();
    setIsProcessing(false);
    setProcessingStatus('');
    setConfirmDeleteActive(false);
    const fresh = createNewSession('Nueva conversación');
    setSessionState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === prev.activeSessionId ? { ...fresh, id: s.id } : s)),
    }));
  };

  const totalInteractions = messages.filter((m) => m.sender === 'user').length;
  const webSearchesDone = messages.filter((m) => m.webSearch).length;
  const mathCalculationsDone = messages.filter((m) => m.mathResult).length;
  const timeQueriesDone = messages.filter((m) => m.timeData).length;

  // Extraer el último tema activo de la sesión
  const activeTopic = messages
    .slice()
    .reverse()
    .find((m) => m.classification?.contextTopic)?.classification?.contextTopic;

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-full overflow-hidden bg-[#070914] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <Header
        onResetChat={handleResetCurrentChat}
        onToggleInspector={() => setIsInspectorOpen(true)}
        isInspectorOpen={isInspectorOpen}
        isSpeechEnabled={isSpeechEnabled}
        onToggleSpeech={() => {
          if (isSpeechEnabled) {
            stopSpeaking();
          }
          setIsSpeechEnabled(!isSpeechEnabled);
        }}
        totalInteractions={totalInteractions}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewSession={handleCreateSession}
        voiceGender={voiceGender}
        onToggleVoiceGender={handleToggleVoiceGender}
        isAudioPlaying={isAudioPlaying}
      />

      {/* Main Layout con Sidebar y Chat Area */}
      <div className="flex-1 flex w-full max-w-full overflow-hidden min-h-0">
        {/* Historial de Sesiones */}
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onClearAllSessions={handleClearAllSessions}
        />

        {/* Área Principal de Conversación */}
        <main className="flex-1 flex flex-col px-2 sm:px-4 md:px-6 max-w-4xl mx-auto w-full h-full min-h-0 overflow-hidden">
          {/* Banner de Estado y Memoria Activa */}
          <div className="mb-2 p-2.5 sm:p-3 rounded-2xl bg-[#0c1024]/90 backdrop-blur-md border border-indigo-950/80 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-slate-200 font-bold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[260px] font-['Space_Grotesk']">
                  {currentSession.title}
                </span>
                {activeTopic && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
                    <span className="truncate max-w-[140px]">Memoria: {activeTopic}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[10px] sm:text-[11px] ml-auto">
              <span className="flex items-center gap-1 text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 font-mono" title="Consultas de hora y fecha">
                <Clock className="w-3 h-3 text-sky-400" /> {timeQueriesDone}
              </span>
              <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 font-mono" title="Cálculos matemáticos resueltos">
                <Calculator className="w-3 h-3 text-amber-400" /> {mathCalculationsDone}
              </span>
              <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 font-mono" title="Búsquedas web en vivo">
                <Globe className="w-3 h-3 text-amber-400" /> {webSearchesDone}
              </span>

              {/* Botón para eliminar o vaciar la conversación activa */}
              {confirmDeleteActive ? (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-xl bg-rose-950/90 border border-rose-600/60 text-rose-200 animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] font-bold text-rose-300">¿Eliminar?</span>
                  <button
                    onClick={() => handleDeleteSession(currentSession.id)}
                    className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setConfirmDeleteActive(false)}
                    className="px-1.5 py-0.5 rounded-lg bg-[#151c3d] hover:bg-[#1d2754] text-slate-300 text-[10px] transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  id="delete-current-chat-btn"
                  onClick={() => setConfirmDeleteActive(true)}
                  title="Eliminar esta conversación"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 active:bg-rose-900/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400/80 hover:text-rose-400" />
                  <span className="hidden sm:inline text-[11px] text-slate-400 hover:text-rose-300 font-medium">Eliminar</span>
                </button>
              )}
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 py-1 px-0.5 sm:px-1 min-h-0 overscroll-contain">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center my-auto py-6 sm:py-8 px-2 sm:px-4 max-w-xl mx-auto animate-in fade-in duration-300">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-[1.5px] shadow-xl shadow-amber-500/20 mb-3 sm:mb-4 animate-float">
                  <div className="w-full h-full bg-[#070914] rounded-[22px] flex items-center justify-center">
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white font-['Space_Grotesk'] mb-1.5 tracking-tight">
                  Meteory IA • Chat Autónomo
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-3">
                  Conversación limpia e independiente. Pregúntame sobre cualquier tema, realiza cálculos, pide la hora mundial o activa búsquedas web en vivo:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                  <button
                    onClick={() => setIsLiveVoiceOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-rose-500/30 hover:from-amber-500/40 hover:to-rose-500/40 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/30 transition-all cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Iniciar Llamada de Voz en Vivo</span>
                  </button>
                </div>
                <SuggestedPrompts onSelectPrompt={handleSendMessage} />
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    onSpeak={speakText}
                    voiceGender={voiceGender}
                  />
                ))}

                {/* Si la conversación tiene solo 1 mensaje, sugerir temas adicionales */}
                {messages.length === 1 && (
                  <SuggestedPrompts onSelectPrompt={handleSendMessage} />
                )}
              </>
            )}

            {/* Typing / Searching Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-3 text-slate-200 text-xs py-2.5 px-4 animate-pulse bg-[#0c1024]/95 backdrop-blur-md rounded-2xl border border-amber-500/30 w-fit shadow-lg shadow-amber-500/5">
                <div className="w-6 h-6 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                  <Globe className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                </div>
                <span className="font-medium font-['Space_Grotesk']">{processingStatus}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de Chat y Estado de Reproducción de Voz Humana */}
          <div className="mt-auto shrink-0 pt-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] border-t border-indigo-950/80 bg-[#070914]/95 backdrop-blur-lg">
            {isAudioPlaying && (
              <div className="mb-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/40 flex items-center justify-between gap-2 text-xs text-amber-200 animate-in fade-in shadow-lg shadow-amber-500/5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-0.5 h-3.5 px-1 bg-amber-500/20 rounded-md border border-amber-500/30">
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
                    <span className="w-1 h-2 bg-amber-300 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-3.5 bg-amber-400 rounded-full animate-pulse delay-150" />
                  </div>
                  <Volume2 className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <span className="text-xs text-amber-100 truncate font-['Space_Grotesk']">
                    Voz neural <strong>XTTS v2</strong> ({voiceGender === 'female' ? 'Mujer' : 'Hombre'})...
                  </span>
                </div>
                <button
                  onClick={() => stopSpeaking()}
                  className="px-3 py-1 rounded-xl bg-[#0c1024] hover:bg-[#141b3c] text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold shrink-0 transition-all cursor-pointer"
                >
                  Detener
                </button>
              </div>
            )}
            <ChatInput
              onSendMessage={handleSendMessage}
              onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
              disabled={isProcessing}
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
              <span className="truncate">Meteory IA • 100% Autónomo & Web Abierta</span>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-[11px] shrink-0 ml-2 font-['Space_Grotesk'] cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                {sessions.length} conversación{sessions.length > 1 ? 'es' : ''}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Voz en Vivo e Interactivo */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        onSendQuery={handleLiveQuery}
        voiceGender={voiceGender}
        onToggleVoiceGender={handleToggleVoiceGender}
        activeSessionTitle={currentSession.title}
      />

      {/* Modal Inspector del Cerebro */}
      <BrainInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onTestPhrase={handleSendMessage}
      />
    </div>
  );
}
