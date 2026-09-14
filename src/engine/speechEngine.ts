export type VoiceGender = 'female' | 'male';

export interface TTSOptions {
  gender: VoiceGender;
  voiceKey?: string;
}

const VOICE_GENDER_STORAGE_KEY = 'meteory_tts_gender_v2';
const VOICE_ENGINE_NAME = 'XTTS v2 — La opción #1 para voces realistas en español';

export function getVoiceEngineName(): string {
  return VOICE_ENGINE_NAME;
}

export function getSavedVoiceGender(): VoiceGender {
  try {
    const saved = localStorage.getItem(VOICE_GENDER_STORAGE_KEY);
    if (saved === 'female' || saved === 'male') {
      return saved;
    }
  } catch (err) {
    console.error('Error leyendo género de voz:', err);
  }
  return 'female'; // Voz femenina por defecto
}

export function saveVoiceGender(gender: VoiceGender): void {
  try {
    localStorage.setItem(VOICE_GENDER_STORAGE_KEY, gender);
  } catch (err) {
    console.error('Error guardando género de voz:', err);
  }
}

/**
 * Limpia el texto de código, markdown excesivo, símbolos y emojis para dicción humana fluida
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Remover bloques de código markdown
    .replace(/```[\s\S]*?```/g, ' Fragmento de código omitido. ')
    // Remover enlaces markdown [texto](url)
    .replace(/\[(.*?)\]\(https?:\/\/[^\s)]+\)/g, '$1')
    // Remover URLs directas
    .replace(/https?:\/\/[^\s)]+/g, '')
    // Remover símbolos comunes de markdown (*, _, #, `, >, ~)
    .replace(/[*_#`>~•|]/g, ' ')
    // Remover emojis para que el motor no lea nombres de símbolos extraños
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // Normalizar espacios en blanco
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 800);
}

// Control del elemento de Audio HTML5 global
let currentAudioElement: HTMLAudioElement | null = null;
let isAudioPlaying = false;
const audioListeners: Array<(isPlaying: boolean, textSnippet?: string) => void> = [];

export function subscribeAudioStatus(listener: (isPlaying: boolean, textSnippet?: string) => void): () => void {
  audioListeners.push(listener);
  listener(isAudioPlaying);
  return () => {
    const index = audioListeners.indexOf(listener);
    if (index > -1) {
      audioListeners.splice(index, 1);
    }
  };
}

function notifyAudioStatus(playing: boolean, snippet?: string) {
  isAudioPlaying = playing;
  audioListeners.forEach((fn) => {
    try {
      fn(playing, snippet);
    } catch (e) {
      console.error('Error in audio listener:', e);
    }
  });
}

export function isCurrentlySpeaking(): boolean {
  return isAudioPlaying;
}

/**
 * Detiene inmediatamente cualquier audio en reproducción
 */
export function stopSpeaking(): void {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.src = '';
    } catch (err) {
      // Ignorar errores al pausar
    }
    currentAudioElement = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  notifyAudioStatus(false);
}

/**
 * Reproduce texto exclusivamente con XTTS v2 (Neural HD ultra-realista en español).
 * Sin voces robóticas ni fallbacks sintéticos del navegador.
 */
export async function speakTextWithGender(
  text: string,
  gender: VoiceGender,
  onEnd?: () => void
): Promise<boolean> {
  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return false;

  notifyAudioStatus(true, cleaned.slice(0, 45));

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleaned,
        gender,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        currentAudioElement = audio;

        audio.onended = () => {
          if (currentAudioElement === audio) {
            currentAudioElement = null;
            notifyAudioStatus(false);
            onEnd?.();
          }
        };

        audio.onerror = (e) => {
          console.warn('Error al reproducir audio XTTS v2:', e);
          if (currentAudioElement === audio) {
            currentAudioElement = null;
            notifyAudioStatus(false);
            onEnd?.();
          }
        };

        await audio.play();
        return true;
      }
    }
  } catch (err) {
    console.warn('Fallo en la llamada XTTS v2 /api/tts:', err);
  }

  notifyAudioStatus(false);
  onEnd?.();
  return false;
}
