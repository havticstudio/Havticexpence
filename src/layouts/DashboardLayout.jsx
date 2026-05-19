import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomTabBar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      {/* Sidebar with toggle */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Backdrop overlay on mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-xs z-45 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px] pb-[72px] lg:pb-0">
        <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomTabBar />
    </div>
  );
};

export default DashboardLayout;
