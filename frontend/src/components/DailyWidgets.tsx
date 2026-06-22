import { useState, useEffect } from 'react';
import { Check, Calendar, Sparkles, X } from 'lucide-react';

// Helper to get today's date in local YYYY-MM-DD
const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  astronaut: any;
  onCheckInSuccess: (updatedAstronaut: any) => void;
}

export function CheckInModal({ isOpen, onClose, astronaut, onCheckInSuccess }: CheckInModalProps) {
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [streak, setStreak] = useState(0);

  if (!isOpen || !astronaut) return null;

  const today = getLocalDateString();
  const isAlreadyCheckedIn = astronaut.lastCheckIn === today;
  const currentStreak = astronaut.checkInStreak || 0;
  
  // Calculate next streak day
  let displayStreak = currentStreak;
  if (!isAlreadyCheckedIn) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    if (astronaut.lastCheckIn === yesterdayStr) {
      displayStreak = (currentStreak % 7) + 1;
    } else {
      displayStreak = 1;
    }
  }

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/astronaut/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: astronaut.name })
      });

      if (!res.ok) throw new Error('Check-in failed');
      const data = await res.json();
      
      setEarnedStars(data.earnedStars);
      setStreak(data.streak);
      setShowConfetti(true);
      onCheckInSuccess(data.astronaut);
      
      // Keep confetti visible for 4s
      setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 4000);
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ điểm danh!');
    } finally {
      setLoading(false);
    }
  };

  const rewards = [5, 10, 15, 20, 25, 30, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0F172A]/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-6 overflow-hidden transform transition-all animate-scaleUp">
        
        {/* Confetti effect inside modal */}
        {showConfetti && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-violet-600/90 text-white animate-fade-in p-6 text-center">
            <span className="text-7xl animate-bounce mb-4">🎉 🌟 🏆</span>
            <h3 className="text-3xl font-black mb-2 text-yellow-300">Điểm Danh Thành Công!</h3>
            <p className="text-lg font-bold">Bé đã điểm danh ngày thứ {streak} liên tiếp!</p>
            <div className="my-6 bg-white/20 px-6 py-4 rounded-3xl border border-white/30 inline-flex items-center gap-3">
              <span className="text-5xl">⭐</span>
              <span className="text-4xl font-black text-yellow-300">+{earnedStars}</span>
              <span className="text-xl font-bold">Sao Sáng</span>
            </div>
            <p className="text-sm text-purple-200">Đang quay lại bản đồ vũ trụ...</p>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-20">
          <X size={24} />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-amber-50 rounded-2xl border-2 border-amber-200">
            <Calendar className="text-amber-500" size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Lịch Điểm Danh Nhận Quà</h2>
          <p className="text-sm font-semibold text-slate-500">
            {isAlreadyCheckedIn 
              ? `Hôm nay con đã nhận quà rồi! Chuỗi hiện tại: ${currentStreak} ngày 🔥`
              : `Điểm danh mỗi ngày để nhận Sao Sáng khổng lồ nhé bé!`
            }
          </p>
        </div>

        {/* 7-day grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {rewards.map((stars, idx) => {
            const dayNum = idx + 1;
            const isCompleted = isAlreadyCheckedIn 
              ? dayNum <= currentStreak
              : dayNum < displayStreak;
            const isToday = isAlreadyCheckedIn
              ? dayNum === currentStreak
              : dayNum === displayStreak;
            
            return (
              <div 
                key={idx}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center min-h-[90px] transition-all ${
                  isCompleted 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                    : isToday
                      ? 'bg-amber-50 border-amber-400 text-amber-600 animate-pulse scale-105 shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider">Ngày {dayNum}</span>
                <span className="text-2xl my-1">{dayNum === 7 ? '🎁' : '⭐'}</span>
                <span className="text-xs font-black">+{stars}</span>
                
                {isCompleted && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white">
                    <Check size={8} strokeWidth={4} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {!isAlreadyCheckedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full py-4 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 shadow-md hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
          >
            <Sparkles size={20} />
            {loading ? 'Đang điểm danh...' : 'Điểm Danh Nhận Quà Ngay!'}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg rounded-2xl transition-colors"
          >
            Hẹn Gặp Lại Ngày Mai!
          </button>
        )}
      </div>
    </div>
  );
}

/* Mascot emotion greeting bubble */
interface MascotGreetingProps {
  astronaut: any;
  onMoodSuccess: (updatedAstronaut: any) => void;
}

export function MascotGreeting({ astronaut, onMoodSuccess }: MascotGreetingProps) {
  const [moodSubmitted, setMoodSubmitted] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [loading, setLoading] = useState(false);

  const today = getLocalDateString();
  const alreadyGreeted = astronaut?.lastGreetingDate === today;

  useEffect(() => {
    if (astronaut) {
      if (alreadyGreeted) {
        // Show last interaction message
        const lastInteraction = astronaut.dailyInteractions?.[astronaut.dailyInteractions.length - 1];
        setSpeechText(lastInteraction?.message || `Chúc bé ${astronaut.displayName || astronaut.name} học tập thật vui vẻ nhé! 🚀`);
        setMoodSubmitted(true);
      } else {
        setSpeechText(`Chào bé ${astronaut.displayName || astronaut.name}! Hôm nay con cảm thấy thế nào? Hãy nói với Mascot để nhận 5 Sao Sáng nhé!`);
        setMoodSubmitted(false);
      }
    }
  }, [astronaut, alreadyGreeted]);

  const handleMoodSubmit = async (mood: string) => {
    if (!astronaut) return;
    setLoading(true);
    try {
      const res = await fetch('/api/astronaut/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: astronaut.name, mood })
      });

      if (!res.ok) throw new Error('Mood submission failed');
      const data = await res.json();
      
      setSpeechText(data.message);
      setMoodSubmitted(true);
      onMoodSuccess(data.astronaut);
    } catch (err) {
      console.error(err);
      alert('Lỗi hỏi han cảm xúc!');
    } finally {
      setLoading(false);
    }
  };

  if (!astronaut) return null;

  return (
    <div className="bg-white rounded-3xl border-2 border-violet-100 p-5 shadow-xl flex flex-col md:flex-row gap-4 items-center relative overflow-hidden transition-all duration-300 hover:border-violet-300">
      
      {/* Mascot character space */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="text-6xl animate-float p-3 bg-violet-50 rounded-full border border-violet-100">
          {astronaut.avatar || '🚀'}
        </div>
        {astronaut.equippedAccessory && (
          <span className="absolute -bottom-1 bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black border border-white">
            {astronaut.equippedAccessory}
          </span>
        )}
      </div>

      {/* Bubble & Interaction controls */}
      <div className="flex-1 space-y-3 w-full">
        {/* Mascot Speech Bubble */}
        <div className="relative bg-violet-50 text-slate-700 font-bold border border-violet-100 px-4 py-3 rounded-2xl text-sm leading-relaxed">
          <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 rotate-45 bg-violet-50 border-l border-b border-violet-100 hidden md:block" />
          {speechText}
        </div>

        {/* Emotion Buttons */}
        {!moodSubmitted && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => handleMoodSubmit('excited')}
              disabled={loading}
              className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              😄 Hào hứng
            </button>
            <button
              onClick={() => handleMoodSubmit('studious')}
              disabled={loading}
              className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              🤓 Chăm chỉ
            </button>
            <button
              onClick={() => handleMoodSubmit('tired')}
              disabled={loading}
              className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              🥱 Mệt mỏi
            </button>
            <button
              onClick={() => handleMoodSubmit('sad')}
              disabled={loading}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              😢 Buồn bã
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
