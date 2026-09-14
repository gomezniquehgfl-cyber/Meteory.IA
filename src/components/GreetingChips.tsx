import React, { useState } from 'react';
import { Sparkles, Globe, MessageSquareQuote, Compass } from 'lucide-react';

interface GreetingChipsProps {
  onSelectGreeting: (text: string) => void;
  disabled?: boolean;
}

const QUESTION_EXAMPLES = [
  { label: '¿Qué es un agujero negro? 🕳️', text: '¿Qué es un agujero negro y cómo se forma?' },
  { label: '¿Quién fue Nikola Tesla? ⚡', text: '¿Quién fue Nikola Tesla?' },
  { label: 'Planetas del sistema solar 🪐', text: '¿Cuáles son los planetas del sistema solar?' },
  { label: '¿Por qué el cielo es azul? 🌌', text: '¿Por qué el cielo es de color azul?' },
  { label: '¿Qué es la fotosíntesis? 🌿', text: '¿Qué es la fotosíntesis en las plantas?' },
  { label: 'Historia de los videojuegos 🎮', text: 'Busca la historia y origen de los videojuegos' },
];

const GREETING_EXAMPLES = [
  { label: '¡Hola Meteory! 👋', text: '¡Hola Meteory!' },
  { label: 'Hola buenas 👋', text: 'Hola buenas' },
  { label: 'Buenas hola 😊', text: 'Buenas hola' },
  { label: 'Hola que tal ✨', text: 'Hola que tal' },
  { label: 'Buenos días ☀️', text: 'Buenos días' },
  { label: '¿Qué onda? 🤙', text: '¿Qué onda?' },
  { label: '¿Cómo estás? 😊', text: '¿Cómo estás hoy?' },
  { label: 'Un cordial saludo 🤝', text: 'Estimado, un cordial saludo' },
  { label: 'Bonjour! 🥐', text: 'Bonjour!' },
  { label: 'Klk pana 🇩🇴', text: 'Klk pana' },
  { label: '¿Quién eres? 🤖', text: '¿Quién eres y quién te creó?' },
  { label: 'Buenas noches 🌙', text: 'Buenas noches' },
  { label: 'Hasta luego 👋', text: 'Hasta luego, nos vemos' },
];

export const GreetingChips: React.FC<GreetingChipsProps> = ({ onSelectGreeting, disabled }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'questions' | 'greetings'>('all');

  const itemsToShow =
    filterMode === 'questions'
      ? QUESTION_EXAMPLES
      : filterMode === 'greetings'
      ? GREETING_EXAMPLES
      : [...QUESTION_EXAMPLES.slice(0, 3), ...GREETING_EXAMPLES.slice(0, 4), ...QUESTION_EXAMPLES.slice(3)];

  return (
    <div className="w-full pb-2">
      <div className="flex items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-300 font-['Space_Grotesk']">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Accesos rápidos:</span>
        </div>

        <div className="flex items-center gap-1 bg-[#0d1226] p-0.5 rounded-xl border border-indigo-950/90 text-[11px]">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
              filterMode === 'all'
                ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterMode('questions')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
              filterMode === 'questions'
                ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preguntas Web
          </button>
          <button
            onClick={() => setFilterMode('greetings')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
              filterMode === 'greetings'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Saludos NLP
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
        {itemsToShow.map((item, idx) => (
          <button
            key={idx}
            id={`chip-suggestion-${idx}`}
            onClick={() => onSelectGreeting(item.text)}
            disabled={disabled}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0c1024]/90 hover:bg-[#151c3d] border border-indigo-950/90 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-amber-500/10 cursor-pointer backdrop-blur-sm"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};


