import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuWallet, LuFileClock, LuCircleCheck, LuCirclePlus, LuHistory, LuBookOpen, LuZap, LuInfo, LuCircleDollarSign, LuFileText, LuShieldCheck, LuTriangleAlert, LuChartBar, LuCalendar, LuSlidersHorizontal, LuFilter, LuTrendingUp } from 'react-icons/lu';

const MyLedger = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const transactions = globalData.ledger?.transactions || [];
  const stats = globalData.ledger?.stats || { balance: 0, totalReceived: 0, totalSpent: 0 };
  const loading = globalData.loading && transactions.length === 0;

  // Calculate pending bills
  const myExpenses = (globalData.expenses || []).filter(e => e.user === user?._id || e.employee?.user === user?._id);
  const pending = myExpenses.filter(e => e.status === 'Pending');
  const pendingTotal = pending.reduce((s, e) => s + (e.totalAmount || 0), 0);
  const pendingBills = { count: pending.length, total: pendingTotal };

  // Calculate office owed amount (employee will get from office)
  const employeeOwedAmount = myExpenses
    .filter(exp => (exp.status === 'Approved' || exp.status === 'Settled') && exp.isReturned === false)
    .reduce((sum, exp) => {
      const bill = exp.approvedTotalAmount || exp.totalAmount || 0;
      const adv = exp.advance || 0;
      const diff = bill - adv;
      return sum + (diff > 0 ? diff : 0);
    }, 0);

  // Last settlement from approved
  const approved = myExpenses.filter(e => e.status === 'Approved' || e.status === 'Settled');
  const lastSettlement = approved.length > 0 
    ? { amount: approved[0].totalAmount || 0, date: approved[0].updatedAt || approved[0].createdAt }
    : null;

  // Filter daily and group monthly received advances
  const receivedAdvances = transactions.filter(t => t.direction === 'in');

  const filteredDailyAdvances = dateFilter
    ? receivedAdvances.filter(adv => {
        const advDate = new Date(adv.date).toISOString().split('T')[0];
        return advDate === dateFilter;
      })
    : receivedAdvances;

  const totalFilteredDailyAmount = filteredDailyAdvances.reduce((sum, adv) => sum + adv.amount, 0);

  const monthlyGrouped = {};
  receivedAdvances.forEach(adv => {
    const d = new Date(adv.date);
    const monthKey = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthlyGrouped[monthKey] = (monthlyGrouped[monthKey] || 0) + adv.amount;
  });

  const monthlyList = Object.entries(monthlyGrouped).map(([month, total]) => ({ month, total }));

  // Build latest status feed
  const statusItems = [];
  // Add advances
  transactions.filter(t => t.direction === 'in').slice(0, 2).forEach(t => {
    statusItems.push({ type: 'advance', label: 'Advance Received', date: t.date, amount: t.amount, company: t.company, purpose: t.purpose });
  });
  // Add pending bills
  pending.slice(0, 2).forEach(e => {
    statusItems.push({ type: 'pending', label: e.employeeName || 'Bill', date: e.createdAt, status: 'PENDING' });
  });
  // Add settled
  approved.slice(0, 1).forEach(e => {
    statusItems.push({ type: 'settled', label: 'Expenses', date: e.updatedAt || e.createdAt, amount: e.totalAmount, status: 'Settled' });
  });
  // Add rejected
  const rejected = myExpenses.filter(e => e.status === 'Rejected');
  rejected.slice(0, 2).forEach(e => {
    statusItems.push({
      type: 'rejected',
      label: 'Bill Rejected',
      date: e.updatedAt || e.createdAt,
      amount: e.totalAmount,
      reason: e.rejectionReason || 'No reason specified',
      status: 'REJECTED'
    });
  });

  const latestStatus = statusItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  useEffect(() => {
    refreshGlobalData();
  }, []);

  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Hello, {user?.username} 👋</h1>
        <p className="text-outline text-sm font-medium mt-1">Today's Date: {today}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Advance */}
        <div className="bg-white p-7 rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-on-surface/70">Current Advance</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <LuCircleDollarSign size={22} className="text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-orange-500 tracking-tight">৳{Math.max(0, stats.balance || 0).toLocaleString()}</p>
          <p className="text-xs text-outline mt-1.5 font-medium">Available as balance</p>
        </div>

        {/* Office Owed */}
        <div className="bg-white p-7 rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-on-surface/70">Office Owed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <LuWallet size={22} className="text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 tracking-tight">৳{employeeOwedAmount.toLocaleString()}</p>
          <p className="text-xs text-outline mt-1.5 font-medium">Will get from office</p>
        </div>

        {/* Pending Bills */}
        <div className="bg-white p-7 rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-on-surface/70">Pending Bills</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
              <LuFileText size={22} className="text-teal-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-teal-600 tracking-tight">৳{pendingBills.total.toLocaleString()}</p>
          <p className="text-xs text-outline mt-1.5 font-medium">{pendingBills.count} bills awaiting approval</p>
        </div>

        {/* Last Settlement */}
        <div className="bg-white p-7 rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-on-surface/70">Last Settlement</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <LuShieldCheck size={22} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-green-600 tracking-tight">৳{lastSettlement ? lastSettlement.amount.toLocaleString() : '0'}</p>
          <p className="text-xs text-outline mt-1.5 font-medium">
            {lastSettlement ? `Completed on ${new Date(lastSettlement.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'No settlement yet'}
          </p>
        </div>
      </div>

      {/* Main Grid: Actions + Latest Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Actions */}
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-8 space-y-6">
          <h2 className="font-black text-sm text-on-surface flex items-center gap-2">
            <LuZap size={18} className="text-primary" /> Actions
          </h2>

          {/* Submit New Bill Button */}
          <button onClick={() => navigate('/employee/expenses')}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md">
            <LuCirclePlus size={20} /> Submit New Bill
          </button>

          {/* History & Ledger */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/employee/history')}
              className="bg-white border border-[#e2e8f0] hover:border-teal-500/20 py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold text-[#0f172a] transition-all cursor-pointer">
              <LuHistory size={18} className="text-[#0f766e]" /> History
            </button>
            <button onClick={() => navigate('/employee/settlements')}
              className="bg-white border border-[#e2e8f0] hover:border-teal-500/20 py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold text-[#0f172a] transition-all cursor-pointer">
              <LuBookOpen size={18} className="text-[#0f766e]" /> Settlement
            </button>
          </div>

          <div className="border-t border-outline-variant/10 pt-4"></div>

          {/* Decorative card */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl p-8 text-white relative overflow-hidden min-h-[170px]">
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Active</span>
            </div>
            <div className="absolute bottom-6 left-8">
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Employee ID: #{user?.phone?.slice(-4) || '3421'}</p>
              <p className="text-lg font-black tracking-widest">{user?.username?.toUpperCase() || 'USER'}</p>
            </div>
            <div className="absolute bottom-6 right-8 text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Total Advance</p>
              <p className="text-lg font-black">৳{stats.balance.toLocaleString()}</p>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 border border-white/10 rounded-full"></div>
            <div className="absolute -top-16 -right-16 w-48 h-48 border border-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Right: Latest Status */}
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-8 space-y-6">
          <h2 className="font-black text-sm text-on-surface flex items-center gap-2">
            <LuFileText size={18} className="text-primary" /> Latest Status
          </h2>

          {latestStatus.length > 0 ? (
            <div className="space-y-3">
              {latestStatus.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-xl bg-surface-container-low/50 border border-outline-variant/10 hover:border-outline-variant/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.type === 'advance' ? 'bg-orange-100 text-orange-500' :
                      item.type === 'pending' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'rejected' ? 'bg-red-100 text-red-500' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {item.type === 'advance' ? <LuCircleDollarSign size={20} /> :
                       item.type === 'pending' ? <LuFileText size={20} /> :
                       item.type === 'rejected' ? <LuTriangleAlert size={20} /> :
                       <LuCircleCheck size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{item.label}</p>
                      <p className="text-xs text-outline font-bold mt-1">
                        {item.company && <span className="text-primary">{item.company} • </span>}
                        {item.type === 'advance' && item.purpose && <span className="text-orange-500 font-black">{item.purpose} • </span>}
                        <span>{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </p>
                      {item.type === 'rejected' && (
                        <p className="text-[10px] text-red-600 font-bold mt-1 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1">
                          Reason: {item.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.amount ? (
                      <p className={`font-black text-base ${
                        item.type === 'advance' ? 'text-orange-500' : 
                        item.type === 'rejected' ? 'text-red-600' :
                        'text-green-600'
                      }`}>৳{item.amount.toLocaleString()}</p>
                    ) : null}
                    {item.status && (
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        item.status === 'PENDING' ? 'text-orange-500' : 
                        item.status === 'REJECTED' ? 'text-red-600' :
                        'text-green-600'
                      }`}>
                        {item.status === 'Settled' && `৳${item.amount?.toLocaleString() || 0} `}
                        {item.status === 'PENDING' ? 'PENDING' : 
                         item.status === 'REJECTED' ? 'REJECTED' :
                         '(Settled)'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <LuFileClock size={36} className="text-outline/20 mx-auto mb-3" />
              <p className="font-bold text-on-surface">{loading ? 'Loading...' : 'No activity yet'}</p>
              <p className="text-xs text-outline opacity-60 mt-1">Your recent activities will appear here</p>
            </div>
          )}

          {/* Next Settlement Cycle */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <LuInfo size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-blue-900">Next Settlement Cycle</p>
              <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">
                Your next settlement cycle will begin on {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}. Please submit all pending bills before then.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advance Analytics & Insights Section */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-8 space-y-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/10 pb-5">
          <div>
            <h2 className="font-black text-lg text-on-surface flex items-center gap-2.5">
              <LuChartBar className="text-teal-600" size={22} /> Advance Analytics & Insights
            </h2>
            <p className="text-xs text-outline opacity-60 mt-1">Group and analyze all received advances dynamically.</p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
              showFilters
                ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-sm'
                : 'bg-white border-[#e2e8f0] hover:border-teal-500/20 text-[#0f172a]'
            }`}
          >
            <LuSlidersHorizontal size={14} className={showFilters ? 'text-teal-700' : 'text-[#64748b]'} />
            {showFilters ? 'Hide Filters' : 'Filter Advances'}
          </button>
        </div>

        {showFilters && (
          <div className="bg-surface-container-low/30 border border-outline-variant/10 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                <LuCalendar size={20} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-outline font-black mb-1">Select a Specific Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white border border-[#cbd5e1] rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface focus:outline-none focus:border-teal-700 cursor-pointer"
                />
              </div>
            </div>

            {dateFilter && (
              <div className="flex items-center gap-4">
                <div className="bg-teal-50/50 border border-teal-100 px-4 py-2 rounded-xl text-right">
                  <p className="text-[9px] text-teal-700 font-black uppercase tracking-wider">Total Received On This Day</p>
                  <p className="font-black text-base text-teal-800 mt-0.5">৳{totalFilteredDailyAmount.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setDateFilter('')}
                  className="text-xs font-bold text-[#e11d48] hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        )}

        {dateFilter ? (
          /* Filtered Results View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#64748b] uppercase tracking-wider">
                Daily Results for {new Date(dateFilter).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {filteredDailyAdvances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDailyAdvances.map((adv, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/10 bg-surface-container-low/20">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-on-surface">৳{adv.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-outline opacity-60">
                        {adv.company && <span className="text-teal-700 font-bold">{adv.company} • </span>}
                        {adv.purpose && <span className="font-semibold text-on-surface">{adv.purpose} • </span>}
                        {new Date(adv.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-wider border border-orange-100 rounded-md">
                      Advance
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-[#e2e8f0] rounded-2xl">
                <p className="text-xs text-outline opacity-60 font-bold">No advances found on this day.</p>
              </div>
            )}
          </div>
        ) : (
          /* Default Dashboard Analytics View: Small boxes & Trend Graph */
          <div className="space-y-8">
            {/* Small Boxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-2xl space-y-2 hover:shadow-sm transition-shadow">
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest leading-none">Total Received</p>
                <p className="text-2xl font-black text-teal-800">৳{stats.totalReceived.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold">
                  <LuTrendingUp size={12} /> Received Advance
                </div>
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-2xl space-y-2 hover:shadow-sm transition-shadow">
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest leading-none">Total Times</p>
                <p className="text-2xl font-black text-teal-800">{receivedAdvances.length} Times</p>
                <div className="flex items-center gap-1.5 text-[10px] text-teal-600 font-bold">
                  <LuCircleDollarSign size={12} /> Transactions count
                </div>
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-2xl space-y-2 hover:shadow-sm transition-shadow">
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest leading-none">Average Amount</p>
                <p className="text-2xl font-black text-teal-800">
                  ৳{(receivedAdvances.length ? Math.round(stats.totalReceived / receivedAdvances.length) : 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#0f172a] opacity-60 font-bold">
                  <LuWallet size={12} /> Average per advance
                </div>
              </div>
            </div>

            {/* Premium Graph: Custom SVG Monthly Bar Chart */}
            <div className="bg-[#fafafa] border border-[#e2e8f0] p-6 rounded-[2rem] space-y-6">
              <div>
                <h4 className="font-black text-xs text-[#0f172a] uppercase tracking-widest">Monthly Advance Trends</h4>
                <p className="text-[10px] text-outline opacity-60 mt-0.5">Visual representation of total monthly advance cash inflow.</p>
              </div>

              {monthlyList.length > 0 ? (
                <div className="space-y-4">
                  {/* The Graph */}
                  <div className="flex items-end justify-between gap-4 h-[200px] border-b border-[#cbd5e1] pb-2 px-4 select-none">
                    {monthlyList.map((item, idx) => {
                      const maxMonthVal = Math.max(...monthlyList.map(m => m.total), 1);
                      const heightPercent = Math.max(10, (item.total / maxMonthVal) * 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-[105%] bg-[#0f172a] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 whitespace-nowrap">
                            ৳{item.total.toLocaleString()}
                          </div>
                          
                          {/* Bar */}
                          <div 
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[45px] bg-gradient-to-t from-teal-800 to-teal-500 hover:from-teal-700 hover:to-teal-400 rounded-t-lg transition-all duration-500 shadow-sm cursor-pointer"
                          ></div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis labels */}
                  <div className="flex justify-between px-4">
                    {monthlyList.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center">
                        <span className="text-[9px] font-black text-[#64748b] uppercase tracking-wider block truncate max-w-[80px] mx-auto">
                          {item.month.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-[#94a3b8]">
                  <LuChartBar size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">No graph data available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLedger;
