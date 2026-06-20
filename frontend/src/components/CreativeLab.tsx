import { useState, useEffect, useMemo, useCallback } from 'react';
import { Star, Search, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import curriculumData from '../data/units.json';

interface Astronaut {
  name: string;
  stars: number;
  completedPlanets: number[];
  badges: string[];
  accessories: string[];
  equippedAccessory: string;
}

interface CreativeLabProps {
  astronaut: Astronaut;
  onUpdateAstronaut: (updated: Astronaut) => void;
  offlineMode: boolean;
}

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  scale: number;
}

const GRID_SIZE = 10;

interface GridCell {
  letter: string;
  partOf: string[];
}

interface HiddenWord {
  clean: string;
  original: string;
  meaning: string;
}

export default function CreativeLab({ astronaut, onUpdateAstronaut, offlineMode }: CreativeLabProps) {
  const allWords = useMemo(() => {
    return curriculumData.flatMap(unit =>
      unit.vocabulary.map(vocab => ({
        ...vocab,
        unitNumber: unit.unit_id,
        unitTitle: unit.unit_title
      }))
    );
  }, []);

  const [selectedUnitFilter, setSelectedUnitFilter] = useState<number>(0);
  
  const filteredWords = useMemo(() => {
    return allWords.filter(w =>
      selectedUnitFilter === 0 ? true : w.unitNumber === selectedUnitFilter
    );
  }, [allWords, selectedUnitFilter]);

  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [hiddenWords, setHiddenWords] = useState<HiddenWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const generatePuzzle = useCallback(() => {
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    const toHide = shuffled.slice(0, 5).map(w => ({
      clean: w.word.toUpperCase().replace(/[^A-Z]/g, ''),
      original: w.word,
      meaning: w.meaning
    })).filter(w => w.clean.length > 0 && w.clean.length <= GRID_SIZE);

    const newGrid: GridCell[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ letter: '', partOf: [] }))
    );

    const placedWords: HiddenWord[] = [];

    for (const wordObj of toHide) {
      const cleanWord = wordObj.clean;
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 150) {
        attempts++;
        const isHorizontal = Math.random() > 0.5;
        const startX = Math.floor(Math.random() * (isHorizontal ? (GRID_SIZE - cleanWord.length + 1) : GRID_SIZE));
        const startY = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE : (GRID_SIZE - cleanWord.length + 1)));

        let canPlace = true;
        for (let i = 0; i < cleanWord.length; i++) {
          const x = isHorizontal ? startX + i : startX;
          const y = isHorizontal ? startY : startY + i;
          // STRICT RULE: No overlapping letters to fix "chồng chéo" bug
          if (newGrid[y][x].letter !== '') {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < cleanWord.length; i++) {
            const x = isHorizontal ? startX + i : startX;
            const y = isHorizontal ? startY : startY + i;
            newGrid[y][x].letter = cleanWord[i];
            newGrid[y][x].partOf.push(cleanWord);
          }
          placed = true;
          placedWords.push(wordObj);
        }
      }
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (newGrid[y][x].letter === '') {
          newGrid[y][x].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
    setHiddenWords(placedWords);
    setFoundWords([]);
  }, [filteredWords]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  useEffect(() => {
    if (particles.length === 0) return;
    let active = true;
    const animateParticles = () => {
      if (!active) return;
      setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.25, alpha: p.alpha - 0.015 })).filter(p => p.alpha > 0));
      requestAnimationFrame(animateParticles);
    };
    const id = requestAnimationFrame(animateParticles);
    return () => { active = false; cancelAnimationFrame(id); };
  }, [particles]);

  const triggerEmojiFireworks = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899'] });
    const emojis = ['🎉', '✨', '🌟', '⭐', '🎈', '❤️', '🏆', '🎯'];
    const newParticles: Particle[] = [];
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight * 0.45;

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      newParticles.push({
        id: Math.random() + Date.now() + i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: startX, y: startY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4,
        alpha: 1, scale: 0.6 + Math.random() * 1.4
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const playSuccessSound = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);
        
        gainNode.gain.setValueAtTime(0.12, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = audioCtx.currentTime;
      playNote(659.25, now, 0.15); // E5
      playNote(783.99, now + 0.12, 0.3); // G5
    } catch (error) {
      console.error('AudioContext error:', error);
    }
  };

  const awardStars = async (amount: number) => {
    if (!offlineMode) {
      try {
        const res = await fetch('/api/astronaut/add-stars', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: astronaut.name, stars: amount })
        });
        if (!res.ok) throw new Error('Add stars failed');
        const updatedProfile = await res.json();
        onUpdateAstronaut(updatedProfile);
      } catch (err) {
        awardStarsOffline(amount);
      }
    } else {
      awardStarsOffline(amount);
    }
  };

  const awardStarsOffline = (amount: number) => {
    const updated: Astronaut = { ...astronaut, stars: astronaut.stars + amount };
    localStorage.setItem(`astronaut_profile_${astronaut.name}`, JSON.stringify(updated));
    onUpdateAstronaut(updated);
  };

  const handleMouseDown = (x: number, y: number) => {
    setIsDragging(true);
    setDragStart({ x, y });
    setDragEnd({ x, y });
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (isDragging) setDragEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const cells = getSelectedCells();
    if (cells.length === 0) return;

    const selectedWord1 = cells.map(c => grid[c.y][c.x].letter).join('');
    const selectedWord2 = cells.map(c => grid[c.y][c.x].letter).reverse().join('');

    let match = hiddenWords.find(w => w.clean === selectedWord1 || w.clean === selectedWord2);
    
    if (match && !foundWords.includes(match.clean)) {
      setFoundWords(prev => [...prev, match!.clean]);
      triggerEmojiFireworks();
      playSuccessSound();
      awardStars(5);
    }

    setDragStart(null);
    setDragEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.hasAttribute('data-x') && el.hasAttribute('data-y')) {
      const x = parseInt(el.getAttribute('data-x')!);
      const y = parseInt(el.getAttribute('data-y')!);
      setDragEnd({ x, y });
    }
  };

  const getSelectedCells = () => {
    if (!dragStart || !dragEnd) return [];
    const dx = dragEnd.x - dragStart.x;
    const dy = dragEnd.y - dragStart.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return []; // Must be straight line
    
    const stepX = dx === 0 ? 0 : dx / steps;
    const stepY = dy === 0 ? 0 : dy / steps;
    
    const cells = [];
    for (let i = 0; i <= steps; i++) {
      cells.push({ x: dragStart.x + i * stepX, y: dragStart.y + i * stepY });
    }
    return cells;
  };

  const isCellSelected = (x: number, y: number) => {
    const cells = getSelectedCells();
    return cells.some(c => c.x === x && c.y === y);
  };

  const isCellFound = (x: number, y: number) => {
    return grid[y][x].partOf.some(w => foundWords.includes(w));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none" onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map(p => (
            <div key={p.id} className="absolute text-3xl transition-all ease-out" style={{ left: `${p.x}px`, top: `${p.y}px`, opacity: p.alpha, transform: `translate(-50%, -50%) scale(${p.scale})` }}>{p.emoji}</div>
          ))}
        </div>
      )}

      {/* Header banner */}
      <div className="bg-gradient-to-r from-teal-500 via-emerald-600 to-green-600 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjMiLz48Y2lyY2xlIGN4PSIxNDAiIGN5PSI3MCIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjUiLz48L3N2Zz4=')] opacity-20" />
        <div className="relative space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <span>🔍</span> TÌM TỪ VỰNG BÍ ẨN
          </h2>
          <p className="text-sm font-semibold text-emerald-100 max-w-xl">
            Phi hành gia nhí đồng hành cùng con! Bôi đen các chữ cái để tìm từ vựng tiếng Anh bị giấu trong bảng và nhận Sao Sáng!
          </p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[140px]">
          <span className="text-[10px] text-emerald-100 block uppercase font-bold tracking-wider">Ngân khố sao</span>
          <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-xl">
            <Star fill="currentColor" size={20} className="animate-bounce" />
            <span>{astronaut.stars} Sao</span>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider self-center">Chọn bài học:</label>
          <select
            value={selectedUnitFilter}
            onChange={(e) => { setSelectedUnitFilter(Number(e.target.value)); }}
            className="bg-gray-50 border-2 border-gray-200 text-gray-700 font-bold rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value={0}>🪐 Ngẫu nhiên tất cả (Random)</option>
            {curriculumData.map(u => (
              <option key={u.unit_id} value={u.unit_id}>Hành tinh {u.unit_id}: {u.unit_title.slice(0, 30)}...</option>
            ))}
          </select>
        </div>
        <button
          onClick={generatePuzzle}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 rounded-xl font-black text-sm hover:bg-emerald-200 active:scale-95 transition-all"
        >
          <RefreshCw size={16} /> Tạo bảng mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left: Word Search Grid & List */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-100 rounded-3xl p-5 sm:p-8 shadow-md flex flex-col space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <h4 className="font-black text-lg text-gray-800 flex items-center gap-2">
              <Search className="text-emerald-500" /> Bảng Chữ Cái 10x10
            </h4>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Đã tìm: {foundWords.length}/{hiddenWords.length}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            {/* 10x10 Grid */}
            <div 
              className="grid grid-cols-10 gap-1 bg-gray-50 p-3 rounded-3xl border-4 border-emerald-100 mx-auto touch-none shadow-inner"
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
            >
              {grid.map((row, y) => row.map((cell, x) => {
                const selected = isCellSelected(x, y);
                const found = isCellFound(x, y);
                return (
                  <div
                    key={`${x}-${y}`}
                    data-x={x} data-y={y}
                    onMouseDown={() => handleMouseDown(x, y)}
                    onMouseEnter={() => handleMouseEnter(x, y)}
                    onTouchStart={() => handleMouseDown(x, y)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center font-black text-lg sm:text-xl rounded-xl cursor-pointer select-none transition-all duration-150 ${
                      selected ? 'bg-amber-400 text-white scale-110 shadow-lg z-10' 
                      : found ? 'bg-emerald-500 text-white shadow-inner scale-105 ring-2 ring-emerald-300' 
                      : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200 shadow-sm'
                    }`}
                  >
                    {cell.letter}
                  </div>
                );
              }))}
            </div>

            {/* Word List */}
            <div className="flex flex-col gap-3 w-full md:w-48">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center md:text-left">Danh sách từ cần tìm:</p>
              {hiddenWords.map((w) => {
                const isFound = foundWords.includes(w.clean);
                return (
                  <div
                    key={w.clean}
                    className={`p-3 text-left rounded-xl transition-all border-2 ${
                      isFound 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-60' 
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <p className={`font-black text-sm ${isFound ? 'line-through' : ''}`}>
                      {isFound && '✅ '}{w.original}
                    </p>
                    <p className="text-xs font-semibold opacity-80 truncate">{w.meaning}</p>
                    {!isFound && <span className="text-[10px] font-bold text-amber-500 mt-1 block">🏆 +5 Sao</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Mascot Encouragement */}
        <div className="lg:col-span-1 bg-gradient-to-b from-indigo-900 to-slate-900 border-2 border-indigo-950/60 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden text-center group">
          {/* Animated Background stars */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjMiLz48L3N2Zz4=')] opacity-30 animate-pulse" />
          
          <div className="space-y-4 relative z-10 w-full">
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-950/80 border border-indigo-900/50 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block shadow-lg">
              Phi Hành Gia Hỗ Trợ
            </span>
            
            {/* Mascot Showcase Container */}
            <div className="my-10 py-10 relative flex items-center justify-center">
              {/* Magic Platform / Aura */}
              <div className="absolute bottom-0 w-48 h-12 bg-indigo-500/20 blur-xl rounded-[100%]" />
              <div className="absolute w-44 h-44 rounded-full border-2 border-indigo-500/10 animate-ping opacity-60" />
              <div className="absolute w-36 h-36 rounded-full border-2 border-purple-500/20 animate-pulse bg-gradient-to-tr from-purple-500/10 to-indigo-500/10" />
              
              {/* Mascot Bubble */}
              <div className="w-32 h-32 bg-slate-950 border-4 border-indigo-500/50 rounded-full flex items-center justify-center text-6xl relative shadow-[0_0_40px_rgba(99,102,241,0.4)] z-10 animate-float">
                <span>👨‍🚀</span>
                
                {/* Accessory Overlay elements with unique animations */}
                {astronaut.equippedAccessory === 'wizard_hat' && (
                  <>
                    <span className="absolute -top-7 -right-4 text-5xl animate-bounce" title="Mũ phù thủy">🧙</span>
                    <span className="absolute -top-10 left-0 text-xl animate-spin text-amber-300">✨</span>
                    <span className="absolute top-0 -right-8 text-lg animate-ping text-purple-300">🌟</span>
                  </>
                )}
                {astronaut.equippedAccessory === 'dragon_wings' && (
                  <>
                    <span className="absolute -bottom-2 -left-6 text-6xl animate-pulse" title="Cánh rồng lửa">🐉</span>
                    <span className="absolute -bottom-6 -right-2 text-2xl animate-bounce">🔥</span>
                  </>
                )}
                {astronaut.equippedAccessory === 'telescope' && (
                  <>
                    <span className="absolute -bottom-2 -right-6 text-5xl transition-transform hover:scale-110" title="Kính viễn vọng">🔭</span>
                    <div className="absolute inset-0 border border-dashed border-cyan-500/40 rounded-full animate-[spin_10s_linear_infinite]" />
                    <span className="absolute -top-4 -left-4 text-2xl animate-pulse">🪐</span>
                  </>
                )}
                {astronaut.equippedAccessory === 'energy_shield' && (
                  <>
                    <span className="absolute -top-4 -left-5 text-5xl animate-pulse" title="Khiên năng lượng">🛡️</span>
                    <div className="absolute inset-[-12px] border-[3px] border-amber-500/40 rounded-full animate-ping opacity-50" />
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-indigo-900/40 p-4 rounded-2xl backdrop-blur-sm mx-auto max-w-[200px]">
              <p className="text-sm font-bold text-slate-200">
                {foundWords.length === hiddenWords.length ? "Tuyệt vời! Con tìm giỏi quá! 🎉" : "Cố lên con nhé! Tìm nốt từ nào! 💪"}
              </p>
              {astronaut.equippedAccessory && (
                <p className="text-[10px] text-indigo-300 font-semibold italic mt-2 border-t border-indigo-900/30 pt-2">
                  Đang dùng hiệu ứng đặc biệt
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
