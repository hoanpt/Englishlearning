import { useState } from 'react';
import { Rocket, Award, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import { FlashcardTab, MatchingGameTab } from './VocabularyTab';
import GrammarTab from './GrammarTab';
import ListeningTab from './ListeningTab';

import SentenceBuilderTab from './SentenceBuilderTab';

interface VocabItem { word: string; meaning: string; phonetic: string; }
interface UnitData {
  unit_id: number;
  unit_title: string;
  grammar: { structure: string; examples: string[] };
  vocabulary: VocabItem[];
  dialogue: { title: string; lines: { speaker: string; text: string; missingWord: string; choices: string[] }[] };
  story?: { title: string; text: string; questions: { question: string; options: string[]; answer: string }[] };
}

interface Props {
  unit: UnitData;
  equippedAccessory?: string;
  onMissionSuccess: (starsEarned: number) => void;
  onCancel: () => void;
}

const TABS = [
  { label: '🎴 Từ Vựng',    index: 0 },
  { label: '🎮 Nối Từ',     index: 1 },
  { label: '🧩 Trắc Nghiệm', index: 2 },
  { label: '🎧 Luyện Nghe',  index: 3 },
  { label: '🏗️ Xây Câu',   index: 4 },
] as const;

export default function MissionPractice({ unit, equippedAccessory, onMissionSuccess, onCancel }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState<boolean[]>([false, false, false, false, false]);
  const [spaceshipPosition, setSpaceshipPosition] = useState(10);
  const [laserFired, setLaserFired] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const STARS_AWARD = 20;

  const handleTabComplete = (tabIdx: number) => {
    if (completedTabs[tabIdx]) return;
    setLaserFired(true);
    setTimeout(() => setLaserFired(false), 800);
    const next = [...completedTabs];
    next[tabIdx] = true;
    setCompletedTabs(next);
    const count = next.filter(Boolean).length;
    setSpaceshipPosition(10 + count * 18);
    if (count === 5) setTimeout(() => setIsFinished(true), 1500);
    // Auto advance to next tab
    if (tabIdx < 4 && !next[tabIdx + 1]) setTimeout(() => setActiveTab(tabIdx + 1), 1800);
  };

  const completedCount = completedTabs.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Back button */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-bold transition-colors"
        >
          <ArrowLeft size={18} /> Rời nhiệm vụ
        </button>
        <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${spaceshipPosition}%`, background: 'linear-gradient(90deg, #7C3AED, #2563EB)' }} />
        </div>
        <span className="text-sm font-black text-gray-600 flex-shrink-0">{completedCount}/5 chặng</span>
      </div>

      {/* Flight tracker */}
      <div className="px-4 py-4 mx-4 mt-4 bg-white rounded-3xl border-2 border-violet-100 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-3">
          <span className="text-violet-500 font-black flex items-center gap-1">🚀 Khởi hành</span>
          <span className="text-pink-500 font-black text-center flex-1 px-2 truncate">
            Unit {unit.unit_id}: {unit.unit_title}
          </span>
          <span className="text-amber-500 font-black flex items-center gap-1">🪐 Hạ cánh</span>
        </div>
        <div className="relative w-full h-8 bg-gray-100 rounded-full flex items-center px-2 border border-gray-200">
          <div className="absolute right-3 text-xl">🪐</div>
          <div
            className="absolute transition-all duration-1000 ease-out"
            style={{ left: `${spaceshipPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="relative">
              <Rocket className="text-violet-500 rotate-90 animate-bounce" size={24} />
              {laserFired && (
                <div className="absolute top-1/2 left-full w-24 h-0.5 bg-violet-400 animate-pulse origin-left" />
              )}
            </div>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="px-4 py-4">
          {/* Tabs */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {TABS.map(tab => {
              const isActive = activeTab === tab.index;
              const isDone = completedTabs[tab.index];
              return (
                <button
                  key={tab.index}
                  onClick={() => setActiveTab(tab.index)}
                  className={`py-3 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isActive
                      ? 'text-white border-violet-400 scale-[1.02] shadow-md'
                      : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                  style={isActive ? { background: 'linear-gradient(135deg, #7C3AED, #2563EB)' } : {}}
                >
                  <span>{tab.label.split(' ')[0]}</span>
                  <span className="hidden sm:inline text-[10px] leading-tight text-center">{tab.label.split(' ').slice(1).join(' ')}</span>
                  {isDone && <CheckCircle size={14} className="text-emerald-300 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-sky-500 rounded-t-3xl" />
            <div className="p-4 sm:p-6 pt-5">
              {activeTab === 0 && (
                <FlashcardTab vocabulary={unit.vocabulary} onComplete={() => handleTabComplete(0)} />
              )}
              {activeTab === 1 && (
                <MatchingGameTab vocabulary={unit.vocabulary} onComplete={() => handleTabComplete(1)} />
              )}
              {activeTab === 2 && (
                <GrammarTab grammar={unit.grammar} vocabulary={unit.vocabulary} onComplete={() => handleTabComplete(2)} />
              )}
              {activeTab === 3 && (
                <ListeningTab
                  vocabulary={unit.vocabulary}
                  story={unit.story}
                  dialogue={unit.dialogue}
                  grammar={unit.grammar}
                  onComplete={() => handleTabComplete(3)}
                />
              )}
              {activeTab === 4 && (
                <SentenceBuilderTab
                  grammar={unit.grammar}
                  vocabulary={unit.vocabulary}
                  dialogue={unit.dialogue}
                  onComplete={() => handleTabComplete(4)}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        // Victory screen
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-violet-100 p-8 text-center shadow-xl animate-bounce-in">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-5 border-2 border-amber-300 bg-amber-50">
              <Award size={44} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">HẠ CÁNH THÀNH CÔNG! 🚀</h2>
            <p className="text-gray-500 font-semibold text-sm mb-6">
              Bé đã hoàn thành xuất sắc cả 5 chặng thám hiểm<br />
              <strong>Unit {unit.unit_id}: {unit.unit_title}</strong>!
            </p>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 w-fit mx-auto mb-8 flex items-center gap-3">
              <Star size={22} fill="currentColor" className="text-amber-400 animate-pulse" />
              <span className="font-black text-amber-600 text-xl">+{STARS_AWARD} Sao Sáng!</span>
            </div>
            <button
              onClick={() => onMissionSuccess(STARS_AWARD)}
              className="w-full py-4 text-white font-black rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-98 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
            >
              Trở về Bản Đồ Bài Học →
            </button>
          </div>
        </div>
      )}

      {/* Floating Mascot */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-none drop-shadow-2xl">
        <div className="relative">
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-violet-500/20 blur-xl rounded-[100%]" />
          <div className="w-24 h-24 bg-slate-900 border-4 border-violet-500/30 rounded-full flex items-center justify-center text-5xl relative animate-float shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <span>👨‍🚀</span>
            {equippedAccessory === 'wizard_hat' && (
              <>
                <span className="absolute -top-5 -right-3 text-4xl animate-bounce">🧙</span>
                <span className="absolute -top-8 left-0 text-lg animate-spin text-amber-300">✨</span>
              </>
            )}
            {equippedAccessory === 'dragon_wings' && (
              <>
                <span className="absolute -bottom-1 -left-4 text-5xl animate-pulse">🐉</span>
                <span className="absolute -bottom-4 -right-1 text-xl animate-bounce">🔥</span>
              </>
            )}
            {equippedAccessory === 'telescope' && (
              <>
                <span className="absolute -bottom-2 -right-4 text-4xl">🔭</span>
                <div className="absolute inset-0 border border-dashed border-cyan-500/40 rounded-full animate-[spin_10s_linear_infinite]" />
              </>
            )}
            {equippedAccessory === 'energy_shield' && (
              <>
                <span className="absolute -top-3 -left-3 text-4xl animate-pulse">🛡️</span>
                <div className="absolute inset-[-10px] border-[2px] border-amber-500/40 rounded-full animate-ping opacity-50" />
              </>
            )}
          </div>
          
          {/* Encouragement Speech Bubble */}
          <div className="absolute -top-12 -right-24 bg-white px-3 py-2 rounded-2xl rounded-bl-none shadow-lg border border-violet-100 animate-bounce">
            <p className="text-xs font-black text-violet-600">Cố lên bé ơi! 💪</p>
          </div>
        </div>
      </div>
    </div>
  );
}
