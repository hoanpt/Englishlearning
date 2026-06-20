import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface VocabItem {
  word: string;
  meaning: string;
  phonetic: string;
}

interface Props {
  vocabulary: VocabItem[];
  onComplete?: (score: number) => void;
}

function speakText(text: string, rate = 0.78) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.replace(/\//g, ' ').trim());
  utt.lang = 'en-US';
  utt.rate = rate;
  utt.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.lang.startsWith('en') && /female|zira|samantha|karen/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en'));
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// ═══════════ FLASHCARD MODE ═══════════
function FlashcardMode({ vocabulary, onAllSeen }: { vocabulary: VocabItem[]; onAllSeen: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [remembered, setRemembered] = useState<Set<number>>(new Set());
  const [confettiStars, setConfettiStars] = useState<{ id: number; x: number; y: number; e: string }[]>([]);

  const current = vocabulary[idx];

  const flip = () => {
    if (!flipped) {
      // Spawn stars
      setConfettiStars(Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i, x: 30 + Math.random() * 40, y: 20 + Math.random() * 60, e: ['⭐','✨','🌟','💫'][Math.floor(Math.random() * 4)]
      })));
      setTimeout(() => setConfettiStars([]), 1200);
    }
    setFlipped(f => !f);
  };

  const go = (dir: 1 | -1, mark?: boolean) => {
    if (mark !== undefined) {
      setRemembered(prev => { const s = new Set(prev); if (mark) s.add(idx); else s.delete(idx); return s; });
      speakText(current.word);
    }
    setFlipped(false);
    setTimeout(() => {
      const next = (idx + dir + vocabulary.length) % vocabulary.length;
      setIdx(next);
    }, 150);
  };

  const progress = ((idx + 1) / vocabulary.length) * 100;

  return (
    <div className="flex flex-col items-center gap-5 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-1.5">
          <span>Từ {idx + 1} / {vocabulary.length}</span>
          <span className="text-emerald-600">✅ Đã nhớ: {remembered.size} từ</span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flashcard-scene w-full" style={{ height: '300px' }} onClick={flip}>
        <div className={`flashcard-card relative ${flipped ? 'is-flipped' : ''}`}>
          {confettiStars.map(s => (
            <span key={s.id} className="confetti-star" style={{ left: `${s.x}%`, top: `${s.y}%` }}>{s.e}</span>
          ))}
          {/* Front */}
          <div
            className="flashcard-front flex flex-col items-center justify-center py-6 px-4 cursor-pointer select-none"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 60%, #2563EB 100%)', boxShadow: '0 20px 60px rgba(124,58,237,0.4)' }}
          >
            <p className="text-white/60 text-xs font-bold mb-4 uppercase tracking-widest">👆 Nhấn để lật thẻ</p>
            <p className="text-white font-black text-5xl md:text-6xl drop-shadow-lg text-center leading-none capitalize">{current.word}</p>
            <p className="text-purple-200 text-lg font-bold mt-4">{current.phonetic}</p>
            <button
              onClick={e => { e.stopPropagation(); speakText(current.word); }}
              className="mt-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-1.5 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 border border-white/10"
            >🔊 Nghe phát âm</button>
          </div>

          {/* Back */}
          <div
            className="flashcard-back flex flex-col items-center justify-center py-6 px-4 cursor-pointer select-none"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 60%, #EC4899 100%)', boxShadow: '0 20px 60px rgba(239,68,68,0.4)' }}
          >
            <p className="text-yellow-100/70 text-xs font-bold mb-2 uppercase tracking-widest">🇻🇳 Nghĩa tiếng Việt</p>
            <p className="text-white font-black text-3xl md:text-4xl text-center px-6 drop-shadow capitalize">{current.meaning}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="bg-white/20 rounded-2xl px-4 py-1.5">
                <p className="text-white/90 text-sm font-bold">🗣️ {current.phonetic}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); speakText(current.word); }} className="bg-white/25 hover:bg-white/35 text-white rounded-2xl p-2 flex items-center justify-center transition-all active:scale-90 border border-white/10">🔊</button>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={() => go(-1, false)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-100 text-rose-600 font-black text-lg hover:bg-rose-200 active:scale-95 transition-all border-2 border-rose-200"
        >😅 Chưa nhớ</button>
        <button
          onClick={() => go(1, true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-100 text-emerald-600 font-black text-lg hover:bg-emerald-200 active:scale-95 transition-all border-2 border-emerald-200"
        >🎉 Đã nhớ!</button>
      </div>

      {/* Nav dots */}
      <div className="flex items-center gap-3">
        <button onClick={() => go(-1)} className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 text-xl font-black hover:border-violet-400 hover:text-violet-600 hover:scale-110 active:scale-95 transition-all shadow-sm">‹</button>
        <div className="flex gap-1.5">
          {vocabulary.slice(Math.max(0, idx - 3), Math.min(vocabulary.length, idx + 4)).map((_, i) => {
            const r = Math.max(0, idx - 3) + i;
            return (
              <button key={r} onClick={() => { setFlipped(false); setTimeout(() => setIdx(r), 150); }}
                className={`rounded-full transition-all duration-200 ${r === idx ? 'w-6 h-3 bg-violet-600' : remembered.has(r) ? 'w-3 h-3 bg-emerald-400' : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'}`}
              />
            );
          })}
        </div>
        <button onClick={() => go(1)} className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 text-xl font-black hover:border-violet-400 hover:text-violet-600 hover:scale-110 active:scale-95 transition-all shadow-sm">›</button>
      </div>

      {/* Word list */}
      <div className="w-full bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="font-black text-gray-600 text-sm">📋 Tất cả từ vựng ({vocabulary.length} từ)</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 max-h-48 overflow-y-auto">
          {vocabulary.map((v, i) => (
            <button key={i} onClick={() => { setFlipped(false); setTimeout(() => setIdx(i), 150); }}
              className={`text-left px-3 py-2 rounded-xl transition-all duration-150 ${i === idx ? 'bg-violet-100 border-2 border-violet-400' : remembered.has(i) ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'}`}
            >
              <span className={`font-black text-sm ${i === idx ? 'text-violet-700' : remembered.has(i) ? 'text-emerald-700' : 'text-gray-700'}`}>
                {remembered.has(i) ? '✅ ' : ''}{v.word}
              </span>
              <p className="text-xs text-gray-400 font-semibold truncate">{v.meaning}</p>
            </button>
          ))}
        </div>
      </div>

      {remembered.size >= Math.ceil(vocabulary.length * 0.6) && (
        <button onClick={onAllSeen}
          className="w-full py-4 text-white font-black rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-98 shadow-lg animate-bounce-in"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
        >
          ✅ Hoàn thành học thẻ! →
        </button>
      )}
    </div>
  );
}

// ═══════════ MATCHING GAME ═══════════
function MatchingGame({ vocabulary, onComplete }: { vocabulary: VocabItem[]; onComplete: () => void }) {
  const [wordItems, setWordItems] = useState<{ id: number; text: string; wordIdx: number }[]>([]);
  const [meaningItems, setMeaningItems] = useState<{ id: number; text: string; wordIdx: number }[]>([]);
  const [selected, setSelected] = useState<{ side: 'left' | 'right'; id: number } | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finished, setFinished] = useState(false);

  const POOL = 6;

  const init = useCallback(() => {
    const pool = shuffle(vocabulary).slice(0, POOL);
    setWordItems(shuffle(pool.map((v, i) => ({ id: i, text: v.word, wordIdx: i }))));
    setMeaningItems(shuffle(pool.map((v, i) => ({ id: i + POOL, text: v.meaning, wordIdx: i }))));
    setSelected(null);
    setMatched(new Set());
    setWrong([]);
    setScore(0);
    setErrors(0);
    setFinished(false);
  }, [vocabulary]);

  useEffect(() => { init(); }, [init]);

  const handleClick = (side: 'left' | 'right', id: number, wordIdx: number) => {
    if (matched.has(wordIdx)) return;
    if (wrong.includes(id)) return;

    if (!selected || selected.side === side) {
      setSelected({ side, id });
      return;
    }

    // Get the other item's wordIdx
    const otherItems = side === 'right' ? wordItems : meaningItems;
    const otherItem = otherItems.find(i => i.id === selected.id);
    if (!otherItem) { setSelected({ side, id }); return; }

    if (otherItem.wordIdx === wordIdx) {
      // MATCH
      const newMatched = new Set(matched).add(wordIdx);
      setMatched(newMatched);
      setScore(s => s + 10);
      speakText(wordItems.find(w => w.wordIdx === wordIdx)?.text || '');
      setSelected(null);
      if (newMatched.size === POOL) {
        setFinished(true);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#7C3AED', '#10B981', '#F59E0B'] });
      }
    } else {
      // WRONG
      setErrors(e => e + 1);
      setWrong([selected.id, id]);
      setTimeout(() => { setWrong([]); setSelected(null); }, 700);
    }
  };

  const getClass = (id: number, wordIdx: number) => {
    if (matched.has(wordIdx)) return 'bg-emerald-100 border-2 border-emerald-400 text-emerald-700 opacity-70 cursor-default';
    if (wrong.includes(id)) return 'bg-rose-100 border-2 border-rose-500 text-rose-700 animate-shake';
    if (selected?.id === id) return 'bg-amber-100 border-2 border-amber-500 text-amber-800 scale-[1.02] shadow-md shadow-amber-200';
    return 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-400 hover:shadow-md hover:scale-[1.02] cursor-pointer';
  };

  if (finished) return (
    <div className="text-center py-12 animate-bounce-in">
      <p className="text-6xl mb-3 animate-float">🏆</p>
      <p className="text-3xl font-black text-amber-600 mb-2">Xuất sắc!</p>
      <p className="text-gray-500 font-bold mb-6">Đã nối đúng {POOL} cặp! {errors === 0 ? 'Không sai lần nào! 🎉' : `Sai ${errors} lần.`}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={init} className="px-6 py-3 bg-amber-100 text-amber-700 border-2 border-amber-300 font-black rounded-2xl hover:bg-amber-200 active:scale-95 transition-all">🔄 Chơi lại</button>
        <button onClick={onComplete} className="px-6 py-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-98" style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>Tiếp tục →</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 bg-white rounded-2xl border-2 border-emerald-200 px-4 py-2.5 flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <div><p className="text-xs text-gray-500 font-bold">Điểm số</p><p className="text-xl font-black text-emerald-600">{score}</p></div>
        </div>
        <div className="flex-1 bg-white rounded-2xl border-2 border-rose-200 px-4 py-2.5 flex items-center gap-2">
          <span className="text-xl">💔</span>
          <div><p className="text-xs text-gray-500 font-bold">Sai</p><p className="text-xl font-black text-rose-500">{errors}</p></div>
        </div>
        <button onClick={init} className="bg-amber-100 border-2 border-amber-300 text-amber-700 font-black px-4 py-2.5 rounded-2xl hover:bg-amber-200 active:scale-95 transition-all">🔄</button>
      </div>
      <p className="text-center text-gray-500 font-bold text-sm mb-4">🔗 Nhấn một từ tiếng Anh rồi nhấn nghĩa tiếng Việt tương ứng · Đã nối: {matched.size}/{POOL}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <p className="text-center font-black text-gray-500 text-sm uppercase tracking-wide">🇬🇧 Tiếng Anh</p>
          {wordItems.map(item => (
            <button key={item.id} onClick={() => handleClick('left', item.id, item.wordIdx)}
              className={`px-4 py-4 rounded-2xl font-black text-lg text-center transition-all duration-150 ${getClass(item.id, item.wordIdx)}`}
            >
              {matched.has(item.wordIdx) ? '✅ ' : ''}{item.text}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-center font-black text-gray-500 text-sm uppercase tracking-wide">🇻🇳 Tiếng Việt</p>
          {meaningItems.map(item => (
            <button key={item.id} onClick={() => handleClick('right', item.id, item.wordIdx)}
              className={`px-4 py-4 rounded-2xl font-bold text-base text-center transition-all duration-150 ${getClass(item.id, item.wordIdx)}`}
            >
              {matched.has(item.wordIdx) ? '✅ ' : ''}{item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════ MAIN EXPORTS ═══════════
export function FlashcardTab({ vocabulary, onComplete }: Props) {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-3 select-none pb-8">
      <FlashcardMode
        vocabulary={vocabulary}
        onAllSeen={() => { if (onComplete) onComplete(100); }}
      />
    </div>
  );
}

export function MatchingGameTab({ vocabulary, onComplete }: Props) {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-3 select-none pb-8">
      <MatchingGame
        vocabulary={vocabulary}
        onComplete={() => { if (onComplete) onComplete(100); }}
      />
    </div>
  );
}
