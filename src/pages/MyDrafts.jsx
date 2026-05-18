import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LuTrash2, LuClock, LuChevronRight, LuCalendar } from 'react-icons/lu';

const MyDrafts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/expenses/my-drafts', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setDrafts(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError('Failed to fetch your saved drafts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDrafts();
    }
  }, [user]);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    if (!window.confirm('Are you sure you want to permanently delete this draft bill?')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`http://localhost:5000/api/expenses/drafts/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setDrafts(drafts.filter(d => d._id !== id));
    } catch (err) {
      console.error('Failed to delete draft:', err);
      alert(err.response?.data?.message || 'Failed to delete draft');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/employee/expenses?draftId=${id}`);
  };

  return (
    <div className="max-w-[1250px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase">My Saved Drafts</h1>
          <p className="text-[#64748b] text-sm font-medium mt-1">
            Pick up where you left off. Review, complete, and submit your pending drafts.
          </p>
        </div>
        <button
          onClick={() => navigate('/employee/expenses')}
          className="bg-[#0f766e] hover:bg-[#0d9488] text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-teal-700/10 transition-all active:scale-[0.98] cursor-pointer"
        >
          Create New Bill
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-[#64748b] uppercase tracking-widest">Loading Drafts...</p>
        </div>
      ) : drafts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-[#e2e8f0] rounded-[2rem] p-16 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto text-[#0f766e]">
            <LuClock size={40} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-tight">No Saved Drafts</h3>
            <p className="text-xs text-[#64748b] font-medium leading-relaxed">
              You don't have any saved draft bills at the moment. If you start making a bill and save it, it will appear here for later submission.
            </p>
          </div>
          <button
            onClick={() => navigate('/employee/expenses')}
            className="inline-flex items-center gap-2 border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0f766e] font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all"
          >
            Start Preparing a Bill
          </button>
        </div>
      ) : (
        /* Drafts List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drafts.map((draft) => {
            const dateStr = draft.createdAt
              ? new Date(draft.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Unknown Date';
            const itemsCount = draft.items?.length || 0;
            const companyName = draft.advanceId?.company?.name || 'Personal/No Company';
            
            return (
              <div
                key={draft._id}
                onClick={() => handleEdit(draft._id)}
                className="group bg-white border border-[#e2e8f0] rounded-[2rem] p-6 hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                {/* Visual Top Highlight Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/20 via-teal-500 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="space-y-4">
                  {/* Top line with Date and Delete */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#64748b]">
                      <LuCalendar size={14} className="text-[#0f766e]" />
                      <span>{dateStr}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(draft._id, e)}
                      disabled={deletingId === draft._id}
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-[#cbd5e1] hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete Draft"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>

                  {/* Company & Details info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-teal-50 text-[#0f766e] rounded-lg">
                        {companyName}
                      </div>
                      <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-[#f1f5f9] text-[#64748b] rounded-lg">
                        {itemsCount === 1 ? '1 Item' : `${itemsCount} Items`}
                      </div>
                    </div>

                    {/* Quick Preview of items */}
                    <div className="bg-[#f8fafc] rounded-xl p-3 text-[11px] font-bold text-[#64748b] max-h-[85px] overflow-hidden space-y-1.5 border border-[#f1f5f9]">
                      {itemsCount > 0 ? (
                        draft.items.slice(0, 2).map((item, idx) => (
                          <div key={item._id || idx} className="flex justify-between items-center gap-4">
                            <span className="truncate max-w-[170px]">
                              {item.from} → {item.to}
                            </span>
                            <span className="text-[#94a3b8] truncate max-w-[90px]">
                              ({item.vehicle})
                            </span>
                            <span className="font-black text-[#0f172a] ml-auto">
                              ৳{item.amount.toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] italic text-[#94a3b8]">No expense items entered yet.</p>
                      )}
                      {itemsCount > 2 && (
                        <p className="text-[9px] font-black text-[#0f766e] uppercase tracking-wider pt-1">
                          + {itemsCount - 2} more expense items
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom line: amount & CTA */}
                <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-4 mt-6">
                  <div>
                    <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">Total Amount</p>
                    <p className="text-xl font-black text-[#0f766e] mt-0.5">
                      ৳{draft.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0f766e] uppercase tracking-widest group-hover:translate-x-1.5 transition-transform">
                    <span>Continue Edit</span>
                    <LuChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDrafts;
