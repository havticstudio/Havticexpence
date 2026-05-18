import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global cache state for high speed loading
  const [globalData, setGlobalData] = useState({
    employees: [],
    advances: [],
    expenses: [],
    companies: [],
    settlements: [],
    settlementsStats: { totalPaid: 0, totalReturned: 0 },
    reportsStats: { totalExpenses: 0, avgPerEmployee: 0, growthRate: 0, billsProcessed: 0 },
    reportsCategories: [],
    reportsTopSpenders: [],
    ledger: { transactions: [], stats: { balance: 0, totalReceived: 0, totalSpent: 0 } },
    dashboardStats: { totalOutstanding: 0, pendingBills: 0, settlementsThisMonth: 0, approvedThisWeek: 0, paidThisWeek: 0 },
    loading: false
  });

  const refreshGlobalData = async (currentUser = user) => {
    if (!currentUser?.token) return;

    const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };

    // --- STAGE 1: IMMEDIATE CRITICAL LOAD ---
    // Fast load the landing screen data first so the user sees it INSTANTLY
    try {
      const stage1List = [];
      const stage1Keys = [];

      stage1List.push(axios.get('http://localhost:5000/api/expenses', config));
      stage1Keys.push('expenses');

      if (currentUser.role === 'admin') {
        stage1List.push(axios.get('http://localhost:5000/api/dashboard/stats', config));
        stage1Keys.push('dashboardStats');
      }

      if (currentUser.role === 'employee') {
        stage1List.push(axios.get('http://localhost:5000/api/ledger/my', config));
        stage1Keys.push('ledger');
      }

      const stage1Results = await Promise.all(stage1List);
      const stage1Updated = {};
      stage1Results.forEach((res, index) => {
        stage1Updated[stage1Keys[index]] = res.data;
      });

      // Update globalData immediately so the active landing page displays right away
      setGlobalData(prev => ({
        ...prev,
        ...stage1Updated,
        loading: false
      }));

    } catch (err) {
      console.error('Error in Stage 1 data prefetch:', err.message);
    }

    // --- STAGE 2: DEFERRED BACKGROUND LOAD ---
    // Fetch remaining data in the background without blocking the first page render
    setTimeout(async () => {
      try {
        const stage2List = [];
        const stage2Keys = [];

        stage2List.push(axios.get('http://localhost:5000/api/advances', config));
        stage2Keys.push('advances');

        stage2List.push(axios.get('http://localhost:5000/api/companies', config));
        stage2Keys.push('companies');

        if (currentUser.role === 'admin') {
          stage2List.push(axios.get('http://localhost:5000/api/employees', config));
          stage2Keys.push('employees');

          stage2List.push(axios.get('http://localhost:5000/api/settlements', config));
          stage2Keys.push('settlementsData');

          stage2List.push(axios.get('http://localhost:5000/api/reports', config));
          stage2Keys.push('reportsData');
        }

        if (currentUser.role === 'employee') {
          stage2List.push(axios.get('http://localhost:5000/api/settlements/my', config));
          stage2Keys.push('settlements');
        }

        const stage2Results = await Promise.all(stage2List);
        const stage2Updated = {};
        
        stage2Results.forEach((res, index) => {
          const key = stage2Keys[index];
          if (key === 'settlementsData') {
            stage2Updated['settlements'] = res.data.settlements || [];
            stage2Updated['settlementsStats'] = res.data.stats || { totalPaid: 0, totalReturned: 0 };
          } else if (key === 'reportsData') {
            stage2Updated['reportsStats'] = res.data.stats || { totalExpenses: 0, avgPerEmployee: 0, growthRate: 0, billsProcessed: 0 };
            stage2Updated['reportsCategories'] = res.data.categories || [];
            stage2Updated['reportsTopSpenders'] = res.data.topSpenders || [];
          } else {
            stage2Updated[key] = res.data;
          }
        });

        setGlobalData(prev => ({
          ...prev,
          ...stage2Updated
        }));

      } catch (err) {
        console.error('Error in Stage 2 background prefetch:', err.message);
      }
    }, 150); // Small 150ms delay so Stage 1 rendering loop takes absolute precedence
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('stitch_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      refreshGlobalData(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username: userData.username,
        password: userData.password,
      });

      const profile = {
        _id: res.data._id,
        username: res.data.username,
        role: res.data.role,
        phone: res.data.phone,
        token: res.data.token,
      };

      setUser(profile);
      localStorage.setItem('stitch_user', JSON.stringify(profile));
      
      // Prefetch immediately on login
      await refreshGlobalData(profile);
      
      return profile;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stitch_user');
    setGlobalData({
      employees: [],
      advances: [],
      expenses: [],
      companies: [],
      settlements: [],
      settlementsStats: { totalPaid: 0, totalReturned: 0 },
      reportsStats: { totalExpenses: 0, avgPerEmployee: 0, growthRate: 0, billsProcessed: 0 },
      reportsCategories: [],
      reportsTopSpenders: [],
      ledger: { transactions: [], stats: { balance: 0, totalReceived: 0, totalSpent: 0 } },
      dashboardStats: { totalOutstanding: 0, pendingBills: 0, settlementsThisMonth: 0, approvedThisWeek: 0, paidThisWeek: 0 },
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, globalData, refreshGlobalData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
