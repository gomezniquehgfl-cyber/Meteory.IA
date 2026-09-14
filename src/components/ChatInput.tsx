import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, CornerDownLeft, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onOpenLiveVoice?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenLiveVoice,
  disabled,
  placeholder = 'Escribe un mensaje, haz un cálculo o pide una búsqueda web...',
}) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  // No auto-focusing to prevent mobile keyboard from popping up automatically.
  // The user should tap the input field explicitly when they want to type.

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5 sm:gap-2 w-full max-w-full">
      {/* Botón rápido para abrir Modo Hablar en Vivo */}
      {onOpenLiveVoice && (
        <button
          id="open-live-voice-chat-input-btn"
          type="button"
          onClick={onOpenLiveVoice}
          title="Hablar en Vivo con Meteory IA (Voz y Búsquedas en tiempo real)"
          className="w-[48px] h-[48px] rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95 shadow-md shadow-orange-950/30 group cursor-pointer"
        >
          <div className="relative">
            <Mic className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
        </button>
      )}

      <div
        className={`relative flex-1 min-w-0 rounded-2xl transition-all duration-300 ${
          isFocused
            ? 'ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/15 border-amber-500/60'
            : 'border-indigo-950/90 hover:border-indigo-800/60'
        } border bg-[#0c1024]/90 backdrop-blur-md overflow-hidden flex items-center`}
      >
        <input
          ref={inputRef}
          id="chat-input-field"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="sentences"
          className="w-full bg-transparent px-4 py-3 sm:py-3.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50 min-h-[48px]"
        />

        {text.trim() && (
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 mr-3 px-1.5 py-0.5 rounded bg-[#151c3d] border border-indigo-900/60 font-mono">
            <span>Enter</span>
            <CornerDownLeft className="w-2.5 h-2.5 text-amber-400" />
          </span>
        )}
      </div>

      <button
        id="send-message-btn"
        type="submit"
        disabled={!text.trim() || disabled}
        className="w-[48px] h-[48px] sm:w-auto sm:px-5 sm:py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 disabled:opacity-25 disabled:pointer-events-none text-white rounded-2xl text-sm font-bold transition-all duration-200 shadow-lg shadow-orange-950/40 active:scale-95 flex items-center justify-center gap-2 shrink-0 min-w-[48px] border border-amber-400/20 cursor-pointer"
      >
        <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        <span className="hidden sm:inline font-['Space_Grotesk'] tracking-wide">Enviar</span>
      </button>
    </form>
  );
};


