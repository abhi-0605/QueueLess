import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { UserDashboard } from './pages/UserDashboard.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { QueueTracker } from './pages/QueueTracker.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

const StaffRoute = ({ children }) => {
  const { isStaff, loading } = useAuth();
  if (loading) return null;
  return isStaff ? children : <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col ops-grid">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tracker/:id" element={<QueueTracker />} />
          <Route
            path="/admin"
            element={
              <StaffRoute>
                <AdminDashboard />
              </StaffRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
