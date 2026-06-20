import { X, Star, Trophy, Target, ClipboardCheck, BarChart3, Medal } from 'lucide-react';
import curriculumData from '../data/units.json';

interface Astronaut {
  name: string;
  stars: number;
  completedPlanets: number[];
  badges: string[];
  passedRevisions: number[];
}

interface Props {
  astronaut: Astronaut;
  isOpen: boolean;
  onClose: () => void;
}

export default function ParentDashboard({ astronaut, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const totalUnits = curriculumData.length;
  const completedCount = astronaut.completedPlanets.length;
  const progressPercent = Math.round((completedCount / totalUnits) * 100);

  const BADGE_NAMES: Record<string, string> = {
    space_rookie: 'Lính Mới Vũ Trụ',
    grammar_hero: 'Anh Hùng Ngữ Pháp',
    time_traveler: 'Nhà Du Hành Thời Gian',
    galaxy_master: 'Chúa Tể Thiên Hà',
    revision_1: 'Huy hiệu Dải 1',
    revision_2: 'Huy hiệu Dải 2',
    revision_3: 'Huy hiệu Dải 3',
    revision_4: 'Huy hiệu Dải 4',
    revision_5: 'Huy hiệu Dải 5',
    revision_6: 'Huy hiệu Dải 6',
  };

  const handleExportReport = () => {
    const report = `BÁO CÁO HỌC TẬP: ${astronaut.name}
-------------------------------------
🌟 Sao Sáng: ${astronaut.stars}
📚 Bài học hoàn thành: ${completedCount}/${totalUnits} (${progressPercent}%)
🏆 Huy hiệu đạt được: ${astronaut.badges.map(b => BADGE_NAMES[b] || b).join(', ') || 'Chưa có'}
⚡ Vượt Revision: ${astronaut.passedRevisions.length}/6

Cố gắng phát huy nhé! 🎉`;
    navigator.clipboard.writeText(report);
    alert('Đã sao chép báo cáo vào khay nhớ tạm!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FFF8F0] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-bounce-in border-4 border-white">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-md">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-black">Góc Phụ Huynh</h2>
              <p className="text-purple-200 text-xs font-semibold">Theo dõi tiến độ của bé: {astronaut.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border-2 border-amber-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                <Star size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng Sao Sáng</p>
                <p className="text-2xl font-black text-amber-600">{astronaut.stars}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                <Target size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bài Học Đã Xong</p>
                <p className="text-2xl font-black text-emerald-600">{completedCount} <span className="text-sm text-gray-400">/ {totalUnits}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-blue-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revision Đã Qua</p>
                <p className="text-2xl font-black text-blue-600">{astronaut.passedRevisions.length} <span className="text-sm text-gray-400">/ 6</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Progress Chart */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-violet-500" />
                <h3 className="font-black text-gray-700 text-lg">Tiến độ tổng quan</h3>
              </div>
              <div className="mb-2 flex justify-between items-end">
                <span className="text-4xl font-black text-violet-600">{progressPercent}%</span>
                <span className="text-xs font-bold text-gray-400 mb-1">Hoàn thành khóa học</span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #7C3AED, #3B82F6)' }}
                />
              </div>

              {/* Belt breakdown */}
              <div className="space-y-3">
                {[1,2,3,4,5,6].map(belt => {
                  const passed = astronaut.passedRevisions.includes(belt);
                  return (
                    <div key={belt} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-gray-600 flex items-center gap-2">
                        {passed ? <span className="text-emerald-500">✅</span> : <span className="text-gray-300">⏳</span>} 
                        Dải {belt}
                      </span>
                      <span className={passed ? "font-black text-emerald-600" : "font-semibold text-gray-400"}>
                        {passed ? 'Đã hoàn thành' : 'Chưa qua'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Medal className="text-amber-500" />
                <h3 className="font-black text-gray-700 text-lg">Thành tích nổi bật</h3>
              </div>
              
              {astronaut.badges.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-2 opacity-50">🎖️</div>
                  <p className="text-gray-400 font-bold">Chưa có huy hiệu nào.</p>
                  <p className="text-xs text-gray-400 mt-1">Bé cần hoàn thành bài học để nhận huy hiệu.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {astronaut.badges.map(badge => (
                    <div key={badge} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl mb-2 shadow-sm border border-amber-100">
                        {badge.includes('revision') ? '🏆' : badge === 'space_rookie' ? '🚀' : badge === 'grammar_hero' ? '🦸' : badge === 'time_traveler' ? '⏳' : '👑'}
                      </div>
                      <p className="font-black text-amber-700 text-xs leading-tight">{BADGE_NAMES[badge] || badge}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button 
            onClick={handleExportReport}
            className="px-6 py-3 bg-white border-2 border-violet-200 text-violet-700 font-black rounded-xl hover:bg-violet-50 hover:border-violet-300 active:scale-95 transition-all flex items-center gap-2"
          >
            <ClipboardCheck size={18} />
            Copy Báo Cáo
          </button>
        </div>
      </div>
    </div>
  );
}
