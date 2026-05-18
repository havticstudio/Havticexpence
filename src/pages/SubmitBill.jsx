import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LuArrowLeft, LuPlus, LuTrash2, LuFileCheck, LuUpload, LuX, LuSend } from 'react-icons/lu';

const SubmitBill = () => {
  const navigate = useNavigate();
  const { user, globalData, refreshGlobalData } = useAuth();
  const [items, setItems] = useState([
    { id: 1, date: new Date().toISOString().split('T')[0], from: '', to: '', purpose: '', vehicle: 'CNG', amount: '' }
  ]);
  const advances = (globalData.advances || []).filter(adv => adv.employee?._id === user?._id || adv.employee?.user === user?._id);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Refresh background state
    refreshGlobalData();
  }, []);

  const addItem = () => {
    if (items.length >= 30) return;
    setItems([...items, { id: Date.now(), date: new Date().toISOString().split('T')[0], from: '', to: '', purpose: '', vehicle: 'CNG', amount: '' }]);
  };

  const removeItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
  const handleItemChange = (id, field, value) => { setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item)); };
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const selectedAdvance = advances.find(a => a._id === selectedAdvanceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdvanceId) {
      setError('Please select an advance payment first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/expenses', {
        items,
        totalAmount,
        advanceId: selectedAdvanceId,
        remarks
      }, { headers: { Authorization: `Bearer ${user?.token}` } });
      
      // Update global context cache silently
      await refreshGlobalData();
      
      navigate('/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[1250px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase">Submit New Bill</h1>
          <p className="text-[#64748b] text-sm font-medium mt-1">List your official expenses here.</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc] font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all">
          <LuX size={16} /> Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select/Link Advance */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#e2e8f0] p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1 opacity-80">Link this Bill to an Advance Payment *</label>
            <select value={selectedAdvanceId} onChange={(e) => setSelectedAdvanceId(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-[#0f766e] transition-all font-bold text-on-surface cursor-pointer mt-2 text-sm">
              <option value="">-- Select an advance payment --</option>
              {advances.map(adv => (
                <option key={adv._id} value={adv._id}>
                  ৳{(adv.remainingAmount !== undefined ? adv.remainingAmount : adv.amount).toLocaleString()} remaining (Initial: ৳{adv.amount.toLocaleString()}) - {adv.company?.name || 'No Company'} (Purpose: {adv.purpose || 'Not Specified'})
                </option>
              ))}
            </select>
          </div>

          {selectedAdvance && (
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0f766e] flex items-center justify-center text-white text-xs font-bold">৳</div>
              <p className="text-xs text-[#0f766e] font-bold">
                Current Advance: <span className="font-black text-base">৳{(selectedAdvance.remainingAmount !== undefined ? selectedAdvance.remainingAmount : selectedAdvance.amount).toLocaleString()}</span> remaining (Initial: ৳{selectedAdvance.amount.toLocaleString()}) • Date: {new Date(selectedAdvance.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Line Items Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#e2e8f0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#fafafa]">
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748b] uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748b] uppercase tracking-widest">From</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748b] uppercase tracking-widest">To</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748b] uppercase tracking-widest">Purpose</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748b] uppercase tracking-widest">Transport</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748b] uppercase tracking-widest text-right">Amount ৳</th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fbfbfb] transition-colors">
                    <td className="px-6 py-4 min-w-[160px]">
                      <input type="date" value={item.date} onChange={(e) => handleItemChange(item.id, 'date', e.target.value)} className="w-full bg-white border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-xs font-bold text-on-surface focus:outline-none focus:border-[#0f766e] transition-all" required />
                    </td>
                    <td className="px-6 py-4 min-w-[160px]">
                      <input type="text" placeholder="From" value={item.from} onChange={(e) => handleItemChange(item.id, 'from', e.target.value)} className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface focus:outline-none focus:border-[#0f766e] placeholder:text-[#cbd5e1] transition-all" required />
                    </td>
                    <td className="px-6 py-4 min-w-[160px]">
                      <input type="text" placeholder="To" value={item.to} onChange={(e) => handleItemChange(item.id, 'to', e.target.value)} className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface focus:outline-none focus:border-[#0f766e] placeholder:text-[#cbd5e1] transition-all" required />
                    </td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <input type="text" placeholder="Purpose" value={item.purpose} onChange={(e) => handleItemChange(item.id, 'purpose', e.target.value)} className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface focus:outline-none focus:border-[#0f766e] placeholder:text-[#cbd5e1] transition-all" required />
                    </td>
                    <td className="px-6 py-4 min-w-[130px]">
                      <select value={item.vehicle} onChange={(e) => handleItemChange(item.id, 'vehicle', e.target.value)} className="w-full bg-white border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-xs font-bold text-on-surface focus:outline-none focus:border-[#0f766e] transition-all cursor-pointer">
                        <option>CNG</option><option>Rickshaw</option><option>Bus</option><option>Taxi</option><option>Uber/Pathao</option><option>Food/Meal</option><option>Other</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 min-w-[120px]">
                      <input type="number" placeholder="0" value={item.amount} onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)} className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-xs font-black text-on-surface focus:outline-none focus:border-[#0f766e] text-right" required />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="w-9 h-9 flex items-center justify-center rounded-xl text-[#cbd5e1] hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-0 cursor-pointer">
                        <LuTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-[#e2e8f0] bg-white">
            <button type="button" onClick={addItem} className="text-[#0f766e] hover:text-[#0d9488] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all">
              <LuPlus size={16} /> Add Another Line
            </button>
          </div>
        </div>

        {/* Step 3: Remarks and File Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Remarks Section */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-sm space-y-3">
            <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#0f766e] rounded"></span> Additional Info and Remarks
            </h3>
            <textarea rows="4" placeholder="Enter any special information here..." value={remarks} onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-2xl p-4 text-xs font-bold text-on-surface placeholder:text-[#cbd5e1] focus:outline-none focus:border-[#0f766e] resize-none transition-all"></textarea>
          </div>

          {/* Upload Receipt Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <div className="border-2 border-dashed border-[#e2e8f0] rounded-2xl p-8 flex flex-col items-center justify-center text-center flex-1 hover:border-[#cbd5e1] transition-all cursor-pointer">
              <LuUpload size={28} className="text-[#94a3b8] mb-3" />
              <p className="text-xs font-black text-[#0f172a]">Upload Receipt</p>
              <p className="text-[10px] text-[#94a3b8] font-bold mt-1">PNG, JPG, PDF (Max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Step 4: Submission Footer Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-12 self-start md:self-auto">
            <div>
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Total Bill Amount</p>
              <p className="text-2xl font-black text-[#0f766e] tracking-tight mt-0.5">৳{totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Total Items</p>
              <p className="text-2xl font-black text-[#0f172a] tracking-tight mt-0.5">{String(items.length).padStart(2, '0')} Items</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 md:flex-none px-8 py-3.5 bg-white border border-[#e2e8f0] text-[#64748b] font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#f8fafc] transition-all">
              Save as Draft
            </button>
            <button type="submit" disabled={loading} className="flex-1 md:flex-none px-10 py-3.5 bg-[#0f766e] hover:bg-[#0d9488] disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer">
              <LuSend size={16} /> Submit Bill
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitBill;
