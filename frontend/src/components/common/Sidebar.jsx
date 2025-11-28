import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { path: '/', name: 'HOME', icon: '🏠' },
    { path: '/my-pet', name: 'MY PET', icon: '🐲' },
    { path: '/battle', name: 'BATTLE', icon: '⚔️' },
    { path: '/leaderboard', name: 'RANK', icon: '🏆' },
  ];

  return (
    <>
      {/* ปุ่มเมนูสำหรับมือถือ */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-yellow-500 rounded-lg border-2 border-black shadow-lg md:hidden"
      >
        {isOpen ? '❌' : '🍔'}
      </button>

      {/* แถบเมนู */}
      <div className={`
        fixed top-0 left-0 h-screen bg-gray-800 border-r-4 border-gray-900 w-64 transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b-4 border-gray-900 bg-gray-700">
          <h1 className="text-xl font-black text-yellow-400 tracking-widest text-center">
            TAMAGOTCHAIN
          </h1>
        </div>

        {/* รายการเมนู */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 p-4 rounded-xl transition-all font-bold tracking-wider font-mono
                ${isActive 
                  ? 'bg-yellow-500 text-black border-b-4 border-yellow-700 translate-y-0' 
                  : 'bg-gray-700 text-gray-300 border-b-4 border-gray-900 hover:bg-gray-600 hover:translate-y-1 active:border-b-0 active:translate-y-2'
                }
              `}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 bg-gray-900 border-t-4 border-black text-center">
          <div className="text-xs text-gray-500 mb-2">CONNECTED</div>
          <div className="text-xs font-mono text-green-400 truncate bg-gray-800 p-2 rounded border border-gray-600">
            0x123...ABCD
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;