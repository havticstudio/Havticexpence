import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuArrowLeft, LuFileText, LuCircleCheck, LuClock, LuTriangleAlert, LuChevronRight, LuCalendar } from 'react-icons/lu';

const History = () => {
  const navigate = useNavigate();
  const { user, globalData } = useAuth();
  
  // Filter out any drafts just in case, though the backend already handles it
  const myExpenses = (globalData.expenses || [])
    .filter(e => e.user === user?._id || e.employee?.user === user?._id)
    .filter(e => e.status !== 'Draft');

  const [selectedBill, setSelectedBill] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const billIdParam = searchParams.get('id');

  useEffect(() => {
    if (billIdParam && myExpenses.length > 0) {
      const found = myExpenses.find(b => (b._id || b.id) === billIdParam);
      if (found) {
        setSelectedBill(found);
      }
    }
  }, [billIdParam, myExpenses]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { bg: 'bg-green-50 text-green-700 border-green-100', icon: <LuCircleCheck size={14} /> };
      case 'Rejected':
        return { bg: 'bg-red-50 text-red-700 border-red-100', icon: <LuTriangleAlert size={14} /> };
      case 'Settled':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-100', icon: <LuCircleCheck size={14} /> };
      default:
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: <LuClock size={14} /> };
    }
  };

  return (
    <div className="max-w-[1250px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/employee')} 
            className="flex items-center gap-1 text-xs font-black text-[#0f766e] uppercase tracking-wider mb-2 hover:underline"
          >
            <LuArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase">My Bill History</h1>
          <p className="text-[#64748b] text-sm font-medium mt-1">
            Track and review all your past submitted bills and their approval statuses.
          </p>
        </div>
      </div>

      {myExpenses.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-[#e2e8f0] rounded-[2rem] p-16 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto text-[#0f766e]">
            <LuFileText size={40} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-tight">No Submitted Bills</h3>
            <p className="text-xs text-[#64748b] font-medium leading-relaxed">
              You haven't submitted any bills yet. Once you submit a bill from the 'Bill Submit' page, its history and status will be displayed here.
            </p>
          </div>
          <button
            onClick={() => navigate('/employee/expenses')}
            className="inline-flex items-center gap-2 border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0f766e] font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all"
          >
            Submit Your First Bill
          </button>
        </div>
      ) : (
        /* History Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Master List of Submitted Bills */}
          <div className="lg:col-span-2 space-y-4">
            {myExpenses.map((bill) => {
              const { bg, icon } = getStatusStyle(bill.status || 'Pending');
              const dateStr = bill.createdAt
                ? new Date(bill.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Unknown Date';
              const isSelected = selectedBill?._id === bill._id;

              return (
                <div
                  key={bill._id}
                  onClick={() => setSelectedBill(bill)}
                  className={`bg-white border rounded-[2rem] p-6 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected ? 'border-[#0f766e] ring-2 ring-[#0f766e]/10' : 'border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      bill.status === 'Approved' || bill.status === 'Settled' ? 'bg-green-50 text-green-600' :
                      bill.status === 'Rejected' ? 'bg-red-50 text-red-500' :
                      'bg-amber-50 text-amber-500'
                    }`}>
                      <LuFileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-[#0f172a] flex items-center gap-2">
                        ৳{bill.totalAmount.toLocaleString()}
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${bg}`}>
                          {icon}
                          {bill.status || 'Pending'}
                        </span>
                      </h3>
                      <p className="text-xs text-[#64748b] font-bold mt-1.5 flex items-center gap-1.5">
                        <LuCalendar size={13} className="text-[#0f766e]" />
                        <span>Submitted on {dateStr}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-[10px] font-black text-[#0f766e] uppercase tracking-wider">
                      {bill.items?.length || 0} Items
                    </span>
                    <LuChevronRight size={18} className="text-[#cbd5e1]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Bill Details Panel */}
          <div className="space-y-6">
            {selectedBill ? (
              <div className="bg-white border border-[#e2e8f0] rounded-[2rem] p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-black text-lg text-[#0f172a] uppercase tracking-tight">Bill Details</h3>
                  <p className="text-[10px] text-[#64748b] font-bold mt-1">
                    ID: #{selectedBill._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                {/* Status Alert Reason */}
                {selectedBill.status === 'Rejected' && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-700 font-bold space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-red-500 font-black">Rejection Reason</p>
                    <p className="leading-relaxed">{selectedBill.rejectionReason || 'No details provided.'}</p>
                  </div>
                )}

                {/* Status Alert Notes */}
                {selectedBill.reviewNotes && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 font-bold space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-blue-500 font-black">Reviewer Notes</p>
                    <p className="leading-relaxed">{selectedBill.reviewNotes}</p>
                  </div>
                )}

                {/* List of Line Items */}
                <div className="space-y-3.5">
                  <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Line Items</p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedBill.items.map((item, idx) => (
                      <div key={item._id || idx} className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-[#0f172a]">
                            {item.from} → {item.to}
                          </span>
                          <span className="font-black text-[#0f766e]">
                            ৳{item.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#94a3b8]">
                          <span>{item.purpose}</span>
                          <span className="bg-[#f1f5f9] px-2 py-0.5 rounded text-[#64748b] font-black uppercase text-[8px]">
                            {item.vehicle}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked Advance & Summary */}
                <div className="border-t border-[#e2e8f0] pt-4 space-y-2 text-xs font-bold text-[#64748b]">
                  <div className="flex justify-between">
                    <span>Total Bill</span>
                    <span className="font-black text-[#0f172a]">৳{selectedBill.totalAmount.toLocaleString()}</span>
                  </div>
                  {selectedBill.advanceId && (
                    <div className="flex justify-between">
                      <span>Linked Advance</span>
                      <span className="font-black text-[#0f766e]">
                        ৳{(selectedBill.advance || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Re-submit Button for Rejected Bills */}
                {selectedBill.status === 'Rejected' && (
                  <button
                    onClick={() => navigate(`/employee/expenses?reSubmitId=${selectedBill._id}`)}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] select-none"
                  >
                    <LuFileText size={16} /> Re-submit Rejected Bill
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#e2e8f0] border-dashed rounded-[2rem] p-8 text-center py-20 text-[#94a3b8]">
                <LuFileText size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-xs font-black uppercase tracking-wider">Select a Bill</p>
                <p className="text-[10px] font-medium mt-1">Click on a bill card on the left to see its full breakdown and reviewer details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
