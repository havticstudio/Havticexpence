import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LuBell, LuChevronRight, LuUser, LuMenu } from 'react-icons/lu';

const TopBar = ({ onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="h-[64px] bg-[#141718] border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 md:gap-6">
        {/* Hamburger Menu Toggle for Mobile */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-white/50 hover:text-white active:bg-white/5 transition-all cursor-pointer"
        >
          <LuMenu size={22} />
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline">Home</span>
          <LuChevronRight size={14} className="text-white/10 hidden sm:inline" />
          <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{user?.role === 'admin' ? 'Admin Dashboard' : 'My Ledger'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <button className="relative flex items-center group cursor-pointer">
          <LuBell size={20} className="text-white/30 group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-[#141718]"></span>
        </button>

        <div className="flex items-center gap-4 pl-8 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black text-white leading-none tracking-tight uppercase">{user?.username || 'User'}</p>
            <p className="text-[9px] text-primary/60 uppercase tracking-widest mt-1.5 font-black">
              {user?.role === 'admin' ? 'Administrator' : 'Employee'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/10 bg-[#1c1f21] flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all">
            <LuUser size={18} className="text-white/20" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
