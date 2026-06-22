import { useState } from 'react';
import { User, Award, BarChart2, Heart, Phone, Mail, Edit2, Calendar } from 'lucide-react';

interface AccountDashboardProps {
  astronaut: any;
  onUpdateSuccess: (updatedAstronaut: any) => void;
  onClose: () => void;
}

const AVATARS = ['🦊', '🐯', '🐼', '🐨', '🦁', '🦖', '🦄', '🚀', '👨‍🚀', '👩‍🚀', '🐱', '🐶', '🐰', '🐻'];

export default function AccountDashboard({ astronaut, onUpdateSuccess, onClose }: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'parent'>('profile');
  const [parentAuthenticated, setParentAuthenticated] = useState(false);
  
  // Math gate states
  const [mathNum1] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [mathNum2] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  // Edit states
  const [displayName, setDisplayName] = useState(astronaut?.displayName || '');
  const [birthYear, setBirthYear] = useState(String(astronaut?.birthYear || 2018));
  const [parentEmail, setParentEmail] = useState(astronaut?.parentEmail || '');
  const [parentPhone, setParentPhone] = useState(astronaut?.parentPhone || '');
  const [selectedAvatar, setSelectedAvatar] = useState(astronaut?.avatar || '🚀');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!astronaut) return null;

  const handleVerifyParent = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = mathNum1 + mathNum2;
    if (Number(mathAnswer) === correct) {
      setParentAuthenticated(true);
      setMathError(false);
    } else {
      setMathError(true);
    }
  };

  const handleSaveProfile = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/astronaut/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: astronaut.name,
          displayName,
          birthYear: Number(birthYear),
          parentEmail,
          parentPhone,
          avatar: selectedAvatar
        })
      });

      if (!res.ok) throw new Error('Cập nhật hồ sơ thất bại');
      const data = await res.json();
      onUpdateSuccess(data);
      setIsEditingProfile(false);
    } catch (err) {
      alert('Không thể lưu thông tin hồ sơ!');
    } finally {
      setUpdating(false);
    }
  };

  // Math progress calculation
  const completedPreStarterCount = astronaut.completedPreStarter?.length || 0;
  const completedMoverCount = astronaut.completedPlanets?.length || 0;
  const completedPETCount = astronaut.completedPET?.length || 0;

  const preStarterPercent = Math.min(100, Math.round((completedPreStarterCount / 8) * 100));
  const moverPercent = Math.min(100, Math.round((completedMoverCount / 22) * 100));
  const petPercent = Math.min(100, Math.round((completedPETCount / 12) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0F172A]/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-violet-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shrink-0 flex items-center gap-4">
          <div className="text-5xl">{selectedAvatar}</div>
          <div>
            <h2 className="text-2xl font-black">{displayName || astronaut.name}</h2>
            <p className="text-xs text-violet-200 font-bold">Thành viên ELearn English • Sinh năm {birthYear}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/80 hover:text-white font-black text-xl bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
            ✕
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-gray-100 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center font-black text-sm transition-colors ${
              activeTab === 'profile' 
                ? 'text-violet-600 border-b-4 border-violet-600 bg-white' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            👦 Hồ Sơ Của Bé
          </button>
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex-1 py-3 text-center font-black text-sm transition-colors ${
              activeTab === 'parent' 
                ? 'text-violet-600 border-b-4 border-violet-600 bg-white' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            👨‍👩‍👧 Góc Phụ Huynh
          </button>
        </div>

        {/* Tab Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' && (
            /* TAB 1: KID PROFILE */
            <div className="space-y-6">
              
              {/* Profile Details (Standard / Editable) */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative">
                {!isEditingProfile ? (
                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-black"
                    >
                      <Edit2 size={12} /> Sửa hồ sơ
                    </button>
                    <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <User size={16} className="text-violet-500" /> Thông tin của bé
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                      <div>Tên hiển thị: <span className="text-slate-800 font-black">{displayName}</span></div>
                      <div>Năm sinh: <span className="text-slate-800 font-black">{birthYear}</span></div>
                      <div>Tên đăng nhập: <span className="text-slate-500">{astronaut.name}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 text-sm">Chỉnh sửa hồ sơ</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-1">Tên hiển thị:</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-violet-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-1">Năm sinh:</label>
                        <select
                          value={birthYear}
                          onChange={e => setBirthYear(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-violet-400 bg-white"
                        >
                          {Array.from({ length: 15 }, (_, i) => 2026 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Avatar choice */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-1.5">Thay đổi Avatar đại diện:</label>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                        {AVATARS.map(av => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setSelectedAvatar(av)}
                            className={`text-2xl p-2 rounded-xl border-2 snap-start transition-all shrink-0 ${
                              selectedAvatar === av ? 'border-violet-500 bg-violet-50' : 'border-gray-100 bg-gray-50'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 justify-end">
                      <button
                        onClick={() => { setIsEditingProfile(false); setSelectedAvatar(astronaut.avatar); }}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={updating}
                        className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-700 disabled:opacity-50"
                      >
                        {updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Achievements row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-1">⭐</div>
                  <h4 className="text-lg font-black text-amber-600">{astronaut.stars || 0}</h4>
                  <p className="text-[10px] font-bold text-amber-500">Sao Sáng tích lũy</p>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-1">🔥</div>
                  <h4 className="text-lg font-black text-rose-600">{astronaut.checkInStreak || 0} Ngày</h4>
                  <p className="text-[10px] font-bold text-rose-500">Chuỗi điểm danh</p>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-1">🏆</div>
                  <h4 className="text-lg font-black text-indigo-600">{(astronaut.badges || []).length}</h4>
                  <p className="text-[10px] font-bold text-indigo-500">Danh hiệu đạt được</p>
                </div>
              </div>

              {/* Badges unlocked */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <Award size={16} className="text-indigo-500" /> Bộ sưu tập danh hiệu
                </h3>
                {(!astronaut.badges || astronaut.badges.length === 0) ? (
                  <p className="text-xs text-slate-400 font-semibold italic">Bé chưa có danh hiệu nào. Hãy tích cực làm bài tập để mở khóa nhé!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {astronaut.badges.map((badge: string) => {
                      let title = badge;
                      let icon = '🏅';
                      let color = 'bg-slate-50 border-slate-200 text-slate-600';
                      
                      if (badge === 'space_rookie') {
                        title = 'Tân Binh Vũ Trụ'; icon = '🧑‍🚀'; color = 'bg-blue-50 border-blue-200 text-blue-700';
                      } else if (badge === 'grammar_hero') {
                        title = 'Anh Hùng Ngữ Pháp'; icon = '🦸'; color = 'bg-violet-50 border-violet-200 text-violet-700';
                      } else if (badge === 'time_traveler') {
                        title = 'Du Hành Thời Gian'; icon = '⏳'; color = 'bg-amber-50 border-amber-200 text-amber-700';
                      } else if (badge === 'galaxy_master') {
                        title = 'Chủ Nhân Thiên Hà'; icon = '🌌'; color = 'bg-emerald-50 border-emerald-200 text-emerald-700';
                      } else if (badge === 'streak_master') {
                        title = 'Chăm Chỉ Vô Địch'; icon = '🔥'; color = 'bg-rose-50 border-rose-200 text-rose-700';
                      } else if (badge.startsWith('revision_')) {
                        title = `Vượt Ải Revision ${badge.split('_')[1]}`; icon = '🎗️'; color = 'bg-teal-50 border-teal-200 text-teal-700';
                      }

                      return (
                        <div key={badge} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black ${color}`}>
                          <span>{icon}</span>
                          <span>{title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Attendance calendar summary */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <Calendar size={16} className="text-emerald-500" /> Nhật ký điểm danh tháng này
                </h3>
                <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4">
                  {(!astronaut.checkInHistory || astronaut.checkInHistory.length === 0) ? (
                    <p className="text-xs text-slate-400 font-semibold italic">Bé chưa điểm danh ngày nào trong tháng này.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500 font-semibold">Các ngày bé đã chăm chỉ điểm danh:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {astronaut.checkInHistory.slice(-10).map((date: string) => (
                          <span key={date} className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            ✔ {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'parent' && (
            /* TAB 2: PARENT CORNER */
            <div className="space-y-6">
              {!parentAuthenticated ? (
                /* MATH GATE */
                <form onSubmit={handleVerifyParent} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-center max-w-sm mx-auto space-y-4 my-8">
                  <div className="text-4xl">🔐</div>
                  <h3 className="text-base font-black text-slate-800">Xác Minh Phụ Huynh</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Vui lòng giải phép toán đơn giản để mở khóa góc theo dõi của bố/mẹ nhé!
                  </p>
                  
                  <div className="flex items-center justify-center gap-3 text-xl font-black text-violet-600 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <span>{mathNum1}</span>
                    <span>+</span>
                    <span>{mathNum2}</span>
                    <span>=</span>
                    <input
                      type="number"
                      placeholder="?"
                      required
                      value={mathAnswer}
                      onChange={e => setMathAnswer(e.target.value)}
                      className="w-16 border-2 border-violet-300 focus:outline-none focus:border-violet-500 text-center rounded-lg text-lg p-1 text-slate-800 font-black"
                    />
                  </div>

                  {mathError && <p className="text-xs font-black text-rose-500">Giải phép tính sai rồi, mẹ/bố hãy thử lại nhé!</p>}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-black text-sm rounded-xl transition-colors shadow-sm"
                  >
                    Xác nhận và Mở Khóa
                  </button>
                </form>
              ) : (
                /* PARENT DASHBOARD CONTENTS */
                <div className="space-y-6">
                  
                  {/* System Progress Trackers */}
                  <div className="space-y-3">
                    <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <BarChart2 size={16} className="text-violet-500" /> Báo cáo tiến trình học 3 hệ thống
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Pre-Starter */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-emerald-600 flex items-center gap-1">🐯 Pre-Starter (Làm Quen)</span>
                          <span className="text-slate-600">{completedPreStarterCount}/8 Bài ({preStarterPercent}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                            style={{ width: `${preStarterPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Mover (Round Up) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-violet-600 flex items-center gap-1">🚀 Mover (Round Up 2)</span>
                          <span className="text-slate-600">{completedMoverCount}/22 Bài ({moverPercent}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-400 to-blue-500 transition-all duration-500"
                            style={{ width: `${moverPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* PET B1 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-blue-600 flex items-center gap-1">📚 PET B1 (Luyện Thi)</span>
                          <span className="text-slate-600">{completedPETCount}/12 Bài ({petPercent}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                            style={{ width: `${petPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emotion / Mood diary logs */}
                  <div className="space-y-3">
                    <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Heart size={16} className="text-rose-500" /> Nhật ký cảm xúc học tập của bé ("Mood Diary")
                    </h3>
                    {(!astronaut.dailyInteractions || astronaut.dailyInteractions.length === 0) ? (
                      <p className="text-xs text-slate-400 font-semibold italic">Bé chưa chia sẻ tâm trạng nào. Nhật ký sẽ được ghi nhận hàng ngày khi bé chọn cảm xúc với Mascot.</p>
                    ) : (
                      <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50 shadow-sm bg-slate-50/50 max-h-56 overflow-y-auto">
                        {astronaut.dailyInteractions.slice().reverse().map((it: any, index: number) => {
                          let emoji = '😊';
                          let moodLabel = 'Vui vẻ';
                          let moodColor = 'text-amber-500 bg-amber-50 border-amber-100';
                          
                          switch(it.mood?.toLowerCase()) {
                            case 'excited':
                              emoji = '😄'; moodLabel = 'Hào hứng'; moodColor = 'text-amber-500 bg-amber-50 border-amber-100'; break;
                            case 'studious':
                              emoji = '🤓'; moodLabel = 'Chăm chỉ'; moodColor = 'text-blue-500 bg-blue-50 border-blue-100'; break;
                            case 'tired':
                              emoji = '🥱'; moodLabel = 'Mệt mỏi'; moodColor = 'text-purple-500 bg-purple-50 border-purple-100'; break;
                            case 'sad':
                              emoji = '😢'; moodLabel = 'Buồn bã'; moodColor = 'text-rose-500 bg-rose-50 border-rose-100'; break;
                          }

                          return (
                            <div key={index} className="p-3 text-xs flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-slate-500">{it.date}</span>
                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${moodColor}`}>
                                  {emoji} {moodLabel}
                                </span>
                              </div>
                              <p className="text-slate-600 font-medium italic mt-1">Mascot động viên: "{it.message}"</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Parent Contacts Details */}
                  <div className="space-y-3">
                    <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Mail size={16} className="text-indigo-500" /> Cài đặt thông báo & Liên hệ phụ huynh
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 mb-1">Email nhận kết quả:</label>
                          <div className="relative">
                            <Mail size={12} className="absolute left-3 top-3 text-slate-400" />
                            <input
                              type="email"
                              value={parentEmail}
                              onChange={e => setParentEmail(e.target.value)}
                              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-violet-400 bg-white"
                              placeholder="parent@email.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 mb-1">SĐT Báo cáo (Zalo):</label>
                          <div className="relative">
                            <Phone size={12} className="absolute left-3 top-3 text-slate-400" />
                            <input
                              type="tel"
                              value={parentPhone}
                              onChange={e => setParentPhone(e.target.value)}
                              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-violet-400 bg-white"
                              placeholder="0912345678"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveProfile}
                          disabled={updating}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors disabled:opacity-50"
                        >
                          {updating ? 'Đang lưu...' : 'Lưu Thông Tin Phụ Huynh'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-gray-100 text-center text-[10px] font-bold text-slate-400 shrink-0">
          ELearn English Kids App • Hệ thống Theo Dõi & Phát Triển Toàn Diện
        </div>

      </div>
    </div>
  );
}
