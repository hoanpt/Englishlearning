import { useState, useEffect } from 'react';
import { Star, LogOut, Trophy } from 'lucide-react';
import curriculumData from './data/units.json';
import Sidebar, { BELTS, isUnitUnlocked, isRevisionUnlocked } from './components/Sidebar';
import MissionModal from './components/MissionModal';
import MissionPractice from './components/MissionPractice';
import RevisionTest from './components/RevisionTest';
import CreativeLab from './components/CreativeLab';
import WizardShop from './components/WizardShop';
import AuthScreens from './components/AuthScreens';
import { CheckInModal, MascotGreeting } from './components/DailyWidgets';
import AccountDashboard from './components/AccountDashboard';
import JourneyMap from './components/JourneyMap';
import PETApp from './components/pet/PETApp';
import PreStarterApp from './components/prestarter/PreStarterApp';

const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

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

interface LeaderboardEntry {
  name: string;
  stars: number;
  completedPlanetsCount: number;
}



export default function App() {
  const [astronaut, setAstronaut] = useState<Astronaut | null>(null);
  const [courseLevel, setCourseLevel] = useState<'prestarter' | 'roundup' | 'pet' | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  // Modals / views
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [revisionBeltId, setRevisionBeltId] = useState<number | null>(null);
  const [isParentDashboardOpen, setIsParentDashboardOpen] = useState(false);

  // Other views
  const [currentView, setCurrentView] = useState<'map' | 'leaderboard' | 'creative' | 'shop'>('map');
  const [offlineMode, setOfflineMode] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const selectedUnit = curriculumData.find(u => u.unit_id === selectedUnitId) ?? null;

  // Auto-login from cache
  useEffect(() => {
    const cachedName = localStorage.getItem('astronaut_name');
    const cachedLevel = localStorage.getItem('course_level') as 'prestarter' | 'roundup' | 'pet' | null;
    if (cachedName && cachedLevel) {
      setCourseLevel(cachedLevel);
      if (cachedLevel === 'roundup' || cachedLevel === 'prestarter') loadProfile(cachedName);
    } else if (cachedName) {
      // Has name but no level — will show level selection after login
    }
  }, []);

  const loadProfile = async (name: string) => {
    try {
      const res = await fetch('/api/astronaut/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Backend unavailable');
      const data = await res.json();
      if (!data.passedRevisions) data.passedRevisions = [];
      setAstronaut(data);
      setOfflineMode(false);

      const today = getLocalDateString();
      if (data.lastCheckIn !== today) {
        setIsCheckInOpen(true);
      }
    } catch {
      setOfflineMode(true);
      const stored = localStorage.getItem(`astronaut_profile_${name}`);
      if (stored) {
        const parsed: Astronaut = JSON.parse(stored);
        if (!parsed.passedRevisions) parsed.passedRevisions = [];
        setAstronaut(parsed);

        const today = getLocalDateString();
        if (parsed.lastCheckIn !== today) {
          setIsCheckInOpen(true);
        }
      } else {
        const fresh: Astronaut = {
          name, stars: 0, completedPlanets: [], badges: [],
          accessories: [], equippedAccessory: '', passedRevisions: [],
          completedPreStarter: [], completedPET: [], checkInHistory: [], dailyInteractions: []
        };
        localStorage.setItem(`astronaut_profile_${name}`, JSON.stringify(fresh));
        setAstronaut(fresh);
        setIsCheckInOpen(true);
      }
    } finally {
      localStorage.setItem('astronaut_name', name);
    }
  };

  const saveLocally = (updated: Astronaut) => {
    localStorage.setItem(`astronaut_profile_${updated.name}`, JSON.stringify(updated));
    setAstronaut(updated);
  };

  // Complete a unit mission
  const handleMissionSuccess = async (starsEarned: number) => {
    if (!astronaut || !selectedUnit) return;
    const planetNum = selectedUnit.unit_id;
    const nextCompleted = [...astronaut.completedPlanets];
    if (!nextCompleted.includes(planetNum)) nextCompleted.push(planetNum);
    const nextStars = astronaut.stars + starsEarned;
    const nextBadges = [...astronaut.badges];

    if (nextCompleted.length >= 1 && !nextBadges.includes('space_rookie')) nextBadges.push('space_rookie');
    if (nextCompleted.includes(6) && !nextBadges.includes('grammar_hero')) nextBadges.push('grammar_hero');
    if (nextCompleted.includes(14) && !nextBadges.includes('time_traveler')) nextBadges.push('time_traveler');
    if (nextCompleted.length >= 25 && !nextBadges.includes('galaxy_master')) nextBadges.push('galaxy_master');

    const updated: Astronaut = { ...astronaut, stars: nextStars, completedPlanets: nextCompleted, badges: nextBadges };

    if (!offlineMode) {
      try {
        const res = await fetch('/api/astronaut/complete-mission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: astronaut.name, planetNumber: planetNum, earnedStars: starsEarned }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!data.astronaut.passedRevisions) data.astronaut.passedRevisions = [];
        setAstronaut(data.astronaut);
      } catch {
        saveLocally(updated);
      }
    } else {
      saveLocally(updated);
    }
    setIsPracticing(false);
    setSelectedUnitId(null);

    // Check if revision is now unlocked for a belt
    const belt = BELTS.find(b => b.unitIds.includes(planetNum));
    if (belt && isRevisionUnlocked(belt.beltId, nextCompleted)) {
      // Show a hint that revision is available
      const msg = `🎉 Bạn đã hoàn thành ${belt.beltName}! Hãy thử thách Revision ${belt.beltId} để mở dải tiếp theo!`;
      setTimeout(() => alert(msg), 800);
    }
  };

  // Pass a revision
  const handleRevisionPass = async (score: number) => {
    if (!astronaut || revisionBeltId === null) return;
    const nextRevisions = [...(astronaut.passedRevisions || [])];
    if (!nextRevisions.includes(revisionBeltId)) nextRevisions.push(revisionBeltId);
    const nextBadges = [...astronaut.badges];
    const badgeKey = `revision_${revisionBeltId}`;
    if (!nextBadges.includes(badgeKey)) nextBadges.push(badgeKey);
    const bonusStars = Math.round(score / 5);  // up to 20 bonus stars
    const updated: Astronaut = { ...astronaut, passedRevisions: nextRevisions, badges: nextBadges, stars: astronaut.stars + bonusStars };

    if (!offlineMode) {
      try {
        const res = await fetch('/api/astronaut/pass-revision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: astronaut.name, beltId: revisionBeltId, score }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        // Backend returns astronaut object under data.astronaut
        const updatedAstronaut = data.astronaut;
        if (!updatedAstronaut.passedRevisions) updatedAstronaut.passedRevisions = [];
        setAstronaut(updatedAstronaut);
      } catch {
        saveLocally(updated);
      }
    } else {
      saveLocally(updated);
    }

    setRevisionBeltId(null);
    alert(`🏆 Xuất sắc! Bạn đã vượt Revision ${revisionBeltId} với ${score}%! +${bonusStars} Sao Sáng và mở khóa dải mới!`);
  };

  const loadLeaderboard = async () => {
    setLeaderboard([
      { name: astronaut?.name || 'Bé', stars: astronaut?.stars || 0, completedPlanetsCount: astronaut?.completedPlanets.length || 0 },
      { name: 'Phi hành gia Bi', stars: 250, completedPlanetsCount: 15 },
      { name: 'Phi hành gia Tôm', stars: 120, completedPlanetsCount: 8 },
    ].sort((a, b) => b.stars - a.stars));
  };

  useEffect(() => {
    if (currentView === 'leaderboard') loadLeaderboard();
  }, [currentView]);

  // ─────────── LOGIN ───────────
  if (!astronaut) {
    return (
      <AuthScreens
        onAuthSuccess={(data) => {
          setAstronaut(data);
          localStorage.setItem('astronaut_name', data.name);
          const cachedLevel = localStorage.getItem('course_level') as 'prestarter' | 'roundup' | 'pet' | null;
          if (cachedLevel) {
            setCourseLevel(cachedLevel);
          }
          const today = getLocalDateString();
          if (data.lastCheckIn !== today) {
            setIsCheckInOpen(true);
          }
        }}
      />
    );
  }

  // ─────────── LEVEL SELECTION (after login, before entering app) ───────────
  if (astronaut && !courseLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-3">🎓</div>
            <h1 className="text-3xl font-black text-white">Choose Your Course</h1>
            <p className="text-slate-400 font-semibold">Xin chào, <span className="text-blue-400">{astronaut.name}</span>! Chọn giáo trình phù hợp với bạn:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Pre Starter (Làm quen) */}
            <button
              onClick={() => { localStorage.setItem('course_level', 'prestarter'); setCourseLevel('prestarter'); }}
              className="group relative text-left bg-[#1E293B] border-2 border-emerald-800/50 hover:border-emerald-500 rounded-3xl p-6 transition-all hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-3">
                <div className="text-4xl">🐯</div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Pre-Starter</p>
                  <h2 className="text-xl font-black text-white">Làm Quen</h2>
                  <p className="text-xs text-emerald-300 font-bold bg-emerald-900/40 px-2 py-0.5 rounded-full inline-block mt-1">Dành cho bé 4–6 tuổi</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Làm quen tiếng Anh vui nhộn qua 8 chủ đề gần gũi. Học nghe phát âm tự nhiên, chơi ghép hình, ghép bóng sinh động!
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['🐾 Thảo cầm viên', '🔍 Tìm bạn', '🧩 Ghép bóng', '✂️ Xếp hình'].map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </button>
            {/* Round Up */}
            <button
              onClick={() => { localStorage.setItem('course_level', 'roundup'); setCourseLevel('roundup'); }}
              className="group relative text-left bg-[#1E293B] border-2 border-violet-800/50 hover:border-violet-500 rounded-3xl p-6 transition-all hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-3">
                <div className="text-4xl">🚀</div>
                <div>
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">New Round Up 2</p>
                  <h2 className="text-xl font-black text-white">Mover Level</h2>
                  <p className="text-xs text-violet-300 font-bold bg-violet-900/40 px-2 py-0.5 rounded-full inline-block mt-1">Dành cho lớp 3–4</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Học tiếng Anh thông qua hành trình khám phá vũ trụ. Flashcard, mini-game, và Mascot phi hành gia sôi động!
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['🌟 Sao Sáng', '🤸‍♀️ Mini-game', '🚀 Mascot', '🎴 Flashcard'].map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </button>
            {/* PET */}
            <button
              onClick={() => { localStorage.setItem('course_level', 'pet'); localStorage.setItem('astronaut_name', astronaut.name); setCourseLevel('pet'); }}
              className="group relative text-left bg-[#1E293B] border-2 border-blue-800/50 hover:border-blue-500 rounded-3xl p-6 transition-all hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-3">
                <div className="text-4xl">📚</div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Complete PET 2020</p>
                  <h2 className="text-xl font-black text-white">B1 Preliminary</h2>
                  <p className="text-xs text-blue-300 font-bold bg-blue-900/40 px-2 py-0.5 rounded-full inline-block mt-1">Dành cho lớp 5+</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Ôn luyện thi PET với 12 chủ đề thực tế. Reading, Grammar, Sentence Transformation, Cloze Test!
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['📝 Writing', '📖 Reading', '⚡ Grammar', '🎯 Cloze Test'].map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </button>
          </div>
          <p className="text-center text-xs text-slate-600">
            Bạn có thể đổi giáo trình bất kỳ lúc nào bằng cách đăng xuất.
          </p>
        </div>
      </div>
    );
  }

  // ─────────── PET APP VIEW ───────────
  if (courseLevel === 'pet' && astronaut) {
    return (
      <>
        <PETApp
          astronaut={astronaut}
          onUpdateAstronaut={(updated) => {
            setAstronaut(updated);
            localStorage.setItem(`astronaut_profile_${updated.name}`, JSON.stringify(updated));
          }}
          onLogout={() => { localStorage.removeItem('astronaut_name'); localStorage.removeItem('course_level'); setCourseLevel(null); setAstronaut(null); }}
        />
        <CheckInModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          astronaut={astronaut}
          onCheckInSuccess={(updated) => {
            setAstronaut(updated);
            localStorage.setItem(`astronaut_profile_${updated.name}`, JSON.stringify(updated));
          }}
        />
      </>
    );
  }

  // ─────────── PRESTARTER APP VIEW ───────────
  if (courseLevel === 'prestarter' && astronaut) {
    return (
      <>
        <PreStarterApp
          astronaut={astronaut}
          onUpdateAstronaut={(updated) => {
            setAstronaut(updated);
            localStorage.setItem(`astronaut_profile_${updated.name}`, JSON.stringify(updated));
          }}
          offlineMode={offlineMode}
          onSwitchLevel={() => {
            localStorage.removeItem('course_level');
            setCourseLevel(null);
          }}
        />
        <CheckInModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          astronaut={astronaut}
          onCheckInSuccess={(updated) => {
            setAstronaut(updated);
            localStorage.setItem(`astronaut_profile_${updated.name}`, JSON.stringify(updated));
          }}
        />
      </>
    );
  }

  const sidebarWidth = sidebarOpen && window.innerWidth >= 1024 ? 280 : 0;
  const passedRevisions = astronaut!.passedRevisions || [];

  // ─────────── REVISION TEST VIEW ───────────
  if (revisionBeltId !== null) {
    const belt = BELTS.find(b => b.beltId === revisionBeltId)!;
    const revUnits = curriculumData.filter(u => belt.unitIds.includes(u.unit_id));
    return (
      <RevisionTest
        revisionNumber={revisionBeltId}
        beltName={belt.beltName}
        units={revUnits}
        onPass={handleRevisionPass}
        onClose={() => setRevisionBeltId(null)}
      />
    );
  }

  // ─────────── PRACTICE VIEW ───────────
  if (isPracticing && selectedUnit) {
    return (
      <div style={{ marginLeft: window.innerWidth >= 1024 ? sidebarWidth : 0, minHeight: '100vh', background: '#FFF8F0', transition: 'margin 0.3s' }}>
        <Sidebar
          units={curriculumData.map(u => ({ unit_id: u.unit_id, unit_title: u.unit_title }))}
          selectedUnitId={selectedUnitId}
          completedPlanets={astronaut!.completedPlanets}
          passedRevisions={passedRevisions}
          onSelectUnit={id => { setSelectedUnitId(id); setIsPracticing(false); }}
          onStartRevision={setRevisionBeltId}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(p => !p)}
          stars={astronaut!.stars}
          onOpenParentDashboard={() => setIsParentDashboardOpen(true)}
        />
        <MissionPractice
          unit={selectedUnit!}
          equippedAccessory={astronaut!.equippedAccessory}
          onMissionSuccess={handleMissionSuccess}
          onCancel={() => { setIsPracticing(false); setSelectedUnitId(null); }}
        />
      </div>
    );
  }

  // ─────────── MAIN LAYOUT ───────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FFF8F0' }}>
      <Sidebar
        units={curriculumData.map(u => ({ unit_id: u.unit_id, unit_title: u.unit_title }))}
        selectedUnitId={selectedUnitId}
        completedPlanets={astronaut!.completedPlanets}
        passedRevisions={passedRevisions}
        onSelectUnit={id => { setSelectedUnitId(id); setCurrentView('map'); setIsModalOpen(true); }}
        onStartRevision={setRevisionBeltId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(p => !p)}
        stars={astronaut!.stars}
        onOpenParentDashboard={() => setIsParentDashboardOpen(true)}
      />

      {/* Main content area */}
      <main
        className="flex-1 flex flex-col overflow-y-auto transition-all duration-300"
        style={{ marginLeft: window.innerWidth >= 1024 ? (sidebarOpen ? 280 : 72) : 0 }}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(p => !p)}
              className="lg:hidden p-2 -ml-1 rounded-xl bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors flex-shrink-0"
            >
              ☰
            </button>
            <div className="min-w-0">
              <h1 className="font-black text-gray-800 text-base sm:text-lg truncate">
                {currentView === 'map' ? '📚 Bài Học' : currentView === 'creative' ? '🎨 Sáng Tạo' : currentView === 'shop' ? '🛒 Cửa Hàng' : '🏆 Bảng Xếp Hạng'}
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-400 font-semibold truncate">
                Xin chào, <span className="text-violet-600 font-black">{astronaut!.name}</span>! 
                Đã hoàn thành {astronaut!.completedPlanets.length}/25 bài
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Stars */}
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-amber-200 bg-amber-50 text-amber-600 font-black text-sm">
              <Star size={16} fill="currentColor" className="animate-pulse" />
              {astronaut!.stars}
            </div>
            {/* Nav */}
            <div className="hidden sm:flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
              {(['map', 'creative', 'shop', 'leaderboard'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setCurrentView(v)}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${currentView === v ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {v === 'map' ? '📚 Bài Học' : v === 'creative' ? '🎨 Sáng Tạo' : v === 'shop' ? '🛒 Cửa Hàng' : '🏆 Bảng Xếp Hạng'}
                </button>
              ))}
            </div>
            <button onClick={() => { localStorage.removeItem('astronaut_name'); localStorage.removeItem('course_level'); setAstronaut(null); setCourseLevel(null); }} className="p-2 text-gray-400 hover:text-rose-500 transition-colors" title="Đăng xuất">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-6">
          {currentView === 'creative' ? (
            <CreativeLab astronaut={astronaut!} onUpdateAstronaut={u => { const a = u as Astronaut; if (!a.passedRevisions) a.passedRevisions = []; setAstronaut(a); }} offlineMode={offlineMode} />
          ) : currentView === 'shop' ? (
            <WizardShop astronaut={astronaut!} onUpdateAstronaut={u => { const a = u as Astronaut; if (!a.passedRevisions) a.passedRevisions = []; setAstronaut(a); }} offlineMode={offlineMode} />
          ) : currentView === 'leaderboard' ? (
            <LeaderboardView leaderboard={leaderboard} myName={astronaut!.name} />
          ) : (
            // MAP / Home: Show journey map
            <div className="space-y-4">
              <MascotGreeting
                astronaut={astronaut}
                onMoodSuccess={(updated) => {
                  setAstronaut(updated);
                  localStorage.setItem(`astronaut_profile_${updated.name}`, JSON.stringify(updated));
                }}
              />
              <JourneyMap
                astronautName={astronaut!.name}
                equippedAccessory={astronaut!.equippedAccessory}
                completedPlanets={astronaut!.completedPlanets}
                passedRevisions={passedRevisions}
                onSelectUnit={id => { setSelectedUnitId(id); setIsModalOpen(true); }}
                onStartRevision={setRevisionBeltId}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mission Modal */}
      {selectedUnit && isModalOpen && (
        <MissionModal
          unit={selectedUnit}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedUnitId(null); }}
          isUnlocked={isUnitUnlocked(selectedUnit.unit_id, astronaut!.completedPlanets, passedRevisions)}
          isCompleted={astronaut!.completedPlanets.includes(selectedUnit.unit_id)}
          onStartMission={() => { setIsModalOpen(false); setIsPracticing(true); }}
        />
      )}

      {/* Account / Parent Dashboard Modal */}
      {isParentDashboardOpen && (
        <AccountDashboard
          astronaut={astronaut}
          onUpdateSuccess={(updated) => {
            setAstronaut(updated);
            localStorage.setItem(`astronaut_profile_${updated.name}`, JSON.stringify(updated));
          }}
          onClose={() => setIsParentDashboardOpen(false)}
        />
      )}

      {/* Check-In Modal for Mover level */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        astronaut={astronaut}
        onCheckInSuccess={(updated) => {
          setAstronaut(updated);
          localStorage.setItem(`astronaut_profile_${updated.name}`, JSON.stringify(updated));
        }}
      />
    </div>
  );
}

// ─────────── LEADERBOARD ───────────
function LeaderboardView({ leaderboard, myName }: { leaderboard: LeaderboardEntry[]; myName: string }) {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border-2 border-gray-100 shadow-lg overflow-hidden">
      <div className="px-6 py-5 text-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
        <Trophy size={28} className="text-amber-300 mx-auto mb-2" />
        <h2 className="text-xl font-black text-white">Bảng Vàng Sao Sáng</h2>
      </div>
      <div className="p-6 space-y-3">
        {leaderboard.map((u, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${u.name === myName ? 'border-violet-300 bg-violet-50' : 'border-gray-100 bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${i === 0 ? 'bg-amber-400 text-white border-amber-300' : i === 1 ? 'bg-gray-300 text-gray-700 border-gray-200' : i === 2 ? 'bg-amber-700 text-white border-amber-600' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {i + 1}
              </span>
              <div>
                <p className="font-black text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-400 font-semibold">Đã mở: {u.completedPlanetsCount} bài</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 font-black text-amber-500">
              <Star size={16} fill="currentColor" /> {u.stars}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
