import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuHandshake, LuArrowUpRight, LuArrowDownLeft } from 'react-icons/lu';

const MySettlements = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();

  const handleRowClick = (s) => {
    const expenseId = s.expense?._id || s.expense;
    if (!expenseId) return;
    navigate(`/employee/history?id=${expenseId}`);
  };

  const settlements = globalData.settlements || [];
  const loading = globalData.loading && settlements.length === 0;

  useEffect(() => {
    // Refresh background state
    refreshGlobalData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase">My Settlements</h1>
        <p className="text-outline text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Your completed settlements</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 overflow-hidden">
        {settlements.length > 0 ? (
          <div className="divide-y divide-outline-variant/10">
            {settlements.map((s, i) => {
              const hasExpense = !!(s.expense?._id || s.expense);
              return (
                <div 
                  key={i} 
                  onClick={() => handleRowClick(s)}
                  className={`px-8 py-5 flex items-center justify-between transition-colors ${hasExpense ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.type === 'Employee Return' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                      {s.type === 'Employee Return' ? <LuArrowUpRight size={20} /> : <LuArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface flex items-center gap-2">
                        {s.type}
                        {hasExpense && <span className="text-[8px] bg-teal-50 text-[#0f766e] border border-teal-100 px-2 py-0.5 rounded-full font-black uppercase tracking-wider no-print hover:underline">View Bill</span>}
                      </p>
                      <p className="text-[10px] text-outline opacity-60">{s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</p>
                    </div>
                  </div>
                  <p className={`font-black text-sm ${s.type === 'Employee Return' ? 'text-orange-600' : 'text-green-600'}`}>৳{(s.amount || 0).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <LuHandshake size={40} className="text-outline/20 mx-auto mb-4" />
            <p className="font-bold text-on-surface">{loading ? 'Loading...' : 'No settlements yet'}</p>
            <p className="text-xs text-outline opacity-60 mt-1">Your settlement history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySettlements;
