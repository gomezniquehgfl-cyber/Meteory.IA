import { LiveChatMessage, LiveUser } from '../types';
import { getApiUrl } from '../lib/apiConfig';

type Listener<T> = (data: T) => void;

class LiveChatEngine {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private pollInterval: any = null;
  private isConnecting = false;
  private shouldReconnect = true;
  private typingTimeout: any = null;

  public isConnected = false;
  public onlineCount = 0;
  public onlineUsers: LiveUser[] = [];
  public messages: LiveChatMessage[] = [];
  public selfUser: LiveUser | null = null;
  public typingUsers: Map<string, string> = new Map(); // userId -> userName
  public soundEnabled = true;

  private listeners: {
    stateChange: Set<Listener<boolean>>;
    messagesChange: Set<Listener<LiveChatMessage[]>>;
    presenceChange: Set<Listener<{ count: number; users: LiveUser[] }>>;
    typingChange: Set<Listener<string[]>>;
    userJoined: Set<Listener<LiveUser>>;
    userLeft: Set<Listener<LiveUser | undefined>>;
    profileError: Set<Listener<string>>;
    profileUpdated: Set<Listener<LiveUser>>;
  } = {
    stateChange: new Set(),
    messagesChange: new Set(),
    presenceChange: new Set(),
    typingChange: new Set(),
    userJoined: new Set(),
    userLeft: new Set(),
    profileError: new Set(),
    profileUpdated: new Set(),
  };

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('meteory_live_user_profile');
        if (saved) {
          this.selfUser = JSON.parse(saved);
        }
        const savedSound = localStorage.getItem('meteory_chat_sound_enabled');
        if (savedSound !== null) {
          this.soundEnabled = savedSound === 'true';
        }
      } catch {
        // Ignore
      }

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.fetchHistory();
          if (!this.isConnected) {
            this.connect();
          }
        }
      });

      window.addEventListener('online', () => {
        this.fetchHistory();
        this.connect();
      });

      this.fetchHistory();

      this.pollInterval = setInterval(() => {
        this.fetchHistory();
      }, 3500);
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('meteory_chat_sound_enabled', String(enabled));
    } catch {
      // Ignore
    }
  }

  // Sintetizador de audio Web Audio para notificaciones del chat en vivo
  public playSound(type: 'message' | 'join' = 'message') {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'message') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'join') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    } catch {
      // Ignore audio context errors if browser blocks autoplay before user gesture
    }
  }

  public async fetchHistory() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch(getApiUrl('/api/live-chat/messages'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          this.mergeMessages(data.messages, false);
        }
        if (typeof data.onlineUsersCount === 'number' && !this.isConnected) {
          this.onlineCount = Math.max(1, data.onlineUsersCount);
          if (Array.isArray(data.onlineUsers)) {
            this.onlineUsers = data.onlineUsers;
          }
          this.emitPresence();
        }
      }
    } catch {
      // Ignore
    }
  }

  private mergeMessages(newMessages: LiveChatMessage[], triggerSound = true) {
    if (!newMessages || newMessages.length === 0) return;
    const existingMap = new Map<string, LiveChatMessage>();
    this.messages.forEach((m) => existingMap.set(m.id, m));

    let hasNew = false;
    let newestType: string | undefined = 'chat';

    newMessages.forEach((m) => {
      if (!existingMap.has(m.id)) {
        existingMap.set(m.id, m);
        hasNew = true;
        newestType = m.type || 'chat';
      }
    });

    if (hasNew) {
      this.messages = Array.from(existingMap.values()).slice(-250);
      this.emitMessages();

      if (triggerSound) {
        this.playSound('message');
      }
    }
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/live-chat`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.emitState();

        if (this.selfUser) {
          this.ws?.send(
            JSON.stringify({
              type: 'update_profile',
              name: this.selfUser.name,
              avatar: this.selfUser.avatar,
              status: this.selfUser.status || '🟢 En línea',
            })
          );
        }

        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'init') {
            if (!this.selfUser || !this.selfUser.id) {
              this.selfUser = data.self;
            }
            this.onlineUsers = data.onlineUsers || [];
            this.onlineCount = data.onlineCount || 1;
            if (Array.isArray(data.messages)) {
              this.mergeMessages(data.messages, false);
            }
            this.emitPresence();
          } else if (data.type === 'presence') {
            this.onlineCount = data.onlineCount ?? this.onlineUsers.length;
            this.onlineUsers = data.onlineUsers || [];
            this.emitPresence();

            if (data.userJoined) {
              this.playSound('join');
              this.listeners.userJoined.forEach((cb) => cb(data.userJoined));
            }
            if (data.userLeft) {
              this.listeners.userLeft.forEach((cb) => cb(data.userLeft));
            }
          } else if (data.type === 'message') {
            if (data.message) {
              this.mergeMessages([data.message], true);
            }
          } else if (data.type === 'typing_update') {
            if (data.userId && data.userId !== this.selfUser?.id) {
              if (data.isTyping) {
                this.typingUsers.set(data.userId, data.userName || 'Jugador');
              } else {
                this.typingUsers.delete(data.userId);
              }
              this.emitTyping();
            }
          } else if (data.type === 'profile_updated') {
            if (data.self) {
              this.selfUser = data.self;
              try {
                localStorage.setItem('meteory_live_user_profile', JSON.stringify(data.self));
              } catch {
                // Ignore
              }
              this.emitState();
              this.listeners.profileUpdated.forEach((cb) => cb(data.self));
            }
          } else if (data.type === 'profile_error') {
            if (data.error) {
              this.listeners.profileError.forEach((cb) => cb(data.error));
            }
          }
        } catch (e) {
          console.error('Error parseando mensaje WS en LiveChatEngine:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.emitState();

        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }

        if (this.shouldReconnect) {
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, 3000);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.emitState();
      };
    } catch (e) {
      console.error('Error al instanciar WebSocket en LiveChatEngine:', e);
      this.isConnecting = false;
      this.isConnected = false;
      this.emitState();
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.emitState();
  }

  public sendTyping(isTyping: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'typing',
          isTyping,
        })
      );
    }
  }

  public notifyTyping() {
    this.sendTyping(true);
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.sendTyping(false);
    }, 2500);
  }

  public async sendMessage(text: string) {
    const cleanText = text.trim();
    if (!cleanText) return;

    this.sendTyping(false);

    const user = this.selfUser || {
      id: `user-${Date.now()}`,
      name: 'Viajero Cósmico',
      avatar: '🚀',
      color: '#f59e0b',
      joinedAt: Date.now(),
      status: '🟢 En línea',
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'chat_message',
          text: cleanText,
        })
      );
    } else {
      try {
        const res = await fetch(getApiUrl('/api/live-chat/send'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            userColor: user.color,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.message) {
            this.mergeMessages([resData.message], true);
          }
        }
      } catch (err) {
        console.error('Error enviando mensaje por API fallback:', err);
      }
      this.connect();
    }
  }

  public updateProfile(name: string, avatar: string, status?: string) {
    if (!name.trim()) return;
    if (this.selfUser) {
      this.selfUser = {
        ...this.selfUser,
        name: name.trim(),
        avatar: avatar || this.selfUser.avatar,
        status: status || this.selfUser.status || '🟢 En línea',
      };
      try {
        localStorage.setItem('meteory_live_user_profile', JSON.stringify(this.selfUser));
      } catch {
        // Ignore
      }
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'update_profile',
          name: name.trim(),
          avatar,
          status: status || this.selfUser?.status || '🟢 En línea',
        })
      );
    }
  }

  // Listeners
  public onStateChange(cb: Listener<boolean>) {
    this.listeners.stateChange.add(cb);
    return () => this.listeners.stateChange.delete(cb);
  }

  public onMessagesChange(cb: Listener<LiveChatMessage[]>) {
    this.listeners.messagesChange.add(cb);
    return () => this.listeners.messagesChange.delete(cb);
  }

  public onPresenceChange(cb: Listener<{ count: number; users: LiveUser[] }>) {
    this.listeners.presenceChange.add(cb);
    return () => this.listeners.presenceChange.delete(cb);
  }

  public onTypingChange(cb: Listener<string[]>) {
    this.listeners.typingChange.add(cb);
    return () => this.listeners.typingChange.delete(cb);
  }

  public onUserJoined(cb: Listener<LiveUser>) {
    this.listeners.userJoined.add(cb);
    return () => this.listeners.userJoined.delete(cb);
  }

  public onUserLeft(cb: Listener<LiveUser | undefined>) {
    this.listeners.userLeft.add(cb);
    return () => this.listeners.userLeft.delete(cb);
  }

  public onProfileError(cb: Listener<string>) {
    this.listeners.profileError.add(cb);
    return () => this.listeners.profileError.delete(cb);
  }

  public onProfileUpdated(cb: Listener<LiveUser>) {
    this.listeners.profileUpdated.add(cb);
    return () => this.listeners.profileUpdated.delete(cb);
  }

  private emitState() {
    this.listeners.stateChange.forEach((cb) => cb(this.isConnected));
  }

  private emitMessages() {
    this.listeners.messagesChange.forEach((cb) => cb([...this.messages]));
  }

  private emitPresence() {
    this.listeners.presenceChange.forEach((cb) =>
      cb({ count: this.onlineCount, users: [...this.onlineUsers] })
    );
  }

  private emitTyping() {
    const list = Array.from(this.typingUsers.values());
    this.listeners.typingChange.forEach((cb) => cb(list));
  }
}

export const liveChatEngine = new LiveChatEngine();
