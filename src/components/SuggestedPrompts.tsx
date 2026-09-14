import React from 'react';
import { Sparkles, Code2, Atom, Clock, Calculator, Globe, Cpu, Compass } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Atom,
    title: 'Ciencia y Cosmos',
    prompt: '¿Por qué brillan las estrellas y cómo mueren?',
    tag: 'Física',
    gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/35 text-amber-300',
    iconColor: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
  },
  {
    icon: Globe,
    title: 'Búsqueda Web en Vivo',
    prompt: '¿Cuáles son las últimas noticias de misiones espaciales?',
    tag: 'En Vivo',
    gradient: 'from-cyan-500/20 to-indigo-500/10 border-cyan-500/35 text-cyan-300',
    iconColor: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
  },
  {
    icon: Calculator,
    title: 'Matemáticas Simbólicas',
    prompt: 'Calcula la raíz cuadrada de 144 + 5^3',
    tag: 'Cálculo',
    gradient: 'from-orange-500/20 to-amber-500/10 border-orange-500/35 text-amber-300',
    iconColor: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
  },
  {
    icon: Clock,
    title: 'Reloj y Zonas Horarias',
    prompt: '¿Qué hora y fecha es en Tokio y Londres?',
    tag: 'Tiempo',
    gradient: 'from-indigo-500/20 to-sky-500/10 border-indigo-500/35 text-indigo-300',
    iconColor: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/40',
  },
  {
    icon: Code2,
    title: 'Algoritmos y Código',
    prompt: '¿Cómo funciona una red neuronal artificial?',
    tag: 'IA & Tech',
    gradient: 'from-rose-500/20 to-orange-500/10 border-rose-500/35 text-rose-300',
    iconColor: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
  },
  {
    icon: Compass,
    title: 'Modismos & Cortesía',
    prompt: '¡Hola buenas, qué tal cómo estás hoy!',
    tag: 'NLP Natural',
    gradient: 'from-amber-500/20 to-rose-500/10 border-amber-500/35 text-amber-300',
    iconColor: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
  },
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="my-4 sm:my-6 p-3 sm:p-5 rounded-3xl bg-[#0a0e21]/80 border border-indigo-950/90 max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-3.5 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 font-['Space_Grotesk']">
            Explora las capacidades autónomas de Meteory
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">6 módulos listos</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              id={`suggested-prompt-${idx}`}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`text-left p-3 rounded-2xl bg-gradient-to-br ${item.gradient} hover:scale-[1.02] border transition-all duration-200 flex items-start gap-3 group cursor-pointer shadow-sm active:scale-[0.98] bg-[#0c1024]/80`}
            >
              <div className={`p-2 rounded-xl border ${item.iconColor} shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors font-['Space_Grotesk']">
                    {item.title}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#070914]/90 text-slate-400 font-mono border border-indigo-950/80">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  "{item.prompt}"
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

