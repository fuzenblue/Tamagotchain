import React from 'react';
import Sidebar from '../common/Sidebar'; 

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* ฝั่งซ้าย: Sidebar */}
      <Sidebar />

      {/* ฝั่งขวา: เนื้อหาเกม */}
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;