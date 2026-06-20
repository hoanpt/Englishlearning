"use client";

import React, { useState, useEffect, useRef } from "react";

export interface Item {
  id: string;
  word: string;
  vietnamese: string;
  audio_word: string;
  audio_effect: string;
  image_url: string;
}

export interface Unit {
  unit_id: number;
  unit_title: string;
  emoji: string;
  color: string;
  items: Item[];
}

interface Piece {
  id: number; // 0: TL, 1: TR, 2: BL, 3: BR
  bgPosX: string;
  bgPosY: string;
}

const PIECE_DEFS: Piece[] = [
  { id: 0, bgPosX: "0%", bgPosY: "0%" },
  { id: 1, bgPosX: "100%", bgPosY: "0%" },
  { id: 2, bgPosX: "0%", bgPosY: "100%" },
  { id: 3, bgPosX: "100%", bgPosY: "100%" }
];

interface ConfettiItem {
  id: number;
  emoji: string;
  leftPercent: number;
  topPercent: number;
  scale: number;
  angle: number;
}

export default function JigsawGame({ unit, onWin }: { unit: Unit, onWin?: () => void }) {
  const [correctItem, setCorrectItem] = useState<Item | null>(null);
  
  // Board has 4 slots (0 to 3)
  const [board, setBoard] = useState<(Piece | null)[]>([null, null, null, null]);
  const [tray, setTray] = useState<Piece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiItem[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: "select" | "place" | "remove" | "correct") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "select") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "place") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "remove") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {}
  };

  const startNewRound = () => {
    if (unit.items.length === 0) return;
    
    // Select a random item
    const nextItem = unit.items[Math.floor(Math.random() * unit.items.length)];
    setCorrectItem(nextItem);
    
    // Shuffle pieces for tray
    const shuffled = [...PIECE_DEFS].sort(() => Math.random() - 0.5);
    
    setTray(shuffled);
    setBoard([null, null, null, null]);
    setSelectedPieceId(null);
    setIsMatched(false);
    setConfetti([]);
  };

  useEffect(() => {
    startNewRound();
  }, [unit]);

  const handleSelectTrayPiece = (piece: Piece) => {
    if (isMatched) return;
    playSound("select");
    if (selectedPieceId === piece.id) {
      setSelectedPieceId(null); // deselect
    } else {
      setSelectedPieceId(piece.id);
    }
  };

  const handleBoardSlotClick = (slotIndex: number) => {
    if (isMatched) return;

    if (selectedPieceId !== null) {
      // We are trying to place a piece from the tray onto the board
      const pieceToPlace = tray.find(p => p.id === selectedPieceId);
      if (!pieceToPlace) return;

      const newBoard = [...board];
      const newTray = tray.filter(p => p.id !== selectedPieceId);

      // If there is already a piece in the slot, put it back to tray
      const existingPiece = newBoard[slotIndex];
      if (existingPiece) {
        newTray.push(existingPiece);
      }

      newBoard[slotIndex] = pieceToPlace;
      setBoard(newBoard);
      setTray(newTray);
      setSelectedPieceId(null);
      playSound("place");

      checkWin(newBoard);
    } else {
      // No piece selected. If we clicked an occupied slot, remove it to tray
      const existingPiece = board[slotIndex];
      if (existingPiece) {
        const newBoard = [...board];
        newBoard[slotIndex] = null;
        setBoard(newBoard);
        setTray([...tray, existingPiece]);
        playSound("remove");
      }
    }
  };

  const checkWin = (currentBoard: (Piece | null)[]) => {
    // Check if every slot has the correct piece (piece.id === slotIndex)
    const isWin = currentBoard.every((piece, index) => piece && piece.id === index);
    if (isWin) {
      setIsMatched(true);
      playSound("correct");
      if (onWin) onWin();

      // Trigger Confetti
      const fireworksEmojis = ["🌟", "✨", "🎉", "🎈", "🧩"];
      const newConfetti = Array.from({ length: 20 }).map((_, i) => ({
        id: Date.now() + i,
        emoji: fireworksEmojis[Math.floor(Math.random() * fireworksEmojis.length)],
        leftPercent: 20 + Math.random() * 60,
        topPercent: 20 + Math.random() * 60,
        scale: 0.6 + Math.random() * 1.0,
        angle: Math.random() * 360
      }));
      setConfetti(newConfetti);

      // Read word
      if (correctItem) {
        const wordAudio = new Audio(correctItem.audio_word);
        wordAudio.play().catch(() => {
          if (typeof window !== "undefined" && window.speechSynthesis) {
            const utter = new SpeechSynthesisUtterance(correctItem.word);
            utter.lang = "en-US";
            utter.rate = 0.8;
            window.speechSynthesis.speak(utter);
          }
        });
      }

      setTimeout(() => {
        startNewRound();
      }, 3500);
    }
  };

  if (!correctItem) return null;

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col items-center min-h-[calc(100vh-100px)] relative overflow-hidden bg-emerald-50/30">
      {/* Visual Fireworks Confetti */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="absolute animate-[fireworkSpread_1.2s_ease-out_forwards] pointer-events-none select-none z-40 text-4xl"
          style={{
            left: `${c.leftPercent}%`,
            top: `${c.topPercent}%`,
            transform: `scale(${c.scale}) rotate(${c.angle}deg)`,
            "--tx": `${(Math.random() - 0.5) * 300}px`,
            "--ty": `${(Math.random() - 0.5) * 300}px`,
          } as React.CSSProperties}
        >
          {c.emoji}
        </span>
      ))}

      <style>{`
        @keyframes fireworkSpread {
          0% { transform: scale(0.5) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1.5) rotate(360deg); opacity: 0; filter: blur(1px); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Guide text */}
      <div className="bg-emerald-100 border-4 border-emerald-300 px-6 py-2 rounded-full shadow-sm mb-6 z-10 flex flex-col items-center">
        <span className="text-emerald-800 font-black text-xl">Lắp ghép mảnh vỡ 🧩</span>
        <span className="text-emerald-600 font-bold text-sm">Chạm mảnh dưới, rồi chạm ô trống bên trên để xếp</span>
      </div>

      {/* 2x2 Board */}
      <div className="mb-10 mt-2 relative z-10 p-2 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg border-4 border-dashed border-emerald-300">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 md:gap-2 w-64 h-64 md:w-80 md:h-80">
          {board.map((piece, index) => (
            <div 
              key={index}
              onClick={() => handleBoardSlotClick(index)}
              className={`
                w-full h-full rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-300
                ${!piece ? "bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-200" : ""}
                ${isMatched ? "rounded-none scale-105 z-20 shadow-2xl" : ""}
              `}
            >
              {!piece && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 text-emerald-600 font-black text-3xl">
                  {index + 1}
                </div>
              )}
              {piece && (
                <div 
                  className={`w-full h-full animate-[popIn_0.2s_ease-out] ${isMatched ? "rounded-none" : "rounded-2xl"}`}
                  style={{
                    backgroundImage: `url('${correctItem.image_url}')`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: `${piece.bgPosX} ${piece.bgPosY}`,
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: 'white'
                  }}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Full image overlay when matched for smooth presentation */}
        {isMatched && (
          <div className="absolute inset-2 animate-[popIn_0.5s_ease-out] z-30 pointer-events-none flex flex-col items-center justify-center">
             <div className="w-full h-full absolute inset-0 bg-white rounded-2xl" style={{
                backgroundImage: `url('${correctItem.image_url}')`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
             }} />
             <div className="absolute -top-6 bg-emerald-500 text-white font-black px-8 py-2 rounded-full text-3xl shadow-lg border-4 border-white animate-bounce drop-shadow-xl">
              {correctItem.word}
            </div>
          </div>
        )}
      </div>

      {/* Tray for pieces */}
      <div className="w-full max-w-4xl min-h-[160px] bg-white/60 border-t-4 border-emerald-200 p-6 flex items-center justify-center gap-4 flex-wrap z-20 rounded-t-[3rem] shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {tray.map(piece => {
          const isSelected = selectedPieceId === piece.id;
          return (
            <div
              key={piece.id}
              onClick={() => handleSelectTrayPiece(piece)}
              className={`
                w-24 h-24 md:w-28 md:h-28 rounded-2xl cursor-pointer shadow-md transition-all duration-300 bg-white
                ${isSelected ? "scale-110 border-4 border-amber-400 ring-4 ring-amber-200 shadow-xl -translate-y-4" : "border-2 border-gray-200 hover:scale-105 hover:-translate-y-1 hover:border-emerald-300"}
              `}
              style={{
                backgroundImage: `url('${correctItem.image_url}')`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${piece.bgPosX} ${piece.bgPosY}`,
                backgroundRepeat: 'no-repeat'
              }}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-amber-400 text-white w-8 h-8 flex items-center justify-center rounded-full font-black animate-bounce shadow-md">
                  ✨
                </div>
              )}
            </div>
          );
        })}
        {tray.length === 0 && !isMatched && (
          <div className="text-gray-400 font-bold text-xl opacity-50 animate-pulse">
            Không còn mảnh ghép nào
          </div>
        )}
      </div>
    </div>
  );
}
