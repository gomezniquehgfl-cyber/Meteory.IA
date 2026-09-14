import React, { useState, useEffect } from 'react';
import { ChatSession } from '../types';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Sparkles,
  Search,
  Zap,
} from 'lucide-react';
import { LiveCommunityChat } from './LiveCommunityChat';
import { liveChatEngine } from '../engine/liveChatEngine';

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAllSessions?: () => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  isOpen,
  onClose,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
}) => {
  const [sidebarTab, setSidebarTab] = useState<'sessions' | 'live_chat'>('sessions');
  const [liveOnlineCount, setLiveOnlineCount] = useState(liveChatEngine.onlineCount);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    liveChatEngine.connect();
    const unsub = liveChatEngine.onPresenceChange(({ count }) => {
      setLiveOnlineCount(count);
    });
    return unsub;
  }, []);

  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handlePromptDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEditingId(null);
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSession(id);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop para móviles */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Panel lateral */}
      <aside
        id="sessions-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] md:w-80 bg-[#070914]/98 backdrop-blur-xl border-r border-indigo-950/80 flex flex-col transition-all duration-300 ease-in-out pt-[max(0.6rem,env(safe-area-inset-top))] pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${!isOpen ? 'md:hidden' : 'md:flex'}`}
      >
        {/* Encabezado con selector de Pestañas: Sesiones IA vs Chat en Vivo */}
        <div className="p-2.5 sm:p-3 border-b border-indigo-950/80 bg-[#0a0e26] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-100 font-['Space_Grotesk'] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Espacio Meteory</span>
            </span>

            <button
              id="close-sidebar-mobile-btn"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#151c3d] md:hidden transition-colors cursor-pointer"
              title="Cerrar panel lateral"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center p-1 rounded-xl bg-[#070914] border border-indigo-950/90 gap-1">
            <button
              onClick={() => setSidebarTab('sessions')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'sessions'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12183b]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Sesiones</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#151c3d] text-slate-300 font-mono">
                {sessions.length}
              </span>
            </button>

            <button
              onClick={() => setSidebarTab('live_chat')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                sidebarTab === 'live_chat'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12183b]'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>En Vivo</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono">
                {liveOnlineCount}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Sesiones IA */}
        {sidebarTab === 'sessions' ? (
          <>
            {/* Botón de Nueva Conversación */}
            <div className="p-3 space-y-2 shrink-0">
              <button
                id="new-chat-btn"
                onClick={() => {
                  onCreateSession();
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10 active:scale-98 group cursor-pointer"
              >
                <Plus className="w-4 h-4 group-hover:scale-125 transition-transform text-amber-400" />
                <span className="font-['Space_Grotesk'] tracking-wide">Nueva Conversación</span>
              </button>

              {/* Buscador de sesiones */}
              {sessions.length > 2 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar en el historial..."
                    className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-[#0b0f29] border border-indigo-950/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Lista de Sesiones */}
            <div className="flex-1 overflow-y-auto px-2.5 space-y-1 custom-scrollbar min-h-0">
              {filteredSessions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                  <p className="text-xs">No se encontraron sesiones</p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const isEditing = editingId === session.id;
                  const isDeleting = confirmDeleteId === session.id;
                  const messageCount = session.messages ? session.messages.length : 0;

                  return (
                    <div
                      key={session.id}
                      onClick={() => !isEditing && onSelectSession(session.id)}
                      className={`group relative rounded-xl p-2.5 transition-all text-xs border cursor-pointer ${
                        isActive
                          ? 'bg-[#151c42] border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/20'
                          : 'bg-[#090d24]/60 hover:bg-[#11173b] border-indigo-950/60 text-slate-300 hover:text-slate-100 hover:border-indigo-900/60'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(e as any, session.id);
                              if (e.key === 'Escape') handleCancelRename(e as any);
                            }}
                            autoFocus
                            className="flex-1 px-2 py-1 rounded bg-[#070914] border border-amber-500/60 text-white text-xs focus:outline-none"
                          />
                          <button
                            onClick={(e) => handleSaveRename(e, session.id)}
                            className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer"
                            title="Guardar nombre"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : isDeleting ? (
                        <div
                          className="flex items-center justify-between gap-1 p-1 bg-rose-950/80 rounded-lg border border-rose-800/80 animate-in fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[11px] text-rose-200 font-semibold truncate">
                            ¿Eliminar chat?
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => handleConfirmDelete(e, session.id)}
                              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Sí
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {isActive ? (
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                              ) : (
                                <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                              <span className="font-semibold truncate block text-slate-100">
                                {session.title}
                              </span>
                            </div>

                            {session.topicPreview && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5 pl-5">
                                {session.topicPreview}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1 pl-5 text-[10px] text-slate-400">
                              <span>
                                {new Date(session.updatedAt || session.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span>•</span>
                              <span>
                                {messageCount === 0 ? 'Limpio' : `${messageCount} msgs`}
                              </span>
                            </div>
                          </div>

                          {/* Botones de acción al hover */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => handleStartRename(e, session)}
                              className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-[#1c2552] transition-colors cursor-pointer"
                              title="Renombrar sesión"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handlePromptDelete(e, session.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Eliminar sesión"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Live Bar at Bottom */}
            <div className="p-2.5 mx-2.5 my-1.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-emerald-200 truncate">
                    {liveOnlineCount} {liveOnlineCount === 1 ? 'persona activa' : 'personas activas'}
                  </p>
                  <p className="text-[10px] text-emerald-400/80 truncate">Comunidad en tiempo real</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarTab('live_chat')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                Abrir Chat
              </button>
            </div>

            {/* Footer del Historial */}
            <div className="p-3 border-t border-indigo-950/80 bg-[#070914]/95 space-y-2 shrink-0">
              {onClearAllSessions && sessions.length > 1 && (
                <div>
                  {isConfirmingClearAll ? (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 space-y-2 animate-in fade-in">
                      <span className="text-xs text-rose-200 block font-semibold">
                        ¿Eliminar todo el historial ({sessions.length} chats)?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onClearAllSessions();
                            setIsConfirmingClearAll(false);
                          }}
                          className="flex-1 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Sí, vaciar todo
                        </button>
                        <button
                          onClick={() => setIsConfirmingClearAll(false)}
                          className="py-1 px-2.5 rounded-lg bg-[#151c3d] hover:bg-[#1d2754] text-slate-300 text-[11px] transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsConfirmingClearAll(true)}
                      className="w-full py-2 px-2.5 rounded-xl border border-indigo-950 hover:border-rose-900/50 text-slate-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Vaciar todas las conversaciones</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                <span className="flex items-center gap-1.5 font-medium font-['Space_Grotesk']">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Guardado local
                </span>
                <span className="text-[10px] text-slate-500 font-mono">100% Autónomo</span>
              </div>
            </div>
          </>
        ) : (
          /* Tab 2: Chat en Vivo Global */
          <div className="flex-1 min-h-0 flex flex-col">
            <LiveCommunityChat />
          </div>
        )}
      </aside>
    </>
  );
};
