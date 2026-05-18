import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LuBuilding2, LuPlus, LuTrash2, LuPhone, LuMapPin } from 'react-icons/lu';

const Companies = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const companies = globalData.companies || [];
  const loading = globalData.loading && companies.length === 0;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Refresh background state
    refreshGlobalData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Company name required'); return; }
    setSaving(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/companies', form, { headers: { Authorization: `Bearer ${user?.token}` } });
      setForm({ name: '', address: '', phone: '' });
      setShowForm(false);
      
      // Update global context cache silently
      await refreshGlobalData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add company');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/companies/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
      
      // Update global context cache silently
      await refreshGlobalData();
    } catch (err) { alert('Delete failed'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase">Companies</h1>
          <p className="text-outline text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{companies.length} Registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white font-black text-[11px] uppercase tracking-widest px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          <LuPlus size={18} /> Add Company
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-8">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border border-red-100 mb-4">{error}</div>}
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">Company Name *</label>
                <input type="text" placeholder="e.g. ABC Corporation" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-on-surface text-sm" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">Address</label>
                <input type="text" placeholder="Office address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-on-surface text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">Phone</label>
                <input type="text" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-on-surface text-sm" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="px-8 py-3 bg-surface-container border border-outline-variant/30 rounded-2xl font-black text-[11px] text-outline uppercase tracking-widest hover:bg-surface transition-all">Cancel</button>
              <button type="submit" disabled={saving} className="px-8 py-3 bg-primary disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                <LuPlus size={16} /> {saving ? 'Saving...' : 'Add Company'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Company List */}
      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <div key={c._id} className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-8 group hover:shadow-lg transition-all relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <LuBuilding2 size={26} />
                </div>
                <button onClick={() => handleDelete(c._id, c.name)} className="w-9 h-9 rounded-xl flex items-center justify-center text-outline/20 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                  <LuTrash2 size={18} />
                </button>
              </div>
              <h3 className="font-black text-lg text-on-surface uppercase tracking-tight mb-3">{c.name}</h3>
              {c.address && (
                <div className="flex items-center gap-2 text-xs text-outline mb-1.5">
                  <LuMapPin size={14} className="shrink-0" /> {c.address}
                </div>
              )}
              {c.phone && (
                <div className="flex items-center gap-2 text-xs text-outline">
                  <LuPhone size={14} className="shrink-0" /> {c.phone}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-16 text-center">
          <LuBuilding2 size={48} className="text-outline/20 mx-auto mb-4" />
          <h3 className="font-black text-xl text-on-surface uppercase mb-2">{loading ? 'Loading...' : 'No Companies Yet'}</h3>
          <p className="text-xs text-outline opacity-60 mb-6">Add your client companies to track advance disbursements.</p>
          <button onClick={() => setShowForm(true)} className="bg-primary text-white font-black text-[11px] uppercase tracking-widest px-8 py-3 rounded-2xl shadow-lg shadow-primary/20">
            <LuPlus size={16} className="inline mr-2" /> Add First Company
          </button>
        </div>
      )}
    </div>
  );
};

export default Companies;
