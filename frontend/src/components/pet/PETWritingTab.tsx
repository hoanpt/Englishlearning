import { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Transformation {
  id: number;
  original: string;
  key_word: string;
  answer: string;
  hint: string;
}

interface Props {
  transformations: Transformation[];
  onComplete: () => void;
}

export default function PETWritingTab({ transformations, onComplete }: Props) {
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);

  const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/['']/g, "'");

  const checkAnswer = (id: number) => {
    const correct = transformations.find(t => t.id === id)?.answer || '';
    return (inputs[id] || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/['']/g, "'") === normalise(correct);
  };

  const handleSubmit = () => {
    if (Object.values(inputs).filter(Boolean).length < transformations.length) {
      alert('Please complete all sentences before submitting.');
      return;
    }
    const s = transformations.filter(t => checkAnswer(t.id)).length;
    setScore(s);
    setSubmitted(true);
    if (s >= Math.ceil(transformations.length * 0.5)) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 }, colors: ['#3B82F6', '#14B8A6', '#F59E0B'] });
      onComplete();
    }
  };

  const reset = () => { setInputs({}); setSubmitted(false); setShowHints(new Set()); setScore(0); };

  const toggleHint = (id: number) => {
    setShowHints(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-800/40 rounded-2xl p-4 space-y-2">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Writing Part 1 — Sentence Transformations</p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Complete the second sentence so that it has a similar meaning to the first sentence. You <strong>must</strong> use the key word given in <strong>CAPITALS</strong>. The key word must not be changed. Use between <strong>two and five words</strong> including the key word.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {transformations.map((t, i) => {
          const userAns = inputs[t.id] || '';
          const isCorrect = submitted && checkAnswer(t.id);
          return (
            <div key={t.id} className={`bg-[#1E293B] border rounded-2xl p-5 space-y-4 transition-all ${submitted ? (isCorrect ? 'border-teal-600/40' : 'border-rose-600/40') : 'border-slate-700'}`}>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-900/40 border border-blue-800/50 text-blue-300 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <div className="space-y-3 flex-1">
                  {/* Original sentence */}
                  <p className="text-slate-300 text-sm italic">"{t.original}"</p>
                  {/* Blank sentence */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 text-sm">→</span>
                    <span className="text-xs font-black text-amber-400 bg-amber-900/30 border border-amber-800/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">{t.key_word}</span>
                    <input
                      type="text"
                      value={userAns}
                      onChange={e => !submitted && setInputs(prev => ({ ...prev, [t.id]: e.target.value }))}
                      disabled={submitted}
                      placeholder="Type 2–5 words..."
                      className={`flex-1 min-w-[180px] bg-slate-800 border rounded-xl px-3 py-2 text-sm text-white font-medium placeholder:text-slate-600 focus:outline-none transition-all ${
                        submitted ? (isCorrect ? 'border-teal-600' : 'border-rose-600') : 'border-slate-600 focus:border-blue-500'
                      }`}
                    />
                    {submitted && (
                      isCorrect ? <CheckCircle size={18} className="text-teal-400 flex-shrink-0" /> : <XCircle size={18} className="text-rose-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Hint */}
                  {!submitted && (
                    <button onClick={() => toggleHint(t.id)} className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-semibold">
                      <Lightbulb size={13} />
                      {showHints.has(t.id) ? 'Hide hint' : 'Show hint'}
                    </button>
                  )}
                  {showHints.has(t.id) && !submitted && (
                    <p className="text-xs text-amber-300/80 bg-amber-900/15 border border-amber-800/20 rounded-xl px-3 py-2 italic">💡 Hint: {t.hint}</p>
                  )}
                  {submitted && (
                    <div className={`p-3 rounded-xl text-xs border ${isCorrect ? 'bg-teal-900/20 border-teal-800/30 text-teal-300' : 'bg-rose-900/20 border-rose-800/30 text-rose-300'}`}>
                      {isCorrect ? '✓ Correct!' : (
                        <><strong>Model answer:</strong> {t.answer}</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all text-sm shadow-lg">
          Check My Answers
        </button>
      ) : (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-xl">{score} / {transformations.length}</p>
            <p className="text-slate-400 text-sm">Transformations Score</p>
          </div>
          <button onClick={reset} className="px-5 py-2.5 bg-slate-800 border border-slate-600 text-slate-300 font-bold rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all text-sm">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
