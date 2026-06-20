import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface ReadingData {
  title: string;
  text: string;
  questions: Question[];
}

interface Props {
  reading: ReadingData;
  reading2?: ReadingData;
  onComplete: () => void;
}

export default function PETReadingTab({ reading, reading2, onComplete }: Props) {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [answers1, setAnswers1] = useState<Record<number, string>>({});
  const [answers2, setAnswers2] = useState<Record<number, string>>({});
  const [submitted1, setSubmitted1] = useState(false);
  const [submitted2, setSubmitted2] = useState(false);
  const [showPassage, setShowPassage] = useState(true);

  const currentReading = activeTab === 1 ? reading : reading2 || reading;
  const currentAnswers = activeTab === 1 ? answers1 : answers2;
  const currentSubmitted = activeTab === 1 ? submitted1 : submitted2;
  const setAnswers = activeTab === 1 ? setAnswers1 : setAnswers2;
  const setSubmitted = activeTab === 1 ? setSubmitted1 : setSubmitted2;

  const score = currentSubmitted
    ? currentReading.questions.filter(q => currentAnswers[q.id] === q.answer).length
    : 0;

  const handleSubmit = () => {
    if (Object.keys(currentAnswers).length < currentReading.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitted(true);
    const pct = (currentReading.questions.filter(q => currentAnswers[q.id] === q.answer).length / currentReading.questions.length) * 100;
    if (pct >= 60) {
      confetti({ particleCount: 50, spread: 55, origin: { y: 0.5 }, colors: ['#3B82F6', '#14B8A6'] });
      onComplete();
    }
  };

  const reset = () => { setAnswers({}); setSubmitted(false); };

  const optionLabel = (opt: string) => opt.split('. ')[0]; // "A" from "A. text"
  const optionText = (opt: string) => opt.split('. ').slice(1).join('. '); // "text"

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Passage Switcher */}
      {reading2 && (
        <div className="flex bg-slate-800/60 p-1 rounded-xl w-fit mx-auto gap-1 border border-slate-700/80 mb-2">
          <button
            onClick={() => { setActiveTab(1); setShowPassage(true); }}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Passage 1: {reading.title}
          </button>
          <button
            onClick={() => { setActiveTab(2); setShowPassage(true); }}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Passage 2: {reading2.title}
          </button>
        </div>
      )}

      {/* Reading passage toggle */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl overflow-hidden">
        <button onClick={() => setShowPassage(p => !p)} className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded uppercase tracking-widest">Reading Passage</span>
            <span className="font-black text-white">{currentReading.title}</span>
          </div>
          <span className="text-slate-400">{showPassage ? '▲ Hide' : '▼ Show'}</span>
        </button>
        {showPassage && (
          <div className="border-t border-slate-700 p-5">
            <div className="prose prose-invert prose-sm max-w-none">
              {currentReading.text.split('\n\n').map((para, i) => (
                <p key={i} className="text-slate-300 text-sm leading-7 mb-4 last:mb-0">{para}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Questions — Choose the best answer (A, B, C, or D)
        </p>
        {currentReading.questions.map((q, qi) => {
          const sel = currentAnswers[q.id];
          const isCorrect = sel === q.answer;
          return (
            <div key={q.id} className={`bg-[#1E293B] border rounded-2xl p-5 space-y-3 transition-all ${currentSubmitted ? (isCorrect ? 'border-teal-600/40' : 'border-rose-600/40') : 'border-slate-700'}`}>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-900/40 border border-blue-800/50 text-blue-300 font-black text-xs flex items-center justify-center flex-shrink-0">{qi + 1}</span>
                <p className="text-slate-200 font-semibold text-sm leading-relaxed">{q.question}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                {q.options.map(opt => {
                  const label = optionLabel(opt);
                  const text = optionText(opt);
                  const isSelected = sel === label;
                  const isAnswer = q.answer === label;
                  let cls = 'p-3 rounded-xl border text-sm font-medium text-left transition-all flex items-center gap-2.5 ';
                  if (!currentSubmitted) {
                    cls += isSelected
                      ? 'bg-blue-900/40 border-blue-500 text-blue-200 cursor-default'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 cursor-pointer';
                  } else {
                    if (isAnswer) cls += 'bg-teal-900/30 border-teal-500 text-teal-200';
                    else if (isSelected && !isAnswer) cls += 'bg-rose-900/30 border-rose-500 text-rose-300';
                    else cls += 'bg-slate-800/20 border-slate-800 text-slate-600';
                  }
                  return (
                    <button key={opt} onClick={() => !currentSubmitted && setAnswers(a => ({ ...a, [q.id]: label }))} className={cls}>
                      <span className="w-6 h-6 rounded-md border flex items-center justify-center font-black text-xs flex-shrink-0"
                        style={{ background: isSelected || (currentSubmitted && isAnswer) ? 'transparent' : '#1E293B', borderColor: isSelected ? '#60A5FA' : '#475569' }}>
                        {currentSubmitted && isAnswer ? <CheckCircle size={14} className="text-teal-400" /> : currentSubmitted && isSelected && !isAnswer ? <XCircle size={14} className="text-rose-400" /> : label}
                      </span>
                      {text}
                    </button>
                  );
                })}
              </div>
              {currentSubmitted && (
                <div className={`ml-10 p-3 rounded-xl text-xs leading-relaxed border ${isCorrect ? 'bg-teal-900/20 border-teal-800/30 text-teal-300' : 'bg-rose-900/20 border-rose-800/30 text-rose-300'}`}>
                  <strong>{isCorrect ? '✓ Correct.' : '✗ Incorrect.'}</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score / Submit */}
      {!currentSubmitted ? (
        <button onClick={handleSubmit} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all text-sm shadow-lg">
          Submit Answers
        </button>
      ) : (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-xl">{score} / {currentReading.questions.length}</p>
            <p className="text-slate-400 text-sm">Reading Score</p>
          </div>
          <button onClick={reset} className="px-5 py-2.5 bg-slate-800 border border-slate-600 text-slate-300 font-bold rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all text-sm">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
