import { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Exercise {
  id: number;
  sentence: string;
  answer: string;
  options: string[];
  explanation: string;
}

interface GrammarData {
  topic: string;
  explanation: string;
  rules: string[];
  exercises: Exercise[];
}

interface Props {
  grammar: GrammarData;
  onComplete: () => void;
}

export default function PETGrammarTab({ grammar, onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>(new Array(grammar.exercises.length).fill(null));
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTheory, setShowTheory] = useState(false);

  const q = grammar.exercises[currentQ];
  const isCorrect = selected === q.answer;
  const totalQ = grammar.exercises.length;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    setShowExplanation(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);
    if (selected === q.answer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < totalQ - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setSubmitted(false);
      setShowExplanation(false);
    } else {
      setShowResults(true);
      const finalScore = score + (selected === q.answer && !submitted ? 1 : 0);
      if (finalScore >= Math.ceil(totalQ * 0.6)) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ['#3B82F6', '#14B8A6', '#F59E0B'] });
        onComplete();
      }
    }
  };

  if (showResults) {
    const finalScore = score;
    const pct = Math.round((finalScore / totalQ) * 100);
    return (
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className={`rounded-2xl p-8 border ${pct >= 60 ? 'bg-teal-900/20 border-teal-700/40' : 'bg-rose-900/20 border-rose-700/40'}`}>
          <div className="text-5xl font-black mb-2" style={{ color: pct >= 60 ? '#14B8A6' : '#F87171' }}>{pct}%</div>
          <p className="text-white font-bold text-lg mb-1">{pct >= 60 ? 'Well done!' : 'Keep practising!'}</p>
          <p className="text-slate-400 text-sm">{finalScore} / {totalQ} correct</p>
        </div>
        <div className="space-y-3 text-left">
          {grammar.exercises.map((ex, i) => {
            const ans = answers[i];
            const correct = ans === ex.answer;
            return (
              <div key={ex.id} className={`p-4 rounded-xl border text-sm ${correct ? 'bg-teal-900/20 border-teal-700/30' : 'bg-rose-900/20 border-rose-700/30'}`}>
                <div className="flex items-start gap-2">
                  {correct ? <CheckCircle size={16} className="text-teal-400 mt-0.5 flex-shrink-0" /> : <XCircle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-slate-300">{ex.sentence.replace('_____', `[${ex.answer}]`)}</p>
                    {!correct && <p className="text-rose-300 text-xs mt-1">Your answer: {ans} | Correct: {ex.answer}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => { setCurrentQ(0); setSelected(null); setSubmitted(false); setScore(0); setShowResults(false); setAnswers(new Array(totalQ).fill(null)); setShowExplanation(false); }}
          className="w-full py-3 bg-[#1E293B] border border-slate-700 text-slate-300 font-bold rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all text-sm">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Grammar Theory Collapse */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl overflow-hidden">
        <button onClick={() => setShowTheory(t => !t)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800 transition-colors">
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Grammar Focus</p>
            <p className="font-black text-white">{grammar.topic}</p>
          </div>
          <span className="text-slate-400 text-lg">{showTheory ? '−' : '+'}</span>
        </button>
        {showTheory && (
          <div className="border-t border-slate-700 p-4 space-y-3">
            <p className="text-slate-300 text-sm leading-relaxed">{grammar.explanation}</p>
            <ul className="space-y-1.5">
              {grammar.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400 font-bold mt-0.5">›</span>
                  <span className="text-slate-300">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1.5">
          {grammar.exercises.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < currentQ ? 'w-6 bg-teal-500' : i === currentQ ? 'w-6 bg-blue-500' : 'w-4 bg-slate-700'}`} />
          ))}
        </div>
        <span className="text-xs font-bold text-slate-500 ml-auto">{currentQ + 1} / {totalQ}</span>
      </div>

      {/* Question Card */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 space-y-5">
        <p className="text-slate-300 text-base leading-relaxed font-medium">
          {q.sentence.split('_____').map((part, i) => (
            <span key={i}>
              {part}
              {i === 0 && (
                <span className="inline-block mx-1 bg-slate-800 border-b-2 border-blue-400 px-3 py-0.5 rounded text-blue-300 font-black text-sm">
                  {selected && submitted ? q.answer : '______'}
                </span>
              )}
            </span>
          ))}
        </p>

        <div className="grid grid-cols-1 gap-2">
          {q.options.map((opt) => {
            let cls = 'w-full text-left p-3.5 rounded-xl border font-semibold text-sm transition-all ';
            if (!submitted) {
              cls += selected === opt
                ? 'bg-blue-900/40 border-blue-500 text-blue-200'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white cursor-pointer';
            } else {
              if (opt === q.answer) cls += 'bg-teal-900/40 border-teal-500 text-teal-200';
              else if (opt === selected && opt !== q.answer) cls += 'bg-rose-900/40 border-rose-500 text-rose-300';
              else cls += 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-50';
            }
            return (
              <button key={opt} onClick={() => !submitted && setSelected(opt)} className={cls}>
                <span className="flex items-center gap-2">
                  {submitted && opt === q.answer && <CheckCircle size={16} className="text-teal-400 flex-shrink-0" />}
                  {submitted && opt === selected && opt !== q.answer && <XCircle size={16} className="text-rose-400 flex-shrink-0" />}
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className={`rounded-xl p-4 border text-sm ${isCorrect ? 'bg-teal-900/20 border-teal-700/40' : 'bg-amber-900/20 border-amber-700/40'}`}>
            <p className={`font-bold mb-1 ${isCorrect ? 'text-teal-300' : 'text-amber-300'}`}>{isCorrect ? '✓ Correct!' : `✗ Incorrect. The answer is: ${q.answer}`}</p>
            <p className="text-slate-400">{q.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!selected} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black rounded-xl transition-all text-sm">
            Check Answer
          </button>
        ) : (
          <button onClick={handleNext} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-black rounded-xl hover:from-blue-500 hover:to-teal-500 transition-all text-sm flex items-center justify-center gap-2">
            {currentQ < totalQ - 1 ? 'Next Question' : 'See Results'} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
