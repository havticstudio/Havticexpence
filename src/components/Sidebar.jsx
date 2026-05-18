import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { 
  LuLayoutDashboard, 
  LuUsers, 
  LuCircleDollarSign, 
  LuFileCheck2, 
  LuHandshake, 
  LuChartBar, 
  LuBuilding2, 
  LuLogOut,
  LuHistory,
  LuFileText
} from 'react-icons/lu';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminItems = [
    { name: 'Dashboard', icon: LuLayoutDashboard, path: '/admin' },
    { name: 'Employees', icon: LuUsers, path: '/admin/employees' },
    { name: 'Give Advance', icon: LuCircleDollarSign, path: '/admin/give-advance' },
    { name: 'Bill Review', icon: LuFileCheck2, path: '/admin/bill-review' },
    { name: 'Settlement', icon: LuHandshake, path: '/admin/settlements' },
    { name: 'Reports', icon: LuChartBar, path: '/admin/reports' },
    { name: 'Company', icon: LuBuilding2, path: '/admin/settings' },
  ];

  const employeeItems = [
    { name: 'Home', icon: LuLayoutDashboard, path: '/employee' },
    { name: 'My Expenses', icon: LuFileText, path: '/employee/expenses' },
    { name: 'Settlement', icon: LuHistory, path: '/employee/settlements' },
  ];

  const navItems = user?.role === 'admin' ? adminItems : employeeItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 bg-[#141718] flex flex-col py-6 z-50">
      {/* Brand Logo */}
      <div className="px-6 mb-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/employee')}>
          <img src={logo} alt="Brand Care" className="h-10 w-auto object-contain max-w-[170px]" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin' || item.path === '/employee'}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-bold text-[12px] tracking-wide uppercase">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto px-4 pt-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 text-white/40 px-4 py-4 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 rounded-2xl group text-left"
        >
          <LuLogOut size={20} className="group-hover:text-red-400 transition-colors" />
          <span className="font-bold text-[12px] tracking-wide uppercase">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
