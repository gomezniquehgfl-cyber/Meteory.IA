// Configuración centralizada de endpoints de API para entorno Web y APK Android nativo

export const PRODUCTION_SERVER_URL = 'https://ais-pre-stapgrrgwuhuf7h6fqw7ho-169813259851.us-east1.run.app';

/**
 * Resuelve la URL del endpoint para funcionar tanto en la web como en el APK standalone.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Si la app está ejecutándose dentro del APK nativo (appassets.androidplatform.net o file://)
    if (origin.includes('androidplatform.net') || origin.startsWith('file:') || origin === 'null') {
      return `${PRODUCTION_SERVER_URL}${cleanPath}`;
    }
  }
  return cleanPath;
}

/**
 * Resuelve la URL del WebSocket para funcionar tanto en la web como en el APK standalone.
 */
export function getWsUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Si la app está ejecutándose dentro del APK nativo (appassets.androidplatform.net o file://)
    if (origin.includes('androidplatform.net') || origin.startsWith('file:') || origin === 'null') {
      const wsBase = PRODUCTION_SERVER_URL.replace(/^http/, 'ws');
      return `${wsBase}${cleanPath}`;
    }
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}${cleanPath}`;
}
