import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LuSearch, 
  LuUserPlus, 
  LuPhone, 
  LuChevronRight, 
  LuChevronLeft, 
  LuUsers, 
  LuEye 
} from 'react-icons/lu';

const Employees = () => {
  const { user, globalData, refreshGlobalData } = useAuth();
  const navigate = useNavigate();
  const employees = globalData.employees || [];
  const [search, setSearch] = useState('');
  const loading = globalData.loading;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    refreshGlobalData();
  }, []);

  const filtered = employees.filter(emp =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.phone?.includes(search) ||
    emp.employeeId?.includes(search) ||
    emp.department?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Color schemes for employee profile initials for visual variety
  const getAvatarColors = (index) => {
    const schemes = [
      'bg-teal-50 text-teal-700',
      'bg-indigo-50 text-indigo-700',
      'bg-amber-50 text-amber-700',
      'bg-rose-50 text-rose-700',
      'bg-emerald-50 text-emerald-700',
    ];
    return schemes[index % schemes.length];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 no-print">
        <div>
          <h2 className="font-black text-3xl text-[#0f172a] uppercase tracking-tight">Employee List</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              {employees.length} registered employees
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/admin/employees/add')} 
          className="bg-[#0f766e] hover:bg-[#0d9488] text-white px-6 py-3.5 rounded-2xl shadow-lg shadow-teal-700/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <LuUserPlus size={16} />
          + New Employee
        </button>
      </div>

      {/* Search Bar Section */}
      <div className="bg-white p-4 rounded-3xl border border-[#e2e8f0] shadow-sm no-print">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl focus:outline-none focus:border-[#0f766e] transition-all text-xs font-bold text-[#0f172a] placeholder:text-[#94a3b8]"
          />
          <LuSearch className="absolute left-4 text-[#94a3b8]" size={15} />
        </div>
      </div>

      {/* Table Section */}
      {currentItems.length > 0 ? (
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#e2e8f0]">
                  <th className="px-6 py-4.5 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-[#64748b] uppercase tracking-widest text-right">Outstanding Advance</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-[#64748b] uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {currentItems.map((emp, index) => {
                  const avatarColorClass = getAvatarColors(index);
                  const nameInitials = (emp.name || emp.username || '?')
                    .split(' ')
                    .map(word => word.charAt(0))
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr 
                      key={emp._id} 
                      className="hover:bg-[#fbfbfb] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/employees/${emp._id}`)}
                    >
                      {/* Name with initials bubble */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${avatarColorClass}`}>
                            {nameInitials}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#0f172a] capitalize block">
                              {emp.name || emp.username}
                            </span>
                            <span className="text-[9px] text-[#94a3b8] font-black uppercase tracking-widest mt-0.5 block">
                              #{emp.employeeId || 'N/A'} • {emp.department || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-5 text-xs font-bold text-[#64748b]">
                        {emp.phone || '—'}
                      </td>

                      {/* Outstanding Advance */}
                      <td className="px-6 py-5 text-right font-black text-xs text-red-600">
                        {(emp.balance || 0) > 0 ? `৳${(emp.balance || 0).toLocaleString()}` : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                          Active
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/employees/${emp._id}`);
                          }}
                          className="text-[#0f766e] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center justify-end gap-1 ml-auto"
                        >
                          View <LuEye size={13} className="text-[#0f766e]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-[#fafafa] flex justify-between items-center border-t border-[#e2e8f0]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} results
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 bg-white rounded-xl border border-[#cbd5e1] hover:bg-[#fafafa] disabled:opacity-40 transition-opacity cursor-pointer flex items-center justify-center text-[#0f172a]"
              >
                <LuChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 bg-white rounded-xl border border-[#cbd5e1] hover:bg-[#fafafa] disabled:opacity-40 transition-opacity cursor-pointer flex items-center justify-center text-[#0f172a]"
              >
                <LuChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm p-16 text-center no-print">
          <LuUsers size={48} className="text-[#cbd5e1] mx-auto mb-4" />
          <h3 className="font-black text-xl text-[#0f172a] uppercase mb-2">
            {loading ? 'Loading...' : 'No Employees Found'}
          </h3>
          <p className="text-xs text-[#64748b] font-medium mb-6 max-w-sm mx-auto">
            {loading ? 'Please wait while we fetch the team list.' : 'We couldn\'t find any employee matching your search query.'}
          </p>
          {!loading && (
            <button 
              onClick={() => navigate('/admin/employees/add')} 
              className="bg-[#0f766e] text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl shadow-lg shadow-teal-700/10 cursor-pointer"
            >
              <LuUserPlus size={16} className="inline mr-2" /> Add Employee
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Employees;
