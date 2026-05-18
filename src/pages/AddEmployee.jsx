import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  LuArrowLeft, 
  LuUserPlus, 
  LuShieldAlert, 
  LuInfo, 
  LuEye, 
  LuEyeOff, 
  LuUser, 
  LuLock, 
  LuPhone, 
  LuBuilding, 
  LuBriefcase, 
  LuKey, 
  LuShieldCheck, 
  LuChartBar, 
  LuWallet 
} from 'react-icons/lu';

const AddEmployee = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    employeeId: '',
    department: '',
    phone: '',
    designation: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Form Validations
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Send the payload to the server
      await axios.post('http://localhost:5000/api/employees', {
        name: form.name,
        employeeId: form.employeeId,
        department: form.department,
        phone: form.phone,
        designation: form.designation,
        username: form.username,
        password: form.password
      }, { 
        headers: { Authorization: `Bearer ${user?.token}` } 
      });
      navigate('/admin/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee account');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, val) => {
    setForm(prev => ({
      ...prev,
      [field]: val
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Breadcrumbs Navigation */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[#64748b] hover:text-[#0f766e] transition-colors font-bold text-xs uppercase tracking-widest cursor-pointer"
        >
          <LuArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Heading and Brand Message */}
        <div className="flex-1 w-full lg:max-w-md space-y-6">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase leading-none">Add New Employee</h1>
            <p className="text-[#64748b] text-sm font-medium mt-3 leading-relaxed">
              Create an account for a new employee and ensure transparency in office expenses.
            </p>
          </div>

          {/* Decorative Workspace Illustration Card */}
          <div className="hidden lg:block relative h-64 w-full rounded-3xl overflow-hidden border border-[#e2e8f0] bg-white shadow-sm group">
            {/* Visual background using subtle clean overlay and graphic items */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-50 to-emerald-50/50 flex flex-col justify-between p-8">
              <div className="flex justify-between items-start">
                <span className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/10">
                  <LuUserPlus size={20} />
                </span>
                <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  HR Portal
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Workspace Automation</p>
                <h4 className="text-lg font-black text-[#0f172a] mt-1 leading-snug">Empower your team with autonomous balance tracking.</h4>
              </div>
            </div>
            {/* Soft decorative blur circles */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-300/15 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="w-full lg:max-w-[560px] bg-white border border-[#e2e8f0] rounded-3xl shadow-sm p-8 md:p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border border-red-100 flex items-center justify-center gap-2">
              <LuShieldAlert size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <LuUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#0f766e] transition-colors" />
                <input 
                  type="text" 
                  placeholder="e.g. Md. Rashed" 
                  value={form.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0f766e] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition-all" 
                  required 
                />
              </div>
            </div>

            {/* Side-by-side: Employee ID & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Employee ID */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Employee ID</label>
                <div className="relative group">
                  <LuKey size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#0f766e] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="e.g. 1001" 
                    value={form.employeeId} 
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0f766e] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition-all" 
                    required 
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Department</label>
                <div className="relative group">
                  <LuBuilding size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#0f766e] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="e.g. Marketing" 
                    value={form.department} 
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0f766e] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition-all" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Side-by-side: Designation & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Designation */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Designation</label>
                <div className="relative group">
                  <LuBriefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#0f766e] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="e.g. Executive" 
                    value={form.designation} 
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0f766e] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition-all" 
                    required 
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <LuPhone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#0f766e] transition-colors" />
                  <input 
                    type="tel" 
                    placeholder="e.g. 01XXXXXXXXX" 
                    value={form.phone} 
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0f766e] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition-all" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Username (Login ID)</label>
              <div className="relative group">
                <LuUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#0f766e] transition-colors" />
                <input 
                  type="text" 
                  placeholder="e.g. rashed" 
                  value={form.username} 
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0f766e] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition-all" 
                  required 
                />
              </div>
              <p className="text-[10px] text-[#64748b] font-bold flex items-center gap-1 opacity-70">
                <LuInfo size={12} className="text-[#0f766e]" /> Use English letters only (a-z, 0-9)
              </p>
            </div>

            {/* Side-by-side: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <LuLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#0f766e] transition-colors" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Min 6 chars" 
                    value={form.password} 
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-3.5 pl-11 pr-10 focus:outline-none focus:border-[#0f766e] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition-all" 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f766e] transition-colors cursor-pointer"
                  >
                    {showPassword ? <LuEyeOff size={15} /> : <LuEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <LuLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#0f766e] transition-colors" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="Re-enter password" 
                    value={form.confirmPassword} 
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl py-3.5 pl-11 pr-10 focus:outline-none focus:border-[#0f766e] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] transition-all" 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f766e] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <LuEyeOff size={15} /> : <LuEye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0f766e] hover:bg-[#0d9488] disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-700/10 flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98]"
              >
                <LuUserPlus size={16} /> {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Decorative Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        
        {/* Secure Access Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <LuShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#0f172a] uppercase tracking-tight">Secure Access</h3>
            <p className="text-xs text-[#64748b] mt-1.5 font-medium leading-relaxed">
              Every employee will be provided with unique login credentials to access their personalized ledger.
            </p>
          </div>
        </div>

        {/* Real-time Tracking Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <LuChartBar size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#0f172a] uppercase tracking-tight">Real-time Tracking</h3>
            <p className="text-xs text-[#64748b] mt-1.5 font-medium leading-relaxed">
              Instantly track employees' daily expense entries, outstanding claims, and settlement periods.
            </p>
          </div>
        </div>

        {/* Easy Payments Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <LuWallet size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#0f172a] uppercase tracking-tight">Easy Payments</h3>
            <p className="text-xs text-[#64748b] mt-1.5 font-medium leading-relaxed">
              Maintain an audit-safe ledger log of advances given, bills approved, and dynamic returns completed.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddEmployee;
