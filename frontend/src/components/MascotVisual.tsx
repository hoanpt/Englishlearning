
interface MascotVisualProps {
  avatar: string;
  equippedAccessories?: string[];
  size?: string; // CSS text size, e.g. 'text-5xl', 'text-6xl', 'text-2xl'
}

export default function MascotVisual({ avatar = '🚀', equippedAccessories = [], size = 'text-5xl' }: MascotVisualProps) {
  let headEmoji = '';
  let headClass = 'absolute -top-5 -right-3 text-[0.8em] animate-bounce z-20';
  
  let bodyEmoji = '';
  let bodyClass = 'absolute -bottom-1 text-[0.55em] pointer-events-none z-10';

  let handEmoji = '';
  let handClass = 'absolute -bottom-2 -right-3 text-[0.7em] z-20';

  let shieldEmoji = '';
  let shieldClass = 'absolute -top-1 -left-4 text-[0.7em] z-0 animate-pulse';

  // Process equipped items
  equippedAccessories.forEach(id => {
    switch (id) {
      // HEAD
      case 'wizard_hat':
        headEmoji = '🧙';
        headClass = 'absolute -top-5 -right-3 text-[0.8em] animate-bounce z-20';
        break;
      case 'royal_crown':
        headEmoji = '👑';
        headClass = 'absolute -top-6 left-1/2 transform -translate-x-1/2 text-[0.75em] animate-pulse z-20';
        break;
      case 'astronaut_helmet':
        headEmoji = '🪖';
        headClass = 'absolute -top-4 left-1/2 transform -translate-x-1/2 text-[0.75em] z-20';
        break;
      case 'dragon_horn':
        headEmoji = '😈';
        headClass = 'absolute -top-5 left-1/2 transform -translate-x-1/2 text-[0.7em] z-20';
        break;

      // BODY
      case 'wizard_robe':
        bodyEmoji = '👘';
        break;
      case 'space_suit':
        bodyEmoji = '🦾';
        break;
      case 'dragon_armor':
        bodyEmoji = '🥋';
        break;

      // HAND
      case 'wizard_wand':
        handEmoji = '🪄';
        break;
      case 'laser_saber':
        handEmoji = '🗡️';
        handClass = 'absolute -bottom-2 -right-3 text-[0.75em] animate-pulse z-20';
        break;
      case 'infinity_staff':
        handEmoji = '🔱';
        handClass = 'absolute -bottom-3 -right-3 text-[0.75em] z-20';
        break;
      case 'telescope':
        handEmoji = '🔭';
        break;

      // SHIELD/BACK
      case 'energy_shield':
        shieldEmoji = '🛡️';
        break;
      case 'dragon_wings':
        shieldEmoji = '🐉';
        shieldClass = 'absolute -bottom-1 -left-4 text-[0.8em] z-0 animate-pulse';
        break;
      case 'butterfly_wings':
        shieldEmoji = '🦋';
        shieldClass = 'absolute -bottom-2 -left-4 text-[0.8em] z-0 animate-pulse';
        break;
    }
  });

  return (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ fontSize: 'inherit' }}>
      {/* Base Avatar */}
      <span className={`${size} relative z-10 filter drop-shadow-sm`}>{avatar}</span>

      {/* Layer Overlays */}
      {headEmoji && <span className={headClass} title="Đầu">{headEmoji}</span>}
      {bodyEmoji && <span className={bodyClass} title="Thân">{bodyEmoji}</span>}
      {handEmoji && <span className={handClass} title="Tay">{handEmoji}</span>}
      {shieldEmoji && <span className={shieldClass} title="Khiên">{shieldEmoji}</span>}
    </div>
  );
}
