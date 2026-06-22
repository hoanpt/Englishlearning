import { useState, useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';
import prestarterData from '../../data/prestarter-units.json';
import PuzzleGame from './PuzzleGame';
import JigsawGame from './JigsawGame';

interface Item {
  id: string;
  word: string;
  vietnamese: string;
  audio_word: string;
  audio_effect: string;
  image_url: string;
}

interface SimonAction {
  command: string;
  audio: string;
  gif_url: string;
}

interface Unit {
  unit_id: number;
  unit_title: string;
  emoji: string;
  color: string;
  items: Item[];
  simon_actions: SimonAction[];
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

interface PreStarterAppProps {
  astronaut: Astronaut;
  onUpdateAstronaut: (updated: Astronaut) => void;
  offlineMode: boolean;
  onSwitchLevel: () => void;
}

export default function PreStarterApp({
  astronaut,
  onUpdateAstronaut,
  offlineMode,
  onSwitchLevel
}: PreStarterAppProps) {
  const units: Unit[] = prestarterData.units as Unit[];
  const [activeTab, setActiveTab] = useState<'safari' | 'findFriend' | 'puzzle' | 'jigsaw'>('safari');
  const [selectedUnitId, setSelectedUnitId] = useState<number>(1);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [mascotBubble, setMascotBubble] = useState('Chào bé! Cùng học nhé! 👋');

  const currentUnit = units.find(u => u.unit_id === selectedUnitId) || units[0];

  // Mascot phrases
  const mascotPhrases = [
    'Bé làm giỏi quá! 🌟',
    'Cố lên nào bé ơi! 💪',
    'Chính xác luôn! Tuyệt vời! 🎉',
    'Thật là xuất sắc! 🥳',
    'Trò chơi này vui quá bé nhỉ? 🎈',
    'Tuyệt vời ông mặt trời! ☀️',
  ];

  const triggerMascotCheer = () => {
    const randomPhrase = mascotPhrases[Math.floor(Math.random() * mascotPhrases.length)];
    setMascotBubble(randomPhrase);
    setTimeout(() => {
      setMascotBubble('Bé cưng cố lên nhé! 🥰');
    }, 4000);
  };

  const addGlobalScore = async () => {
    // Show local animation
    setShowStarAnimation(true);
    setTimeout(() => setShowStarAnimation(false), 1500);

    triggerMascotCheer();

    // Sync to DB/Profile
    const amount = 1;
    const nextStars = astronaut.stars + amount;
    const nextCompleted = [...(astronaut.completedPreStarter || [])];
    if (!nextCompleted.includes(selectedUnitId)) {
      nextCompleted.push(selectedUnitId);
    }
    const updated: Astronaut = {
      ...astronaut,
      stars: nextStars,
      completedPreStarter: nextCompleted
    };

    if (!offlineMode) {
      try {
        const res = await fetch('/api/astronaut/complete-mission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: astronaut.name, 
            planetNumber: selectedUnitId, 
            earnedStars: amount, 
            system: 'prestarter' 
          })
        });
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        onUpdateAstronaut(data.astronaut);
      } catch (err) {
        // Fallback local update
        localStorage.setItem(`astronaut_profile_${astronaut.name}`, JSON.stringify(updated));
        onUpdateAstronaut(updated);
      }
    } else {
      localStorage.setItem(`astronaut_profile_${astronaut.name}`, JSON.stringify(updated));
      onUpdateAstronaut(updated);
    }
  };

  const playTabSwitchSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const handleTabChange = (tab: 'safari' | 'findFriend' | 'puzzle' | 'jigsaw') => {
    setActiveTab(tab);
    playTabSwitchSound();
  };

  const handleUnitChange = (unitId: number) => {
    setSelectedUnitId(unitId);
    playTabSwitchSound();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF0] to-[#FFF8F0] flex flex-col md:flex-row font-sans select-none relative overflow-x-hidden">
      
      {/* TOP HEADER */}
      <header className="w-full bg-white/70 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-emerald-100 md:hidden sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐯</span>
          <span className="font-black text-xl text-emerald-800">Pre-Starter</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300 flex items-center gap-1">
            <span className="text-amber-500">⭐</span>
            <span className="font-black text-amber-700 text-sm">{astronaut.stars}</span>
          </div>
          <button onClick={onSwitchLevel} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* CUTE SIDEBAR LESSON PICKER */}
      <aside className="w-full md:w-36 bg-white/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-emerald-100 flex md:flex-col items-center justify-start gap-4 p-4 md:py-8 shadow-sm md:h-screen md:sticky md:top-0 z-40 overflow-x-auto md:overflow-x-visible md:overflow-y-auto">
        <div className="hidden md:flex flex-col items-center gap-1 mb-6 text-center">
          <div className="text-4xl filter drop-shadow-sm animate-bounce">🐯🐰</div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Làm quen</p>
          <div className="bg-amber-100/80 px-3 py-1 rounded-full border-2 border-amber-300 flex items-center gap-1 mt-1 shadow-sm">
            <span className={`text-xl transition-transform ${showStarAnimation ? 'scale-150 rotate-12' : ''}`}>⭐</span>
            <span className="font-black text-amber-600 text-sm">{astronaut.stars}</span>
          </div>
        </div>
        
        <div className="flex md:flex-col gap-3.5 w-full items-center justify-start md:justify-center">
          {units.map((unit) => {
            const isSelected = unit.unit_id === selectedUnitId;
            return (
              <button
                key={unit.unit_id}
                onClick={() => handleUnitChange(unit.unit_id)}
                className={`
                  w-14 h-14 md:w-20 md:h-20 rounded-[1.8rem] md:rounded-[2.2rem] font-black text-2xl md:text-3xl flex flex-col items-center justify-center
                  transition-all duration-300 transform cursor-pointer border-4 shadow-sm flex-shrink-0
                  ${
                    isSelected
                      ? `bg-gradient-to-tr ${unit.color} text-white scale-110 border-white -translate-y-1 md:-translate-y-0 md:translate-x-1.5 ring-4 ring-emerald-300/30`
                      : "bg-emerald-50/60 text-emerald-800 border-emerald-100 hover:border-emerald-300 hover:scale-105 active:scale-95"
                  }
                `}
              >
                <span className="filter drop-shadow-sm select-none">{unit.emoji}</span>
                <span className="text-[9px] uppercase font-extrabold tracking-tight mt-0.5 max-w-[60px] truncate hidden md:block">
                  {unit.unit_title}
                </span>
              </button>
            );
          })}
        </div>

        <button 
          onClick={onSwitchLevel}
          className="hidden md:flex items-center gap-2 mt-auto w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black text-xs transition-colors justify-center"
        >
          <LogOut size={14} />
          <span>Đổi cấp độ</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Game Switcher Tabs */}
        <div className="bg-white/50 backdrop-blur-md py-4 px-6 flex justify-center flex-wrap gap-4 border-b border-emerald-50 sticky top-0 md:top-0 z-30 shadow-sm">
          <button
            onClick={() => handleTabChange('safari')}
            className={`px-6 py-3 rounded-2xl font-black text-sm md:text-lg transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md ${
              activeTab === 'safari'
                ? 'bg-emerald-500 text-white scale-105 ring-4 ring-emerald-300/40'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>🐾</span>
            <span>Thảo Cầm Viên</span>
          </button>
          <button
            onClick={() => handleTabChange('findFriend')}
            className={`px-6 py-3 rounded-2xl font-black text-sm md:text-lg transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md ${
              activeTab === 'findFriend'
                ? 'bg-amber-500 text-white scale-105 ring-4 ring-amber-300/40'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span>🔍</span>
            <span>Tìm Bạn Nhỏ</span>
          </button>
          <button
            onClick={() => handleTabChange('puzzle')}
            className={`px-6 py-3 rounded-2xl font-black text-sm md:text-lg transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md ${
              activeTab === 'puzzle'
                ? 'bg-rose-500 text-white scale-105 ring-4 ring-rose-300/40'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span>🧩</span>
            <span>Ghép Bóng</span>
          </button>
          <button
            onClick={() => handleTabChange('jigsaw')}
            className={`px-6 py-3 rounded-2xl font-black text-sm md:text-lg transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md ${
              activeTab === 'jigsaw'
                ? 'bg-indigo-500 text-white scale-105 ring-4 ring-indigo-300/40'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <span>✂️</span>
            <span>Xếp Hình</span>
          </button>
        </div>

        {/* Dynamic Game Render */}
        <main className="flex-1 flex flex-col relative pb-32">
          {activeTab === 'safari' && <SoundGardenGame unit={currentUnit} onWin={addGlobalScore} />}
          {activeTab === 'findFriend' && <FindFriendGame unit={currentUnit} onWin={addGlobalScore} />}
          {activeTab === 'puzzle' && <PuzzleGame unit={currentUnit} onWin={addGlobalScore} />}
          {activeTab === 'jigsaw' && <JigsawGame unit={currentUnit} onWin={addGlobalScore} />}
        </main>
      </div>

      {/* FLOATING MASCOT CHEERING THEM ON */}
      <div className="fixed bottom-6 right-6 md:left-6 md:right-auto z-50 pointer-events-none drop-shadow-2xl">
        <div className="relative">
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-emerald-500/20 blur-xl rounded-[100%]" />
          <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 border-4 border-emerald-400 rounded-full flex items-center justify-center text-4xl md:text-5xl relative animate-float shadow-[0_0_30px_rgba(52,211,153,0.3)]">
            <span>👨‍🚀</span>
            {astronaut.equippedAccessory === 'wizard_hat' && (
              <>
                <span className="absolute -top-5 -right-3 text-4xl animate-bounce">🧙</span>
                <span className="absolute -top-8 left-0 text-lg animate-spin text-amber-300">✨</span>
              </>
            )}
            {astronaut.equippedAccessory === 'dragon_wings' && (
              <>
                <span className="absolute -bottom-1 -left-4 text-5xl animate-pulse">🐉</span>
                <span className="absolute -bottom-4 -right-1 text-xl animate-bounce">🔥</span>
              </>
            )}
            {astronaut.equippedAccessory === 'telescope' && (
              <>
                <span className="absolute -bottom-2 -right-4 text-4xl">🔭</span>
                <div className="absolute inset-0 border border-dashed border-cyan-500/40 rounded-full animate-[spin_10s_linear_infinite]" />
              </>
            )}
            {astronaut.equippedAccessory === 'energy_shield' && (
              <>
                <span className="absolute -top-3 -left-3 text-4xl animate-pulse">🛡️</span>
                <div className="absolute inset-[-10px] border-[2px] border-amber-500/40 rounded-full animate-ping opacity-50" />
              </>
            )}
          </div>
          
          {/* Encouragement Speech Bubble */}
          <div className="absolute -top-12 -left-2 md:left-auto md:-right-24 bg-white px-3.5 py-2 rounded-2xl rounded-bl-none md:rounded-bl-none md:rounded-br-none shadow-lg border border-emerald-100 animate-bounce max-w-[150px]">
            <p className="text-[10px] md:text-xs font-black text-emerald-600">{mascotBubble}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GAME 1: THẢO CẦM VIÊN ÂM THANH
// ============================================================================
function SoundGardenGame({ unit, onWin }: { unit: Unit; onWin?: () => void }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'effect' | 'word'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const playIntro = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance('Look!');
        utter.lang = 'en-US';
        utter.rate = 0.85;
        utter.pitch = 1.15;
        
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.startsWith('en') && /female|samantha|zira|karen/i.test(v.name))
          || voices.find(v => v.lang.startsWith('en'));
        if (engVoice) utter.voice = engVoice;
        
        window.speechSynthesis.speak(utter);
      } else {
        const introAudio = new Audio('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=Look!');
        introAudio.play().catch(() => {});
      }
    };
    setTimeout(playIntro, 350);

    return () => {
      if (audioRef.current) audioRef.current.pause();
      setPlayingId(null);
      setCurrentPhase('idle');
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [unit]);

  const playItemSound = (item: Item) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setPlayingId(item.id);
    setCurrentPhase('effect');

    const speakWord = (text: string, callback: () => void) => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 0.8;
        utter.pitch = 1.1;

        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.startsWith('en') && /female|samantha|zira|karen/i.test(v.name))
          || voices.find(v => v.lang.startsWith('en'));
        if (engVoice) utter.voice = engVoice;

        utter.onend = () => callback();
        utter.onerror = () => callback();
        window.speechSynthesis.speak(utter);
      } else {
        const wordAudio = new Audio(item.audio_word);
        audioRef.current = wordAudio;
        wordAudio.play().then(() => {
          wordAudio.onended = () => callback();
        }).catch(() => callback());
      }
    };

    const effectAudio = new Audio(item.audio_effect);
    audioRef.current = effectAudio;

    effectAudio.play().then(() => {
      effectAudio.onended = () => {
        setCurrentPhase('word');
        speakWord(item.word, () => {
          setPlayingId(null);
          setCurrentPhase('idle');
          if (onWin) onWin();
        });
      };
    }).catch(() => {
      setCurrentPhase('word');
      speakWord(item.word, () => {
        setPlayingId(null);
        setCurrentPhase('idle');
        if (onWin) onWin();
      });
    });
  };

  return (
    <div className="flex-1 p-4 md:px-8 pt-6 flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4 py-4">
        {unit.items.map((item) => {
          const isPlaying = playingId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => playItemSound(item)}
              className={`
                relative flex flex-col items-center bg-white p-4 md:p-6 rounded-[2.5rem] shadow-md
                border-8 transition-all duration-300 transform outline-none cursor-pointer
                aspect-square justify-between
                ${
                  isPlaying
                    ? 'border-amber-400 bg-amber-50 scale-105 shadow-2xl shadow-amber-200/50 -translate-y-2 ring-8 ring-amber-300/20'
                    : 'border-emerald-100 hover:border-emerald-300 hover:scale-105 active:scale-95 hover:-translate-y-1 hover:shadow-lg'
                }
              `}
            >
              {isPlaying && (
                <div className="absolute -top-3 -right-2 bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md animate-bounce border-2 border-white">
                  {currentPhase === 'effect' ? '🔊' : '🗣️'}
                </div>
              )}

              <div className="w-full h-[75%] rounded-[1.8rem] overflow-hidden bg-emerald-50/50 border-2 border-emerald-100 relative group">
                <img
                  src={item.image_url}
                  alt={item.word}
                  className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center animate-pulse">
                    <span className="text-4xl animate-ping opacity-75">🔔</span>
                  </div>
                )}
              </div>

              <div className="text-center w-full mt-1.5">
                <h3 className="text-lg md:text-2xl font-black text-emerald-800 tracking-wide">
                  {item.word}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-400 font-semibold">{item.vietnamese}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// GAME 2: TÌM BẠN NHỎ
// ============================================================================
function FindFriendGame({ unit, onWin }: { unit: Unit; onWin?: () => void }) {
  const [correctItem, setCorrectItem] = useState<Item | null>(null);
  const [options, setOptions] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const [showGiftBox, setShowGiftBox] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [rewardSticker, setRewardSticker] = useState<'star' | 'crown'>('star');
  
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);
  const effectAudioRef = useRef<HTMLAudioElement | null>(null);
  const rewardAudioRef = useRef<HTMLAudioElement | null>(null);

  const playAlertChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const playFeedbackSound = (type: 'correct' | 'wrong') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const startNewRound = () => {
    if (unit.items.length < 3) return;

    const correctIndex = Math.floor(Math.random() * unit.items.length);
    const correct = unit.items[correctIndex];

    const wrongPool = unit.items.filter((a) => a.id !== correct.id);
    const shuffledWrong = [...wrongPool].sort(() => Math.random() - 0.5);
    const selectedWrong = shuffledWrong.slice(0, 2);

    const roundOptions = [correct, ...selectedWrong].sort(() => Math.random() - 0.5);

    setCorrectItem(correct);
    setOptions(roundOptions);
    setSelectedId(null);
    setIsCorrect(null);
    setShakeId(null);

    if (questionAudioRef.current) questionAudioRef.current.pause();
    if (effectAudioRef.current) effectAudioRef.current.pause();

    setTimeout(() => {
      playAlertChime();
      playQuestion(correct);
    }, 400);
  };

  const playQuestion = (target: Item) => {
    if (!target) return;

    if (questionAudioRef.current) questionAudioRef.current.pause();
    if (effectAudioRef.current) effectAudioRef.current.pause();

    const questionTemplates = [
      `Where is the ${target.word}?`,
      `Can you find the ${target.word}?`,
      `Point to the ${target.word}!`,
      `Which one is the ${target.word}?`,
      `Show me the ${target.word}!`,
      `Do you see the ${target.word}?`,
      `Let's look for the ${target.word}.`,
      `I am looking for the ${target.word}.`,
      `Help me find the ${target.word}!`,
      `Can you spot the ${target.word}?`,
      `Where could the ${target.word} be?`,
      `Find the ${target.word} for me!`,
      `Tap on the ${target.word}!`,
      `Touch the ${target.word}!`,
      `Can you see the ${target.word}?`,
      `Look for the ${target.word}!`,
      `Let's find the ${target.word}!`,
      `Can you show me the ${target.word}?`,
      `It's time to find the ${target.word}!`,
      `Where did the ${target.word} go?`
    ];
    let phrase = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    const questionText = `Listen! ${phrase}`;

    const playEffectSound = () => {
      const effectAudio = new Audio(target.audio_effect);
      effectAudioRef.current = effectAudio;
      effectAudio.play().catch(() => {});
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(questionText);
      utter.lang = 'en-US';
      utter.rate = 0.8;
      utter.pitch = 1.1;

      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en') && /female|samantha|zira|karen/i.test(v.name))
        || voices.find(v => v.lang.startsWith('en'));
      if (engVoice) utter.voice = engVoice;

      utter.onend = () => {
        playEffectSound();
      };
      utter.onerror = () => {
        playEffectSound();
      };

      window.speechSynthesis.speak(utter);
    } else {
      const listenUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=Listen!`;
      const listenAudio = new Audio(listenUrl);
      questionAudioRef.current = listenAudio;

      listenAudio.play().then(() => {
        listenAudio.onended = () => {
          const questionUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(phrase)}`;
          const questionAudio = new Audio(questionUrl);
          questionAudioRef.current = questionAudio;
          questionAudio.play().then(() => {
            questionAudio.onended = () => {
              playEffectSound();
            };
          }).catch(() => {
            playEffectSound();
          });
        };
      }).catch(() => {
        playEffectSound();
      });
    }
  };

  useEffect(() => {
    setScore(0);
    setShowGiftBox(false);
    setGiftOpened(false);
    startNewRound();
    return () => {
      if (questionAudioRef.current) questionAudioRef.current.pause();
      if (effectAudioRef.current) effectAudioRef.current.pause();
      if (rewardAudioRef.current) rewardAudioRef.current.pause();
    };
  }, [unit]);

  const handleSelect = (item: Item) => {
    if (isCorrect) return;

    setSelectedId(item.id);

    if (item.id === correctItem?.id) {
      setIsCorrect(true);
      const newScore = score + 1;
      setScore(newScore);
      playFeedbackSound('correct');
      if (onWin) onWin();

      if (questionAudioRef.current) questionAudioRef.current.pause();
      if (effectAudioRef.current) effectAudioRef.current.pause();

      setTimeout(() => {
        if (newScore === 5) {
          setShowGiftBox(true);
        } else {
          startNewRound();
        }
      }, 2000);
    } else {
      setIsCorrect(false);
      setShakeId(item.id);
      playFeedbackSound('wrong');
      
      setTimeout(() => {
        setShakeId(null);
      }, 500);
    }
  };

  const handleOpenGift = () => {
    if (giftOpened) return;

    const applause = new Audio('https://upload.wikimedia.org/wikipedia/commons/e/e6/Applause.ogg');
    rewardAudioRef.current = applause;
    applause.play().catch(() => {});

    const stickers: Array<'star' | 'crown'> = ['star', 'crown'];
    const chosen = stickers[Math.floor(Math.random() * stickers.length)];
    
    setRewardSticker(chosen);
    setGiftOpened(true);
  };

  const resetAllGames = () => {
    setScore(0);
    setShowGiftBox(false);
    setGiftOpened(false);
    startNewRound();
  };

  if (!correctItem) return null;

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-between relative overflow-hidden min-h-[calc(100vh-160px)]">
      <div className="absolute top-10 left-10 text-yellow-300/20 text-8xl animate-spin select-none pointer-events-none">⭐</div>
      <div className="absolute bottom-10 right-10 text-emerald-300/20 text-8xl animate-bounce select-none pointer-events-none">🎈</div>

      <div className="w-full max-w-4xl flex justify-between items-center mb-4 z-10">
        <div className="bg-amber-100/90 border-4 border-amber-300 px-4 py-2.5 rounded-full shadow-sm flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span
              key={idx}
              className={`text-2xl transition-transform duration-300 ${
                idx < score ? 'scale-110 filter drop-shadow-md animate-pulse' : 'opacity-30 scale-90'
              }`}
            >
              🍎
            </span>
          ))}
        </div>

        <button
          onClick={() => playQuestion(correctItem)}
          disabled={showGiftBox}
          className="bg-purple-500 hover:bg-purple-600 active:scale-95 text-white p-4 rounded-full shadow-lg border-4 border-purple-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-3xl">📢</span>
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-3 gap-4 md:gap-8 px-4 py-4 relative z-10 flex-1 items-center justify-center">
        {options.map((item) => {
          const isSelected = selectedId === item.id;
          const isShake = shakeId === item.id;
          const cardClass = isSelected
            ? item.id === correctItem.id
              ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-2xl shadow-emerald-200/50'
              : 'border-rose-400 bg-rose-50'
            : 'border-amber-300 bg-white hover:border-amber-500 hover:scale-105 active:scale-95 hover:shadow-2xl';

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              disabled={isCorrect === true || showGiftBox}
              className={`
                relative flex flex-col items-center p-4 md:p-6 rounded-[2.5rem] md:rounded-[3rem] shadow-lg
                border-8 transition-all duration-300 transform outline-none cursor-pointer
                w-full aspect-square justify-center
                ${cardClass}
                ${isShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}
              `}
            >
              <style>{`
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  20%, 60% { transform: translateX(-10px); }
                  40%, 80% { transform: translateX(10px); }
                }
              `}</style>

              {isSelected && item.id === correctItem.id && (
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white font-black text-2xl w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-bounce">
                  ⭐
                </div>
              )}
              {isSelected && item.id !== correctItem.id && (
                <div className="absolute -top-4 -right-4 bg-rose-500 text-white font-black text-2xl w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                  ❌
                </div>
              )}

              <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-amber-50 border-2 border-amber-100 relative">
                <img
                  src={item.image_url}
                  alt={item.word}
                  className="w-full h-full object-contain p-3"
                  loading="lazy"
                />
              </div>
            </button>
          );
        })}
      </div>

      {isCorrect && !showGiftBox && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950/40 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
          <div className="bg-white p-6 md:p-10 rounded-[3rem] border-8 border-emerald-400 shadow-2xl text-center max-w-sm mx-4 transform scale-110 transition-transform duration-300 animate-[bounce_1s_infinite]">
            <div className="text-6xl mb-3 animate-bounce">🥳🌟</div>
            <h3 className="text-3xl font-black text-emerald-600 leading-tight">
              {correctItem.word}!
            </h3>
            <p className="text-slate-500 font-bold text-sm mt-1">({correctItem.vietnamese})</p>
          </div>
        </div>
      )}

      {showGiftBox && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-purple-950/50 backdrop-blur-md animate-[fade-in_0.3s_ease-out]">
          <div className="bg-[#FFFDF0] p-8 md:p-12 rounded-[4rem] border-8 border-amber-400 shadow-2xl text-center max-w-md mx-4 flex flex-col items-center relative overflow-hidden animate-[scale-up_0.4s_ease-out]">
            <style>{`
              @keyframes scale-up {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes wiggle {
                0%, 100% { transform: rotate(0deg); }
                15% { transform: rotate(-8deg); }
                30% { transform: rotate(6deg); }
                45% { transform: rotate(-4deg); }
                60% { transform: rotate(2deg); }
              }
            `}</style>

            {!giftOpened ? (
              <>
                <h3 className="text-2xl md:text-3xl font-black text-purple-700 leading-tight mb-6">
                  Bé nhận hộp quà nhé! 🎁
                </h3>
                <button
                  onClick={handleOpenGift}
                  className="w-44 h-44 md:w-52 md:h-52 animate-[wiggle_1.5s_infinite] hover:scale-105 active:scale-95 transition-transform duration-200 outline-none cursor-pointer flex items-center justify-center relative bg-gradient-to-tr from-amber-400 to-amber-500 rounded-[2.5rem] shadow-xl border-4 border-white"
                >
                  <span className="text-7xl filter drop-shadow-md select-none">🎁</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black text-emerald-600 leading-tight mb-6">
                  Quà đặc biệt của bé! 🎉
                </h3>
                <div className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 flex flex-col items-center justify-center shadow-2xl border-[8px] border-white animate-[bounce_1.2s_infinite] relative">
                  <div className="absolute inset-0 bg-yellow-300/10 rounded-full animate-ping opacity-75"></div>
                  <span className="text-7xl filter drop-shadow-lg select-none">
                    {rewardSticker === 'star' ? '⭐' : '👑'}
                  </span>
                </div>
                <button
                  onClick={resetAllGames}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xl px-10 py-4 rounded-[2rem] shadow-xl border-4 border-emerald-300 transition-all cursor-pointer transform hover:scale-105 mt-8"
                >
                  Tiếp Tục Chơi! 🎮
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
