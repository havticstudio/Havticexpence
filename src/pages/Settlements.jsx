import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuDownload, LuSearch, LuTrendingUp, LuTrendingDown, LuReceipt, LuHandshake } from 'react-icons/lu';

const Settlements = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();

  const handleRowClick = (s) => {
    const expenseId = s.expense?._id || s.expense;
    if (!expenseId) return;
    navigate(`/admin/bill-review?id=${expenseId}`);
  };

  const settlements = globalData.settlements || [];
  const stats = globalData.settlementsStats || { totalPaid: 0, totalReturned: 0 };
  const loading = globalData.loading && settlements.length === 0;

  useEffect(() => {
    // Refresh background state
    refreshGlobalData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase">Settlements</h1>
          <p className="text-outline text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Finalized transactions</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-3 bg-white border border-outline-variant rounded-2xl text-[11px] font-black text-outline uppercase tracking-widest hover:text-primary transition-all cursor-pointer">
          <LuDownload size={16} /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-outline-variant/20 p-10 shadow-sm">
          <p className="text-[10px] font-black text-outline uppercase tracking-widest opacity-50 mb-3">Total Office Payout</p>
          <h2 className="text-4xl font-black text-primary tracking-tighter">৳{stats.totalPaid.toLocaleString()}</h2>
        </div>
        <div className="bg-white rounded-3xl border border-outline-variant/20 p-10 shadow-sm">
          <p className="text-[10px] font-black text-outline uppercase tracking-widest opacity-50 mb-3">Total Employee Return</p>
          <h2 className="text-4xl font-black text-orange-500 tracking-tighter">৳{stats.totalReturned.toLocaleString()}</h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="font-black text-[12px] uppercase tracking-widest text-on-surface">History</h3>
        </div>
        {settlements.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/10">
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest text-center">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest text-center">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {settlements.map((s, i) => {
                const hasExpense = !!(s.expense?._id || s.expense);
                return (
                  <tr 
                    key={i} 
                    onClick={() => handleRowClick(s)}
                    className={`transition-all ${hasExpense ? 'cursor-pointer hover:bg-slate-50' : 'opacity-90'}`}
                  >
                    <td className="px-8 py-5">
                      <p className="font-bold text-on-surface">{s.employeeName || 'Unknown'}</p>
                      {hasExpense && <span className="text-[9px] text-[#0f766e] font-black uppercase tracking-wider block mt-0.5 no-print hover:underline">View Bill Details</span>}
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-medium text-outline">{s.date ? new Date(s.date).toLocaleDateString() : '-'}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.type === 'Office Pay' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>{s.type}</span>
                    </td>
                    <td className="px-8 py-5 text-right"><p className={`text-lg font-black ${s.type === 'Office Pay' ? 'text-primary' : 'text-orange-500'}`}>৳{(s.amount || 0).toLocaleString()}</p></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <LuHandshake size={40} className="text-outline/20 mx-auto mb-4" />
            <p className="font-bold text-on-surface">{loading ? 'Loading...' : 'No settlements yet'}</p>
            <p className="text-xs text-outline opacity-60 mt-1">Completed settlements will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settlements;
