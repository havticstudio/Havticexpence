import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import { LuWallet, LuUser, LuLock, LuPhone, LuShieldCheck } from 'react-icons/lu';

const Signup = () => {
  const [form, setForm] = useState({ username: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/signup', {
        username: form.username,
        phone: form.phone,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen login-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-10 text-center border border-white/20">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LuShieldCheck size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-black text-on-surface uppercase tracking-tight mb-2">Account Created!</h2>
          <p className="text-xs text-outline font-medium leading-relaxed mb-8">
            Your account has been created. Contact your administrator to activate and assign your role.
          </p>
          <Link to="/login" className="block w-full bg-primary text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 cursor-pointer text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen login-bg flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-6">
        <img src={logo} alt="Brand Care" className="h-16 w-auto object-contain max-w-[240px] drop-shadow-xl" />
      </div>

      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-10 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border border-red-100">{error}</div>}

          <div className="space-y-1.5">
            <label className="text-outline text-[10px] font-black ml-1 uppercase tracking-[0.2em] opacity-60">Username</label>
            <div className="relative group">
              <LuUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Choose a username" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
                className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-on-surface placeholder:text-outline/30" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-outline text-[10px] font-black ml-1 uppercase tracking-[0.2em] opacity-60">Phone</label>
            <div className="relative group">
              <LuPhone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
              <input type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-on-surface placeholder:text-outline/30" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-outline text-[10px] font-black ml-1 uppercase tracking-[0.2em] opacity-60">Password</label>
              <div className="relative group">
                <LuLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input type="password" placeholder="Min 6 chars" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-on-surface placeholder:text-outline/30" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-outline text-[10px] font-black ml-1 uppercase tracking-[0.2em] opacity-60">Confirm</label>
              <div className="relative group">
                <LuLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input type="password" placeholder="Re-enter" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-on-surface placeholder:text-outline/30" required />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-container disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] uppercase text-[11px] tracking-[0.2em] mt-2 cursor-pointer">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-6 text-xs text-outline font-medium">
          Already have an account? <Link to="/login" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline cursor-pointer">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
