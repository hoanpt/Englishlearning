import { Lock, Check, Compass } from 'lucide-react';

interface UnitData {
  unit_id: number;
  unit_title: string;
  grammar: {
    structure: string;
    examples: string[];
  };
}

interface SpaceMapProps {
  units: UnitData[];
  completedPlanets: number[];
  onPlanetSelect: (unit: UnitData) => void;
}

// Fixed coordinates in percentage for the 25 planets on the 2D galaxy board
const planetPositions = [
  { x: 15, y: 5 },
  { x: 45, y: 8 },
  { x: 75, y: 6 },
  { x: 80, y: 18 },
  { x: 50, y: 20 },
  { x: 20, y: 17 },
  { x: 15, y: 30 },
  { x: 45, y: 32 },
  { x: 75, y: 29 },
  { x: 82, y: 42 },
  { x: 52, y: 44 },
  { x: 22, y: 41 },
  { x: 15, y: 54 },
  { x: 45, y: 56 },
  { x: 75, y: 53 },
  { x: 80, y: 66 },
  { x: 50, y: 68 },
  { x: 20, y: 65 },
  { x: 15, y: 78 },
  { x: 45, y: 80 },
  { x: 75, y: 77 },
  { x: 80, y: 86 },
  { x: 50, y: 88 },
  { x: 20, y: 86 },
  { x: 50, y: 95 }
];

const planetStyles = [
  'from-rose-400 to-pink-600',       // 1
  'from-amber-400 to-orange-600',    // 2
  'from-yellow-400 to-amber-600',    // 3
  'from-emerald-400 to-teal-600',    // 4
  'from-cyan-400 to-blue-600',       // 5
  'from-indigo-400 to-violet-600',   // 6
  'from-purple-400 to-fuchsia-600',  // 7
  'from-pink-400 to-rose-600',       // 8
  'from-orange-400 to-red-600',      // 9
  'from-teal-400 to-cyan-600',       // 10
  'from-blue-400 to-indigo-600',     // 11
  'from-fuchsia-400 to-pink-600',    // 12
  'from-red-400 to-rose-600',        // 13
  'from-amber-500 to-yellow-600',    // 14
  'from-green-400 to-emerald-600',   // 15
  'from-cyan-500 to-indigo-600',     // 16
  'from-purple-500 to-indigo-700',   // 17
  'from-pink-500 to-purple-700',     // 18
  'from-orange-500 to-yellow-700',   // 19
  'from-teal-500 to-emerald-700',    // 20
  'from-cyan-500 to-blue-700',       // 21
  'from-violet-500 to-fuchsia-700',  // 22
  'from-rose-500 to-red-700',        // 23
  'from-lime-500 to-green-600',      // 24
  'from-amber-500 to-orange-700'     // 25
];

export default function SpaceMap({
  units,
  completedPlanets,
  onPlanetSelect,
}: SpaceMapProps) {
  
  // Find current active planet (first incomplete planet)
  let activePlanetNum = 1;
  for (let i = 1; i <= 25; i++) {
    if (!completedPlanets.includes(i)) {
      activePlanetNum = i;
      break;
    }
  }

  // Check state helper
  const getPlanetState = (num: number) => {
    if (completedPlanets.includes(num)) return 'completed';
    if (num === activePlanetNum) return 'active';
    return 'locked';
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 border border-indigo-900/50 rounded-3xl p-4 sm:p-8 min-h-[1400px]">
      
      {/* Stars Background layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjMiLz48Y2lyY2xlIGN4PSIxNDAiIGN5PSI3MCIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjUiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjE1MCIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjIiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />

      {/* SVG Connecting lines in background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {planetPositions.map((pos, idx) => {
          if (idx === planetPositions.length - 1) return null;
          const nextPos = planetPositions[idx + 1];
          
          const isPathCompleted = completedPlanets.includes(idx + 1);
          const lineStroke = isPathCompleted 
            ? 'rgba(124, 58, 237, 0.6)'  // Indigo 600
            : 'rgba(51, 65, 85, 0.4)';    // Slate 700
            
          return (
            <line
              key={idx}
              x1={`${pos.x}%`}
              y1={`${pos.y}%`}
              x2={`${nextPos.x}%`}
              y2={`${nextPos.y}%`}
              stroke={lineStroke}
              strokeWidth={isPathCompleted ? 3 : 2}
              strokeDasharray={isPathCompleted ? '0' : '5, 5'}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      {/* Galaxy Core Center decoration */}
      <div className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />

      {/* Render Planets */}
      {units.map((unit) => {
        const num = unit.unit_id;
        const pos = planetPositions[num - 1] || { x: 50, y: 50 };
        const state = getPlanetState(num);
        const style = planetStyles[num - 1] || 'from-slate-400 to-slate-600';
        
        let planetClasses = '';
        let iconContent = null;

        if (state === 'completed') {
          planetClasses = `bg-gradient-to-tr ${style} scale-100 shadow-lg shadow-purple-900/30 cursor-pointer border border-white/20`;
          iconContent = <Check size={14} className="text-white font-black" />;
        } else if (state === 'active') {
          planetClasses = `bg-gradient-to-tr ${style} scale-110 border-2 border-white cursor-pointer shadow-xl shadow-cyan-400/20 animate-pulse`;
          iconContent = <Compass size={16} className="text-white animate-spin-slow" />;
        } else {
          planetClasses = 'bg-slate-800 border border-slate-700/60 scale-90 cursor-not-allowed opacity-50';
          iconContent = <Lock size={12} className="text-slate-400" />;
        }

        return (
          <div
            key={num}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-fade-in min-w-[200px]">
              <div className="bg-slate-900 text-white text-xs rounded-xl p-3 border border-indigo-500/30 shadow-2xl flex flex-col gap-1">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Hành tinh {num}</span>
                <span className="font-extrabold text-slate-100 line-clamp-1">{unit.unit_title}</span>
                <span className="text-[10px] text-slate-400 font-medium">Cấu trúc: {unit.grammar.structure.substring(0, 40)}...</span>
              </div>
              <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45 -mt-1.5" />
            </div>

            {/* Astronaut space suit head indicator for Active Planet */}
            {state === 'active' && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <span className="bg-cyan-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">Bé ở đây</span>
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping mt-1" />
              </div>
            )}

            {/* Planet Body */}
            <button
              onClick={() => state !== 'locked' && onPlanetSelect(unit)}
              disabled={state === 'locked'}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${planetClasses}`}
            >
              {iconContent}
            </button>

            {/* Planet Title text below */}
            <div className="text-center mt-2.5 pointer-events-none select-none">
              <p className={`text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-md ${
                state === 'completed' ? 'text-purple-300' :
                state === 'active' ? 'text-cyan-400 font-black' : 'text-slate-600'
              }`}>
                H.tinh {num}
              </p>
            </div>
          </div>
        );
      })}

    </div>
  );
}
