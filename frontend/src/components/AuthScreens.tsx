import React, { useState } from 'react';
import { User, Lock, Mail, Phone, Calendar, Loader2, Sparkles, AlertCircle, Play } from 'lucide-react';

interface AuthScreensProps {
  onAuthSuccess: (astronaut: any) => void;
}

const AVATARS = ['🦊', '🐯', '🐼', '🐨', '🦁', '🦖', '🦄', '🚀', '👨‍🚀', '👩‍🚀', '🐱', '🐶', '🐰', '🐻'];

export default function AuthScreens({ onAuthSuccess }: AuthScreensProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthYear, setBirthYear] = useState('2018');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Bé ơi, điền tên đăng nhập nhé!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/astronaut/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username.trim(), password: pin }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi đăng nhập');
      }

      const data = await res.json();
      
      if (data.status === 'need_password') {
        setLoading(false);
        // Show PIN input if it wasn't requested before
        setErrorMsg('Nhập thêm mã PIN 4 số của bé nhé!');
        return;
      }

      onAuthSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã PIN chưa đúng hoặc máy chủ bận rồi bé!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Bé điền tên đăng nhập nhé!');
      return;
    }
    if (!displayName.trim()) {
      setErrorMsg('Bé nhập tên hiển thị nha (ví dụ: Bé Bin)!');
      return;
    }
    if (pin.length !== 4 || isNaN(Number(pin))) {
      setErrorMsg('Mã PIN phải là 4 số nhé bé!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/astronaut/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username.trim().toLowerCase().replace(/\s+/g, ''),
          password: pin,
          displayName: displayName.trim(),
          birthYear: Number(birthYear),
          parentEmail: parentEmail.trim(),
          parentPhone: parentPhone.trim(),
          avatar: selectedAvatar
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Đăng ký thất bại');
      }

      const data = await res.json();
      onAuthSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra, bé chọn tên đăng nhập khác nha!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-amber-200/50 shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Colorful top banner */}
        <div className="p-8 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}>
          <div className="absolute top-0 right-0 p-4 text-purple-200 opacity-20 select-none text-8xl">🌟</div>
          <div className="absolute bottom-0 left-0 p-4 text-blue-200 opacity-10 select-none text-9xl">🚀</div>
          
          <div className="text-6xl mb-3 animate-float relative z-10">{selectedAvatar}</div>
          <h1 className="text-3xl font-black text-white tracking-wide relative z-10">ELearn English</h1>
          <p className="text-purple-200 text-sm font-semibold mt-1 relative z-10">Vũ Trụ Tiếng Anh Tuyệt Vời Của Bé</p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setIsRegistering(false); setErrorMsg(''); }}
            className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-colors ${
              !isRegistering ? 'text-violet-600 border-b-4 border-violet-600 bg-violet-50/30' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            🔑 Đăng Nhập
          </button>
          <button
            onClick={() => { setIsRegistering(true); setErrorMsg(''); }}
            className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-colors ${
              isRegistering ? 'text-violet-600 border-b-4 border-violet-600 bg-violet-50/30' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            📝 Đăng Ký Bé Mới
          </button>
        </div>

        <div className="p-8">
          {errorMsg && (
            <div className="mb-5 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-rose-600 text-sm font-bold leading-snug">{errorMsg}</p>
            </div>
          )}

          {!isRegistering ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Tên đăng nhập:</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: tom, anminh, cherry"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold focus:outline-none focus:border-violet-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Mã PIN 4 số (Nếu có):</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Nhập 4 số PIN bảo mật"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold tracking-widest text-lg focus:outline-none focus:border-violet-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 shadow-md hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Đang kiểm tra...</>
                ) : (
                  <><Play size={18} fill="white" /> Bắt đầu phiêu lưu!</>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Chọn linh vật đại diện:</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-3xl p-3 rounded-2xl border-3 snap-start transition-all ${
                        selectedAvatar === av 
                          ? 'border-violet-500 bg-violet-100/50 scale-110' 
                          : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Tên đăng nhập (viết liền):</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="ví dụ: bebin"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold focus:outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Tên gọi của bé:</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="ví dụ: Bé Bin, Tôm"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold focus:outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Mã PIN bé tự đặt (4 số):</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="Ví dụ: 1234"
                      value={pin}
                      onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold tracking-widest text-lg focus:outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Năm sinh của bé:</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <select
                      value={birthYear}
                      onChange={e => setBirthYear(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold focus:outline-none focus:border-violet-400 transition-colors appearance-none bg-white"
                    >
                      {Array.from({ length: 15 }, (_, i) => 2026 - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <hr className="my-2 border-dashed border-gray-200" />
              <p className="text-[11px] font-bold text-violet-500">Thông tin liên lạc của phụ huynh để gửi báo cáo tiến trình học tập:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Email bố/mẹ:</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="parent@gmail.com"
                      value={parentEmail}
                      onChange={e => setParentEmail(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold focus:outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">SĐT bố/mẹ:</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={parentPhone}
                      onChange={e => setParentPhone(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-800 font-bold focus:outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 shadow-md hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Đang đăng ký...</>
                ) : (
                  <><Sparkles size={18} /> Đăng Ký Tài Khoản Bé</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
