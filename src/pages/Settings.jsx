import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LuBuilding2, LuSave } from 'react-icons/lu';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ companyName: '', address: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/settings', form, { headers: { Authorization: `Bearer ${user?.token}` } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.log('Settings save:', err.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-[700px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase">Company Settings</h1>
        <p className="text-outline text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Configure your organization</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-10">
        {saved && <div className="bg-green-50 text-green-600 p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border border-green-100 mb-6">Settings saved!</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: 'Company Name', key: 'companyName', placeholder: 'Your company name' },
            { label: 'Address', key: 'address', placeholder: 'Office address' },
            { label: 'Phone', key: 'phone', placeholder: 'Office phone number' },
            { label: 'Email', key: 'email', placeholder: 'Office email' },
          ].map(field => (
            <div key={field.key} className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">{field.label}</label>
              <input type="text" placeholder={field.placeholder} value={form[field.key]} onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-on-surface text-sm" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-primary disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest transition-all">
            <LuSave size={18} /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
