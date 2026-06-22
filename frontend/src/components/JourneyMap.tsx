import { useEffect, useRef } from 'react';
import curriculumData from '../data/units.json';
import { BELTS, isUnitUnlocked, isRevisionUnlocked } from './Sidebar';

interface Props {
  astronautName: string;
  equippedAccessory: string;
  completedPlanets: number[];
  passedRevisions: number[];
  manuallyUnlockedPlanets?: number[];
  onSelectUnit: (id: number) => void;
  onStartRevision: (beltId: number) => void;
}

const UNIT_EMOJIS: Record<number, string> = {
  1:'👋',2:'🎈',3:'🧸',4:'🏃',5:'⏰',6:'🔄',7:'📍',8:'🍏',9:'🍇',10:'🚀',
  11:'🦖',12:'👥',13:'🔮',14:'❓',15:'🛡️',16:'🔗',17:'🌅',18:'📦',19:'🔢',
  20:'🎭',21:'🗺️',22:'💊',23:'🌊',24:'🎯',25:'🏆',
};

export default function JourneyMap({
  astronautName,
  equippedAccessory,
  completedPlanets,
  passedRevisions,
  manuallyUnlockedPlanets = [],
  onSelectUnit,
  onStartRevision,
}: Props) {
  // Determine highest unlocked unit
  let highestUnlockedUnit = 1;
  for (let i = 25; i >= 1; i--) {
    if (isUnitUnlocked(i, completedPlanets, passedRevisions, manuallyUnlockedPlanets)) {
      highestUnlockedUnit = i;
      break;
    }
  }

  // We will flatten the structure to render from BOTTOM to TOP.
  // We can interleave units and revision gates.
  const nodes: { type: 'unit' | 'revision'; id: number; beltId?: number; unitData?: any; belt?: any }[] = [];
  
  BELTS.forEach(belt => {
    belt.unitIds.forEach(uid => {
      nodes.push({ type: 'unit', id: uid, beltId: belt.beltId, unitData: curriculumData.find(u => u.unit_id === uid), belt });
    });
    if (belt.revisionAfter) {
      nodes.push({ type: 'revision', id: belt.beltId, beltId: belt.beltId, belt });
    }
  });

  const reversedNodes = [...nodes].reverse(); // Render top-to-bottom so #25 is at top, #1 is at bottom.

  const mapRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current position
  useEffect(() => {
    if (mapRef.current) {
      const activeNode = mapRef.current.querySelector('[data-active="true"]');
      if (activeNode) {
        activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highestUnlockedUnit]);

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 relative overflow-hidden" ref={mapRef}>
      {/* Background stars / details (optional) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <div className="flex flex-col items-center relative z-10 space-y-10">
        {reversedNodes.map((node, i) => {
          const isRevision = node.type === 'revision';
          
          if (isRevision) {
            const allDone = isRevisionUnlocked(node.beltId!, completedPlanets);
            const revPassed = passedRevisions.includes(node.beltId!);

            return (
              <div key={`rev-${node.id}`} className="relative flex flex-col items-center w-full py-6">
                {/* Winding path line connecting to the next node down */}
                {i < reversedNodes.length - 1 && (
                  <div className="absolute top-1/2 w-2 h-20 bg-gray-200 -z-10 rounded-full" />
                )}
                
                <div className={`w-full max-w-sm border-2 rounded-3xl p-5 shadow-lg flex items-center justify-between transition-all ${
                  revPassed ? 'bg-emerald-50 border-emerald-300' 
                  : allDone ? 'bg-amber-50 border-amber-300 animate-pulse' 
                  : 'bg-white border-gray-200 opacity-60'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-inner ${
                      revPassed ? 'bg-emerald-200' : allDone ? 'bg-amber-200' : 'bg-gray-100'
                    }`}>
                      {revPassed ? '🏆' : allDone ? '⚡' : '🔒'}
                    </div>
                    <div>
                      <h3 className={`font-black text-lg ${revPassed ? 'text-emerald-700' : allDone ? 'text-amber-700' : 'text-gray-500'}`}>
                        Revision {node.id}
                      </h3>
                      <p className="text-xs font-bold text-gray-400">
                        {revPassed ? 'Đã vượt ải!' : allDone ? 'Sẵn sàng kiểm tra!' : 'Hoàn thành bài trước'}
                      </p>
                    </div>
                  </div>
                  {allDone && !revPassed && (
                    <button 
                      onClick={() => onStartRevision(node.id)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                      Bắt đầu
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // It's a unit node
          const uid = node.id;
          const belt = node.belt!;
          const isDone = completedPlanets.includes(uid);
          const isUnlocked = isUnitUnlocked(uid, completedPlanets, passedRevisions, manuallyUnlockedPlanets);
          const isCurrent = uid === highestUnlockedUnit;
          
          // Calculate winding offset (x translation)
          // reverse index so that index 0 is at bottom (unit 1)
          const ascendingIndex = reversedNodes.length - 1 - i;
          const xOffset = Math.sin(ascendingIndex * 0.8) * 80;

          return (
            <div 
              key={`unit-${uid}`} 
              data-active={isCurrent}
              className="relative flex flex-col items-center justify-center w-full min-h-[100px]"
            >
              {/* Path line to next node (below this one) */}
              {i < reversedNodes.length - 1 && (
                <svg className="absolute top-[60px] -z-10 w-full h-[100px]" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path 
                    d={`M 50 0 Q ${50 + xOffset * 0.3} 50 50 100`} 
                    stroke={isUnlocked ? '#D1D5DB' : '#F3F4F6'} 
                    strokeWidth="8" 
                    fill="none" 
                    strokeLinecap="round" 
                  />
                </svg>
              )}

              {/* Astronaut Avatar on current unit */}
              {isCurrent && (
                <div 
                  className="absolute z-20 flex flex-col items-center animate-bounce"
                  style={{ top: '-60px', transform: `translateX(${xOffset}px)` }}
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-white rounded-full border-4 border-violet-500 shadow-xl flex items-center justify-center text-3xl">
                      👨‍🚀
                    </div>
                    {equippedAccessory && (
                      <div className="absolute -top-3 -right-3 text-3xl drop-shadow-md">
                        {equippedAccessory}
                      </div>
                    )}
                  </div>
                  <div className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full mt-1 shadow-md">
                    {astronautName}
                  </div>
                </div>
              )}

              {/* Planet Button */}
              <button
                onClick={() => isUnlocked && onSelectUnit(uid)}
                disabled={!isUnlocked}
                className={`relative z-10 rounded-full w-[88px] h-[88px] flex items-center justify-center text-4xl transition-all ${
                  isUnlocked ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed grayscale'
                }`}
                style={{ 
                  transform: `translateX(${xOffset}px)`,
                  background: isDone ? 'linear-gradient(135deg, #10B981, #059669)' : isUnlocked ? `linear-gradient(135deg, ${belt.color.split(' ')[1]}, ${belt.color.split(' ')[3] || belt.color.split(' ')[1]})` : '#E5E7EB',
                  boxShadow: isCurrent ? '0 0 0 6px rgba(139, 92, 246, 0.3), 0 10px 25px rgba(0,0,0,0.2)' : isUnlocked ? '0 8px 20px rgba(0,0,0,0.15)' : 'none',
                  border: isDone ? '4px solid #A7F3D0' : isUnlocked ? '4px solid white' : '4px solid #F3F4F6'
                }}
              >
                {/* Planet Emoji */}
                {UNIT_EMOJIS[uid] || '🌍'}

                {/* Status Indicator */}
                {isDone && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center text-white text-xs shadow-md">
                    ✓
                  </div>
                )}
                {!isUnlocked && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-400 border-2 border-white rounded-full flex items-center justify-center text-white text-xs shadow-md">
                    🔒
                  </div>
                )}
              </button>

              {/* Title popover */}
              <div 
                className={`absolute mt-[100px] text-center px-3 py-1.5 bg-white rounded-xl shadow-sm border border-gray-100 transition-opacity ${isUnlocked ? 'opacity-100' : 'opacity-0'}`}
                style={{ transform: `translateX(${xOffset}px)` }}
              >
                <p className="text-xs font-black text-gray-400 uppercase">Unit {uid}</p>
                <p className="text-sm font-bold text-gray-700 truncate w-32">{node.unitData?.unit_title}</p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
