import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LuChartBar, LuTrendingUp, LuUsers, LuWallet, LuCalendar, LuDownload } from 'react-icons/lu';

const Reports = () => {
  const { user, globalData, refreshGlobalData } = useAuth();

  const stats = globalData.reportsStats || { totalExpenses: 0, avgPerEmployee: 0, growthRate: 0, billsProcessed: 0 };
  const categories = globalData.reportsCategories || [];
  const topSpenders = globalData.reportsTopSpenders || [];
  const loading = globalData.loading && categories.length === 0;

  useEffect(() => {
    // Silently refresh in the background
    refreshGlobalData();
  }, []);

  const colors = ['bg-primary', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase">Reports</h1>
          <p className="text-outline text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Analytics & Insights</p>
        </div>
        <button className="flex items-center gap-2 text-outline text-xs font-bold bg-white border border-outline-variant/20 px-5 py-3 rounded-xl cursor-pointer hover:text-primary transition-colors">
          <LuDownload size={14} /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Expenses', value: `৳${stats.totalExpenses.toLocaleString()}`, icon: LuWallet, bg: 'bg-teal-50', text: 'text-primary' },
          { label: 'Avg / Employee', value: `৳${stats.avgPerEmployee.toLocaleString()}`, icon: LuUsers, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Growth', value: `${stats.growthRate}%`, icon: LuTrendingUp, bg: 'bg-green-50', text: 'text-green-600' },
          { label: 'Bills Done', value: stats.billsProcessed, icon: LuChartBar, bg: 'bg-purple-50', text: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/20 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.text}`}><stat.icon size={22} /></div>
            <div><p className="text-[9px] font-black text-outline uppercase tracking-widest opacity-50">{stat.label}</p><p className="text-xl font-black text-on-surface tracking-tighter">{stat.value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-8">
          <h3 className="font-black text-[12px] uppercase tracking-widest text-on-surface mb-6">Category Breakdown</h3>
          {categories.length > 0 ? (
            <div className="space-y-5">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-on-surface">{cat.name}</span>
                    <span className="text-sm font-black text-on-surface">৳{cat.amount.toLocaleString()} <span className="text-outline text-xs">({cat.percent}%)</span></span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-3 overflow-hidden">
                    <div className={`${colors[i % colors.length]} h-full rounded-full transition-all duration-1000`} style={{ width: `${cat.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-outline text-sm py-12 opacity-60">{loading ? 'Loading...' : 'No data yet'}</p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-8">
          <h3 className="font-black text-[12px] uppercase tracking-widest text-on-surface mb-6">Top Spenders</h3>
          {topSpenders.length > 0 ? (
            <div className="space-y-4">
              {topSpenders.map((emp, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">{(emp.name || '?').charAt(0).toUpperCase()}</div>
                    <div><p className="font-bold text-sm text-on-surface">{emp.name}</p><p className="text-[10px] text-outline opacity-60">{emp.department || '-'}</p></div>
                  </div>
                  <p className="font-black text-sm text-primary">৳{emp.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-outline text-sm py-12 opacity-60">{loading ? 'Loading...' : 'No data yet'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
