import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface VocabItem { word: string; meaning: string; phonetic: string; }
interface DialogueLine { speaker: string; text: string; missingWord: string; choices: string[]; }
interface GrammarData { structure: string; examples: string[]; }

interface Props {
  grammar: GrammarData;
  vocabulary: VocabItem[];
  dialogue: { title: string; lines: DialogueLine[] };
  onComplete?: (score: number) => void;
}

interface Sentence {
  id: number;
  words: string[];
  hint: string; // Vietnamese hint
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function speakText(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.trim());
  utt.lang = 'en-US'; utt.rate = 0.78; utt.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.lang.startsWith('en') && /female|zira|samantha|karen/i.test(v.name)) || voices.find(v => v.lang.startsWith('en'));
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
}

/** Build sentences from grammar examples + dialogue */
function buildSentences(grammar: GrammarData, dialogue: { lines: DialogueLine[] }, vocab: VocabItem[]): Sentence[] {
  const sentences: Sentence[] = [];

  // From grammar examples
  grammar.examples.forEach((ex, i) => {
    const words = ex.split(' ').filter(w => w.trim());
    if (words.length >= 3) {
      sentences.push({ id: i + 1, words, hint: ex });
    }
  });

  // From dialogue lines (complete sentences)
  dialogue.lines.forEach((line, i) => {
    const full = line.text.replace('_____', line.missingWord);
    const words = full.split(' ').filter(w => w.trim());
    if (words.length >= 3 && words.length <= 10) {
      sentences.push({ id: 100 + i, words, hint: `${line.speaker}: ${full}` });
    }
  });

  // From vocab in sentences
  vocab.slice(0, 5).forEach((v, i) => {
    const template = `I can ${v.word} very well.`;
    sentences.push({
      id: 200 + i,
      words: template.split(' '),
      hint: `Tôi có thể ${v.meaning} rất giỏi.`,
    });
  });

  return sentences.slice(0, 15);
}

export default function SentenceBuilderTab({ grammar, vocabulary, dialogue, onComplete }: Props) {
  const [sentences] = useState<Sentence[]>(() => buildSentences(grammar, dialogue, vocabulary));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [wordBank, setWordBank] = useState<{ word: string; id: number; used: boolean }[]>([]);
  const [answer, setAnswer] = useState<{ word: string; id: number }[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  const current = sentences[currentIdx];

  const initRound = useCallback(() => {
    if (!current) return;
    const shuffled = shuffle(current.words).map((w, i) => ({ word: w, id: i, used: false }));
    setWordBank(shuffled);
    setAnswer([]);
    setStatus('idle');
    setShowHint(false);
  }, [current]);

  useEffect(() => { initRound(); }, [initRound]);

  const addWord = (item: { word: string; id: number }) => {
    if (status !== 'idle') return;
    setWordBank(prev => prev.map(w => w.id === item.id ? { ...w, used: true } : w));
    setAnswer(prev => [...prev, { word: item.word, id: item.id }]);
  };

  const removeWord = (item: { word: string; id: number }) => {
    if (status !== 'idle') return;
    setWordBank(prev => prev.map(w => w.id === item.id ? { ...w, used: false } : w));
    setAnswer(prev => prev.filter(w => w.id !== item.id));
  };

  const check = () => {
    const userSentence = answer.map(a => a.word).join(' ').trim();
    const correctSentence = current.words.join(' ').trim();
    const isCorrect = userSentence.toLowerCase().replace(/[.,!?]/g, '') === correctSentence.toLowerCase().replace(/[.,!?]/g, '');

    if (isCorrect) {
      setStatus('correct');
      setScore(s => s + 1);
      setCompletedIds(prev => new Set(prev).add(currentIdx));
      speakText(correctSentence);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ['#7C3AED', '#10B981', '#F59E0B'] });
    } else {
      setStatus('wrong');
    }
  };

  const next = () => {
    if (currentIdx + 1 >= sentences.length) {
      if (onComplete) onComplete(Math.round((completedIds.size / sentences.length) * 100));
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  if (!current) return null;

  const allDone = completedIds.size >= Math.ceil(sentences.length * 0.7);

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full select-none pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white border-2 border-violet-100 rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div><p className="text-xs text-gray-400 font-bold">Điểm số</p><p className="font-black text-violet-700 text-xl">{score}</p></div>
          </div>
          <div className="flex-1 bg-white border-2 border-violet-100 rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <div><p className="text-xs text-gray-400 font-bold">Hoàn thành</p><p className="font-black text-emerald-600 text-xl">{completedIds.size}/{sentences.length}</p></div>
          </div>
        </div>
        <button onClick={initRound} className="bg-amber-100 border-2 border-amber-300 text-amber-700 font-black px-4 py-3 rounded-2xl hover:bg-amber-200 active:scale-95 transition-all">🔄 Thử lại</button>
      </div>

      {/* Progress */}
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
          style={{ width: `${(currentIdx / sentences.length) * 100}%` }} />
      </div>

      {/* Sentence counter */}
      <p className="text-center text-gray-500 font-bold text-sm">Câu {currentIdx + 1} / {sentences.length}</p>

      {/* Hint */}
      <div className="rounded-2xl p-4 text-center bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-100 min-h-[96px] flex flex-col items-center justify-center">
        {!showHint ? (
          <button onClick={() => setShowHint(true)} className="px-5 py-2.5 bg-white text-violet-600 border-2 border-violet-200 rounded-xl font-black text-sm hover:bg-violet-100 active:scale-95 transition-all">
            💡 Xem gợi ý nghĩa Tiếng Việt
          </button>
        ) : (
          <div className="animate-bounce-in">
            <p className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">💡 Gợi ý nghĩa:</p>
            <p className="text-gray-700 font-black text-base">{current.hint}</p>
            {status === 'correct' && (
              <button
                onClick={() => speakText(current.words.join(' '))}
                className="mt-2 text-violet-500 hover:text-violet-700 text-xs font-black bg-violet-100 px-3 py-1 rounded-full transition-all"
              >🔊 Nghe lại câu hoàn chỉnh</button>
            )}
          </div>
        )}
      </div>

      {/* Answer box */}
      <div className={`min-h-[80px] bg-white rounded-2xl border-2 p-4 flex flex-wrap gap-2 items-start transition-all ${
        status === 'correct' ? 'border-emerald-400 bg-emerald-50'
        : status === 'wrong' ? 'border-rose-400 bg-rose-50 animate-shake'
        : 'border-dashed border-gray-300'
      }`}>
        {answer.length === 0 && (
          <p className="text-gray-400 font-bold text-sm w-full text-center py-2">Chọn các từ bên dưới để xây câu...</p>
        )}
        {answer.map((item, i) => (
          <button
            key={`${item.id}-${i}`}
            onClick={() => removeWord(item)}
            className={`px-4 py-2 rounded-xl font-black text-sm transition-all active:scale-95 ${
              status === 'correct' ? 'bg-emerald-200 text-emerald-800 cursor-default'
              : status === 'wrong' ? 'bg-rose-200 text-rose-800'
              : 'bg-violet-100 text-violet-800 hover:bg-violet-200 cursor-pointer border-2 border-violet-200 hover:border-violet-400'
            }`}
          >
            {item.word}
            {status === 'idle' && <span className="ml-1 text-violet-400 text-xs">×</span>}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {status === 'correct' && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center animate-bounce-in">
          <p className="text-3xl mb-1">🎉</p>
          <p className="text-emerald-700 font-black">Chính xác! +1 điểm</p>
          <p className="text-emerald-600 font-bold text-sm mt-1">{current.words.join(' ')}</p>
        </div>
      )}
      {status === 'wrong' && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-center">
          <p className="text-rose-600 font-black">😅 Chưa đúng! Thứ tự các từ cần sắp xếp lại.</p>
          <p className="text-gray-500 font-bold text-xs mt-1">Hãy thử xóa vài từ và xếp lại nhé!</p>
        </div>
      )}

      {/* Word Bank */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
        <p className="text-gray-400 font-black text-xs uppercase tracking-wider mb-3 text-center">🔤 Kho từ — chọn theo thứ tự đúng</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {wordBank.map(item => (
            <button
              key={item.id}
              onClick={() => !item.used && addWord(item)}
              disabled={item.used || status !== 'idle'}
              className={`px-4 py-2.5 rounded-2xl font-black text-sm transition-all duration-150 ${
                item.used
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-2 border-transparent'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-400 hover:shadow-md hover:scale-[1.03] active:scale-95 cursor-pointer'
              }`}
            >
              {item.word}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {status === 'idle' ? (
          <button
            onClick={check}
            disabled={answer.length === 0}
            className={`flex-1 py-4 font-black rounded-2xl text-base transition-all ${
              answer.length > 0
                ? 'text-white hover:scale-[1.02] active:scale-98 shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            style={answer.length > 0 ? { background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' } : {}}
          >🔍 Kiểm tra câu</button>
        ) : (
          <button
            onClick={() => { if (status === 'wrong') initRound(); else next(); }}
            className="flex-1 py-4 text-white font-black rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-98 shadow-lg"
            style={{ background: status === 'correct' ? 'linear-gradient(135deg, #10B981, #0891B2)' : 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
          >
            {status === 'correct'
              ? (currentIdx + 1 >= sentences.length ? '🏆 Hoàn thành tất cả!' : '▶ Câu tiếp theo')
              : '🔄 Xây lại câu'}
          </button>
        )}
      </div>

      {allDone && onComplete && (
        <button
          onClick={() => onComplete(Math.round((completedIds.size / sentences.length) * 100))}
          className="w-full py-4 text-white font-black rounded-2xl text-base transition-all hover:scale-[1.02] animate-bounce-in shadow-lg"
          style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}
        >✅ Hoàn thành Xây Câu! →</button>
      )}
    </div>
  );
}
