import { useState } from 'react';
import { ArrowLeft, BookOpen, Zap, FileText, PenLine, AlignLeft, CheckCircle } from 'lucide-react';
import PETVocabTab from './PETVocabTab';
import PETGrammarTab from './PETGrammarTab';
import PETReadingTab from './PETReadingTab';
import PETWritingTab from './PETWritingTab';
import PETClozeTab from './PETClozeTab';

interface Unit {
  unit_id: number;
  unit_title: string;
  topic: string;
  color: string;
  vocabulary: any[];
  grammar: any;
  reading: any;
  reading2?: any;
  sentence_transformations: any[];
  cloze: any;
  cloze2?: any;
}

interface Props {
  unit: Unit;
  completedSections: string[];
  onSectionComplete: (section: string) => void;
  onBack: () => void;
}

const TABS = [
  { id: 'vocab',    label: 'Vocabulary',           shortLabel: 'Vocab',    icon: BookOpen },
  { id: 'grammar',  label: 'Grammar Practice',      shortLabel: 'Grammar',  icon: Zap },
  { id: 'reading',  label: 'Reading Comprehension', shortLabel: 'Reading',  icon: FileText },
  { id: 'writing',  label: 'Sentence Transformation',shortLabel: 'Writing',  icon: PenLine },
  { id: 'cloze',    label: 'Cloze Test',            shortLabel: 'Cloze',    icon: AlignLeft },
] as const;

type TabId = typeof TABS[number]['id'];

export default function PETUnitDetail({ unit, completedSections, onSectionComplete, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('vocab');
  const doneCount = completedSections.length;
  const progress = Math.round((doneCount / TABS.length) * 100);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: unit.color }} />
              <span className="text-white font-black text-sm truncate">Unit {unit.unit_id}: {unit.unit_title}</span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-slate-400 text-xs">{doneCount}/{TABS.length} sections</span>
            </div>
            <div className="mt-1.5 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: unit.color }} />
            </div>
          </div>
          {doneCount === TABS.length && (
            <span className="text-xs font-black text-teal-400 bg-teal-900/30 border border-teal-700/40 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <CheckCircle size={13} /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b border-slate-800 bg-[#0F172A]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isDone = completedSections.includes(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'text-white'
                      : isDone
                      ? 'text-teal-400 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  style={isActive ? { background: `${unit.color}25`, color: unit.color, border: `1px solid ${unit.color}40` } : {}}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  {isDone && <CheckCircle size={13} className="text-teal-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Section header */}
        <div className="mb-6">
          {(() => {
            const tab = TABS.find(t => t.id === activeTab)!;
            const Icon = tab.icon;
            const isDone = completedSections.includes(activeTab);
            return (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${unit.color}20`, border: `1px solid ${unit.color}40` }}>
                    <Icon size={20} style={{ color: unit.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unit {unit.unit_id}</p>
                    <h2 className="text-lg font-black text-white">{tab.label}</h2>
                  </div>
                </div>
                {isDone && (
                  <span className="text-xs font-bold text-teal-400 bg-teal-900/20 border border-teal-700/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <CheckCircle size={12} /> Done
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        {activeTab === 'vocab' && (
          <PETVocabTab vocabulary={unit.vocabulary} onComplete={() => onSectionComplete('vocab')} />
        )}
        {activeTab === 'grammar' && (
          <PETGrammarTab grammar={unit.grammar} onComplete={() => onSectionComplete('grammar')} />
        )}
        {activeTab === 'reading' && (
          <PETReadingTab reading={unit.reading} reading2={unit.reading2} onComplete={() => onSectionComplete('reading')} />
        )}
        {activeTab === 'writing' && (
          <PETWritingTab transformations={unit.sentence_transformations} onComplete={() => onSectionComplete('writing')} />
        )}
        {activeTab === 'cloze' && (
          <PETClozeTab cloze={unit.cloze} cloze2={unit.cloze2} onComplete={() => onSectionComplete('cloze')} />
        )}
      </div>
    </div>
  );
}
