import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LuLayoutDashboard, 
  LuUsers, 
  LuCircleDollarSign, 
  LuFileCheck2, 
  LuFileText,
  LuHistory
} from 'react-icons/lu';

const BottomTabBar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const adminTabs = [
    { name: 'Home', icon: LuLayoutDashboard, path: '/admin' },
    { name: 'Employees', icon: LuUsers, path: '/admin/employees' },
    { name: 'Give Advance', icon: LuCircleDollarSign, path: '/admin/give-advance' },
    { name: 'Bill Review', icon: LuFileCheck2, path: '/admin/bill-review' },
  ];

  const employeeTabs = [
    { name: 'Home', icon: LuLayoutDashboard, path: '/employee' },
    { name: 'Submit Bill', icon: LuFileText, path: '/employee/expenses' },
    { name: 'Drafts', icon: LuFileCheck2, path: '/employee/drafts' },
    { name: 'History', icon: LuHistory, path: '/employee/history' },
  ];

  const tabs = user.role === 'admin' ? adminTabs : employeeTabs;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[#141718] border-t border-white/5 flex items-center justify-around px-2 z-40 shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.15)] backdrop-blur-md bg-opacity-95">
      {tabs.map((tab) => (
        <NavLink
          key={tab.name}
          to={tab.path}
          end={tab.path === '/admin' || tab.path === '/employee'}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-2xl transition-all duration-300 select-none ${
              isActive 
                ? 'text-[#0f766e]' 
                : 'text-white/40 active:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#0f766e]/10 scale-110' : ''}`}>
                <tab.icon size={20} className={`transition-transform duration-300 ${isActive ? 'stroke-[2.5] text-[#0f766e]' : ''}`} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${isActive ? 'text-[#0f766e]' : 'text-white/30'}`}>
                {tab.name}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomTabBar;
