import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { 
  LuFileCheck, 
  LuSearch, 
  LuTriangleAlert, 
  LuX, 
  LuCheck, 
  LuCalendar, 
  LuNotebook, 
  LuArrowLeft, 
  LuDownload, 
  LuPrinter, 
  LuChevronDown, 
  LuHistory, 
  LuArrowRight, 
  LuBuilding,
  LuChevronRight,
  LuFileText,
  LuSlidersHorizontal,
  LuCircleCheck
} from 'react-icons/lu';

const Expenses = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const billIdParam = searchParams.get('id');

  const bills = (globalData.expenses || []).filter(e => e.status === 'Pending' || !e.status);
  const [selectedBill, setSelectedBill] = useState(null);
  const [approvedAmounts, setApprovedAmounts] = useState({});
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReturned, setIsReturned] = useState(false);
  const loading = globalData.loading && bills.length === 0;
  const [submitLoading, setSubmitLoading] = useState(false);

  // Search & Filters for Master List
  const [searchQuery, setSearchQuery] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef(null);

  useEffect(() => {
    // Silently refresh in background
    refreshGlobalData();
  }, []);

  // Handle direct navigation from dashboard or selection changes
  useEffect(() => {
    if (billIdParam && (globalData.expenses || []).length > 0) {
      const found = (globalData.expenses || []).find(b => (b._id || b.id) === billIdParam);
      if (found) {
        setSelectedBill(found);
      }
    } else if (!billIdParam) {
      setSelectedBill(null);
    }
  }, [billIdParam, globalData.expenses]);

  useEffect(() => {
    if (selectedBill) {
      const initial = {};
      (selectedBill.items || []).forEach(item => {
        initial[item._id || item.id] = item.amount;
      });
      setApprovedAmounts(initial);
      setReviewNotes('');
      setIsReturned(false);
    }
  }, [selectedBill]);

  // Click outside to close download dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleAmountChange = (itemId, val) => {
    setApprovedAmounts(prev => ({
      ...prev,
      [itemId]: Number(val) || 0
    }));
  };

  const handleApprove = async () => {
    if (!selectedBill) return;
    setSubmitLoading(true);
    try {
      const updatedItems = (selectedBill.items || []).map(item => ({
        ...item,
        approvedAmount: approvedAmounts[item._id || item.id] !== undefined ? approvedAmounts[item._id || item.id] : item.amount
      }));

      const totalApprovedBill = Object.values(approvedAmounts).reduce((sum, current) => sum + current, 0);

      await axios.put(`http://localhost:5000/api/expenses/${selectedBill._id || selectedBill.id}/approve`, {
        items: updatedItems,
        approvedTotalAmount: totalApprovedBill,
        reviewNotes,
        isReturned
      }, { headers: { Authorization: `Bearer ${user?.token}` } });

      await refreshGlobalData();
      handleBackToList();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBill) return;
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setSubmitLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/expenses/${selectedBill._id || selectedBill.id}/reject`, { reason }, { headers: { Authorization: `Bearer ${user?.token}` } });
      await refreshGlobalData();
      handleBackToList();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBackToList = () => {
    setSearchParams({});
    setSelectedBill(null);
  };

  const triggerDownloadPDF = () => {
    setShowDownloadMenu(false);
    window.print();
  };

  // Check if a line item is flagged
  const getFlaggedIssues = () => {
    if (!selectedBill) return [];
    const issues = [];
    (selectedBill.items || []).forEach(item => {
      if ((item.vehicle === 'Uber/Pathao' || item.vehicle === 'Taxi') && item.amount > 500) {
        issues.push(`Conveyance cost for ${item.from || 'From'} to ${item.to || 'To'} exceeds guideline threshold of ৳500.00.`);
      }
      if (item.vehicle === 'Food/Meal' && item.amount > 200) {
        issues.push(`Lunch bill (Oct ${item.date ? new Date(item.date).getDate() : '22'}) exceeds the daily policy limit of ৳200.00.`);
      }
    });
    return issues;
  };

  const flaggedIssues = getFlaggedIssues();

  // Calculations
  const totalSubmittedBill = selectedBill ? selectedBill.totalAmount : 0;
  const totalApprovedBill = Object.values(approvedAmounts).reduce((sum, current) => sum + current, 0);
  const diff = selectedBill ? (selectedBill.advance - totalApprovedBill) : 0;

  // Search logic for pending list
  const filteredBills = bills.filter(bill => {
    const name = (bill.employeeName || bill.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Printing Style Tag */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide everything */
          body * {
            visibility: hidden;
            background: none !important;
          }
          /* Show only the bill review card */
          #printable-bill-review, #printable-bill-review * {
            visibility: visible;
          }
          #printable-bill-review {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          /* Expand input box during print for perfect visual representation */
          .print-input-value {
            border: none !important;
            background: transparent !important;
            text-align: right !important;
            font-weight: 900 !important;
          }
        }
      `}} />

      {/* Main Headers - only visible when a bill is selected */}
      {selectedBill && (
        <div className="flex justify-between items-center no-print mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase">Review Bills</h1>
            <p className="text-[#64748b] text-sm font-medium mt-0.5">Approval, overrides & settlements</p>
          </div>
          <div className="relative" ref={downloadMenuRef}>
            <button 
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="px-5 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-teal-700/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <LuDownload size={15} /> Download Options <LuChevronDown size={14} />
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 overflow-hidden py-1">
                <button 
                  onClick={triggerDownloadPDF}
                  className="w-full px-4 py-3 text-left text-xs font-bold text-[#0f172a] hover:bg-[#f8fafc] flex items-center gap-2"
                >
                  <LuPrinter size={15} className="text-[#0f766e]" /> Download / Print PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditional Layout */}
      {!selectedBill ? (
        /* ==================== 1. MASTER PENDING BILLS BENTO GRID VIEW ==================== */
        <div className="space-y-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 no-print">
            <div>
              <h2 className="font-black text-3xl text-[#0f172a] uppercase tracking-tight">Bill Review List</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2.5 h-2.5 rounded-full ${filteredBills.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-teal-500'}`}></span>
                <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  {filteredBills.length} bills pending for approval
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 md:w-72 md:flex-none">
                <input 
                  type="text" 
                  placeholder="Search employee name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#cbd5e1] rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f766e] transition-all shadow-sm"
                />
                <LuSearch className="absolute left-3.5 top-3.5 text-[#94a3b8]" size={15} />
              </div>
              
              <button className="bg-white border border-[#cbd5e1] text-[#0f172a] px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#fafafa] transition-colors shadow-sm cursor-pointer">
                <LuSlidersHorizontal size={16} className="text-[#0f766e]" />
                Filter
              </button>
            </div>
          </div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
            
            {/* Left Column (Main list of pending bills - takes 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {filteredBills.length > 0 ? (
                filteredBills.map(bill => {
                  // Dynamic calculation of guideline issues
                  let issuesCount = 0;
                  (bill.items || []).forEach(item => {
                    if ((item.vehicle === 'Uber/Pathao' || item.vehicle === 'Taxi') && item.amount > 500) {
                      issuesCount++;
                    }
                    if (item.vehicle === 'Food/Meal' && item.amount > 200) {
                      issuesCount++;
                    }
                  });

                  return (
                    <div key={bill._id || bill.id} className="bg-white border border-[#e2e8f0] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md transition-shadow gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                          <LuFileText size={30} />
                        </div>
                        <div>
                          <h3 className="font-black text-base text-[#0f172a]">{bill.employeeName || bill.name || 'Unknown'}</h3>
                          <p className="text-xs text-[#64748b] font-bold flex flex-wrap items-center gap-2 mt-1">
                            <span>{bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                            <span className="text-[#cbd5e1]">•</span>
                            <span className="text-[#0f766e]">Advance: ৳{(bill.advance || 0).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                        {/* Dynamic warning vs status chip */}
                        {issuesCount > 0 ? (
                          <div className="bg-red-50 text-red-600 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shrink-0 border border-red-100">
                            <LuTriangleAlert size={14} />
                            {issuesCount} Issues
                          </div>
                        ) : (
                          <div className="bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shrink-0 border border-blue-100">
                            <LuCircleCheck size={14} />
                            New Bill
                          </div>
                        )}

                        {/* Amount box */}
                        <div className="bg-[#f8fafc] px-4 py-2 rounded-2xl border border-[#e2e8f0] text-center min-w-[105px]">
                          <p className="text-[9px] text-[#94a3b8] font-black uppercase tracking-wider leading-none">Bill Amount</p>
                          <p className="font-black text-sm text-[#0f766e] mt-1">৳{(bill.totalAmount || 0).toLocaleString()}</p>
                        </div>

                        <button 
                          onClick={() => setSearchParams({ id: bill._id || bill.id })}
                          className="bg-[#0f766e] hover:bg-[#0d9488] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-teal-700/5 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                        >
                          Review Now
                          <LuChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center border border-dashed border-[#e2e8f0] bg-white rounded-3xl">
                  <LuFileCheck size={40} className="text-[#cbd5e1] mx-auto mb-3" />
                  <p className="font-bold text-[#64748b]">{loading ? 'Loading Submissions...' : 'All clear!'}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">No pending employee bills are currently awaiting review.</p>
                </div>
              )}
            </div>

            {/* Right Column: Review Guidelines & Status */}
            <div className="space-y-6">
              
              {/* Guidelines Card */}
              <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="font-black text-xs text-[#0f172a] uppercase tracking-wider">Review Guidelines</h4>
                <ul className="space-y-3.5">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                      <LuCircleCheck size={14} />
                    </span>
                    <span className="text-xs text-[#64748b] font-medium leading-relaxed">
                      Ensure receipts or vouchers are clear and legible.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                      <LuCircleCheck size={14} />
                    </span>
                    <span className="text-xs text-[#64748b] font-medium leading-relaxed">
                      Check consistency of expenses with the advance balance.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                      <LuCircleCheck size={14} />
                    </span>
                    <span className="text-xs text-[#64748b] font-medium leading-relaxed">
                      If there's any discrepancy, "Reject" and state the reason.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Progress Insight Card */}
              <div className="relative overflow-hidden bg-gradient-to-tr from-[#0f766e] to-[#0d9488] text-white rounded-3xl p-6 shadow-lg shadow-teal-900/10 flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="font-black text-sm uppercase tracking-wider">Review Status</h4>
                  <p className="text-xs text-teal-50/80 leading-relaxed max-w-[180px]">
                    You have reviewed a total of 24 bills this month. Your average review time is 8 minutes.
                  </p>
                </div>
                
                {/* Modern Progress Ring */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-teal-950/20" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeWidth="6"></circle>
                    <circle cx="40" cy="40" fill="transparent" r="32" stroke="white" stroke-dasharray="201" stroke-dashoffset="16" strokeWidth="6" strokeLinecap="round"></circle>
                  </svg>
                  <span className="absolute font-black text-base">92%</span>
                </div>
                
                {/* Soft blur circle */}
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* ==================== 2. SCREEN 04 FULL-WIDTH DETAIL REVIEW PAGE ==================== */
        <div id="printable-bill-review" className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col justify-between">
          
          {/* Header Row */}
          <div className="p-8 border-b border-[#e2e8f0] bg-[#fafafa] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Official Brand Logo */}
              <img src={logo} alt="Brand Care" className="h-12 w-auto object-contain shrink-0" />
              <div className="border-l border-[#cbd5e1] pl-5 hidden sm:block h-10"></div>
              <div>
                {/* Back Button (Only shown in screen view, hidden when printing) */}
                <button 
                  onClick={handleBackToList}
                  className="flex items-center gap-1.5 text-xs font-black text-[#0f766e] uppercase tracking-wider mb-2 hover:underline no-print"
                >
                  <LuArrowLeft size={14} /> Back to Submissions list
                </button>
                
                <h3 className="font-black text-2xl text-[#0f172a] tracking-tight">Review Bill - {selectedBill.employeeName || 'Unknown'}</h3>
                
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-[#64748b] font-bold">
                    <LuCalendar size={13} />
                    Submitted: {selectedBill.createdAt ? new Date(selectedBill.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                  <span className="bg-[#f1f5f9] text-[#475569] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    Emp ID: #{selectedBill.employee?.phone?.slice(-4) || '3421'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-[#e2e8f0] rounded-xl px-6 py-4 text-right shrink-0">
              <p className="text-[8px] font-black text-[#94a3b8] uppercase tracking-widest">CURRENT ADVANCE</p>
              <p className="text-2xl font-black text-[#0f766e] mt-0.5">৳{(selectedBill.advance || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Flagged Issues Alert */}
          {flaggedIssues.length > 0 && (
            <div className="mx-8 mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 space-y-2 no-print">
              <h4 className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                <LuTriangleAlert size={15} /> Flagged Issues
              </h4>
              <ul className="list-disc pl-5 text-xs text-red-600 font-bold space-y-1.5">
                {flaggedIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Items Table */}
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  <th className="pb-3 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Date</th>
                  <th className="pb-3 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Description (From → To)</th>
                  <th className="pb-3 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Purpose</th>
                  <th className="pb-3 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Vehicle</th>
                  <th className="pb-3 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Submitted</th>
                  <th className="pb-3 text-[10px] font-black text-[#64748b] uppercase tracking-widest text-right">Approve Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {(selectedBill.items || []).map((item, idx) => {
                  const isItemFlagged = (item.vehicle === 'Food/Meal' && item.amount > 200) || 
                                       ((item.vehicle === 'Uber/Pathao' || item.vehicle === 'Taxi') && item.amount > 500);
                  const currentApproveVal = approvedAmounts[item._id || item.id] !== undefined ? approvedAmounts[item._id || item.id] : item.amount;
                  return (
                    <tr key={item._id || item.id} className="hover:bg-[#fbfbfb] transition-colors">
                      <td className="py-4 text-xs font-bold text-[#0f172a] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          {isItemFlagged && <LuTriangleAlert size={13} className="text-red-500 shrink-0 no-print" />}
                          {item.date ? new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-bold text-[#64748b]">
                        {item.from} → {item.to}
                      </td>
                      <td className="py-4 text-xs font-bold text-[#64748b]">
                        {item.purpose}
                      </td>
                      <td className="py-4 text-xs font-bold text-[#64748b]">
                        {item.vehicle}
                      </td>
                      <td className="py-4 text-xs font-black text-[#64748b]">
                        ৳{item.amount.toLocaleString()}
                      </td>
                      <td className="py-4 text-right">
                        {/* Printable friendly input view */}
                        <input 
                          type="number"
                          value={currentApproveVal}
                          onChange={(e) => handleAmountChange(item._id || item.id, e.target.value)}
                          className="w-24 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl py-2 px-3 focus:outline-none focus:border-[#0f766e] text-right font-black text-xs print-input-value"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Grid */}
          <div className="p-8 border-t border-[#e2e8f0] bg-[#fbfbfb] grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                <LuNotebook size={15} /> Review Notes (Optional)
              </h4>
              <textarea 
                rows="5"
                placeholder="Explain any deductions or adjustments here..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded-2xl p-4 text-xs font-bold text-on-surface placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f766e] resize-none transition-all"
              ></textarea>
            </div>

            {/* Right: Calculations Summary */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Calculation Summary</h4>
              <div className="space-y-2 border-b border-[#e2e8f0] pb-3">
                <div className="flex justify-between text-xs font-bold text-[#64748b]">
                  <span>Total Submitted Bill</span>
                  <span>৳{totalSubmittedBill.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-[#0f766e]">
                  <span>Total Approved Bill</span>
                  <span>৳{totalApprovedBill.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#94a3b8]">
                  <span>Less Advance Taken</span>
                  <span>৳({(selectedBill.advance || 0).toLocaleString()})</span>
                </div>
              </div>

              {/* Status Box */}
              <div className={`p-4 rounded-2xl flex flex-col justify-between border ${
                diff >= 0 ? 'bg-[#fefce8] border-[#fef08a]' : 'bg-[#f0fdfa] border-[#ccfbf1]'
              }`}>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${diff >= 0 ? 'text-[#a16207]' : 'text-[#0f766e]'}`}>
                    {diff >= 0 ? 'Employee Return' : 'Office Pay'}
                  </span>
                  <p className="text-xs font-bold text-[#0f172a] mt-1 leading-relaxed">
                    {diff >= 0 
                      ? `Employee needs to return ৳${diff.toLocaleString()} to the office.`
                      : `Office needs to pay ৳${Math.abs(diff).toLocaleString()} to the employee.`}
                  </p>
                </div>

                {diff >= 0 && (
                  <div className="flex gap-3 mt-4 no-print">
                    <button 
                      type="button"
                      onClick={() => setIsReturned(true)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        isReturned 
                          ? 'bg-[#15803d] border-[#15803d] text-white' 
                          : 'bg-white border-[#15803d] text-[#15803d] hover:bg-[#15803d]/5'
                      }`}
                    >
                      <LuCheck size={13} /> Returned
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsReturned(false)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        !isReturned 
                          ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-500/10' 
                          : 'bg-white border-red-600 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LuX size={13} /> Not Returned
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="p-6 border-t border-[#e2e8f0] bg-white flex gap-4 justify-end no-print">
            <button 
              type="button" 
              onClick={handleReject}
              disabled={submitLoading}
              className="px-8 py-3.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Reject Submission
            </button>
            <button 
              type="button"
              onClick={handleApprove}
              disabled={submitLoading}
              className="px-10 py-3.5 bg-[#0f766e] hover:bg-[#0d9488] disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-teal-700/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              Approve & Submit Settlement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
