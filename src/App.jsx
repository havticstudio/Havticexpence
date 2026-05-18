import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Employees from './pages/Employees';
import Settlements from './pages/Settlements';
import GiveAdvance from './pages/GiveAdvance';
import Reports from './pages/Reports';
import Companies from './pages/Companies';
import MyLedger from './pages/MyLedger';
import MySettlements from './pages/MySettlements';
import AddEmployee from './pages/AddEmployee';
import SubmitBill from './pages/SubmitBill';
import EmployeeDetails from './pages/EmployeeDetails';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  return <Outlet />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="give-advance" element={<GiveAdvance />} />
          <Route path="settlements" element={<Settlements />} />
          <Route path="reports" element={<Reports />} />
          <Route path="bill-review" element={<Expenses />} />
          <Route path="settings" element={<Companies />} />
        </Route>
      </Route>

      {/* Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
        <Route path="/employee" element={<DashboardLayout />}>
          <Route index element={<MyLedger />} />
          <Route path="expenses" element={<SubmitBill />} />
          <Route path="settlements" element={<MySettlements />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
