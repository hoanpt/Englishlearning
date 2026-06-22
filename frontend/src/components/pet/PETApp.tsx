import { useState } from 'react';
import { Star, LogOut, Trophy, Target, TrendingUp, Award, CheckCircle, ChevronRight, BarChart2 } from 'lucide-react';
import petUnitsData from '../../data/pet-units.json';
import petUnitsExtraData from '../../data/pet-units-extra.json';
import PETUnitDetail from './PETUnitDetail';

interface UserProfile {
  name: string;
  xp: number;
  level: number;
  completedUnits: number[];
  sectionProgress: Record<string, string[]>; // unitId -> ['vocab','grammar',...]
}

interface Astronaut {
  name: string;
  password?: string;
  displayName?: string;
  birthYear?: number;
  parentEmail?: string;
  parentPhone?: string;
  avatar?: string;
  stars: number;
  completedPlanets: number[];
  completedPreStarter?: number[];
  completedPET?: number[];
  badges: string[];
  accessories: string[];
  equippedAccessory: string;
  passedRevisions: number[];
  lastCheckIn?: string;
  checkInStreak?: number;
  checkInHistory?: string[];
  lastGreetingDate?: string;
  dailyInteractions?: Array<{ date: string; mood: string; message: string }>;
}

interface Props {
  astronaut: Astronaut;
  onUpdateAstronaut: (updated: Astronaut) => void;
  onLogout: () => void;
}

const SECTIONS_PER_UNIT = 5;
const XP_PER_SECTION = 20;

function getLevel(xp: number) {
  if (xp < 100) return { level: 1, title: 'Beginner', next: 100 };
  if (xp < 250) return { level: 2, title: 'Elementary', next: 250 };
  if (xp < 500) return { level: 3, title: 'Pre-Intermediate', next: 500 };
  if (xp < 900) return { level: 4, title: 'Intermediate', next: 900 };
  if (xp < 1500) return { level: 5, title: 'Upper-Intermediate', next: 1500 };
  return { level: 6, title: 'B1 Ready!', next: 2000 };
}

const mergedUnits = petUnitsData.map(unit => {
  const extra = petUnitsExtraData.find(e => e.unit_id === unit.unit_id);
  if (!extra) return unit;
  return {
    ...unit,
    grammar: {
      ...unit.grammar,
      exercises: [...unit.grammar.exercises, ...extra.extra_grammar]
    },
    reading2: extra.reading2,
    sentence_transformations: [...unit.sentence_transformations, ...extra.extra_transformations],
    cloze2: extra.cloze2
  };
});

export default function PETApp({ astronaut, onUpdateAstronaut, onLogout }: Props) {
  const userName = astronaut.name;
  const storageKey = `pet_profile_${userName}`;
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
    
    // Fallback from astronaut profile
    const completed = astronaut.completedPET || [];
    const initialProgress: Record<string, string[]> = {};
    completed.forEach(u => {
      initialProgress[String(u)] = ['vocab', 'grammar', 'reading', 'writing', 'cloze'];
    });
    return { 
      name: userName, 
      xp: astronaut.stars * 5, 
      level: 1, 
      completedUnits: completed, 
      sectionProgress: initialProgress 
    };
  });
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'units' | 'progress'>('units');

  const saveProfile = (updated: UserProfile) => {
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setProfile(updated);
  };

  const handleSectionComplete = async (unitId: number, section: string) => {
    const key = String(unitId);
    const currentSections = profile.sectionProgress[key] || [];
    if (currentSections.includes(section)) return;
    const newSections = [...currentSections, section];
    const newProgress = { ...profile.sectionProgress, [key]: newSections };
    const newXp = profile.xp + XP_PER_SECTION;
    const isUnitJustCompleted = newSections.length >= SECTIONS_PER_UNIT && !profile.completedUnits.includes(unitId);
    const newCompleted = isUnitJustCompleted
      ? [...profile.completedUnits, unitId]
      : profile.completedUnits;
    
    saveProfile({ ...profile, xp: newXp, completedUnits: newCompleted, sectionProgress: newProgress });

    // Sync to backend (convert 20 XP to 4 stars)
    const earnedStars = Math.round(XP_PER_SECTION / 5);
    try {
      const res = await fetch('/api/astronaut/complete-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          planetNumber: unitId,
          earnedStars,
          system: 'pet'
        })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateAstronaut(data.astronaut);
      } else {
        const updatedAstronaut = {
          ...astronaut,
          stars: astronaut.stars + earnedStars,
          completedPET: newCompleted
        };
        onUpdateAstronaut(updatedAstronaut);
      }
    } catch (err) {
      console.error('Error syncing section progress:', err);
      const updatedAstronaut = {
        ...astronaut,
        stars: astronaut.stars + earnedStars,
        completedPET: newCompleted
      };
      onUpdateAstronaut(updatedAstronaut);
    }
  };

  const units = mergedUnits;
  const { level, title: levelTitle, next: nextXP } = getLevel(profile.xp);
  const levelPct = Math.min(100, Math.round((profile.xp / nextXP) * 100));
  const totalSections = units.length * SECTIONS_PER_UNIT;
  const doneSections = Object.values(profile.sectionProgress).reduce((acc, s) => acc + s.length, 0);
  const overallPct = Math.round((doneSections / totalSections) * 100);

  if (selectedUnit !== null) {
    const unit = units.find(u => u.unit_id === selectedUnit)!;
    const completed = profile.sectionProgress[String(selectedUnit)] || [];
    return (
      <PETUnitDetail
        unit={unit as any}
        completedSections={completed}
        onSectionComplete={s => handleSectionComplete(selectedUnit, s)}
        onBack={() => setSelectedUnit(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0F172A]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center font-black text-sm">PET</div>
            <div className="hidden sm:block">
              <p className="font-black text-white text-sm">Complete PET · B1 Preliminary</p>
              <p className="text-xs text-slate-400">Hello, <span className="text-blue-400 font-bold">{profile.name}</span></p>
            </div>
          </div>

          <div className="flex-1 mx-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500 font-bold">Level {level} · {levelTitle}</span>
              <span className="text-slate-500 font-bold">{profile.xp} / {nextXP} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${levelPct}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-900/30 border border-blue-800/40 text-blue-300 font-black text-sm">
              <Star size={14} fill="currentColor" />
              {profile.xp} XP
            </div>
            <div className="flex bg-slate-800 rounded-xl p-0.5 gap-0.5">
              {(['units', 'progress'] as const).map(v => (
                <button key={v} onClick={() => setActiveView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activeView === v ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  {v === 'units' ? 'Units' : 'Progress'}
                </button>
              ))}
            </div>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {activeView === 'units' ? (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Units Completed', value: profile.completedUnits.length, total: units.length, icon: CheckCircle, color: 'text-teal-400' },
                { label: 'Sections Done', value: doneSections, total: totalSections, icon: Target, color: 'text-blue-400' },
                { label: 'Overall Progress', value: `${overallPct}%`, total: null, icon: TrendingUp, color: 'text-purple-400' },
                { label: 'Current Level', value: levelTitle, total: null, icon: Award, color: 'text-amber-400' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-4">
                    <Icon size={18} className={`${stat.color} mb-2`} />
                    <p className="text-white font-black text-xl">{stat.value}{stat.total ? `/${stat.total}` : ''}</p>
                    <p className="text-slate-500 text-xs font-semibold">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Unit Grid */}
            <div>
              <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <BookOpen2 /> 12 Study Units
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map(unit => {
                  const sectionsDone = (profile.sectionProgress[String(unit.unit_id)] || []).length;
                  const isComplete = profile.completedUnits.includes(unit.unit_id);
                  const pct = Math.round((sectionsDone / SECTIONS_PER_UNIT) * 100);
                  const started = sectionsDone > 0;

                  return (
                    <button
                      key={unit.unit_id}
                      onClick={() => setSelectedUnit(unit.unit_id)}
                      className={`relative text-left bg-[#1E293B] border rounded-2xl p-5 transition-all duration-200 group overflow-hidden hover:scale-[1.02] ${
                        isComplete ? 'border-teal-700/50' : started ? 'border-blue-800/40 hover:border-blue-600/50' : 'border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      {/* Color accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all" style={{ background: isComplete ? '#14B8A6' : unit.color, opacity: started ? 1 : 0.4 }} />

                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: `${unit.color}20`, color: unit.color }}>
                          {unit.unit_id}
                        </div>
                        {isComplete ? (
                          <CheckCircle size={18} className="text-teal-400" />
                        ) : (
                          <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                        )}
                      </div>

                      {/* Info */}
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{unit.topic}</p>
                      <h3 className="font-black text-white text-sm mb-1">{unit.unit_title}</h3>
                      <p className="text-xs text-slate-500 font-semibold mb-3 truncate">{unit.grammar.topic}</p>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>{sectionsDone}/{SECTIONS_PER_UNIT} sections</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: isComplete ? '#14B8A6' : unit.color }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <ProgressView profile={profile} units={units} />
        )}
      </main>
    </div>
  );
}

function BookOpen2() {
  return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
}

function ProgressView({ profile, units }: { profile: UserProfile; units: typeof petUnitsData }) {
  const grammarTopics = units.map(u => ({ unit: u.unit_id, topic: u.grammar.topic, done: (profile.sectionProgress[String(u.unit_id)] || []).includes('grammar') }));
  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6">
        <h3 className="font-black text-white text-lg mb-1 flex items-center gap-2"><BarChart2 size={20} className="text-blue-400" /> Your Learning Journey</h3>
        <p className="text-slate-400 text-sm mb-5">Track your mastery across all 12 units.</p>
        <div className="space-y-3">
          {units.map(unit => {
            const sections = profile.sectionProgress[String(unit.unit_id)] || [];
            const pct = Math.round((sections.length / 5) * 100);
            return (
              <div key={unit.unit_id} className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-500 w-6 text-right">{unit.unit_id}</span>
                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: unit.color }} />
                </div>
                <span className="text-xs font-bold text-slate-400 w-8 text-right">{pct}%</span>
                {pct === 100 && <CheckCircle size={14} className="text-teal-400" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6">
        <h3 className="font-black text-white text-lg mb-4 flex items-center gap-2"><Trophy size={18} className="text-amber-400" /> Grammar Topics Studied</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {grammarTopics.map(({ unit: uid, topic, done }) => (
            <div key={uid} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${done ? 'border-teal-700/30 bg-teal-900/10' : 'border-slate-700 bg-slate-800/30'}`}>
              <span className="w-6 h-6 rounded-md font-black text-xs flex items-center justify-center" style={{ background: done ? '#14B8A625' : '#1E293B', color: done ? '#14B8A6' : '#64748B', border: done ? '1px solid #14B8A630' : '1px solid #334155' }}>
                {uid}
              </span>
              <span className={done ? 'text-teal-200' : 'text-slate-500'}>{topic}</span>
              {done && <CheckCircle size={13} className="text-teal-400 ml-auto flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
