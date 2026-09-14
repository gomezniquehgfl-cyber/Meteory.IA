/**
 * Servicio de Reconocimiento de Voz en Tiempo Real para Meteory IA
 * Soporta SpeechRecognition / webkitSpeechRecognition en español con gestión de eventos y estados.
 */

import { detectWakeWord, WakeWordMatch } from './wakeWordDetector';

export interface SpeechRecognitionResultPayload {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export type SpeechState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'unsupported';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export class MeteoryVoiceListener {
  private recognition: any = null;
  private isManuallyStopped = false;
  private isRunning = false;
  private lang = 'es-ES';
  private silenceTimer: any = null;
  private silenceDelay = 1300; // ms de silencio antes de auto-enviar en modo manos libres

  public onTranscriptChange: ((transcript: string, isFinal: boolean) => void) | null = null;
  public onSpeechEnd: ((finalTranscript: string) => void) | null = null;
  public onWakeWordDetected: ((match: WakeWordMatch, fullTranscript: string) => void) | null = null;
  public onStateChange: ((state: SpeechState, errorMsg?: string) => void) | null = null;
  public onSoundLevel: ((level: number) => void) | null = null;

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private lastTranscript = '';
  private lastWakeWordTimestamp = 0;

  constructor(lang = 'es-ES') {
    this.lang = lang;
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isRunning = true;
        this.onStateChange?.('listening');
      };

      this.recognition.onresult = (event: any) => {
        // Concatenar todos los fragmentos acumulados en la sesión actual
        let fullTranscript = '';
        let hasFinal = false;

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          fullTranscript += ' ' + text;
          if (res.isFinal) {
            hasFinal = true;
          }
        }

        const currentText = fullTranscript.replace(/\s+/g, ' ').trim();

        if (currentText) {
          this.lastTranscript = currentText;
          this.onTranscriptChange?.(currentText, hasFinal);

          // Verificar si se detecta alguna de las +100 variantes de "Hey Meteory", "Hola Meteory", etc.
          const wakeMatch = detectWakeWord(currentText);
          const now = Date.now();
          if (wakeMatch.detected && now - this.lastWakeWordTimestamp > 2000) {
            this.lastWakeWordTimestamp = now;
            this.onWakeWordDetected?.(wakeMatch, currentText);
          }

          // Reiniciar temporizador de silencio para auto-envío rápido y receptivo
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
          }

          // Si el navegador ya marcó el resultado como final, usar un retardo más breve (650ms)
          const delay = hasFinal ? 650 : this.silenceDelay;

          this.silenceTimer = setTimeout(() => {
            if (this.lastTranscript.trim()) {
              const textToSend = this.lastTranscript.trim();
              this.lastTranscript = '';
              this.onSpeechEnd?.(textToSend);
            }
          }, delay);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition status/warning:', event?.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isManuallyStopped = true;
          this.onStateChange?.('error', 'Permiso de micrófono denegado. Permite el acceso al micrófono en el navegador.');
        } else if (event.error === 'no-speech') {
          // Silencio detectado por el navegador, normal
        } else if (event.error === 'network') {
          this.onStateChange?.('error', 'Error de red en el reconocimiento de voz. Verifica tu conexión.');
        } else if (event.error !== 'aborted') {
          this.onStateChange?.('error', `Aviso de micrófono: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isRunning = false;

        // Si había una transcripción pendiente al momento en que el navegador cerró el stream, procesarla
        if (this.lastTranscript.trim()) {
          const textToSend = this.lastTranscript.trim();
          this.lastTranscript = '';
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
          this.onSpeechEnd?.(textToSend);
        }

        // Si el usuario no presionó pausar/mutear, reanudar escucha con un retardo seguro de 400ms para evitar trabarse
        if (!this.isManuallyStopped) {
          setTimeout(() => {
            if (!this.isManuallyStopped && !this.isRunning) {
              try {
                this.startListening();
              } catch (e) {
                // Silencioso en caso de reintento
              }
            }
          }, 400);
        }
      };
    } catch (err) {
      console.error('Error al inicializar SpeechRecognition:', err);
    }
  }

  /**
   * Inicia la captura de audio y análisis espectral para visualizador reactivo
   */
  public async startAudioVisualizer(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return false;
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));

        this.onSoundLevel?.(normalized);
        this.animFrameId = requestAnimationFrame(updateLevel);
      };

      updateLevel();
      return true;
    } catch (err) {
      console.warn('No se pudo inicializar analizador de audio:', err);
      return false;
    }
  }

  /**
   * Detiene el visualizador de audio
   */
  public stopAudioVisualizer() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.onSoundLevel?.(0);
  }

  /**
   * Comienza a escuchar la voz del usuario
   */
  public startListening() {
    this.isManuallyStopped = false;
    this.lastTranscript = '';

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      this.onStateChange?.('unsupported', 'El navegador no soporta Speech Recognition nativo.');
      return;
    }

    if (this.isRunning) {
      return;
    }

    try {
      this.recognition.start();
      this.isRunning = true;
    } catch (e: any) {
      // Ignorar si ya estaba activo (InvalidStateError)
      if (e?.name !== 'InvalidStateError') {
        console.warn('Aviso iniciando SpeechRecognition:', e);
      }
    }
  }

  /**
   * Pausa o detiene la escucha inmediatamente
   */
  public stopListening() {
    this.isManuallyStopped = true;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        try {
          this.recognition.stop();
        } catch {}
      }
    }
    this.isRunning = false;
  }

  /**
   * Fuerza el envío inmediato del texto acumulado
   */
  public flushTranscript(): string {
    const text = this.lastTranscript.trim();
    this.lastTranscript = '';
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    return text;
  }

  public destroy() {
    this.isManuallyStopped = true;
    this.stopListening();
    this.stopAudioVisualizer();
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.onstart = null;
        this.recognition.onspeechstart = null;
        this.recognition.onspeechend = null;
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    this.onTranscriptChange = null;
    this.onSpeechEnd = null;
    this.onStateChange = null;
    this.onSoundLevel = null;
    this.onWakeWordDetected = null;
  }
}
