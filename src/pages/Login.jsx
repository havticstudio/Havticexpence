import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { LuWallet, LuUser, LuLock, LuShieldCheck } from 'react-icons/lu';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter both username and password'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await login({ username, password });
      navigate(user.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen login-bg flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-8">
        <img src={logo} alt="Brand Care" className="h-20 w-auto object-contain max-w-[260px] drop-shadow-xl" />
      </div>

      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-10 border border-white/20">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">Welcome Back</h2>
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1 opacity-60">Secure Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border border-red-100">{error}</div>}

          <div className="space-y-2">
            <label className="text-outline text-[10px] font-black ml-1 uppercase tracking-[0.2em] opacity-60">Username</label>
            <div className="relative group">
              <LuUser size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-on-surface placeholder:text-outline/30" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-outline text-[10px] font-black ml-1 uppercase tracking-[0.2em] opacity-60">Password</label>
            <div className="relative group">
              <LuLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-on-surface placeholder:text-outline/30" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-container disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] uppercase text-[11px] tracking-[0.2em] mt-2 cursor-pointer">
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-outline font-medium">
          Don't have an account? <Link to="/signup" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline cursor-pointer">Sign Up</Link>
        </p>
      </div>

      <div className="mt-12 flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">
        <LuShieldCheck size={14} /> Encrypted Session v2.0
      </div>
    </div>
  );
};

export default Login;
