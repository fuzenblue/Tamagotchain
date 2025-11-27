// frontend/src/components/common/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', // primary (เหลือง), secondary (เทา), danger (แดง)
  disabled = false, 
  isLoading = false,
  className = '' 
}) => {
  
  // กำหนดสีตาม Variant
  const variants = {
    primary: "bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-700",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-500",
    danger: "bg-red-500 hover:bg-red-600 text-white border-red-800",
    success: "bg-green-500 hover:bg-green-600 text-white border-green-800",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative px-6 py-3 font-bold uppercase tracking-wider
        border-b-4 border-r-4 border-t-2 border-l-2 rounded-lg
        transform active:scale-95 active:border-b-2 active:mt-1
        transition-all duration-100
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:mt-0
        ${variants[variant]}
        ${className}
      `}
      style={{ fontFamily: '"Press Start 2P", cursive, sans-serif' }} // ถ้ามีฟอนต์ pixel
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        )}
        {children}
      </div>
    </button>
  );
};

export default Button;