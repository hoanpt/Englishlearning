import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface VocabItem {
  word: string;
  meaning: string;
  phonetic: string;
}

interface RevisionUnit {
  unit_id: number;
  unit_title: string;
  vocabulary: VocabItem[];
  grammar: { structure: string; examples: string[] };
  dialogue: {
    title: string;
    lines: { speaker: string; text: string; missingWord: string; choices: string[] }[];
  };
}

interface RevisionTestProps {
  revisionNumber: number; // 1, 2, 3...
  beltName: string;
  units: RevisionUnit[]; // The 4 units this revision covers
  onPass: (score: number) => void;
  onClose: () => void;
}

type QuestionType = 'vocab_mc' | 'grammar_mc' | 'dialogue_fill' | 'vocab_translate';

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options: string[];
  correct: string;
  unitId: number;
  unitTitle: string;
  hint?: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(units: RevisionUnit[]): Question[] {
  const questions: Question[] = [];
  let id = 1;

  units.forEach(unit => {
    const vocab = unit.vocabulary;
    const allMeanings = units.flatMap(u => u.vocabulary.map(v => v.meaning));
    const allWords = units.flatMap(u => u.vocabulary.map(v => v.word));

    // 3 vocab MC per unit (EN → VN)
    const selectedVocab = shuffle(vocab).slice(0, 3);
    selectedVocab.forEach(v => {
      const wrongMeanings = shuffle(allMeanings.filter(m => m !== v.meaning)).slice(0, 3);
      questions.push({
        id: id++,
        type: 'vocab_mc',
        question: v.word,
        options: shuffle([v.meaning, ...wrongMeanings]),
        correct: v.meaning,
        unitId: unit.unit_id,
        unitTitle: unit.unit_title,
        hint: v.phonetic,
      });
    });

    // 2 vocab MC per unit (VN → EN)
    const selectedVocab2 = shuffle(vocab).slice(0, 2);
    selectedVocab2.forEach(v => {
      const wrongWords = shuffle(allWords.filter(w => w !== v.word)).slice(0, 3);
      questions.push({
        id: id++,
        type: 'vocab_translate',
        question: v.meaning,
        options: shuffle([v.word, ...wrongWords]),
        correct: v.word,
        unitId: unit.unit_id,
        unitTitle: unit.unit_title,
      });
    });

    // 2 grammar examples per unit
    const examples = shuffle(unit.grammar.examples).slice(0, 2);
    examples.forEach(ex => {
      // Find a word to blank out
      const words = ex.split(' ').filter(w => w.length > 3);
      if (words.length === 0) return;
      const targetWord = words[Math.floor(Math.random() * words.length)].replace(/[.,!?]/g, '');
      const blanked = ex.replace(targetWord, '___');
      const wrongOptions = shuffle(
        units.flatMap(u => u.vocabulary.map(v => v.word)).filter(w => w.toLowerCase() !== targetWord.toLowerCase())
      ).slice(0, 3);
      questions.push({
        id: id++,
        type: 'grammar_mc',
        question: blanked,
        options: shuffle([targetWord, ...wrongOptions]),
        correct: targetWord,
        unitId: unit.unit_id,
        unitTitle: unit.unit_title,
        hint: unit.grammar.structure,
      });
    });

    // 1 dialogue fill per unit
    const dialogueLine = shuffle(unit.dialogue.lines.filter(l => l.missingWord && l.choices?.length > 0))[0];
    if (dialogueLine) {
      questions.push({
        id: id++,
        type: 'dialogue_fill',
        question: dialogueLine.text,
        options: dialogueLine.choices,
        correct: dialogueLine.missingWord,
        unitId: unit.unit_id,
        unitTitle: unit.unit_title,
        hint: `Hội thoại: ${unit.dialogue.title}`,
      });
    }
  });

  return shuffle(questions).slice(0, 30); // max 30 questions
}

const TYPE_LABELS: Record<QuestionType, string> = {
  vocab_mc: '🎴 Từ Vựng',
  vocab_translate: '🔄 Dịch Nghĩa',
  grammar_mc: '🧩 Ngữ Pháp',
  dialogue_fill: '💬 Hội Thoại',
};

const TYPE_COLORS: Record<QuestionType, string> = {
  vocab_mc: 'bg-violet-100 text-violet-700 border-violet-200',
  vocab_translate: 'bg-sky-100 text-sky-700 border-sky-200',
  grammar_mc: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  dialogue_fill: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function RevisionTest({ revisionNumber, beltName, units, onPass, onClose }: RevisionTestProps) {
  const [questions] = useState<Question[]>(() => buildQuestions(units));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; selected: string; question: Question }[]>([]);

  const PASS_SCORE = 70;
  const current = questions[currentIdx];

  const handleSelect = useCallback((option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === current.correct;
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > maxStreak) setMaxStreak(newStreak);
    if (isCorrect) setCorrectCount(c => c + 1);

    setAnswers(prev => [...prev, { correct: isCorrect, selected: option, question: current }]);

    if (isCorrect) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 }, colors: ['#7C3AED', '#10B981', '#F59E0B'] });
    }

    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        setShowResult(true);
      } else {
        setCurrentIdx(i => i + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }, 1200);
  }, [isAnswered, current, streak, maxStreak, currentIdx, questions.length]);

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= PASS_SCORE;

  const handleFinish = () => {
    if (passed) {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
      onPass(score);
    } else {
      onClose();
    }
  };

  if (showResult) {
    const resultConfig = passed
      ? { emoji: '🏆', label: 'Xuất Sắc! Qua Ải!', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' }
      : score >= 50
      ? { emoji: '😊', label: 'Gần rồi! Cố thêm nhé!', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' }
      : { emoji: '💪', label: 'Ôn lại rồi thử lại nhé!', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };

    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden animate-bounce-in">
          {/* Header */}
          <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}>
            <p className="text-purple-200 text-sm font-bold mb-1">REVISION {revisionNumber} · {beltName}</p>
            <h2 className="text-white font-black text-2xl">Kết Quả Kiểm Tra</h2>
          </div>

          <div className="p-8">
            {/* Score circle */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-36 h-36 mb-4">
                <svg className="w-36 h-36" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#F3F4F6" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={passed ? '#10B981' : '#EF4444'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - score / 100)}`}
                    className="progress-ring-circle"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: passed ? '#10B981' : '#EF4444' }}>{score}%</span>
                  <span className="text-xs text-gray-400 font-bold">Điểm số</span>
                </div>
              </div>
              <p className="text-4xl mb-2">{resultConfig.emoji}</p>
              <h3 className={`text-2xl font-black ${resultConfig.color}`}>{resultConfig.label}</h3>
              <p className="text-gray-500 font-semibold mt-1">
                Đúng {correctCount}/{questions.length} câu
                {maxStreak >= 3 && <span className="ml-2 text-orange-500">🔥 Chuỗi dài nhất: {maxStreak}</span>}
              </p>
            </div>

            {/* Pass/Fail Banner */}
            <div className={`rounded-2xl border-2 p-4 mb-6 text-center ${resultConfig.bg}`}>
              {passed ? (
                <p className="font-black text-emerald-700">
                  🎉 Bạn đã vượt qua ngưỡng {PASS_SCORE}%! Dải hành tinh tiếp theo đã được mở khóa!
                </p>
              ) : (
                <p className="font-black text-rose-700">
                  📖 Cần đạt {PASS_SCORE}% để vượt ải. Hãy ôn lại Unit {units[0].unit_id}–{units[units.length - 1].unit_id} rồi thử lại!
                </p>
              )}
            </div>

            {/* Review wrong answers */}
            {answers.filter(a => !a.correct).length > 0 && (
              <div className="mb-6">
                <p className="font-black text-gray-600 text-sm mb-3">📋 Những câu cần ôn lại:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {answers.filter(a => !a.correct).map((a, i) => (
                    <div key={i} className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-2 flex items-start gap-3">
                      <span className="text-rose-500 font-black mt-0.5">✗</span>
                      <div>
                        <p className="text-gray-700 font-bold text-sm">{a.question.question}</p>
                        <p className="text-emerald-600 font-black text-sm">→ {a.question.correct}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[a.question.type]}`}>
                          {TYPE_LABELS[a.question.type]} · Unit {a.question.unitId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleFinish}
              className="w-full py-4 font-black text-white rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-98"
              style={{ background: passed ? 'linear-gradient(135deg, #10B981, #0891B2)' : 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
            >
              {passed ? '🚀 Tiến Lên Dải Tiếp Theo!' : '🔄 Ôn Lại & Thử Lại'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  const progressPct = (currentIdx / questions.length) * 100;

  const getOptionClass = (option: string) => {
    if (!isAnswered) return 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-400 hover:shadow-md hover:scale-[1.01] cursor-pointer';
    if (option === current.correct) return 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800 font-black scale-[1.01]';
    if (option === selectedAnswer && option !== current.correct) return 'bg-rose-50 border-2 border-rose-400 text-rose-700 animate-shake';
    return 'bg-gray-50 border-2 border-gray-100 text-gray-400 cursor-not-allowed';
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-bold transition-colors"
        >
          ← Trở về
        </button>
        <div className="flex-1 mx-2 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #7C3AED, #2563EB)' }}
          />
        </div>
        <span className="text-sm font-black text-gray-600 flex-shrink-0">{currentIdx + 1}/{questions.length}</span>
        {streak >= 2 && (
          <span className="text-sm font-black text-orange-500 flex-shrink-0 animate-pop">🔥 {streak}</span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl animate-slide-up">
          {/* Revision Badge */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="revision-badge">Revision {revisionNumber}</span>
            <span className="text-gray-400 text-sm font-bold">{beltName}</span>
          </div>

          {/* Question Type Tag */}
          <div className="flex justify-center mb-4">
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${TYPE_COLORS[current.type]}`}>
              {TYPE_LABELS[current.type]}
              <span className="ml-2 text-opacity-60">Unit {current.unitId}</span>
            </span>
          </div>

          {/* Question Card */}
          <div
            className="rounded-3xl p-8 mb-6 text-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}
          >
            {current.type === 'vocab_mc' && (
              <p className="text-purple-200 text-xs font-bold mb-2 uppercase tracking-widest">🇬🇧 Từ này có nghĩa là gì?</p>
            )}
            {current.type === 'vocab_translate' && (
              <p className="text-purple-200 text-xs font-bold mb-2 uppercase tracking-widest">🇻🇳 Tiếng Anh của từ này là?</p>
            )}
            {current.type === 'grammar_mc' && (
              <p className="text-purple-200 text-xs font-bold mb-2 uppercase tracking-widest">✏️ Điền từ thích hợp vào chỗ trống</p>
            )}
            {current.type === 'dialogue_fill' && (
              <p className="text-purple-200 text-xs font-bold mb-2 uppercase tracking-widest">💬 Hoàn thành câu hội thoại</p>
            )}
            <p className={`text-white font-black drop-shadow ${current.question.length > 40 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'}`}>
              {current.question}
            </p>
            {current.hint && current.type === 'vocab_mc' && (
              <p className="text-purple-200 text-lg font-bold mt-3 opacity-80">{current.hint}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {current.options.map((option, idx) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-left transition-all duration-150 ${getOptionClass(option)}`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  isAnswered && option === current.correct ? 'bg-emerald-500 text-white'
                  : isAnswered && option === selectedAnswer && option !== current.correct ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                <span className="text-sm leading-snug">{option}</span>
              </button>
            ))}
          </div>

          {/* Correct answer reveal */}
          {isAnswered && selectedAnswer !== current.correct && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 animate-slide-up">
              <p className="text-emerald-700 font-black text-sm">
                ✅ Đáp án đúng: <span className="text-emerald-900">{current.correct}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
