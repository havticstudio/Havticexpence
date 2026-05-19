import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuWallet, LuFileClock, LuCircleCheck, LuBell, LuZap, LuUserPlus, LuArrowRight } from 'react-icons/lu';

const Dashboard = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();

  const [showOutstandingModal, setShowOutstandingModal] = useState(false);
  const [showPendingBillsModal, setShowPendingBillsModal] = useState(false);
  const [modalTab, setModalTab] = useState('receivable');
  const [payingId, setPayingId] = useState(null);

  const handlePayEmployeeClaims = async (employeeId, employeeName, amount) => {
    if (!window.confirm(`Are you sure you want to pay ৳${amount.toLocaleString()} to ${employeeName}? This will settle all their approved outstanding claims.`)) {
      return;
    }
    setPayingId(employeeId);
    try {
      await axios.post(`http://localhost:5000/api/employees/${employeeId}/pay-claims`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      alert(`Successfully paid ৳${amount.toLocaleString()} to ${employeeName}!`);
      await refreshGlobalData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to settle claims.');
    } finally {
      setPayingId(null);
    }
  };
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const receivableList = (globalData.employees || [])
    .filter(emp => (emp.balance || 0) > 0)
    .sort((a, b) => b.balance - a.balance);

  const payableList = (globalData.employees || [])
    .map(emp => {
      const owed = (globalData.expenses || [])
        .filter(exp => {
          const id = exp.employee?._id || exp.employee;
          return id === emp._id && (exp.status === 'Approved' || exp.status === 'Settled') && exp.isReturned === false;
        })
        .reduce((sum, exp) => {
          const bill = exp.approvedTotalAmount || exp.totalAmount || 0;
          const adv = exp.advance || 0;
          const diff = bill - adv;
          return sum + (diff > 0 ? diff : 0);
        }, 0);
      return { ...emp, owed };
    })
    .filter(emp => emp.owed > 0)
    .sort((a, b) => b.owed - a.owed);

  const totalEmployeePayables = payableList.reduce((sum, emp) => sum + emp.owed, 0);

  const pendingBillsList = (globalData.expenses || [])
    .filter(exp => exp.status === 'Pending')
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const monthlyExpense = (globalData.expenses || [])
    .filter(exp => {
      if (exp.status !== 'Approved' && exp.status !== 'Settled') return false;
      if (!exp.createdAt) return false;
      const date = new Date(exp.createdAt);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}` === selectedMonth;
    })
    .reduce((sum, exp) => sum + (exp.approvedTotalAmount || exp.totalAmount || 0), 0);

  const stats = globalData.dashboardStats || { totalOutstanding: 0, pendingBills: 0, settlementsThisMonth: 0, approvedThisWeek: 0, paidThisWeek: 0 };
  const recentBills = (globalData.expenses || [])
    .slice(0, 3)
    .map(exp => ({
      id: exp._id,
      name: exp.employee?.username || exp.employeeName || 'Unknown',
      date: exp.createdAt ? new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
      company: exp.advanceId?.company?.name || 'No Company',
      amount: exp.totalAmount,
      status: exp.status || 'Pending',
    }));

  useEffect(() => {
    // Refresh stats silently in the background
    refreshGlobalData();
  }, []);

  const getNextSettlementInfo = () => {
    const today = new Date();
    let target = new Date(today.getFullYear(), today.getMonth(), 20);
    if (today.getDate() > 20) {
      target.setMonth(target.getMonth() + 1);
    }
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      dateStr: target.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      daysRemaining: String(diffDays).padStart(2, '0')
    };
  };

  const settlementInfo = getNextSettlementInfo();

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Dashboard</h1>
        <p className="text-[#64748b] text-sm font-medium mt-0.5">Today's Summary — {todayStr}</p>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Total Outstanding Advance */}
        <div 
          onClick={() => {
            setModalTab('receivable');
            setShowOutstandingModal(true);
          }}
          className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-5 cursor-pointer hover:border-[#0f766e]/40 hover:shadow-md transition-all active:scale-[0.99] group"
        >
          <div className="w-12 h-12 rounded-full bg-[#f0fdfa] flex items-center justify-center text-[#0f766e] shrink-0 group-hover:scale-110 transition-transform">
            <LuWallet size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest truncate">Outstanding Advance</p>
              <span className="text-[8px] bg-[#f0fdfa] text-[#0f766e] px-1.5 py-0.5 rounded-full font-black border border-teal-100 uppercase tracking-widest no-print shrink-0">View</span>
            </div>
            <p className="text-2xl font-black text-[#0f172a] mt-0.5">৳{stats.totalOutstanding.toLocaleString()}</p>
            <span className="text-[9px] font-bold text-[#0f766e] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mt-1 no-print">
              View Breakdown <LuArrowRight size={10} />
            </span>
          </div>
        </div>

        {/* Total Employee Payables */}
        <div 
          onClick={() => {
            setModalTab('payable');
            setShowOutstandingModal(true);
          }}
          className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-5 cursor-pointer hover:border-[#ea580c]/40 hover:shadow-md transition-all active:scale-[0.99] group"
        >
          <div className="w-12 h-12 rounded-full bg-[#fff7ed] flex items-center justify-center text-[#ea580c] shrink-0 group-hover:scale-110 transition-transform">
            <LuWallet size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest truncate">Employee Payables</p>
              <span className="text-[8px] bg-[#fff7ed] text-[#ea580c] px-1.5 py-0.5 rounded-full font-black border border-orange-100 uppercase tracking-widest no-print shrink-0">View</span>
            </div>
            <p className="text-2xl font-black text-[#0f172a] mt-0.5">৳{totalEmployeePayables.toLocaleString()}</p>
            <span className="text-[9px] font-bold text-[#ea580c] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mt-1 no-print">
              View Breakdown <LuArrowRight size={10} />
            </span>
          </div>
        </div>

        {/* Monthly Expense with Date Filter */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#f0fdfa] flex items-center justify-center text-[#0f766e] shrink-0">
            <LuWallet size={24} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest truncate">Monthly Expense</p>
              <input 
                type="month" 
                value={selectedMonth}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl py-1 px-1.5 text-[10px] font-black uppercase text-[#0f766e] focus:outline-none focus:border-[#0f766e] cursor-pointer transition-all shrink-0"
              />
            </div>
            <p className="text-2xl font-black text-[#0f172a] mt-0.5">৳{monthlyExpense.toLocaleString()}</p>
          </div>
        </div>

        {/* Pending Bills */}
        <div 
          onClick={() => setShowPendingBillsModal(true)}
          className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-5 cursor-pointer hover:border-[#d97706]/40 hover:shadow-md transition-all active:scale-[0.99] group"
        >
          <div className="w-12 h-12 rounded-full bg-[#fffbeb] flex items-center justify-center text-[#d97706] shrink-0 group-hover:scale-110 transition-transform">
            <LuFileClock size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest truncate">Pending Bills</p>
              <span className="text-[8px] bg-[#fffbeb] text-[#d97706] px-1.5 py-0.5 rounded-full font-black border border-amber-100 uppercase tracking-widest no-print shrink-0">View</span>
            </div>
            <p className="text-2xl font-black text-[#0f172a] mt-0.5">{stats.pendingBills}</p>
            <span className="text-[9px] font-bold text-[#d97706] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mt-1 no-print">
              View Pending List <LuArrowRight size={10} />
            </span>
          </div>
        </div>

        {/* Settlements this Month */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
            <LuCircleCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Settlements this Month</p>
            <p className="text-2xl font-black text-[#0f172a] mt-0.5">{stats.settlementsThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Bill Submissions */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e2e8f0] p-7 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-sm text-[#0f172a] uppercase tracking-tight flex items-center gap-2">
              <LuBell size={18} className="text-[#0f766e]" /> Recent Bill Submissions
            </h2>
            <button onClick={() => navigate('/admin/bill-review')} className="text-[#0f766e] text-xs font-black uppercase tracking-wider hover:underline">
              View All
            </button>
          </div>

          {recentBills.length > 0 ? (
            <div className="divide-y divide-[#e2e8f0]">
              {recentBills.map((bill) => (
                <div key={bill.id} className="py-4 flex items-center justify-between hover:bg-[#fbfbfb] rounded-2xl px-4 -mx-4 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center font-black text-xs text-[#475569]">
                      {bill.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-base text-[#0f172a] capitalize">{bill.name}</p>
                      <p className="text-xs text-[#64748b] font-bold mt-0.5">
                        {bill.date} • <span className="text-[#0f766e]">{bill.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-black text-sm text-[#0f172a]">৳{bill.amount.toLocaleString()}</span>
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${
                      bill.status === 'Approved' || bill.status === 'Settled'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : bill.status === 'Rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {bill.status}
                    </span>
                    <button onClick={() => navigate(`/admin/bill-review?id=${bill.id}`)} className="text-xs font-black text-[#0f766e] hover:text-[#0d9488] flex items-center gap-0.5">
                      Review <LuArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <LuFileClock size={40} className="text-[#cbd5e1] mx-auto mb-3" />
              <p className="font-bold text-[#64748b]">No submissions found</p>
              <p className="text-xs text-[#94a3b8] mt-1">Pending employee bills will appear here</p>
            </div>
          )}
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-7 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h2 className="font-black text-sm text-[#0f172a] uppercase tracking-tight flex items-center gap-2">
              <LuZap size={18} className="text-[#0f766e]" /> Quick Actions
            </h2>
            <div className="space-y-3">
              {/* New Employee */}
              <button onClick={() => navigate('/admin/employees/add')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-blue-100 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <LuUserPlus size={18} />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-blue-700">New Employee</span>
              </button>

              {/* Give Advance */}
              <button onClick={() => navigate('/admin/give-advance')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-teal-100 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shrink-0">
                  <LuWallet size={18} />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-teal-700">Give Advance</span>
              </button>

              {/* Review Bill */}
              <button onClick={() => navigate('/admin/bill-review')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-amber-100 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                  <LuFileClock size={18} />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-amber-700">Review Bill</span>
              </button>

              {/* Reports */}
              <button onClick={() => navigate('/admin/reports')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-purple-100 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
                  <LuCircleCheck size={18} />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-purple-700">Reports</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="border-t border-[#e2e8f0] pt-4 flex items-center justify-between">
            <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">System Status</span>
            <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#dcfce7] px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
              <span className="text-[10px] font-black text-[#15803d] uppercase tracking-wider">Server Connection: Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trackers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly Tracker (col-span-3) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#0f766e] to-[#115e59] rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm">
          <div>
            <h3 className="text-lg font-black tracking-tight">Weekly Tracker</h3>
            <p className="text-sm font-semibold opacity-90 mt-2 max-w-[400px] leading-relaxed">
              {stats.approvedThisWeek || 0} bills were approved this week and ৳{(stats.paidThisWeek || 0).toLocaleString()} has been paid out.
            </p>
          </div>
          {/* Decorative Sparkline */}
          <div className="absolute right-6 bottom-4 opacity-15">
            <svg width="150" height="80" viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 65 L30 45 L55 55 L80 25 L105 35 L140 10" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Next Settlement Cycle (col-span-2) */}
        <div className="lg:col-span-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-8 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block">Remaining</span>
            <h3 className="text-base font-black text-[#0f172a]">Next Settlement Cycle</h3>
            <p className="text-xs text-[#64748b] font-medium leading-relaxed mt-1">
              The next bill payout is scheduled for {settlementInfo.dateStr}.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-black text-[#0f766e] tracking-tight">{settlementInfo.daysRemaining} Days</p>
          </div>
        </div>
      </div>

      {/* Outstanding Advance Details Modal */}
      {showOutstandingModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#cbd5e1]/30 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0f766e] shrink-0">
                  <LuWallet size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#0f172a] uppercase tracking-tight">Advances & Payables</h3>
                  <p className="text-[10px] text-[#64748b] font-medium mt-0.5">Summary of outstanding advance balances and employee claims.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowOutstandingModal(false);
                  setModalTab('receivable');
                }}
                className="text-xs font-black text-[#64748b] hover:text-[#0f172a] uppercase tracking-wider bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e2e8f0] -mx-6 px-6">
              <button
                onClick={() => setModalTab('receivable')}
                className={`flex-1 pb-3 text-[11px] font-black uppercase tracking-wider border-b-2 transition-all ${
                  modalTab === 'receivable'
                    ? 'border-[#0f766e] text-[#0f766e]'
                    : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                অফিস পাবে (Receivables) ({receivableList.length})
              </button>
              <button
                onClick={() => setModalTab('payable')}
                className={`flex-1 pb-3 text-[11px] font-black uppercase tracking-wider border-b-2 transition-all ${
                  modalTab === 'payable'
                    ? 'border-[#0f766e] text-[#0f766e]'
                    : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                কর্মচারী পাবে (Payables) ({payableList.length})
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-[#e2e8f0] pr-1">
              {modalTab === 'receivable' ? (
                receivableList.length > 0 ? (
                  receivableList.map((emp) => (
                    <div key={emp._id} className="py-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-sm text-[#0f172a] capitalize">{emp.name}</h4>
                        <p className="text-[10px] text-[#64748b] font-bold mt-0.5">
                          Employee ID: #{emp.employeeId || emp.phone?.slice(-4) || 'N/A'} • <span className="text-[#0f766e]">{emp.department || 'General'}</span>
                        </p>
                      </div>
                      <div className="bg-[#f0fdfa] border border-[#dcfce7] px-3.5 py-1.5 rounded-2xl text-right">
                        <span className="text-[8px] font-black text-[#0f766e] uppercase tracking-wider block">Outstanding</span>
                        <span className="font-black text-sm text-[#0f766e]">৳{emp.balance.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-[#94a3b8] font-bold">
                    No active outstanding receivables found.
                  </div>
                )
              ) : (
                payableList.length > 0 ? (
                payableList.map((emp) => (
                    <div key={emp._id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                      <div>
                        <h4 className="font-black text-sm text-[#0f172a] capitalize">{emp.name}</h4>
                        <p className="text-[10px] text-[#64748b] font-bold mt-0.5 flex items-center gap-1.5">
                          <span>ID: #{emp.employeeId || emp.phone?.slice(-4) || 'N/A'}</span>
                          <span className="w-1 h-1 bg-[#cbd5e1] rounded-full"></span>
                          <span className="text-[#0f766e]">{emp.department || 'General'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl text-right">
                          <span className="text-[8px] font-black text-amber-700 uppercase tracking-wider block">Owed Amount</span>
                          <span className="font-black text-sm text-amber-700">৳{emp.owed.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => handlePayEmployeeClaims(emp._id, emp.name, emp.owed)}
                          disabled={payingId === emp._id}
                          className="bg-[#0f766e] hover:bg-[#0d9488] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-teal-700/10 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          {payingId === emp._id ? 'Paying...' : 'Pay'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-[#94a3b8] font-bold">
                    No active employee payables found.
                  </div>
                )
              )}
            </div>

            <div className="border-t border-[#e2e8f0] pt-4 flex justify-between items-center bg-[#fafafa] -mx-6 -mb-6 p-6 rounded-b-3xl">
              <span className="text-xs font-black text-[#64748b] uppercase tracking-widest">
                {modalTab === 'receivable' ? 'Total Receivables' : 'Total Payables'}
              </span>
              <span className={`text-xl font-black ${modalTab === 'receivable' ? 'text-[#0f766e]' : 'text-amber-700'}`}>
                ৳{modalTab === 'receivable'
                  ? stats.totalOutstanding.toLocaleString()
                  : payableList.reduce((sum, emp) => sum + emp.owed, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Pending Bills Details Modal */}
      {showPendingBillsModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#cbd5e1]/30 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-[#d97706] shrink-0">
                  <LuFileClock size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#0f172a] uppercase tracking-tight">Pending Bills</h3>
                  <p className="text-[10px] text-[#64748b] font-medium mt-0.5">List of active bill submissions waiting for review.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPendingBillsModal(false)}
                className="text-xs font-black text-[#64748b] hover:text-[#0f172a] uppercase tracking-wider bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-[#e2e8f0] pr-1">
              {pendingBillsList.length > 0 ? (
                pendingBillsList.map((bill) => (
                  <div key={bill._id} className="py-3 flex items-center justify-between hover:bg-[#fbfbfb] px-2 rounded-xl transition-colors">
                    <div>
                      <h4 className="font-black text-sm text-[#0f172a] capitalize">{bill.employee?.username || bill.employeeName || 'Unknown'}</h4>
                      <p className="text-[10px] text-[#64748b] font-bold mt-0.5">
                        {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'} • <span className="text-[#0f766e]">{bill.advanceId?.company?.name || 'No Company'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-[#0f172a]">৳{bill.totalAmount.toLocaleString()}</span>
                      <button 
                        onClick={() => {
                          setShowPendingBillsModal(false);
                          navigate(`/admin/bill-review?id=${bill._id}`);
                        }}
                        className="px-2.5 py-1.5 bg-[#f0fdfa] hover:bg-[#0f766e] hover:text-white text-[#0f766e] font-black text-[9px] uppercase tracking-widest rounded-lg border border-teal-100 transition-all cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#94a3b8] font-bold">
                  No active pending bills waiting for review.
                </div>
              )}
            </div>

            <div className="border-t border-[#e2e8f0] pt-4 flex justify-between items-center bg-[#fafafa] -mx-6 -mb-6 p-6 rounded-b-3xl">
              <span className="text-xs font-black text-[#64748b] uppercase tracking-widest">
                Total Pending Amount
              </span>
              <span className="text-xl font-black text-[#d97706]">
                ৳{pendingBillsList.reduce((sum, bill) => sum + bill.totalAmount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
