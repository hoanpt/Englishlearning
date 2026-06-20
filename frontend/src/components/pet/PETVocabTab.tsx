import { useState, useEffect } from 'react';
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, BookOpen } from 'lucide-react';

interface VocabWord {
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
}

interface Props {
  vocabulary: VocabWord[];
  onComplete: () => void;
}

function speakWord(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

export default function PETVocabTab({ vocabulary, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<'cards' | 'list'>('cards');

  const current = vocabulary[idx];
  const progress = Math.round(((idx + 1) / vocabulary.length) * 100);

  useEffect(() => { setFlipped(false); }, [idx]);

  const goNext = () => setIdx(i => Math.min(i + 1, vocabulary.length - 1));
  const goPrev = () => setIdx(i => Math.max(i - 1, 0));

  const markKnown = () => {
    setKnown(prev => { const s = new Set(prev); s.add(idx); return s; });
    if (idx < vocabulary.length - 1) setTimeout(goNext, 300);
    else if (known.size + 1 >= Math.ceil(vocabulary.length * 0.7)) onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex bg-[#1E293B] rounded-xl p-1 gap-1">
          <button onClick={() => setMode('cards')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            Flashcards
          </button>
          <button onClick={() => setMode('list')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <BookOpen size={14} className="inline mr-1" />Word List
          </button>
        </div>
        <span className="text-sm font-bold text-slate-400">{known.size}/{vocabulary.length} learned</span>
      </div>

      {mode === 'list' ? (
        <div className="space-y-3">
          {vocabulary.map((w, i) => (
            <div key={i} className={`bg-[#1E293B] border rounded-xl p-4 flex items-start gap-4 transition-all ${known.has(i) ? 'border-teal-600/50 opacity-60' : 'border-slate-700'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-black text-white text-lg">{w.word}</span>
                  <span className="text-xs text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded-full font-semibold">{w.partOfSpeech}</span>
                  {known.has(i) && <span className="text-xs text-teal-400 font-bold">✓ Learned</span>}
                </div>
                <p className="text-slate-300 text-sm font-medium mb-1">{w.definition}</p>
                <p className="text-slate-500 text-xs italic">"{w.example}"</p>
              </div>
              <button onClick={() => speakWord(w.word)} className="text-slate-400 hover:text-blue-400 transition-colors p-2">
                <Volume2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span>{idx + 1} / {vocabulary.length}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Flashcard */}
          <div className="relative cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped(f => !f)}>
            <div className={`relative w-full transition-transform duration-500`} style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', minHeight: '280px' }}>
              {/* Front */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-2xl flex flex-col items-center justify-center p-8 select-none" style={{ backfaceVisibility: 'hidden' }}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Click to reveal definition</p>
                <div className="text-center space-y-3">
                  <h2 className="text-5xl font-black text-white tracking-tight">{current.word}</h2>
                  <span className="inline-block text-sm text-blue-400 bg-blue-900/30 border border-blue-800/50 px-3 py-1 rounded-full font-semibold">{current.partOfSpeech}</span>
                </div>
                <button onClick={e => { e.stopPropagation(); speakWord(current.word); }} className="mt-6 flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm font-bold bg-slate-800 px-4 py-2 rounded-xl">
                  <Volume2 size={16} /> Listen
                </button>
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-teal-900 border border-blue-700/50 rounded-2xl flex flex-col items-center justify-center p-8 select-none" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">Definition</p>
                <p className="text-2xl font-bold text-white text-center mb-4">{current.definition}</p>
                <div className="bg-white/10 border border-white/10 rounded-xl p-3 max-w-sm">
                  <p className="text-sm text-blue-100 italic text-center">"{current.example}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button onClick={goPrev} disabled={idx === 0} className="p-3 bg-[#1E293B] border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => { setKnown(new Set()); setIdx(0); setFlipped(false); }} className="p-3 bg-[#1E293B] border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all">
              <RotateCcw size={16} />
            </button>
            <button onClick={() => { setKnown(prev => { const s = new Set(prev); s.delete(idx); return s; }); }} className="flex-1 py-3 bg-[#1E293B] border border-slate-600 text-slate-400 font-bold rounded-xl hover:border-rose-500 hover:text-rose-400 transition-all text-sm">
              Still Learning
            </button>
            <button onClick={markKnown} className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all text-sm">
              Got It ✓
            </button>
            <button onClick={goNext} disabled={idx === vocabulary.length - 1} className="p-3 bg-[#1E293B] border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>

          {known.size >= Math.ceil(vocabulary.length * 0.7) && (
            <button onClick={onComplete} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-black rounded-xl transition-all text-sm shadow-lg">
              Complete Vocabulary Section →
            </button>
          )}
        </>
      )}
    </div>
  );
}
