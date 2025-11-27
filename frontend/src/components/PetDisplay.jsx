import React from 'react';

// Path ของรูปภาพ
const PET_IMAGES = {
  IDLE: '/assets/pets/idle.png',
  WALK: '/assets/pets/walk.png',
  EAT: '/assets/pets/eat.png',
  SLEEP: '/assets/pets/sleep.png',
  TIRED: '/assets/pets/tired.png', 
  DEAD: '/assets/pets/die.png'
};

const PetDisplay = ({ status = 'IDLE', size = 200 }) => {
  const currentImage = PET_IMAGES[status] || PET_IMAGES.IDLE;

  // Animation Class ตามสถานะ
  const getAnimation = () => {
    switch (status) {
      case 'WALK': return 'animate-bounce';
      case 'EAT': return 'animate-pulse';
      case 'TIRED': return 'animate-pulse opacity-80'; // 🚑 ป่วย: กระพริบช้าๆ ตัวจางๆ
      case 'DEAD': return 'grayscale contrast-125 translate-y-4'; // 💀 ตาย: ขาวดำ + นอนจมพื้น
      default: return 'animate-bounce-slow'; // ปกติ: เด้งดุ๊กดิ๊ก
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center transition-all duration-300">
      
      {/* ☁️ effect ป่วย (แสดงเฉพาะตอน TIRED) */}
      {status === 'TIRED' && (
        <div className="absolute -top-4 right-0 text-2xl animate-bounce">
          🤒
        </div>
      )}

      {/* 👻 effect วิญญาณ (แสดงเฉพาะตอน DEAD) */}
      {status === 'DEAD' && (
        <div className="absolute -top-10 text-4xl animate-float opacity-50">
          👻
        </div>
      )}

      {/* ตัวสัตว์เลี้ยง */}
      <img 
        src={currentImage} 
        alt="Tamagotchi Pet"
        className={`object-contain transition-all duration-500 ${getAnimation()}`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          imageRendering: 'pixelated'
        }}
      />
      
      {/* เงาพื้น (ตอนตายเงาจะหายไป หรือจางลง) */}
      {status !== 'DEAD' && (
        <div className="w-24 h-4 bg-black/20 rounded-full blur-sm -mt-4 transition-all" />
      )}
    </div>
  );
};

export default PetDisplay;