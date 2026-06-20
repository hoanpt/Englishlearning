import { X, Sparkles, BookOpen, Star } from 'lucide-react';

interface VocabItem {
  word: string;
  meaning: string;
  phonetic: string;
}

interface UnitData {
  unit_id: number;
  unit_title: string;
  grammar: {
    structure: string;
    examples: string[];
  };
  vocabulary: VocabItem[];
}

interface MissionModalProps {
  unit: UnitData;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  isCompleted: boolean;
  onStartMission: () => void;
}

export default function MissionModal({
  unit,
  isOpen,
  onClose,
  isUnlocked,
  isCompleted,
  onStartMission,
}: MissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl border border-indigo-500/40 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/40 text-purple-300">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-widest">
                Hành tinh số {unit.unit_id}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight line-clamp-1">{unit.unit_title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Grammar Section */}
          <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-2xl p-4 sm:p-5">
            <h3 className="font-extrabold text-sm sm:text-base text-cyan-300 flex items-center gap-2 mb-3">
              <BookOpen size={16} /> Bí kíp thám hiểm (Grammar Cheat)
            </h3>
            
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cấu trúc chính</p>
                <div className="bg-indigo-900/60 border border-indigo-500/30 rounded-lg p-3 text-xs font-semibold text-slate-200">
                  {unit.grammar.structure}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mẫu câu ví dụ</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 font-medium">
                  {unit.grammar.examples.map((example, i) => (
                    <li key={i} className="italic">"{example}"</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Vocabulary Section */}
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-pink-400 flex items-center gap-2 mb-3">
              <span>🎒</span> Từ vựng thám hiểm
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {unit.vocabulary.map((vocab, i) => (
                <div key={i} className="bg-slate-800/40 border border-slate-700/50 hover:border-pink-500/30 rounded-2xl p-4 transition-all hover:scale-[1.01]">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="font-extrabold text-white text-base sm:text-lg tracking-tight capitalize">{vocab.word}</span>
                  </div>
                  <p className="text-xs font-extrabold text-pink-300 mb-1">{vocab.meaning}</p>
                  <p className="text-[11px] font-bold text-slate-400">{vocab.phonetic}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-indigo-500/20 bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-semibold">
            {isCompleted ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>✓</span> Đã thám hiểm thành công!
              </span>
            ) : isUnlocked ? (
              <span className="text-cyan-400">Đã mở khóa nhiệm vụ!</span>
            ) : (
              <span className="text-rose-400">🔒 Hãy hoàn thành các hành tinh trước</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
            >
              Hủy
            </button>
            {isUnlocked && (
              <button
                onClick={onStartMission}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-1"
              >
                <Star size={16} fill="currentColor" /> Bắt đầu nhiệm vụ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
