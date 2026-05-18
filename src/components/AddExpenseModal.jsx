import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, AlertCircle } from 'lucide-react';

const AddExpenseModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'General',
    employee: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:5000/api/employees')
        .then(res => setEmployees(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/expenses', formData);
      onRefresh();
      onClose();
      setFormData({
        description: '',
        amount: '',
        category: 'General',
        employee: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-card shadow-2xl border border-surface-container overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-surface-container bg-surface/50">
          <h2 className="text-xl font-bold text-on-surface">Add New Expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Description</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-2.5 rounded-control border border-surface-container focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
              placeholder="e.g. Office Snacks, Internet Bill..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Amount (৳)</label>
              <input 
                required
                type="number"
                className="w-full px-4 py-2.5 rounded-control border border-surface-container focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Date</label>
              <input 
                required
                type="date"
                className="w-full px-4 py-2.5 rounded-control border border-surface-container focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Staff Member</label>
            <select 
              required
              className="w-full px-4 py-2.5 rounded-control border border-surface-container focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm bg-white"
              value={formData.employee}
              onChange={(e) => setFormData({...formData, employee: e.target.value})}
            >
              <option value="">Select Staff</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Category</label>
            <select 
              className="w-full px-4 py-2.5 rounded-control border border-surface-container focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm bg-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="General">General</option>
              <option value="Utility">Utility</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Supplies">Supplies</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-control border border-surface-container font-semibold text-on-surface-variant hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={loading}
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-control bg-primary hover:bg-primary-container text-white font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
