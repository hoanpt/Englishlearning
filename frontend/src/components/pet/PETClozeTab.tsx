import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Gap {
  id: number;
  answer: string;
  options: string[];
}

interface ClozeData {
  title: string;
  text: string;
  gaps: Gap[];
}

interface Props {
  cloze: ClozeData;
  cloze2?: ClozeData;
  onComplete: () => void;
}

export default function PETClozeTab({ cloze, cloze2, onComplete }: Props) {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [answers1, setAnswers1] = useState<Record<number, string>>({});
  const [answers2, setAnswers2] = useState<Record<number, string>>({});
  const [submitted1, setSubmitted1] = useState(false);
  const [submitted2, setSubmitted2] = useState(false);

  const currentCloze = activeTab === 1 ? cloze : cloze2 || cloze;
  const currentAnswers = activeTab === 1 ? answers1 : answers2;
  const currentSubmitted = activeTab === 1 ? submitted1 : submitted2;
  const setAnswers = activeTab === 1 ? setAnswers1 : setAnswers2;
  const setSubmitted = activeTab === 1 ? setSubmitted1 : setSubmitted2;

  const score = currentSubmitted
    ? currentCloze.gaps.filter(g => currentAnswers[g.id] === g.answer).length
    : 0;

  const handleSubmit = () => {
    if (Object.keys(currentAnswers).length < currentCloze.gaps.length) {
      alert('Please fill in all gaps before submitting.');
      return;
    }
    setSubmitted(true);
    const correctCount = currentCloze.gaps.filter(g => currentAnswers[g.id] === g.answer).length;
    if (correctCount >= Math.ceil(currentCloze.gaps.length * 0.6)) {
      confetti({ particleCount: 50, spread: 55, origin: { y: 0.5 }, colors: ['#3B82F6', '#14B8A6', '#F59E0B'] });
      onComplete();
    }
  };

  const reset = () => { setAnswers({}); setSubmitted(false); };

  // Parse text with (n)_____ placeholders
  const renderText = () => {
    const parts = currentCloze.text.split(/\((\d+)\)_____/);
    const result: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        result.push(<span key={`t${i}`} className="text-slate-300 leading-relaxed">{parts[i]}</span>);
      } else {
        const gapId = parseInt(parts[i]);
        const gap = currentCloze.gaps.find(g => g.id === gapId);
        if (!gap) continue;
        const sel = currentAnswers[gapId];
        const isCorrect = currentSubmitted && sel === gap.answer;
        const isWrong = currentSubmitted && sel && sel !== gap.answer;
        result.push(
          <span key={`g${gapId}`} className="inline-block mx-1 align-middle">
            <select
              value={sel || ''}
              onChange={e => !currentSubmitted && setAnswers(a => ({ ...a, [gapId]: e.target.value }))}
              disabled={currentSubmitted}
              className={`appearance-none text-center px-2.5 py-1 rounded-lg border text-sm font-bold cursor-pointer transition-all outline-none ${
                !sel ? 'bg-slate-800 border-dashed border-slate-600 text-slate-500 min-w-[100px]'
                : currentSubmitted ? (isCorrect ? 'bg-teal-900/40 border-teal-500 text-teal-200' : 'bg-rose-900/40 border-rose-500 text-rose-200')
                : 'bg-blue-900/30 border-blue-600 text-blue-200'
              }`}
            >
              <option value="" disabled>({gapId}) ______</option>
              {gap.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {currentSubmitted && (
              <span className="ml-1 align-middle">
                {isCorrect ? <CheckCircle size={13} className="text-teal-400 inline" /> : isWrong ? <XCircle size={13} className="text-rose-400 inline" /> : null}
              </span>
            )}
          </span>
        );
      }
    }
    return result;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Cloze Text Switcher */}
      {cloze2 && (
        <div className="flex bg-slate-800/60 p-1 rounded-xl w-fit mx-auto gap-1 border border-slate-700/80 mb-2">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cloze Text 1: {cloze.title}
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cloze Text 2: {cloze2.title}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-800/40 rounded-2xl p-4">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Reading Part 6 — Open Cloze</p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Choose the best word (A, B, C, or D) for each gap in the text.
        </p>
      </div>

      {/* Text with inline gaps */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6">
        <h3 className="font-black text-white mb-4">{currentCloze.title}</h3>
        <div className="text-sm leading-8">
          {renderText()}
        </div>
      </div>

      {/* Answer key after submission */}
      {currentSubmitted && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Answer Key</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currentCloze.gaps.map(g => {
              const sel = currentAnswers[g.id];
              const correct = sel === g.answer;
              return (
                <div key={g.id} className={`p-2.5 rounded-xl border text-xs font-semibold ${correct ? 'bg-teal-900/20 border-teal-700/30 text-teal-300' : 'bg-rose-900/20 border-rose-800/30 text-rose-300'}`}>
                  <span className="text-slate-500 font-bold">({g.id})</span> {g.answer}
                  {!correct && <span className="block text-slate-500 text-[10px]">You wrote: {sel}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!currentSubmitted ? (
        <button onClick={handleSubmit} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all text-sm shadow-lg">
          Submit Answers
        </button>
      ) : (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-xl">{score} / {currentCloze.gaps.length}</p>
            <p className="text-slate-400 text-sm">Cloze Score</p>
          </div>
          <button onClick={reset} className="px-5 py-2.5 bg-slate-800 border border-slate-600 text-slate-300 font-bold rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all text-sm">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
