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

interface ConfettiItem {
  id: number;
  emoji: string;
  leftPercent: number;
  topPercent: number;
  scale: number;
  angle: number;
}

export default function PuzzleGame({ unit, onWin }: { unit: Unit, onWin?: () => void }) {
  const [correctItem, setCorrectItem] = useState<Item | null>(null);
  const [options, setOptions] = useState<Item[]>([]);
  const [isMatched, setIsMatched] = useState(false);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<ConfettiItem[]>([]);

  const shadowRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playFeedbackSound = (type: "correct" | "wrong") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.2);
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
    setIsMatched(false);
    setShakeId(null);
    setConfetti([]);
  };

  useEffect(() => {
    startNewRound();
  }, [unit]);

  const handleSelectPiece = (item: Item) => {
    if (isMatched) return;

    if (item.id === correctItem?.id) {
      // WIN
      setIsMatched(true);
      playFeedbackSound("correct");
      if (onWin) onWin();

      // Trigger Confetti
      const fireworksEmojis = ["🌟", "✨", "🎉", "🎈", "💖"];
      const newConfetti = Array.from({ length: 15 }).map((_, i) => ({
        id: Date.now() + i,
        emoji: fireworksEmojis[Math.floor(Math.random() * fireworksEmojis.length)],
        leftPercent: 30 + Math.random() * 40,
        topPercent: 30 + Math.random() * 40,
        scale: 0.6 + Math.random() * 1.0,
        angle: Math.random() * 360
      }));
      setConfetti(newConfetti);

      // Play word audio
      const wordAudio = new Audio(item.audio_word);
      wordAudio.play().catch(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const utter = new SpeechSynthesisUtterance(item.word);
          utter.lang = "en-US";
          utter.rate = 0.8;
          window.speechSynthesis.speak(utter);
        }
      });

      // Advance to next round
      setTimeout(() => {
        startNewRound();
      }, 2500);

    } else {
      // WRONG
      setShakeId(item.id);
      playFeedbackSound("wrong");
      setTimeout(() => setShakeId(null), 500);
    }
  };

  if (!correctItem) return null;

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative overflow-hidden bg-rose-50/30">
      
      {/* Visual Fireworks Confetti */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="absolute animate-[fireworkSpread_1s_ease-out_forwards] pointer-events-none select-none z-40 text-4xl"
          style={{
            left: `${c.leftPercent}%`,
            top: `${c.topPercent}%`,
            transform: `scale(${c.scale}) rotate(${c.angle}deg)`,
            "--tx": `${(Math.random() - 0.5) * 200}px`,
            "--ty": `${(Math.random() - 0.5) * 200}px`,
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
        @keyframes shakePuzzle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px) rotate(-5deg); }
          50% { transform: translateX(10px) rotate(5deg); }
          75% { transform: translateX(-10px) rotate(-5deg); }
        }
      `}</style>

      {/* Target Shadow Board */}
      <div className="w-full flex justify-center items-center mb-10 mt-6 relative z-10">
        <div 
          ref={shadowRef}
          className={`
            w-64 h-64 md:w-80 md:h-80 rounded-[3rem] border-8 border-dashed flex flex-col items-center justify-center
            transition-all duration-500 relative
            ${isMatched ? "bg-emerald-100 border-emerald-400 scale-110 shadow-2xl shadow-emerald-200/60" : "bg-gray-100 border-gray-300 shadow-inner"}
          `}
        >
          {/* Label inside board when matched */}
          {isMatched && (
            <div className="absolute -top-6 bg-emerald-500 text-white font-black px-6 py-2 rounded-full text-2xl shadow-lg border-4 border-white animate-bounce">
              {correctItem.word}
            </div>
          )}

          <img
            src={correctItem.image_url}
            alt="shadow"
            className={`w-3/4 h-3/4 object-contain transition-all duration-500 ${isMatched ? "opacity-100 filter-none scale-110 drop-shadow-md" : "grayscale opacity-30 blur-[1px]"}`}
            draggable={false}
          />
        </div>
      </div>

      {/* Draggable Pieces (Actually Tap-able Pieces for better mobile UX) */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-4 md:gap-8 px-2 z-20">
        {options.map((item) => {
          const isHidden = isMatched && item.id === correctItem.id; // Hide original piece if matched
          const isShake = shakeId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectPiece(item)}
              disabled={isMatched}
              className={`
                bg-white border-4 border-rose-200 rounded-3xl p-4 md:p-6 shadow-lg
                flex items-center justify-center aspect-square transition-all duration-300
                hover:scale-105 hover:border-rose-400 active:scale-95 cursor-pointer
                ${isHidden ? "opacity-0 scale-50 pointer-events-none" : "opacity-100"}
                ${isShake ? "animate-[shakePuzzle_0.4s_ease-in-out] border-rose-500 bg-rose-50" : ""}
              `}
            >
              <img
                src={item.image_url}
                alt={item.word}
                className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
