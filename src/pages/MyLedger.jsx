import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuWallet, LuFileClock, LuCircleCheck, LuCirclePlus, LuHistory, LuBookOpen, LuZap, LuInfo, LuCircleDollarSign, LuFileText, LuShieldCheck, LuTriangleAlert } from 'react-icons/lu';

const MyLedger = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();

  const transactions = globalData.ledger?.transactions || [];
  const stats = globalData.ledger?.stats || { balance: 0, totalReceived: 0, totalSpent: 0 };
  const loading = globalData.loading && transactions.length === 0;

  // Calculate pending bills
  const myExpenses = (globalData.expenses || []).filter(e => e.user === user?._id || e.employee?.user === user?._id);
  const pending = myExpenses.filter(e => e.status === 'Pending');
  const pendingTotal = pending.reduce((s, e) => s + (e.totalAmount || 0), 0);
  const pendingBills = { count: pending.length, total: pendingTotal };

  // Last settlement from approved
  const approved = myExpenses.filter(e => e.status === 'Approved' || e.status === 'Settled');
  const lastSettlement = approved.length > 0 
    ? { amount: approved[0].totalAmount || 0, date: approved[0].updatedAt || approved[0].createdAt }
    : null;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Advance */}
        <div className="bg-white p-7 rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-on-surface/70">Current</p>
              <p className="text-sm font-bold text-on-surface/70">Advance</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <LuCircleDollarSign size={22} className="text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-orange-500 tracking-tight">৳{stats.balance.toLocaleString()}</p>
          <p className="text-xs text-outline mt-1.5 font-medium">Available as balance</p>
        </div>

        {/* Pending Bills */}
        <div className="bg-white p-7 rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-on-surface/70">Pending</p>
              <p className="text-sm font-bold text-on-surface/70">Bills</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
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
              <p className="text-sm font-bold text-on-surface/70">Last</p>
              <p className="text-sm font-bold text-on-surface/70">Settlement</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
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
            <button onClick={() => navigate('/employee/expenses')}
              className="bg-white border border-outline-variant/30 hover:border-primary/30 py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold text-on-surface transition-all">
              <LuHistory size={18} className="text-outline" /> History
            </button>
            <button onClick={() => navigate('/employee/settlements')}
              className="bg-white border border-outline-variant/30 hover:border-primary/30 py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold text-on-surface transition-all">
              <LuBookOpen size={18} className="text-outline" /> Ledger
            </button>
          </div>

          <div className="border-t border-outline-variant/10 pt-4"></div>

          {/* Decorative card */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl p-8 text-white relative overflow-hidden min-h-[170px]">
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Active</span>
            </div>
            <div className="absolute bottom-6 left-8">
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Employee ID</p>
              <p className="text-lg font-black tracking-widest">{user?.username?.toUpperCase() || 'USER'}</p>
            </div>
            <div className="absolute bottom-6 right-8 text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Balance</p>
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
                      <p className="text-[10px] text-outline opacity-60 mt-0.5">
                        {item.company && <span className="text-primary font-bold">{item.company} • </span>}
                        {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
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
    </div>
  );
};

export default MyLedger;
