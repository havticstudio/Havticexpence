import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuArrowLeft, LuSearch, LuCalendar, LuSend, LuInfo, LuUser, LuBuilding2 } from 'react-icons/lu';

const GiveAdvance = () => {
  const navigate = useNavigate();
  const { user, globalData, refreshGlobalData } = useAuth();
  const employees = globalData.employees || [];
  const companies = globalData.companies || [];
  const [formData, setFormData] = useState({ employeeId: '', companyId: '', amount: '', date: new Date().toISOString().split('T')[0], purpose: '' });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle preset employee from query parameter (for details navigation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presetEmpId = params.get('employee');
    if (presetEmpId && employees.length > 0) {
      const found = employees.find(e => e._id === presetEmpId);
      if (found) {
        setFormData(prev => ({ ...prev, employeeId: found._id }));
        setSelectedEmployee(found);
      }
    }
  }, [employees]);

  const handleEmployeeSearch = (id) => {
    setFormData({ ...formData, employeeId: id });
    const emp = employees.find(e => e.employeeId === id || e._id === id);
    setSelectedEmployee(emp || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !formData.amount) return;
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/advances', {
        employee: selectedEmployee._id,
        company: formData.companyId || undefined,
        amount: Number(formData.amount),
        date: formData.date,
        purpose: formData.purpose,
      }, { headers: { Authorization: `Bearer ${user?.token}` } });
      
      // Silently refresh cache to reflect new advance
      await refreshGlobalData();
      
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disburse advance');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant hover:bg-white transition-all cursor-pointer">
          <LuArrowLeft size={18} className="text-outline" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-on-surface uppercase tracking-tight">Give Advance</h1>
          <p className="text-outline text-xs font-bold uppercase tracking-widest opacity-60">Disburse funds for official expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-10">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border border-red-100 mb-6">{error}</div>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">Select Employee</label>
              <select onChange={(e) => handleEmployeeSearch(e.target.value)} value={formData.employeeId}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-on-surface cursor-pointer">
                <option value="">-- Select an employee --</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name || emp.username} (#{emp.employeeId})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">Select Company</label>
              <select onChange={(e) => setFormData({...formData, companyId: e.target.value})} value={formData.companyId}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-on-surface cursor-pointer">
                <option value="">-- Select company (optional) --</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">Amount (৳)</label>
                <input type="number" placeholder="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-black text-primary text-xl" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-on-surface cursor-pointer" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">Purpose</label>
              <textarea rows="3" placeholder="Reason for advance..." value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-on-surface resize-none"></textarea>
            </div>

            <button type="submit" disabled={loading || !selectedEmployee}
              className="w-full bg-primary hover:bg-primary-container disabled:bg-outline-variant/30 disabled:text-outline text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest cursor-pointer">
              <LuSend size={18} /> {loading ? 'Disbursing...' : 'Disburse Advance'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-outline-variant/20 p-8 shadow-sm flex flex-col items-center text-center">
            {selectedEmployee ? (
              <div className="w-full space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center text-primary font-black text-3xl mx-auto border-2 border-white shadow-lg">{(selectedEmployee.name || selectedEmployee.username || '?').charAt(0).toUpperCase()}</div>
                <div><h3 className="font-black text-xl text-on-surface">{selectedEmployee.name || selectedEmployee.username}</h3><p className="text-[10px] font-black text-outline uppercase tracking-widest opacity-60">{selectedEmployee.department || 'General'}</p></div>
                <div className="bg-surface-container-low/50 rounded-2xl p-6 text-left space-y-4">
                  <div className="flex justify-between"><span className="text-[10px] font-black text-outline uppercase tracking-widest opacity-60">Balance</span><span className="text-lg font-black text-orange-500">৳{(selectedEmployee.balance || 0).toLocaleString()}</span></div>
                  <div className="h-px bg-outline-variant/20"></div>
                  <div className="flex justify-between"><span className="text-[10px] font-black text-outline uppercase tracking-widest opacity-60">Phone</span><span className="text-sm font-bold text-on-surface">{selectedEmployee.phone || '-'}</span></div>
                </div>
              </div>
            ) : (
              <div className="py-12 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center text-outline/30 mx-auto"><LuUser size={36} /></div>
                <div><h4 className="font-bold text-on-surface">No Employee Selected</h4><p className="text-xs font-medium text-outline max-w-[180px] mx-auto">Select an employee to see their details.</p></div>
              </div>
            )}
          </div>
          <div className="bg-teal-50 border border-primary/10 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-3 text-primary"><LuInfo size={20} /><h4 className="font-bold text-sm">Policy</h4></div>
            <p className="text-xs text-primary/70 font-medium leading-relaxed">Max outstanding advance per employee: <span className="font-bold">৳20,000</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveAdvance;
