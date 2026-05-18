import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LuArrowLeft, 
  LuPhone, 
  LuCircleCheck, 
  LuFileText, 
  LuHistory, 
  LuChevronLeft, 
  LuChevronRight, 
  LuLayers, 
  LuBuilding,
  LuSlidersHorizontal,
  LuSearch,
  LuSparkles,
  LuWallet,
  LuTriangleAlert
} from 'react-icons/lu';

const EmployeeDetails = () => {
  const { id } = useParams();
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();

  const employee = (globalData.employees || []).find(emp => emp._id === id);
  const advances = (globalData.advances || []).filter(adv => adv.employee?._id === id);
  const expenses = (globalData.expenses || []).filter(exp => exp.employee?._id === id);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Silently refresh in background
    refreshGlobalData();
  }, []);

  const loading = globalData.loading && !employee;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-[#64748b] uppercase tracking-widest">Loading employee files...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-16 text-center shadow-sm">
        <LuTriangleAlert size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="font-black text-xl text-[#0f172a] uppercase mb-2">Employee Not Found</h3>
        <p className="text-xs text-[#64748b] mb-6">The employee record you are trying to view does not exist or has been deleted.</p>
        <button 
          onClick={() => navigate('/admin/employees')}
          className="bg-[#0f766e] text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl cursor-pointer"
        >
          Back to List
        </button>
      </div>
    );
  }

  // Calculation of Stats
  // 1. Current outstanding advance (directly from employee.balance)
  const currentAdvance = employee.balance || 0;

  // 2. Total submitted bills (sum of all submitted expense amount)
  const totalSubmittedBills = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

  // 3. Completed settlements (sum of all settled bills or approved total amounts)
  const completedSettlements = expenses
    .filter(exp => exp.status === 'Approved' || exp.status === 'Settled')
    .reduce((sum, exp) => sum + (exp.approvedTotalAmount || exp.totalAmount || 0), 0);

  // Filter history list
  const filteredHistory = expenses.filter(exp => {
    const purposeText = (exp.items || []).map(itm => itm.purpose || '').join(' ').toLowerCase();
    const vehicleText = (exp.items || []).map(itm => itm.vehicle || '').join(' ').toLowerCase();
    const query = searchQuery.toLowerCase();
    return purposeText.includes(query) || vehicleText.includes(query) || exp.status?.toLowerCase().includes(query);
  });

  // Pagination calculations
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Avatar Initials
  const nameInitials = (employee.name || employee.username || '?')
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center no-print">
        <button 
          onClick={() => navigate('/admin/employees')}
          className="flex items-center gap-2 text-[#64748b] hover:text-[#0f766e] font-black text-xs uppercase tracking-widest transition-colors cursor-pointer group"
        >
          <LuArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Go Back
        </button>
      </div>

      {/* Profile Header Section */}
      <section className="bg-white rounded-3xl border border-[#e2e8f0] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          {/* Circular profile initials container */}
          <div className="w-20 h-20 rounded-full bg-teal-50 text-[#0f766e] flex items-center justify-center font-black text-2xl border-2 border-teal-100 shrink-0">
            {nameInitials}
          </div>
          <div>
            <h2 className="font-black text-2xl text-[#0f172a] capitalize leading-none">{employee.name || employee.username}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
              <div className="flex items-center gap-1.5 text-[#64748b] text-xs font-bold">
                <LuPhone size={14} className="text-[#0f766e]" />
                <span>{employee.phone || 'No phone number'}</span>
              </div>
              <span className="text-[#cbd5e1] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748b]">
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                  Active
                </span>
              </div>
              <span className="text-[#cbd5e1] hidden sm:inline">•</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">
                ID: #{employee.employeeId || 'N/A'} • {employee.department || 'General'}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/admin/give-advance?employee=${employee._id}`)}
          className="bg-[#0f766e] hover:bg-[#0d9488] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-teal-700/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <LuWallet size={16} />
          Give Advance
        </button>
      </section>

      {/* Stat Cards: Bento Grid Style */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Current Advance (Amber) */}
        <div className="bg-amber-50/50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/70 flex items-center justify-center text-amber-700 shrink-0">
            <LuWallet size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black text-amber-800/80 uppercase tracking-widest leading-none">Current Advance</p>
            <h3 className="text-2xl font-black text-amber-900 mt-2">৳ {Math.max(0, currentAdvance).toLocaleString()}</h3>
          </div>
        </div>

        {/* Total Bills (Slate) */}
        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-3xl flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
            <LuFileText size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-700/80 uppercase tracking-widest leading-none">Total Submitted Bills</p>
            <h3 className="text-2xl font-black text-slate-900 mt-2">৳ {totalSubmittedBills.toLocaleString()}</h3>
          </div>
        </div>

        {/* Settlements (Green) */}
        <div className="bg-emerald-50/40 border border-emerald-200 p-6 rounded-3xl flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 flex items-center justify-center text-emerald-700 shrink-0">
            <LuCircleCheck size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black text-emerald-800/80 uppercase tracking-widest leading-none">Completed Settlements</p>
            <h3 className="text-2xl font-black text-emerald-900 mt-2">৳ {completedSettlements.toLocaleString()}</h3>
          </div>
        </div>

      </section>

      {/* Bill History Table Section */}
      <section className="bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-sm">
        
        {/* Table header row */}
        <div className="p-6 border-b border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-black text-lg text-[#0f172a] uppercase tracking-tight">Bill Submission History</h3>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Table Search */}
            <div className="relative flex-1 sm:w-60 sm:flex-none">
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-2 pl-9 pr-4 text-xs font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f766e] transition-all"
              />
              <LuSearch className="absolute left-3.5 top-3 text-[#94a3b8]" size={14} />
            </div>

            <button className="bg-white border border-[#cbd5e1] text-[#0f172a] px-3.5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#fafafa] transition-colors cursor-pointer">
              <LuSlidersHorizontal size={14} className="text-[#0f766e]" />
              Filter
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          {currentItems.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#e2e8f0]">
                  <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Bill Submitted (Details)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {currentItems.map((exp) => {
                  const billSubmittedText = exp.items && exp.items.length > 0 
                    ? exp.items.map(i => `${i.vehicle || 'Expense'} (${i.from || 'From'} to ${i.to || 'To'})`).join(', ') 
                    : 'Expense submission';

                  const voucherNum = exp._id ? exp._id.slice(-6).toUpperCase() : 'N/A';

                  return (
                    <tr key={exp._id} className="hover:bg-[#fbfbfb] transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-[#64748b]">
                        {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-[#0f172a] max-w-sm truncate">{billSubmittedText}</div>
                        <div className="text-[9px] text-[#94a3b8] font-black uppercase tracking-wider mt-0.5">
                          Voucher No: #TR-{voucherNum}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-black text-xs text-[#0f172a]">
                        ৳ {exp.totalAmount.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        {exp.status === 'Approved' && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-100">
                            Approved
                          </span>
                        )}
                        {exp.status === 'Pending' && (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-100">
                            Pending
                          </span>
                        )}
                        {exp.status === 'Rejected' && (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-rose-100">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/admin/bill-review?id=${exp._id}`)}
                          className="text-[#0f766e] hover:underline font-black text-[10px] uppercase tracking-widest cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-[#64748b] text-xs font-bold uppercase tracking-wider">
              No bills submitted by this employee yet
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="px-6 py-4 bg-[#fafafa] flex items-center justify-between border-t border-[#e2e8f0]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} results
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 bg-white rounded-xl border border-[#cbd5e1] hover:bg-[#fafafa] disabled:opacity-40 transition-opacity cursor-pointer flex items-center justify-center text-[#0f172a]"
              >
                <LuChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 bg-white rounded-xl border border-[#cbd5e1] hover:bg-[#fafafa] disabled:opacity-40 transition-opacity cursor-pointer flex items-center justify-center text-[#0f172a]"
              >
                <LuChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};

export default EmployeeDetails;
