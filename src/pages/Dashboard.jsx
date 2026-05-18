import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuWallet, LuFileClock, LuCircleCheck, LuBell, LuZap, LuUserPlus, LuArrowRight } from 'react-icons/lu';

const Dashboard = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Outstanding Advance */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#f0fdfa] flex items-center justify-center text-[#0f766e]">
            <LuWallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Total Outstanding Advance</p>
            <p className="text-2xl font-black text-[#0f172a] mt-0.5">৳{stats.totalOutstanding.toLocaleString()}</p>
          </div>
        </div>

        {/* Pending Bills */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#fffbeb] flex items-center justify-center text-[#d97706]">
            <LuFileClock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Pending Bills</p>
            <p className="text-2xl font-black text-[#0f172a] mt-0.5">{stats.pendingBills}</p>
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
    </div>
  );
};

export default Dashboard;
