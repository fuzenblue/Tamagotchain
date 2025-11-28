import React from 'react';

// นี่คือโค้ดปุ่มกด Feed/Play ที่ถูกต้อง
const SideButton = ({ emoji, label, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-16 h-16 mb-4 flex flex-col items-center justify-center 
        bg-gray-800 border-4 border-gray-900 rounded-xl shadow-lg
        hover:bg-gray-700 active:scale-95 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        group relative
      `}
    >
      {/* อีโมจิ */}
      <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
      {/* ป้ายชื่อ */}
      <span className="text-[8px] text-white font-bold mt-1 uppercase">{label}</span>
      
      {/* เงาตกแต่ง */}
      <div className="absolute inset-0 border-t-4 border-white opacity-10 rounded-xl pointer-events-none"></div>
    </button>
  );
};

export default SideButton;