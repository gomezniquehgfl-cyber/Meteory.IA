import { getApiUrl } from '../lib/apiConfig';

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
 * Síntesis de voz nativa del sistema (Google TTS / Web Speech API) como respaldo infalible
 */
export function speakNativeSpeechSynthesis(
  text: string,
  gender: VoiceGender,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    notifyAudioStatus(false);
    onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = gender === 'female' ? 1.15 : 0.9;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter((v) => v.lang.startsWith('es'));

    if (spanishVoices.length > 0) {
      const preferredVoice = spanishVoices.find((v) => {
        const name = v.name.toLowerCase();
        if (gender === 'female') {
          return (
            name.includes('female') ||
            name.includes('femenin') ||
            name.includes('google español') ||
            name.includes('sabina') ||
            name.includes('monica') ||
            name.includes('lucia') ||
            name.includes('paulina') ||
            name.includes('helena')
          );
        } else {
          return (
            name.includes('male') ||
            name.includes('masculin') ||
            name.includes('jorge') ||
            name.includes('pablo') ||
            name.includes('diego') ||
            name.includes('carlos') ||
            name.includes('raul')
          );
        }
      }) || spanishVoices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onend = () => {
      currentAudioElement = null;
      notifyAudioStatus(false);
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Error en síntesis nativa:', e);
      currentAudioElement = null;
      notifyAudioStatus(false);
      onEnd?.();
    };

    notifyAudioStatus(true, text.slice(0, 45));
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Excepción en síntesis nativa de voz:', err);
    notifyAudioStatus(false);
    onEnd?.();
    return false;
  }
}

/**
 * Reproduce texto con XTTS v2 (Neural HD ultra-realista en español) y respaldo nativo automático.
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

  // 1. Intentar motor neuronal XTTS v2 en servidor descargando como Blob y reproduciendo localmente (Evita 100% de CORS/bloqueos en WebView Android)
  try {
    const streamUrl = getApiUrl(`/api/tts/stream?text=${encodeURIComponent(cleaned)}&gender=${gender}`);
    const response = await fetch(streamUrl);
    if (!response.ok) {
      throw new Error(`Servidor de síntesis respondió con código: ${response.status}`);
    }
    const blob = await response.blob();
    const localUrl = URL.createObjectURL(blob);

    const audio = new Audio(localUrl);
    currentAudioElement = audio;

    audio.onended = () => {
      URL.revokeObjectURL(localUrl);
      if (currentAudioElement === audio) {
        currentAudioElement = null;
        notifyAudioStatus(false);
        onEnd?.();
      }
    };

    audio.onerror = (e) => {
      console.warn('Error al reproducir audio XTTS v2 (Blob local), activando respaldo nativo:', e);
      URL.revokeObjectURL(localUrl);
      if (currentAudioElement === audio) {
        currentAudioElement = null;
      }
      speakNativeSpeechSynthesis(cleaned, gender, onEnd);
    };

    await audio.play();
    return true;
  } catch (err) {
    console.warn('Fallo al descargar/reproducir XTTS v2, activando respaldo nativo:', err);
  }

  // 2. Respaldo nativo de voz de dispositivo (Google TTS / WebSpeech) si falla la API
  return speakNativeSpeechSynthesis(cleaned, gender, onEnd);
}
