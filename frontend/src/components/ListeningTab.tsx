import { useState, useEffect, useRef, useCallback } from 'react';

interface VocabItem { word: string; meaning: string; phonetic: string; }
interface StoryQuestion { question: string; options: string[]; answer: string; }
interface Story { title: string; text: string; questions: StoryQuestion[]; }
interface DialogueLine { speaker: string; text: string; missingWord: string; choices: string[]; }
interface Dialogue { title: string; lines: DialogueLine[]; }

interface Props {
  vocabulary: VocabItem[];
  story?: Story;
  dialogue: Dialogue;
  grammar: { structure: string; examples: string[] };
  onComplete?: (score: number) => void;
}

interface Passage {
  id: number;
  emoji: string;
  title: string;
  sentences: string[];
  questions: { id: number; type: 'mc' | 'tf'; question: string; options?: string[]; correct: string | boolean }[];
}

function speakText(text: string, rate = 0.75, onEnd?: () => void) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.trim());
  utt.lang = 'en-US'; utt.rate = rate; utt.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.lang.startsWith('en') && /female|zira|samantha|karen/i.test(v.name)) || voices.find(v => v.lang.startsWith('en'));
  if (v) utt.voice = v;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}

/** Split a story text into sentences */
function toSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) ?? [text];
}

/** Build 3 passages from unit data */
function buildPassages(story: Story | undefined, dialogue: Dialogue, grammar: { examples: string[] }, vocab: VocabItem[]): Passage[] {
  const passages: Passage[] = [];

  // Passage 1: Story reading
  if (story) {
    passages.push({
      id: 1,
      emoji: '📖',
      title: story.title,
      sentences: toSentences(story.text),
      questions: story.questions.map((q, i) => ({
        id: i + 1, type: 'mc',
        question: q.question,
        options: q.options,
        correct: q.answer,
      })),
    });
  } else {
    // Fallback: make from grammar examples
    const sentences = grammar.examples;
    passages.push({
      id: 1, emoji: '📖', title: 'Grammar in Context',
      sentences,
      questions: sentences.map((s, i) => {
        return { id: i + 1, type: 'tf' as 'tf', question: s, correct: true };
      }),
    });
  }

  // Passage 2: Dialogue as listening
  const dialogueSentences = dialogue.lines.map(l =>
    `${l.speaker}: ${l.text.replace('_____', l.missingWord)}`
  );
  const linesWithChoices = dialogue.lines.filter(l => l.choices && l.choices.length > 0);
  passages.push({
    id: 2,
    emoji: '💬',
    title: dialogue.title,
    sentences: dialogueSentences,
    questions: linesWithChoices.slice(0, 5).map((l, i) => ({
      id: i + 1,
      type: 'mc',
      question: l.text.replace('_____', '___?'),
      options: l.choices,
      correct: l.missingWord,
    })),
  });

  // Passage 3: Vocabulary in sentences
  const vocabSentences = vocab.slice(0, 8).map(v => `The word "${v.word}" means "${v.meaning}". ${v.word} — ${v.phonetic}.`);
  const vocabQuestions = vocab.slice(0, 6).map((v, i) => {
    const wrongs = vocab.filter(x => x.word !== v.word).slice(0, 3).map(x => x.meaning);
    return {
      id: i + 1,
      type: 'mc' as 'mc',
      question: `What does "${v.word}" mean?`,
      options: [v.meaning, ...wrongs].sort(() => Math.random() - 0.5),
      correct: v.meaning,
    };
  });
  passages.push({
    id: 3,
    emoji: '🎯',
    title: 'Từ Vựng Trong Ngữ Cảnh',
    sentences: vocabSentences,
    questions: vocabQuestions,
  });

  return passages;
}

// ════ SINGLE PASSAGE PLAYER ════
function PassagePlayer({ passage, onDone }: { passage: Passage; onDone: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentIdx, setCurrentSentIdx] = useState(-1);
  const [heardSentences, setHeardSentences] = useState<Set<number>>(new Set());
  const [showText, setShowText] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [autoPause, setAutoPause] = useState(false);
  const [pausedAt, setPausedAt] = useState<number>(-1);
  const [answers, setAnswers] = useState<Record<number, string | boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const playingRef = useRef(false);
  const autoPauseRef = useRef(false);
  autoPauseRef.current = autoPause;

  useEffect(() => {
    setIsPlaying(false); setCurrentSentIdx(-1); setHeardSentences(new Set());
    setShowText(false); setIsFinished(false); setPausedAt(-1); setAnswers({}); setSubmitted(false);
    playingRef.current = false;
    window.speechSynthesis?.cancel();
  }, [passage]);

  const playSentence = useCallback((idx: number) => {
    if (idx >= passage.sentences.length) {
      setIsPlaying(false); setIsFinished(true); setCurrentSentIdx(-1);
      playingRef.current = false; return;
    }
    if (autoPauseRef.current && idx > 0 && idx % 3 === 0) {
      setIsPlaying(false); setPausedAt(idx); playingRef.current = false; return;
    }
    setCurrentSentIdx(idx);
    setHeardSentences(prev => new Set(prev).add(idx));
    speakText(passage.sentences[idx], 0.72, () => {
      if (playingRef.current) playSentence(idx + 1);
    });
  }, [passage.sentences]);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false); playingRef.current = false;
    } else {
      const startFrom = pausedAt >= 0 ? pausedAt : (isFinished ? 0 : Math.max(0, currentSentIdx));
      if (isFinished) { setIsFinished(false); setHeardSentences(new Set()); }
      setPausedAt(-1);
      setIsPlaying(true); playingRef.current = true;
      playSentence(startFrom);
    }
  };

  const restart = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false); setCurrentSentIdx(-1); setHeardSentences(new Set());
    setIsFinished(false); setPausedAt(-1); playingRef.current = false;
  };

  const resumeFromPause = () => {
    setIsPlaying(true); playingRef.current = true;
    playSentence(pausedAt);
  };

  const progress = heardSentences.size > 0
    ? Math.round((Math.max(currentSentIdx + 1, heardSentences.size) / passage.sentences.length) * 100)
    : 0;

  const allAnswered = passage.questions.every(q => answers[q.id] !== undefined);
  const correctCount = submitted
    ? passage.questions.filter(q => String(answers[q.id]) === String(q.correct)).length : 0;
  const scorePercent = submitted ? Math.round((correctCount / passage.questions.length) * 100) : 0;

  const resultCfg = scorePercent === 100
    ? { emoji: '🏆', label: 'Hoàn hảo!', color: 'text-amber-600' }
    : scorePercent >= 70
    ? { emoji: '🌟', label: 'Rất giỏi!', color: 'text-emerald-600' }
    : { emoji: '💪', label: 'Cố thêm nhé!', color: 'text-rose-600' };

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-0 lg:min-h-[calc(100vh-280px)]">
      {/* Left: Audio + Transcript */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Player card */}
        <div className="rounded-3xl px-5 py-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 60%, #6366F1 100%)' }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{passage.emoji}</span>
            <div className="flex-1">
              <p className="text-sky-100 text-xs font-bold">📖 Bài nghe {passage.id}</p>
              <p className="text-white font-black text-base leading-tight">{passage.title}</p>
            </div>
            <button
              onClick={() => setAutoPause(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${autoPause ? 'bg-amber-400 text-white' : 'bg-white/20 text-white/80'}`}
              title="Tự động dừng sau mỗi 3 câu để bé trả lời"
            >
              {autoPause ? '🔔 Tự dừng: BẬT' : '🔕 Tự dừng: TẮT'}
            </button>
          </div>

          {/* Progress */}
          <div className="w-full h-2 bg-white/20 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-sky-200 text-xs font-semibold mb-3">
            <span>{currentSentIdx >= 0 ? `Câu ${currentSentIdx + 1}/${passage.sentences.length}` : isFinished ? 'Đã đọc xong ✅' : 'Chưa bắt đầu'}</span>
            <span>{progress}%</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={restart} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95">⏮</button>
            <button
              onClick={pausedAt >= 0 ? resumeFromPause : togglePlay}
              className={`flex-1 h-12 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-md ${
                pausedAt >= 0 ? 'bg-amber-400 text-white animate-pulse'
                : isPlaying ? 'bg-rose-400 text-white'
                : isFinished ? 'bg-emerald-400 text-white'
                : 'bg-white text-blue-700'
              }`}
            >
              {pausedAt >= 0 ? '▶ Nghe tiếp →' : isPlaying ? '⏸ Tạm dừng' : isFinished ? '⏮ Nghe lại' : currentSentIdx >= 0 ? '▶ Tiếp tục' : '▶ Bắt đầu nghe'}
            </button>
          </div>

          {pausedAt >= 0 && (
            <div className="mt-3 bg-amber-400/30 border border-amber-300/50 rounded-2xl px-4 py-2 text-center">
              <p className="text-white font-black text-sm">🔔 Đã dừng! Hãy trả lời câu hỏi bên phải rồi nhấn <strong>"Nghe tiếp"</strong></p>
            </div>
          )}
        </div>

        {/* Transcript */}
        <div className="flex-1 bg-white rounded-3xl border-2 border-sky-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 bg-sky-50 border-b border-sky-100 flex items-center justify-between flex-shrink-0">
            <p className="font-black text-sky-700 text-sm flex items-center gap-2">📄 Nội dung bài đọc</p>
            {showText ? (
              <button onClick={() => setShowText(false)} className="text-sky-600 hover:text-sky-800 text-xs font-black bg-sky-100 px-3 py-1 rounded-lg border border-sky-200 cursor-pointer">🙈 Ẩn nội dung</button>
            ) : (
              <span className="text-sky-400 text-xs font-semibold">Đang ẩn để bé nghe 🎧</span>
            )}
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            {showText ? (
              <p className="text-gray-700 font-semibold text-base leading-loose select-none">
                {passage.sentences.map((s, i) => (
                  <span key={i} className={`inline transition-all duration-300 rounded px-0.5 mr-1 cursor-default ${
                    i === currentSentIdx ? 'bg-yellow-300 text-yellow-900 font-black ring-2 ring-yellow-400'
                    : heardSentences.has(i) ? 'text-gray-400'
                    : 'text-gray-700'
                  }`}>{s} </span>
                ))}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center gap-3">
                <span className="text-5xl animate-pulse">🎧</span>
                <p className="text-gray-500 font-black text-sm">Bài đọc đang được ẩn để bé luyện tập nghe tập trung hơn!</p>
                <button
                  onClick={() => setShowText(true)}
                  className="bg-sky-100 hover:bg-sky-200 text-sky-700 border-2 border-sky-200 font-black px-5 py-2.5 rounded-2xl text-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >👁️ Xem nội dung bài đọc</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Questions */}
      <div className="w-full lg:w-80 lg:flex-shrink-0 flex flex-col gap-3 lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#FFF8F0] pb-1">
          <div className="bg-white rounded-2xl border-2 border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <p className="font-black text-gray-700 flex items-center gap-2">
              ✏️ Câu hỏi
              <span className="bg-sky-100 text-sky-600 text-xs font-black px-2 py-0.5 rounded-full">{passage.questions.length} câu</span>
            </p>
            {submitted && (
              <span className={`font-black text-sm ${resultCfg.color}`}>{resultCfg.emoji} {correctCount}/{passage.questions.length}</span>
            )}
          </div>
          {submitted && (
            <div className={`mt-2 rounded-2xl border-2 px-4 py-3 flex items-center gap-3 animate-bounce-in ${
              scorePercent >= 70 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <span className="text-3xl">{resultCfg.emoji}</span>
              <div className="flex-1">
                <p className={`font-black text-base ${resultCfg.color}`}>{resultCfg.label}</p>
                <p className="text-gray-500 text-xs font-semibold">Đúng {correctCount}/{passage.questions.length} câu</p>
              </div>
              <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="bg-white border-2 border-gray-200 text-gray-600 font-black text-xs px-3 py-1.5 rounded-xl hover:scale-105 transition-all">🔄</button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pb-4">
          {passage.questions.map((q) => {
            const userAnswer = answers[q.id];
            const isCorrectAnswer = submitted ? String(userAnswer) === String(q.correct) : null;

            return (
              <div key={q.id} className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${submitted ? (isCorrectAnswer ? 'border-emerald-300' : 'border-rose-300') : userAnswer !== undefined ? 'border-sky-300' : 'border-gray-100'}`}>
                <div className="px-4 py-3 flex items-start gap-2.5">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${submitted ? (isCorrectAnswer ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700') : userAnswer !== undefined ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'}`}>
                    {submitted ? (isCorrectAnswer ? '✓' : '✗') : q.id}
                  </span>
                  <p className="font-bold text-gray-800 text-sm leading-snug">{q.question}</p>
                </div>

                {q.type === 'tf' && (
                  <div className="px-4 pb-3 flex gap-2">
                    {['true', 'false'].map(v => {
                      const label = v === 'true' ? '✅ Đúng' : '❌ Sai';
                      const isSelected = String(userAnswer) === v;
                      const isCorrect = v === String(q.correct);
                      let cls = 'border-2 border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-400 cursor-pointer';
                      if (!submitted && isSelected) cls = 'border-2 border-sky-500 bg-sky-50 text-sky-800 font-black';
                      if (submitted && isCorrect) cls = 'border-2 border-emerald-400 bg-emerald-50 text-emerald-700 font-black';
                      if (submitted && isSelected && !isCorrect) cls = 'border-2 border-rose-400 bg-rose-50 text-rose-700 animate-shake';
                      return (
                        <button key={v} onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: v }))}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 ${cls} ${!submitted ? 'hover:scale-[1.02] active:scale-95' : ''}`}
                        >{label}</button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'mc' && q.options && (
                  <div className="px-4 pb-3 grid grid-cols-1 gap-1.5">
                    {q.options.map((opt, oi) => {
                      const isSelected = userAnswer === opt;
                      const isCorrect = opt === q.correct;
                      let cls = 'border-2 border-gray-200 bg-white text-gray-700 hover:border-sky-400 hover:bg-sky-50 cursor-pointer';
                      if (!submitted && isSelected) cls = 'border-2 border-sky-500 bg-sky-50 text-sky-800 font-black';
                      if (submitted && isCorrect) cls = 'border-2 border-emerald-400 bg-emerald-50 text-emerald-800 font-black';
                      if (submitted && isSelected && !isCorrect) cls = 'border-2 border-rose-400 bg-rose-50 text-rose-700 animate-shake';
                      if (submitted && !isSelected && !isCorrect) cls = 'border-2 border-gray-100 bg-gray-50 text-gray-300 cursor-default';
                      return (
                        <button key={opt} onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 ${cls} ${!submitted ? 'hover:scale-[1.01] active:scale-95' : ''}`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${submitted && isCorrect ? 'bg-emerald-500 text-white' : submitted && isSelected && !isCorrect ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {['A','B','C','D'][oi]}
                          </span>
                          <span className="font-semibold">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {submitted && !isCorrectAnswer && (
                  <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                    <p className="text-emerald-700 text-xs font-bold">✅ Đáp án: <span className="font-black">{String(q.correct)}</span></p>
                  </div>
                )}
              </div>
            );
          })}

          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-200 ${allAnswered ? 'text-white shadow-lg hover:scale-[1.02] active:scale-98' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              style={allAnswered ? { background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' } : {}}
            >
              {allAnswered ? '🎯 Kiểm tra kết quả!' : `Còn ${passage.questions.length - Object.keys(answers).length} câu chưa trả lời`}
            </button>
          ) : (
            <button
              onClick={onDone}
              className="w-full py-4 rounded-2xl font-black text-base text-white transition-all hover:scale-[1.02] active:scale-98 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10B981, #0891B2)' }}
            >
              ✅ Hoàn thành bài nghe này →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ════ MAIN EXPORT ════
export default function ListeningTab({ vocabulary, story, dialogue, grammar, onComplete }: Props) {
  const [passages] = useState<Passage[]>(() => buildPassages(story, dialogue, grammar, vocabulary));
  const [activePassage, setActivePassage] = useState(0);
  const [donePassages, setDonePassages] = useState<Set<number>>(new Set());

  const handlePassageDone = () => {
    const newDone = new Set(donePassages).add(activePassage);
    setDonePassages(newDone);
    if (newDone.size >= passages.length) {
      if (onComplete) onComplete(100);
    } else {
      // Auto-advance to next undone
      const next = passages.findIndex((_, i) => !newDone.has(i));
      if (next >= 0) setActivePassage(next);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-2 sm:px-4 py-3 select-none">
      {/* Passage Tabs */}
      <div className="flex gap-2 mb-5">
        {passages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActivePassage(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-bold text-sm transition-all flex-1 justify-center ${
              activePassage === i
                ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm scale-[1.01]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-sky-300'
            }`}
          >
            <span>{p.emoji}</span>
            <span className="hidden md:inline truncate">{p.title}</span>
            <span className="md:hidden">Bài {p.id}</span>
            {donePassages.has(i) && <span className="text-emerald-500 font-black">✅</span>}
          </button>
        ))}
      </div>

      <PassagePlayer
        key={activePassage}
        passage={passages[activePassage]}
        onDone={handlePassageDone}
      />
    </div>
  );
}
