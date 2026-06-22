import { CheckCircle, Lock } from 'lucide-react';

interface UnitMeta {
  unit_id: number;
  unit_title: string;
}

export interface BeltConfig {
  beltId: number;
  beltName: string;
  emoji: string;
  color: string;
  unitIds: number[];           // e.g. [1,2,3,4]
  revisionAfter: boolean;      // show revision gate at end
}

export const BELTS: BeltConfig[] = [
  { beltId: 1, beltName: 'Khởi Hành',   emoji: '🚀', color: 'from-violet-500 to-purple-600',   unitIds: [1,2,3,4],   revisionAfter: true },
  { beltId: 2, beltName: 'Thám Hiểm',   emoji: '🌍', color: 'from-sky-500 to-blue-600',         unitIds: [5,6,7,8],   revisionAfter: true },
  { beltId: 3, beltName: 'Chinh Phục',  emoji: '⚔️', color: 'from-emerald-500 to-teal-600',    unitIds: [9,10,11,12],  revisionAfter: true },
  { beltId: 4, beltName: 'Vượt Gian Nan',emoji: '🌋', color: 'from-amber-500 to-orange-600',    unitIds: [13,14,15,16], revisionAfter: true },
  { beltId: 5, beltName: 'Tiên Tiến',   emoji: '💫', color: 'from-pink-500 to-rose-600',        unitIds: [17,18,19,20], revisionAfter: true },
  { beltId: 6, beltName: 'Đỉnh Cao',    emoji: '👑', color: 'from-fuchsia-500 to-purple-700',   unitIds: [21,22,23,24,25], revisionAfter: true },
];

interface SidebarProps {
  units: UnitMeta[];
  selectedUnitId: number | null;
  completedPlanets: number[];
  passedRevisions: number[];    // revision belt ids that have been passed
  manuallyUnlockedPlanets?: number[];
  onSelectUnit: (id: number) => void;
  onStartRevision: (beltId: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  stars: number;
  onOpenParentDashboard: () => void;
}

// Emoji per unit
const UNIT_EMOJIS: Record<number, string> = {
  1:'👋',2:'🎈',3:'🧸',4:'🏃',5:'⏰',6:'🔄',7:'📍',8:'🍏',9:'🍇',10:'🚀',
  11:'🦖',12:'👥',13:'🔮',14:'❓',15:'🛡️',16:'🔗',17:'🌅',18:'📦',19:'🔢',
  20:'🎭',21:'🗺️',22:'💊',23:'🌊',24:'🎯',25:'🏆',
};

/** Returns the belt a unit belongs to */
export function getBeltForUnit(unitId: number): BeltConfig | undefined {
  return BELTS.find(b => b.unitIds.includes(unitId));
}

/** Returns the "gate" revision number for a belt (same as beltId) */
export function getRevisionNumber(beltId: number): number {
  return beltId;
}

/** Check if a unit is accessible (all previous units in the same belt done, prev belt's revision passed) */
export function isUnitUnlocked(
  unitId: number,
  completedPlanets: number[],
  passedRevisions: number[],
  manuallyUnlockedPlanets?: number[]
): boolean {
  if (manuallyUnlockedPlanets && manuallyUnlockedPlanets.includes(unitId)) return true;

  const belt = getBeltForUnit(unitId);
  if (!belt) return false;

  // First unit in belt 1 is always unlocked
  if (unitId === 1) return true;

  // Check if previous belt's revision is passed
  if (belt.beltId > 1 && !passedRevisions.includes(belt.beltId - 1)) return false;

  // Within the same belt: previous unit in that belt must be done
  const unitIndex = belt.unitIds.indexOf(unitId);
  if (unitIndex === 0) return true;  // first in belt
  const prevUnitId = belt.unitIds[unitIndex - 1];
  return completedPlanets.includes(prevUnitId);
}

/** Check if a belt's revision is unlocked (all units in belt done) */
export function isRevisionUnlocked(beltId: number, completedPlanets: number[]): boolean {
  const belt = BELTS.find(b => b.beltId === beltId);
  if (!belt) return false;
  return belt.unitIds.every(id => completedPlanets.includes(id));
}

export default function Sidebar({
  units,
  selectedUnitId,
  completedPlanets,
  passedRevisions,
  manuallyUnlockedPlanets = [],
  onSelectUnit,
  onStartRevision,
  isOpen,
  onToggle,
  stars,
  onOpenParentDashboard,
}: SidebarProps) {
  const unitMap = new Map(units.map(u => [u.unit_id, u]));

  const handleSelectUnit = (id: number) => {
    onSelectUnit(id);
    // Auto-close on mobile
    if (window.innerWidth < 1024 && isOpen) onToggle();
  };

  const handleStartRevision = (beltId: number) => {
    onStartRevision(beltId);
    if (window.innerWidth < 1024 && isOpen) onToggle();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[39] lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 shadow-2xl sidebar-gradient
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ width: isOpen ? '280px' : '72px' }}
      >
      {/* Logo Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/20 flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl transition-all hover:scale-110 flex-shrink-0 cursor-pointer"
          title={isOpen ? 'Thu gọn' : 'Mở rộng'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
        {isOpen && (
          <div className="overflow-hidden animate-slide-up">
            <p className="text-white font-black text-lg leading-tight whitespace-nowrap">🌟 Round Up 2</p>
            <p className="text-purple-200 text-xs font-semibold whitespace-nowrap">Học Tiếng Anh Cùng Bé</p>
          </div>
        )}
      </div>

      {/* Unit List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1.5">
        {BELTS.map(belt => {
          const allBeltDone = isRevisionUnlocked(belt.beltId, completedPlanets);
          const revPassed = passedRevisions.includes(belt.beltId);
          const beltLocked = belt.beltId > 1 && !passedRevisions.includes(belt.beltId - 1);

          return (
            <div key={belt.beltId} className="mb-1">
              {/* Belt Header */}
              {isOpen && (
                <div className="belt-header mx-1 px-3 py-1.5 rounded-xl mb-1.5 flex items-center gap-2">
                  <span className="text-sm">{belt.emoji}</span>
                  <p className="text-purple-200 text-[10px] font-black uppercase tracking-widest flex-1">
                    {belt.beltName}
                  </p>
                  {beltLocked && <Lock size={11} className="text-white/30" />}
                  {revPassed && <CheckCircle size={11} className="text-emerald-300" />}
                </div>
              )}

              {/* Units in belt */}
              {belt.unitIds.map(unitId => {
                const unit = unitMap.get(unitId);
                if (!unit) return null;
                const isActive = selectedUnitId === unitId;
                const isCompleted = completedPlanets.includes(unitId);
                const unlocked = isUnitUnlocked(unitId, completedPlanets, passedRevisions, manuallyUnlockedPlanets);
                const emoji = UNIT_EMOJIS[unitId] || '📘';

                return (
                  <button
                    key={unitId}
                    onClick={() => unlocked && handleSelectUnit(unitId)}
                    className={`group relative flex items-center gap-3 rounded-2xl transition-all duration-200 w-full
                      ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'}
                      ${isActive ? 'sidebar-item-active scale-[1.02]' : ''}
                      ${!unlocked ? 'sidebar-item-locked' : !isActive ? 'text-white hover:bg-white/15 hover:scale-[1.01] cursor-pointer' : ''}
                    `}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0
                      ${isActive ? 'bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-md'
                        : !unlocked ? 'bg-white/10 text-white/40'
                        : isCompleted ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                        : 'bg-white/20 text-white group-hover:bg-white/30'}
                    `}>
                      {!unlocked ? '🔒' : isCompleted ? '✅' : emoji}
                    </div>

                    {/* Label */}
                    {isOpen && (
                      <div className="text-left overflow-hidden">
                        <p className={`font-bold text-sm leading-tight ${isActive ? 'text-purple-800' : ''}`}>
                          Unit {unitId}
                        </p>
                        <p className={`text-xs font-semibold truncate max-w-[160px] ${isActive ? 'text-purple-600' : 'text-white/70'}`}>
                          {unit.unit_title}
                        </p>
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-r-full" />
                    )}
                  </button>
                );
              })}

              {/* Revision Gate after each belt */}
              {belt.revisionAfter && (
                <button
                  onClick={() => allBeltDone && !revPassed && handleStartRevision(belt.beltId)}
                  disabled={revPassed || !allBeltDone}
                  className={`group relative flex items-center gap-3 rounded-2xl transition-all duration-200 w-full mt-1
                    ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'}
                    ${revPassed ? 'bg-emerald-500/20 border border-emerald-400/30' : ''}
                    ${allBeltDone && !revPassed ? 'sidebar-revision hover:bg-amber-500/20 cursor-pointer animate-pulse' : ''}
                    ${!allBeltDone ? 'sidebar-item-locked' : ''}
                  `}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0
                    ${revPassed ? 'bg-emerald-500/30 text-emerald-200'
                      : allBeltDone ? 'bg-amber-400/30 text-amber-200 border border-amber-400/40'
                      : 'bg-white/10 text-white/40'}
                  `}>
                    {revPassed ? '🏆' : allBeltDone ? '⚡' : '🔒'}
                  </div>

                  {isOpen && (
                    <div className="text-left overflow-hidden">
                      <p className={`font-black text-sm leading-tight ${revPassed ? 'text-emerald-200' : allBeltDone ? 'text-amber-200' : 'text-white/40'}`}>
                        Revision {belt.beltId}
                      </p>
                      <p className="text-xs font-semibold text-white/50 truncate max-w-[160px]">
                        {revPassed ? '✅ Đã vượt ải!' : allBeltDone ? 'Sẵn sàng kiểm tra!' : `Hoàn thành ${belt.beltName} trước`}
                      </p>
                    </div>
                  )}

                  {allBeltDone && !revPassed && (
                    <div className="absolute right-3 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom: Stars + Parent */}
      <div className="px-2 py-4 border-t border-white/20 flex-shrink-0">
        {isOpen ? (
          <>
            <button
              onClick={onOpenParentDashboard}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600/30 hover:bg-purple-600/50 text-white rounded-2xl font-black text-sm transition-all active:scale-95 border border-white/20 cursor-pointer shadow-sm mb-2"
            >
              ⚙️ Góc Phụ Huynh
            </button>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center">
              <p className="text-white text-base font-black">⭐ {stars}</p>
              <p className="text-purple-200 text-[10px] font-semibold mt-0.5">Sao Sáng tích lũy</p>
            </div>
          </>
        ) : (
          <button
            onClick={onOpenParentDashboard}
            className="w-10 h-10 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-white flex items-center justify-center text-base transition-all active:scale-95 border border-white/20 cursor-pointer mx-auto"
            title="Góc Phụ Huynh"
          >
            ⚙️
          </button>
        )}
      </div>
      </aside>
    </>
  );
}
