import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Send,
  Sparkles,
  Radio,
  Smile,
  Edit3,
  Check,
  X,
  Share2,
  RefreshCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LiveChatMessage, LiveUser } from '../types';
import { liveChatEngine } from '../engine/liveChatEngine';

const QUICK_REACTIONS = ['👋', '✨', '🚀', '🔥', '🌟', '🤖', '🪐', '💡', '🏆', '🎉', '❤️', '👏'];
const AVATAR_OPTIONS = ['🚀', '✨', '🪐', '☄️', '🌌', '👾', '🌟', '🛸', '🛰️', '🌠', '🔮', '⚡', '🌙', '🔭', '👑', '🧙‍♂️'];
const STATUS_PRESETS = [
  '🟢 En línea',
  '💬 Chateando',
  '🚀 Explorando el cosmos',
  '🤖 Preguntando a la IA',
  '✨ Creando ideas',
  '🪐 Modo nocturno',
];

interface LiveCommunityChatProps {
  onMinimize?: () => void;
}

export const LiveCommunityChat: React.FC<LiveCommunityChatProps> = () => {
  const [messages, setMessages] = useState<LiveChatMessage[]>(liveChatEngine.messages);
  const [onlineCount, setOnlineCount] = useState<number>(liveChatEngine.onlineCount);
  const [onlineUsers, setOnlineUsers] = useState<LiveUser[]>(liveChatEngine.onlineUsers);
  const [isConnected, setIsConnected] = useState<boolean>(liveChatEngine.isConnected);
  const [selfUser, setSelfUser] = useState<LiveUser | null>(liveChatEngine.selfUser);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(liveChatEngine.soundEnabled);

  const [inputMessage, setInputMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(selfUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(selfUser?.avatar || '🚀');
  const [editStatus, setEditStatus] = useState(selfUser?.status || '🟢 En línea');
  const [showUserList, setShowUserList] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    liveChatEngine.connect();
    liveChatEngine.fetchHistory();

    const unsubState = liveChatEngine.onStateChange((connected) => {
      setIsConnected(connected);
      setSelfUser(liveChatEngine.selfUser);
    });

    const unsubMessages = liveChatEngine.onMessagesChange((msgs) => {
      setMessages(msgs);
    });

    const unsubPresence = liveChatEngine.onPresenceChange(({ count, users }) => {
      setOnlineCount(count);
      setOnlineUsers(users);
      setSelfUser(liveChatEngine.selfUser);
    });

    const unsubTyping = liveChatEngine.onTypingChange((users) => {
      setTypingUsers(users);
    });

    const unsubProfileError = liveChatEngine.onProfileError((errMsg) => {
      setProfileError(errMsg);
    });

    const unsubProfileUpdated = liveChatEngine.onProfileUpdated(() => {
      setIsEditingProfile(false);
      setProfileError(null);
    });

    return () => {
      unsubState();
      unsubMessages();
      unsubPresence();
      unsubTyping();
      unsubProfileError();
      unsubProfileUpdated();
    };
  }, []);

  useEffect(() => {
    if (selfUser) {
      setEditName(selfUser.name);
      setSelectedAvatar(selfUser.avatar);
      setEditStatus(selfUser.status || '🟢 En línea');
    }
  }, [selfUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    liveChatEngine.notifyTyping();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    liveChatEngine.sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSendReaction = (emoji: string) => {
    liveChatEngine.sendMessage(emoji);
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      setProfileError(null);
      liveChatEngine.updateProfile(editName.trim(), selectedAvatar, editStatus);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await liveChatEngine.fetchHistory();
    if (!isConnected) {
      liveChatEngine.connect();
    }
    setTimeout(() => setIsSyncing(false), 600);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    liveChatEngine.setSoundEnabled(next);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#060813] text-slate-200">
      {/* Top Header */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#0b0f2a] via-[#0e1438] to-[#0b0f2a] border-b border-indigo-950/80 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-amber-400'}`} />
            {isConnected && (
              <span className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-ping" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-amber-400 font-['Space_Grotesk'] flex items-center gap-1 truncate">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Comunidad en Vivo
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {onlineCount} {onlineCount === 1 ? 'conectado' : 'conectados'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <span>{selfUser?.name || 'Tú'}</span>
              <span className="text-indigo-400">•</span>
              <span className="text-slate-300">{selfUser?.status || '🟢 En línea'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Sonido activado' : 'Silenciado'}
            className={`p-1.5 rounded-lg border transition-colors text-xs cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-[#12183b] border-indigo-950 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleManualSync}
            title="Sincronizar chat"
            className="p-1.5 rounded-lg border border-indigo-950 bg-[#12183b] text-slate-300 hover:text-white hover:bg-[#1c2654] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleShareLink}
            title="Invitar a un amigo (copiar enlace)"
            className={`p-1.5 rounded-lg border transition-colors text-xs flex items-center gap-1 cursor-pointer ${
              copiedLink
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-[#12183b] border-indigo-950 text-slate-300 hover:text-white hover:bg-[#1c2654]'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowUserList(!showUserList)}
            title="Ver usuarios conectados"
            className={`p-1.5 rounded-lg border transition-colors text-xs flex items-center gap-1 cursor-pointer ${
              showUserList
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-[#12183b] border-indigo-950 text-slate-300 hover:text-white hover:bg-[#1c2654]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">{onlineCount}</span>
          </button>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            title="Editar mi perfil"
            className={`p-1.5 rounded-lg border transition-colors text-xs flex items-center gap-1 cursor-pointer ${
              isEditingProfile
                ? 'bg-amber-500/30 border-amber-400 text-white'
                : 'bg-[#12183b] border-indigo-950 text-slate-300 hover:text-white hover:bg-[#1c2654]'
            }`}
          >
            <span className="text-sm">{selfUser?.avatar || '🚀'}</span>
            <Edit3 className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {copiedLink && (
        <div className="px-3 py-1.5 bg-emerald-950/90 border-b border-emerald-800 text-[11px] text-emerald-200 text-center font-medium animate-in fade-in">
          ✓ Enlace copiado. Compártelo con quien quieras para que se una a esta sala desde su celular.
        </div>
      )}

      {/* Online Users Roster Drawer */}
      {showUserList && (
        <div className="p-3 bg-[#0a0f2e] border-b border-indigo-950/90 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Usuarios Conectados ({onlineCount})
            </span>
            <button
              onClick={() => setShowUserList(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {onlineUsers.map((u) => {
              const isMe = u.id === selfUser?.id;
              return (
                <div
                  key={u.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs border ${
                    isMe
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 ring-1 ring-amber-500/20'
                      : 'bg-[#11173d] border-indigo-950/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{u.avatar}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold truncate max-w-[140px]">{u.name}</span>
                        {isMe && <span className="text-[9px] px-1 py-0.2 bg-amber-500/30 text-amber-300 rounded font-mono">Tú</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{u.status || '🟢 En línea'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Profile Drawer */}
      {isEditingProfile && (
        <div className="p-3 bg-[#0d1338] border-b border-indigo-950/90 animate-in slide-in-from-top-2 duration-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Personaliza tu Perfil de Chat
            </span>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {profileError && (
            <div className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-[11px] text-rose-200 font-medium">
              ⚠️ {profileError}
            </div>
          )}

          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-medium">Nombre o apodo:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={25}
                placeholder="Ingresa tu apodo..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#060813] border border-indigo-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-medium">Estado:</label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {STATUS_PRESETS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      editStatus === st
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-[#151c42] border-indigo-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Avatar selector */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Avatar:</label>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                    selectedAvatar === av
                      ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-sm shadow-amber-400/30'
                      : 'bg-[#151c3d] border-indigo-950 hover:bg-[#1d2754]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Perfil</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 custom-scrollbar min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Radio className="w-8 h-8 text-amber-400/40 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-slate-300">Sala en vivo conectada</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
              Envía un mensaje o comparte el enlace para chatear con otras personas en tiempo real.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === selfUser?.id;
            const isSys = msg.isSystem || msg.type === 'system';

            if (isSys) {
              return (
                <div
                  key={msg.id}
                  className="py-1.5 px-3 rounded-xl bg-[#0e1438]/80 border border-indigo-950 text-[11px] text-amber-200/90 flex items-start gap-2 shadow-sm"
                >
                  <span className="text-xs shrink-0">{msg.userAvatar}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-amber-300 mr-1">{msg.userName}:</span>
                    <span>{msg.text}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 shrink-0 font-mono mt-0.5">{msg.timestamp}</span>
                </div>
              );
            }

            // Standard chat bubble
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                  <span className="text-xs">{msg.userAvatar}</span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: msg.userColor || '#38bdf8' }}
                  >
                    {isMe ? 'Tú' : msg.userName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-2xl text-xs max-w-[88%] break-words shadow-md ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                      : 'bg-[#12183b] border border-indigo-950/90 text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 py-1 px-2 text-xs text-indigo-300 italic animate-pulse">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
            <span>{typingUsers.join(', ')} está escribiendo...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Reactions */}
      <div className="px-2.5 py-1.5 bg-[#080c24] border-t border-indigo-950/60 flex items-center gap-1 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0 pl-1 pr-1 font-medium">
          <Smile className="w-3 h-3 text-amber-400/70" />
        </span>
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleSendReaction(emoji)}
            className="px-2 py-0.5 rounded-md bg-[#11173b] hover:bg-amber-500/20 text-xs border border-indigo-950 hover:border-amber-500/40 transition-all shrink-0 cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 bg-[#060813] border-t border-indigo-950/80 flex items-center gap-1.5 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Escribe un mensaje en vivo..."
          maxLength={300}
          className="flex-1 px-3 py-2 rounded-xl bg-[#0e1438] border border-indigo-900/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 transition-colors shadow-md shadow-amber-500/10 shrink-0 cursor-pointer"
          title="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
