// frontend/src/components/PetDisplay.jsx
import React from 'react';

// Path ของรูปภาพ (ต้องตรงกับชื่อไฟล์จริงของคุณ)
const PET_IMAGES = {
  IDLE: '/assets/pets/idle.png',
  WALK: '/assets/pets/walk.png',
  EAT: '/assets/pets/eat.png',
  SLEEP: '/assets/pets/sleep.png',
  DEAD: '/assets/pets/die.png'
};

const PetDisplay = ({ status = 'IDLE', size = 200 }) => {
  const currentImage = PET_IMAGES[status] || PET_IMAGES.IDLE;

  // Animation Class ตามสถานะ
  const getAnimation = () => {
    switch (status) {
      case 'WALK': return 'animate-bounce';
      case 'EAT': return 'animate-pulse';
      case 'DEAD': return 'grayscale contrast-125';
      default: return 'animate-bounce-slow'; // เด้งช้าๆ ตอนอยู่เฉยๆ
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center transition-all duration-300">
      {/* ตัวสัตว์เลี้ยง */}
      <img 
        src={currentImage} 
        alt="Tamagotchi Pet"
        className={`object-contain ${getAnimation()}`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          imageRendering: 'pixelated' // ทำให้ภาพคมชัดสไตล์ Pixel
        }}
      />
      
      {/* เงาพื้น */}
      {status !== 'DEAD' && (
        <div className="w-24 h-4 bg-black/20 rounded-full blur-sm -mt-4" />
      )}
    </div>
  );
};

export default PetDisplay;