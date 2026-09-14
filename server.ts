import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { EdgeTTS } from '@andresaya/edge-tts';
import { WebSocketServer, WebSocket } from 'ws';

interface LiveUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  joinedAt: number;
  level?: number;
  rankTitle?: string;
  status?: string;
  isTyping?: boolean;
  score?: number;
}

interface LiveChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  type?: 'chat' | 'dice' | 'coin' | 'trivia' | 'action' | 'system';
  badge?: string;
  extraData?: {
    diceRoll?: number;
    coinResult?: 'cara' | 'cruz';
    triviaQuestion?: string;
    triviaAnswer?: string;
    triviaOptions?: string[];
  };
}

interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
  domain?: string;
  imageUrl?: string;
  engine?: string;
}

// Limpiar etiquetas HTML y entidades de texto
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extraer el nombre de dominio legible de una URL
function getDomainName(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Mapeo amigable de dominios populares a nombres reconocidos
function formatSourceTitle(domain: string, fallback?: string): string {
  if (!domain) return fallback || 'Sitio Web';
  const domainLower = domain.toLowerCase();
  const map: Record<string, string> = {
    'es.wikipedia.org': 'Wikipedia en Español',
    'en.wikipedia.org': 'Wikipedia Internacional',
    'ciencia.nasa.gov': 'NASA Ciencia',
    'nasa.gov': 'NASA',
    'elpais.com': 'El País',
    'bbc.com': 'BBC News',
    'cnnespanol.cnn.com': 'CNN en Español',
    'cnn.com': 'CNN',
    'nationalgeographic.com.es': 'National Geographic',
    'nationalgeographicla.com': 'National Geographic LA',
    'xataka.com': 'Xataka',
    'genbeta.com': 'Genbeta',
    'marca.com': 'Diario MARCA',
    'as.com': 'Diario AS',
    'elmundo.es': 'El Mundo',
    'infobae.com': 'Infobae',
    'forbes.com': 'Forbes',
    'es.wired.com': 'WIRED en Español',
    'wired.com': 'WIRED',
    'github.com': 'GitHub',
    'stackoverflow.com': 'Stack Overflow',
    'ibm.com': 'IBM',
    'microsoft.com': 'Microsoft',
    'tableau.com': 'Tableau',
    'reuters.com': 'Reuters',
    'lavanguardia.com': 'La Vanguardia',
    'rtve.es': 'RTVE',
    'muyinteresante.com': 'Muy Interesante',
    'nature.com': 'Nature',
  };

  if (map[domainLower]) return map[domainLower];
  const parts = domainLower.split('.')[0].replace(/[-_]/g, ' ');
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

// 1. Motor de Búsqueda Web Global Multidominio (DuckDuckGo Web Index)
async function searchGlobalWeb(query: string): Promise<SearchResultItem[]> {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(3800),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const bodies = html.split(/class="[^"]*result__body[^"]*"/);
    const list: SearchResultItem[] = [];

    for (let i = 1; i < bodies.length; i++) {
      const b = bodies[i];
      const titleMatch = b.match(/<h2[^>]*class="[^"]*result__title[^"]*"[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = b.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/);

      if (titleMatch) {
        let rawUrl = titleMatch[1];
        let realUrl = rawUrl;
        const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
        if (uddgMatch) {
          realUrl = decodeURIComponent(uddgMatch[1]);
        }

        if (realUrl.startsWith('http') && !realUrl.includes('duckduckgo.com')) {
          const title = stripHtml(titleMatch[2]);
          const snippet = snippetMatch ? stripHtml(snippetMatch[1]) : '';
          const domain = getDomainName(realUrl);
          const source = formatSourceTitle(domain, domain);

          list.push({
            title,
            snippet: snippet || `Página web de ${source} con información sobre ${query}.`,
            url: realUrl,
            domain,
            source,
            engine: 'Índice Web Global',
          });
        }
      }
    }
    return list;
  } catch (err) {
    return [];
  }
}

// 2. Motor de Cobertura en Vivo de Google Noticias (Artículos de prensa y actualidad)
async function searchGoogleNews(query: string): Promise<SearchResultItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es&gl=ES&ceid=ES:es`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MeteoryAI-Bot/1.0' },
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const items = xml.split('<item>');
    const list: SearchResultItem[] = [];

    for (let i = 1; i < Math.min(items.length, 6); i++) {
      const item = items[i];
      const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
      const sourceMatch = item.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
      let link = linkMatch ? linkMatch[1] : '';
      let publisher = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : 'Google Noticias';

      if (title && link) {
        title = stripHtml(title);
        list.push({
          title,
          snippet: `Reporte y cobertura periodística en tiempo real publicado por ${publisher}.`,
          url: link,
          domain: publisher,
          source: `${publisher} (Google Noticias)`,
          engine: 'Google Noticias',
        });
      }
    }
    return list;
  } catch (err) {
    return [];
  }
}

// 3. Pool de Instancias Públicas de SearXNG (Meta-buscador descentralizado)
async function searchSearXNGPool(query: string): Promise<SearchResultItem[]> {
  const instances = [
    'https://searx.dresden.network/search',
    'https://baresearch.org/search',
    'https://search.mdosch.de/search',
    'https://searx.be/search',
  ];

  for (const inst of instances) {
    try {
      const res = await fetch(`${inst}?q=${encodeURIComponent(query)}&format=json&language=es`, {
        headers: { 'User-Agent': 'MeteoryAI-Bot/1.0' },
        signal: AbortSignal.timeout(1800),
      });

      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('json')) {
        const data = await res.json();
        if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
          return data.results.slice(0, 4).map((r: any) => {
            const domain = getDomainName(r.url || '');
            return {
              title: stripHtml(r.title || ''),
              snippet: stripHtml(r.content || ''),
              url: r.url,
              domain,
              source: formatSourceTitle(domain, r.engine || 'SearXNG Web'),
              engine: `SearXNG (${r.engine || 'Meta-Search'})`,
            };
          });
        }
      }
    } catch {
      // Probar siguiente instancia rápidamente
    }
  }
  return [];
}

// 4. Referencia de Consulta Enciclopédica (Wikipedia en Español con extracto completo en texto plano)
async function searchWikipediaReference(query: string): Promise<SearchResultItem[]> {
  try {
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&origin=*&utf8=1`;

    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'MeteoryAI-Bot/1.0' },
      signal: AbortSignal.timeout(2800),
    });

    if (!res.ok) return [];
    const data = await res.json();

    if (data?.query?.search && Array.isArray(data.query.search) && data.query.search.length > 0) {
      const topItem = data.query.search[0];
      const articleTitle = topItem.title;
      const articleUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(articleTitle.replace(/ /g, '_'))}`;

      // Intentar obtener el extracto introductorio completo en texto plano
      try {
        const extractUrl = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(
          articleTitle
        )}&format=json&origin=*&utf8=1`;

        const extRes = await fetch(extractUrl, {
          headers: { 'User-Agent': 'MeteoryAI-Bot/1.0' },
          signal: AbortSignal.timeout(2200),
        });

        if (extRes.ok) {
          const extData = await extRes.json();
          const pages = extData?.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            const fullExtract = pages[pageId]?.extract;
            if (fullExtract && fullExtract.length > 30) {
              return [
                {
                  title: articleTitle,
                  snippet: fullExtract.slice(0, 380).trim(),
                  url: articleUrl,
                  domain: 'es.wikipedia.org',
                  source: 'Wikipedia en Español',
                  engine: 'Enciclopedia Abierta',
                },
              ];
            }
          }
        }
      } catch {
        // En caso de timeout en el extracto, usar el snippet estándar limpio
      }

      const cleanSnippet = stripHtml(topItem.snippet);
      return [
        {
          title: articleTitle,
          snippet: cleanSnippet.endsWith('.') ? cleanSnippet : `${cleanSnippet}...`,
          url: articleUrl,
          domain: 'es.wikipedia.org',
          source: 'Wikipedia en Español',
          engine: 'Enciclopedia Abierta',
        },
      ];
    }
    return [];
  } catch {
    return [];
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Endpoint de salud
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'Meteory IA', time: new Date().toISOString() });
  });

  // Endpoint de Búsqueda Web en tiempo real Multifuente (Google Noticias, Índice Web Global, SearXNG, Enciclopedia)
  app.get('/api/search', async (req, res) => {
    const startTime = Date.now();
    const query = (req.query.q as string || '').trim();

    if (!query) {
      return res.status(400).json({ error: 'Parámetro de búsqueda "q" es requerido.' });
    }

    try {
      // Ejecutar en paralelo los motores de búsqueda autónomos
      const [globalWebResults, googleNewsResults, searxResults, wikiResults] = await Promise.all([
        searchGlobalWeb(query),
        searchGoogleNews(query),
        searchSearXNGPool(query),
        searchWikipediaReference(query),
      ]);

      // Deduplicar e intercalar fuentes para máxima variedad de páginas de internet
      const results: SearchResultItem[] = [];
      const seenUrls = new Set<string>();
      const seenTitles = new Set<string>();

      function addResult(item: SearchResultItem) {
        if (!item || !item.url) return;
        const normUrl = item.url.replace(/\/$/, '').toLowerCase();
        const normTitle = item.title.toLowerCase().slice(0, 30);
        if (seenUrls.has(normUrl) || seenTitles.has(normTitle)) return;
        seenUrls.add(normUrl);
        seenTitles.add(normTitle);
        results.push(item);
      }

      // Si es una pregunta explicativa o temática y hay resultado enciclopédico de alta calidad en español, agregarlo de primero
      const isConceptQuery = /^(que es|quien es|como funciona|origen|fotosintesis|historia|significado|definicion)/i.test(query) || wikiResults.length > 0;
      if (isConceptQuery && wikiResults.length > 0) {
        addResult(wikiResults[0]);
      }

      // 1. Intercalar resultados de la web abierta y noticias de Google
      const maxInterleave = Math.max(
        globalWebResults.length,
        googleNewsResults.length,
        searxResults.length
      );

      for (let i = 0; i < maxInterleave; i++) {
        if (i < globalWebResults.length) addResult(globalWebResults[i]);
        if (i < googleNewsResults.length) addResult(googleNewsResults[i]);
        if (i < searxResults.length) addResult(searxResults[i]);
      }

      // 2. Si no se agregó antes, asegurar agregar la referencia
      if (wikiResults.length > 0) {
        addResult(wikiResults[0]);
      }

      // 3. Agregar los restantes si faltan resultados
      for (const item of [...globalWebResults, ...googleNewsResults, ...searxResults, ...wikiResults]) {
        if (results.length >= 8) break;
        addResult(item);
      }

      // Extraer lista de fuentes y motores utilizados
      const uniqueSources = [...new Set(results.map((r) => r.source))];
      const enginesUsed = [...new Set(results.map((r) => r.engine || 'Web Abierta'))];

      const executionTimeMs = Date.now() - startTime;

      res.json({
        query,
        results: results.slice(0, 8),
        totalResults: results.length,
        executionTimeMs,
        sourceProvider: `Búsqueda Multi-Fuente Web (${uniqueSources.slice(0, 4).join(', ')})`,
        sourcesList: uniqueSources,
        enginesUsed,
        searchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } catch (error) {
      console.error('Error en búsqueda web multifuente:', error);
      res.status(500).json({
        error: 'No se pudo completar la búsqueda en tiempo real.',
        query,
        results: [],
      });
    }
  });

  // Limpieza de texto para TTS ultra-realista sin artefactos
  function cleanTextForTTS(text: string): string {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, ' Fragmento de código. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[(.*?)\]\(https?:\/\/[^\s)]+\)/g, '$1')
      .replace(/https?:\/\/[^\s)]+/g, '')
      .replace(/[*_#~>•|]/g, ' ')
      // Remover emojis para que no se pronuncien sus nombres y el discurso fluya natural
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 750);
  }

  // Voces neurales hiperrealistas en español (XTTS v2 / Neural HD)
  const NEURAL_VOICES = {
    female_spain: 'es-ES-ElviraNeural',
    female_latam: 'es-MX-DaliaNeural',
    male_spain: 'es-ES-AlvaroNeural',
    male_latam: 'es-MX-JorgeNeural',
  };

  // Endpoint de Voces Disponibles
  app.get('/api/tts/voices', (req, res) => {
    res.json({
      engine: 'XTTS v2 / Neural HD',
      description: 'Voces humanas hiperrealistas de última generación en español',
      voices: [
        { id: 'female', name: 'Elvira (Español Natural)', gender: 'female', voiceKey: NEURAL_VOICES.female_spain, tag: 'Recomendada Mujer' },
        { id: 'male', name: 'Álvaro (Español Expresivo)', gender: 'male', voiceKey: NEURAL_VOICES.male_spain, tag: 'Recomendada Hombre' },
        { id: 'female_latam', name: 'Dalia (Español Latino)', gender: 'female', voiceKey: NEURAL_VOICES.female_latam, tag: 'Latinoamérica Mujer' },
        { id: 'male_latam', name: 'Jorge (Español Latino)', gender: 'male', voiceKey: NEURAL_VOICES.male_latam, tag: 'Latinoamérica Hombre' },
      ],
    });
  });

  // Endpoint de Síntesis de Voz Realista (POST)
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, gender = 'female', voice } = req.body;
      const clean = cleanTextForTTS(text);

      if (!clean) {
        return res.status(400).json({ error: 'Texto vacío para sintetizar.' });
      }

      // Seleccionar voz neural según género o nombre especificado
      let targetVoice = voice;
      if (!targetVoice) {
        targetVoice = gender === 'male' ? NEURAL_VOICES.male_spain : NEURAL_VOICES.female_spain;
      }

      const tts = new EdgeTTS();
      await tts.synthesize(clean, targetVoice);

      const base64Audio = tts.toBase64();
      if (!base64Audio) {
        throw new Error('No se pudo generar el flujo de audio.');
      }

      res.json({
        success: true,
        voice: targetVoice,
        gender,
        engine: 'XTTS v2 / Neural HD',
        audioDataUrl: `data:audio/mp3;base64,${base64Audio}`,
      });
    } catch (err: any) {
      console.error('Error al sintetizar audio TTS realista:', err);
      res.status(500).json({
        error: 'Error interno en la generación de voz neural.',
        details: err?.message || String(err),
      });
    }
  });

  // Endpoint de Transmisión de Audio Directa (GET /api/tts/stream)
  app.get('/api/tts/stream', async (req, res) => {
    try {
      const text = (req.query.text as string || '').trim();
      const gender = (req.query.gender as string || 'female');
      const clean = cleanTextForTTS(text);

      if (!clean) {
        return res.status(400).send('Texto no proporcionado');
      }

      const targetVoice = gender === 'male' ? NEURAL_VOICES.male_spain : NEURAL_VOICES.female_spain;
      const tts = new EdgeTTS();
      await tts.synthesize(clean, targetVoice);

      const buffer = tts.toBuffer();
      if (!buffer) {
        return res.status(500).send('Fallo al generar buffer de audio');
      }

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=3600',
      });
      res.send(buffer);
    } catch (err) {
      console.error('Error al transmitir audio:', err);
      res.status(500).send('Error en streaming de audio');
    }
  });


  // Persistencia de mensajes en disco
  const CHAT_STORAGE_FILE = path.join(process.cwd(), 'live_chat_history.json');
  const connectedUsersMap = new Map<WebSocket, LiveUser>();
  
  let recentChatMessages: LiveChatMessage[] = [
    {
      id: 'sys-init-1',
      userId: 'system',
      userName: 'Meteory Bot',
      userAvatar: '☄️',
      userColor: '#f59e0b',
      text: '¡Bienvenidos al Chat Cósmico en Vivo! Aquí puedes platicar en tiempo real con otras personas que estén explorando con Meteory IA en cualquier celular o computadora.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    },
  ];

  // Cargar historial persistente si existe
  try {
    if (fs.existsSync(CHAT_STORAGE_FILE)) {
      const savedData = fs.readFileSync(CHAT_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        recentChatMessages = parsed;
        console.log(`[LiveChat] Cargados ${recentChatMessages.length} mensajes persistentes desde disco.`);
      }
    }
  } catch (err) {
    console.error('[LiveChat] Error leyendo historial guardado:', err);
  }

  function saveChatHistory() {
    try {
      fs.writeFileSync(CHAT_STORAGE_FILE, JSON.stringify(recentChatMessages.slice(-250), null, 2), 'utf-8');
    } catch (err) {
      console.error('[LiveChat] Error guardando historial en disco:', err);
    }
  }

  // Servidor HTTP y WebSocket
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws/live-chat' });

  const AVATARS = ['🚀', '✨', '🪐', '☄️', '🌌', '👾', '🌟', '🛸', '🛰️', '🌠', '🔮', '⚡', '🌙', '🔭'];
  const COLORS = ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#38bdf8', '#fb7185', '#a855f7', '#06b6d4', '#4ade80'];
  const ADJECTIVES = ['Cósmico', 'Estelar', 'Nebular', 'Galáctico', 'Solar', 'Lunar', 'Astral', 'Quásar', 'Pulsar', 'Zeta', 'Alfa', 'Omega', 'Vórtice', 'Caelum', 'Boreal'];
  const NOUNS = ['Viajero', 'Astronauta', 'Explorador', 'Piloto', 'Navegante', 'Observador', 'Centinela', 'Cometa', 'Meteorito', 'Pionero', 'Guía'];

  function generateUniqueNickname(): string {
    const existingNames = new Set(Array.from(connectedUsersMap.values()).map(u => u.name.toLowerCase()));
    for (let i = 0; i < 100; i++) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = Math.floor(100 + Math.random() * 900);
      const candidate = `${noun} ${adj} #${num}`;
      if (!existingNames.has(candidate.toLowerCase())) {
        return candidate;
      }
    }
    return `Explorador Estelar #${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function broadcast(data: any) {
    const payload = JSON.stringify(data);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  function getOnlineUsers(): LiveUser[] {
    return Array.from(connectedUsersMap.values());
  }

  // Endpoints REST para sincronización universal (móviles, tablets, PC desde cualquier red)
  app.get('/api/live-chat/messages', (_req, res) => {
    res.json({
      messages: recentChatMessages,
      onlineUsersCount: connectedUsersMap.size,
      onlineUsers: getOnlineUsers(),
    });
  });

  app.get('/api/live-chat/status', (_req, res) => {
    res.json({
      onlineUsersCount: connectedUsersMap.size,
      onlineUsers: getOnlineUsers(),
      recentMessagesCount: recentChatMessages.length,
    });
  });

  app.post('/api/live-chat/send', (req, res) => {
    try {
      const { text, userId, userName, userAvatar, userColor } = req.body;
      const cleanText = String(text || '').trim().slice(0, 500);
      if (!cleanText) {
        return res.status(400).json({ error: 'Texto requerido' });
      }

      const newMsg: LiveChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: userId || `user-${Date.now()}`,
        userName: String(userName || 'Viajero Cósmico').trim().slice(0, 30),
        userAvatar: String(userAvatar || '🚀').slice(0, 4),
        userColor: String(userColor || '#f59e0b').slice(0, 10),
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      recentChatMessages.push(newMsg);
      if (recentChatMessages.length > 250) {
        recentChatMessages.shift();
      }
      saveChatHistory();

      // Transmitir inmediatamente a todos los clientes WebSocket conectados
      broadcast({
        type: 'message',
        message: newMsg,
      });

      res.json({ success: true, message: newMsg });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Error al enviar mensaje' });
    }
  });

  // Middleware de Vite en desarrollo vs archivos estáticos en producción
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  wss.on('connection', (ws: WebSocket) => {
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const uniqueNickname = generateUniqueNickname();

    const user: LiveUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: uniqueNickname,
      avatar: randomAvatar,
      color: randomColor,
      joinedAt: Date.now(),
      status: '🟢 Conectado',
    };

    connectedUsersMap.set(ws, user);

    // 1. Enviar estado inicial al usuario recién conectado (todo el historial conversado)
    ws.send(
      JSON.stringify({
        type: 'init',
        self: user,
        onlineUsers: getOnlineUsers(),
        onlineCount: connectedUsersMap.size,
        messages: recentChatMessages.slice(-200),
      })
    );

    // 2. Notificar a los demás usuarios sobre la presencia
    broadcast({
      type: 'presence',
      onlineCount: connectedUsersMap.size,
      onlineUsers: getOnlineUsers(),
      userJoined: user,
    });

    // 3. Manejar mensajes entrantes
    ws.on('message', (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());

        if (data.type === 'chat_message' && data.text) {
          const rawText = String(data.text).trim().slice(0, 500);
          if (!rawText) return;

          const currentUser = connectedUsersMap.get(ws) || user;

          const newMsg: LiveChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            userColor: currentUser.color,
            text: rawText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'chat',
          };

          recentChatMessages.push(newMsg);
          if (recentChatMessages.length > 250) {
            recentChatMessages.shift();
          }
          saveChatHistory();

          broadcast({
            type: 'message',
            message: newMsg,
          });
        } else if (data.type === 'typing') {
          const currentUser = connectedUsersMap.get(ws) || user;
          currentUser.isTyping = Boolean(data.isTyping);
          connectedUsersMap.set(ws, currentUser);

          broadcast({
            type: 'typing_update',
            userId: currentUser.id,
            userName: currentUser.name,
            isTyping: Boolean(data.isTyping),
          });
        } else if (data.type === 'status_update') {
          const currentUser = connectedUsersMap.get(ws);
          if (currentUser && data.status) {
            currentUser.status = String(data.status).slice(0, 40);
            connectedUsersMap.set(ws, currentUser);
            broadcast({
              type: 'presence',
              onlineCount: connectedUsersMap.size,
              onlineUsers: getOnlineUsers(),
            });
          }
        } else if (data.type === 'update_profile') {
          const currentUser = connectedUsersMap.get(ws);
          if (currentUser) {
            const requestedName = String(data.name || '').trim().slice(0, 30);
            if (requestedName && requestedName.toLowerCase() !== currentUser.name.toLowerCase()) {
              const nameTaken = Array.from(connectedUsersMap.entries()).some(
                ([clientWs, u]) => clientWs !== ws && u.name.toLowerCase() === requestedName.toLowerCase()
              );
              if (nameTaken) {
                ws.send(
                  JSON.stringify({
                    type: 'profile_error',
                    error: 'Nombre no disponible, intenta otro',
                  })
                );
                return;
              }
              currentUser.name = requestedName;
            }
            if (data.avatar && typeof data.avatar === 'string') {
              currentUser.avatar = data.avatar.slice(0, 4);
            }
            if (data.status && typeof data.status === 'string') {
              currentUser.status = data.status.slice(0, 40);
            }
            connectedUsersMap.set(ws, currentUser);

            broadcast({
              type: 'presence',
              onlineCount: connectedUsersMap.size,
              onlineUsers: getOnlineUsers(),
            });

            ws.send(
              JSON.stringify({
                type: 'profile_updated',
                self: currentUser,
              })
            );
          }
        } else if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (e) {
        console.error('Error procesando mensaje WebSocket:', e);
      }
    });

    ws.on('close', () => {
      const departedUser = connectedUsersMap.get(ws);
      connectedUsersMap.delete(ws);

      broadcast({
        type: 'presence',
        onlineCount: connectedUsersMap.size,
        onlineUsers: getOnlineUsers(),
        userLeft: departedUser,
      });
    });

    ws.on('error', (err) => {
      console.error('Error en WebSocket client:', err);
      connectedUsersMap.delete(ws);
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Meteory IA server running on http://0.0.0.0:${PORT} with Live WebSocket`);
  });
}

startServer();
