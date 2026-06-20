import { useState } from 'react';
import { Star, Loader2, Sparkles } from 'lucide-react';

interface Astronaut {
  name: string;
  stars: number;
  completedPlanets: number[];
  badges: string[];
  accessories: string[];
  equippedAccessory: string;
}

interface WizardShopProps {
  astronaut: Astronaut;
  onUpdateAstronaut: (updated: Astronaut) => void;
  offlineMode: boolean;
}

interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  rarityColor: string;
  bonusEffect: string;
}

export default function WizardShop({ astronaut, onUpdateAstronaut, offlineMode }: WizardShopProps) {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  // Shop item details
  const shopItems: ShopItem[] = [
    {
      id: 'wizard_hat',
      name: 'Mũ Phù Thủy Nhiệm Màu',
      emoji: '🧙',
      cost: 30,
      description: 'Chiếc mũ ma thuật của Pháp sư vĩ đại giúp bé thông thái, làm bài tập tiếng Anh nhanh như chớp!',
      rarity: 'Epic',
      rarityColor: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
      bonusEffect: 'Tăng 10% trí tưởng tượng khi vẽ tranh'
    },
    {
      id: 'dragon_wings',
      name: 'Cánh Rồng Lửa Tự Do',
      emoji: '🐉',
      cost: 50,
      description: 'Đôi cánh rồng thiêng phun lửa giúp bé bay vượt qua mọi hành tinh tiếng Anh khó nhằn nhất!',
      rarity: 'Legendary',
      rarityColor: 'text-rose-450 border-rose-500/30 bg-rose-950/20',
      bonusEffect: 'Tự tin phát âm, không lo sợ sai'
    },
    {
      id: 'telescope',
      name: 'Kính Viễn Vọng Không Gian',
      emoji: '🔭',
      cost: 25,
      description: 'Giúp bé nhìn thấu các hành tinh xa xôi, chuẩn bị bài học mới thật sớm và chu đáo!',
      rarity: 'Common',
      rarityColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
      bonusEffect: 'Xem trước từ vựng của hành tinh tiếp theo'
    },
    {
      id: 'energy_shield',
      name: 'Khiên Năng Lượng Vũ Trụ',
      emoji: '🛡️',
      cost: 40,
      description: 'Lá chắn năng lượng bảo vệ phi hành gia nhí khỏi những lỗi sai ngữ pháp đáng tiếc!',
      rarity: 'Rare',
      rarityColor: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
      bonusEffect: 'Kháng 1 lần chọn sai đáp án trong trò chơi'
    }
  ];

  // Purchase Logic
  const handleBuy = async (item: ShopItem) => {
    if (astronaut.stars < item.cost) {
      alert('❌ Ôi! Con chưa có đủ Sao Sáng rồi. Hãy tích cực làm bài tập và vẽ tranh để kiếm thêm sao nhé!');
      return;
    }

    setLoadingItemId(item.id);
    if (!offlineMode) {
      try {
        const res = await fetch('http://localhost:5000/api/astronaut/buy-accessory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: astronaut.name,
            accessoryId: item.id,
            cost: item.cost
          })
        });

        if (!res.ok) throw new Error('API purchase failed');
        const updated = await res.json();
        onUpdateAstronaut(updated);
        alert(`✨ A ha! Đổi quà thành công! Con đã sở hữu "${item.name}"!`);
      } catch (err) {
        console.warn('API purchase error, processing offline:', err);
        handleBuyOffline(item);
      } finally {
        setLoadingItemId(null);
      }
    } else {
      handleBuyOffline(item);
      setLoadingItemId(null);
    }
  };

  const handleBuyOffline = (item: ShopItem) => {
    const currentOwned = astronaut.accessories || [];
    const nextOwned = [...currentOwned];
    if (!nextOwned.includes(item.id)) {
      nextOwned.push(item.id);
    }

    const updated: Astronaut = {
      ...astronaut,
      stars: astronaut.stars - item.cost,
      accessories: nextOwned
    };

    localStorage.setItem(`astronaut_profile_${astronaut.name}`, JSON.stringify(updated));
    onUpdateAstronaut(updated);
    alert(`✨ A ha! Đổi quà thành công (Offline)! Con đã sở hữu "${item.name}"!`);
  };

  // Equip Logic
  const handleEquip = async (item: ShopItem, equip: boolean) => {
    setLoadingItemId(item.id);
    const nextAccessoryId = equip ? item.id : '';

    if (!offlineMode) {
      try {
        const res = await fetch('http://localhost:5000/api/astronaut/equip-accessory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: astronaut.name,
            accessoryId: nextAccessoryId
          })
        });

        if (!res.ok) throw new Error('API equip failed');
        const updated = await res.json();
        onUpdateAstronaut(updated);
      } catch (err) {
        console.warn('API equip error, processing offline:', err);
        handleEquipOffline(nextAccessoryId);
      } finally {
        setLoadingItemId(null);
      }
    } else {
      handleEquipOffline(nextAccessoryId);
      setLoadingItemId(null);
    }
  };

  const handleEquipOffline = (nextAccessoryId: string) => {
    const updated: Astronaut = {
      ...astronaut,
      equippedAccessory: nextAccessoryId
    };

    localStorage.setItem(`astronaut_profile_${astronaut.name}`, JSON.stringify(updated));
    onUpdateAstronaut(updated);
  };

  const isOwned = (itemId: string) => {
    return (astronaut.accessories || []).includes(itemId);
  };

  const isEquipped = (itemId: string) => {
    return astronaut.equippedAccessory === itemId;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-650 via-indigo-650 to-blue-650 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjMiLz48Y2lyY2xlIGN4PSIxNDAiIGN5PSI3MCIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjUiLz48L3N2Zz4=')] opacity-20" />
        <div className="relative space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <span>🧙‍♂️</span> CỬA HÀNG PHÙ THỦY MA THUẬT
          </h2>
          <p className="text-sm font-semibold text-purple-100 max-w-xl">
            Sử dụng số "Sao Sáng" thu hoạch được sau mỗi bài học để đổi các bảo bối tối thượng trang trí cho Mascot của con!
          </p>
        </div>

        {/* Stars counter */}
        <div className="bg-slate-900/60 backdrop-blur border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[140px]">
          <span className="text-[10px] text-purple-200 block uppercase font-bold tracking-wider">Ngân khố sao sáng</span>
          <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-xl">
            <Star fill="currentColor" size={20} className="animate-bounce" />
            <span>{astronaut.stars} Sao</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Fitting Room Left, Shop List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Mascot Fitting Room */}
        <div className="bg-slate-900 border border-indigo-950/60 rounded-3xl p-6 flex flex-col justify-between shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
          
          <div className="space-y-4">
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-950/50 border border-indigo-900/30 px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
              Phòng Thử Đồ Mascot
            </span>
            <p className="text-xs text-slate-400 font-medium">Hình ảnh Mascot phi hành gia nhí của con</p>
          </div>

          {/* Interactive Mascot visual frame */}
          <div className="my-8 py-8 relative flex items-center justify-center">
            {/* Pulsing magic circles background */}
            <div className="absolute w-44 h-44 rounded-full border border-indigo-500/10 animate-ping opacity-60" />
            <div className="absolute w-36 h-36 rounded-full border border-purple-500/20 animate-pulse bg-gradient-to-tr from-purple-500/5 to-indigo-500/5" />
            
            {/* Mascot Container */}
            <div className="w-28 h-28 bg-slate-950 border-2 border-indigo-500/40 rounded-3xl flex items-center justify-center text-5xl relative shadow-2xl z-10">
              <span>👨‍🚀</span>
              {/* Accessory Overlay elements */}
              {astronaut.equippedAccessory === 'wizard_hat' && (
                <span className="absolute -top-5 -right-3 text-4xl animate-bounce" title="Mũ phù thủy">🧙</span>
              )}
              {astronaut.equippedAccessory === 'dragon_wings' && (
                <span className="absolute -bottom-1 -left-4 text-4xl animate-pulse" title="Cánh rồng lửa">🐉</span>
              )}
              {astronaut.equippedAccessory === 'telescope' && (
                <span className="absolute -bottom-2 -right-4 text-4xl" title="Kính viễn vọng">🔭</span>
              )}
              {astronaut.equippedAccessory === 'energy_shield' && (
                <span className="absolute -top-3 -left-3 text-4xl animate-pulse" title="Khiên năng lượng">🛡️</span>
              )}
            </div>
          </div>

          {/* Equipped Status summary */}
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl space-y-2">
            <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider">Đang trang bị (Equipped)</span>
            {astronaut.equippedAccessory ? (
              <div className="flex items-center justify-center gap-2 font-black text-sm text-purple-400">
                <span className="text-xl">
                  {shopItems.find(i => i.id === astronaut.equippedAccessory)?.emoji}
                </span>
                <span>
                  {shopItems.find(i => i.id === astronaut.equippedAccessory)?.name}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-bold block italic">Mascot đang mặc đồng phục mặc định</span>
            )}
            {astronaut.equippedAccessory && (
              <p className="text-[10px] text-slate-500 font-semibold italic mt-1 text-center leading-normal">
                💥 Hiệu quả kích hoạt: {shopItems.find(i => i.id === astronaut.equippedAccessory)?.bonusEffect}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Wizard Treasury Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-350 px-1 flex items-center gap-2">
            <span>✨</span> Bảo bối Đổi thưởng ({shopItems.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shopItems.map(item => {
              const owned = isOwned(item.id);
              const equipped = isEquipped(item.id);
              const canAfford = astronaut.stars >= item.cost;
              const loading = loadingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-slate-900 border rounded-3xl p-4 flex flex-col justify-between shadow transition-all duration-300 relative group overflow-hidden ${
                    equipped
                      ? 'border-purple-500 shadow-purple-500/5 ring-1 ring-purple-500/20'
                      : owned
                      ? 'border-indigo-950/60'
                      : canAfford
                      ? 'border-slate-800 hover:border-indigo-500/30'
                      : 'border-slate-800 opacity-80'
                  }`}
                >
                  {/* Decorative glowing gradient inside card */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-indigo-500/5 blur-xl rounded-full" />
                  
                  {/* Item Metadata */}
                  <div className="space-y-3.5">
                    {/* Top line badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${item.rarityColor}`}>
                        {item.rarity}
                      </span>
                      {!owned && (
                        <span className="flex items-center gap-0.5 text-xs font-black text-amber-400">
                          <Star fill="currentColor" size={13} /> {item.cost}
                        </span>
                      )}
                    </div>

                    {/* Emoji + Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center text-3xl shadow-inner select-none transition-transform group-hover:scale-105">
                        {item.emoji}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-105 tracking-tight line-clamp-1">{item.name}</h4>
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cổ vật ma thuật</span>
                      </div>
                    </div>

                    {/* Description text */}
                    <p className="text-xs text-slate-400 leading-normal font-medium">
                      {item.description}
                    </p>

                    {/* Bonus stat block */}
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/50">
                      <span className="text-[9px] text-indigo-400 uppercase font-black tracking-wider block">Hiệu ứng đính kèm</span>
                      <span className="text-[10px] text-slate-300 font-bold block leading-snug mt-0.5">{item.bonusEffect}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center gap-2">
                    {loading ? (
                      <button
                        disabled
                        className="w-full py-2 bg-slate-950 border border-slate-850 text-slate-450 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Loader2 size={13} className="animate-spin" /> Đang cập nhật...
                      </button>
                    ) : owned ? (
                      // Equip or Unequip
                      equipped ? (
                        <button
                          onClick={() => handleEquip(item, false)}
                          className="w-full py-2 bg-rose-600/20 border border-rose-600/30 text-rose-450 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          Tháo ra
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEquip(item, true)}
                          className="w-full py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Sparkles size={12} /> Trang bị
                        </button>
                      )
                    ) : (
                      // Purchase
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-650 hover:to-purple-700 shadow-pink-500/5'
                            : 'bg-slate-950 border border-slate-850 text-slate-550 cursor-not-allowed'
                        }`}
                      >
                        Mua bằng {item.cost} Sao
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
