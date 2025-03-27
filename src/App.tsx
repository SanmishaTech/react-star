import { useEffect } from 'react';
import { appName } from './config'; // Import appName from config
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Login from './modules/Auth/Login';
import ForgotPassword from './modules/Auth/ForgotPassword';
import ResetPassword from './modules/Auth/ResetPassword';
import Dashboard from './modules/Dashboard/DashboardPage';
import ProtectedRoute from './components/common/protected-route'; // Correct path
import { Toaster } from 'sonner';
import './App.css';

const App = () => {
  useEffect(() => {
    document.title = appName; // Set the document title
  }, []);

  return (
    <>
      <Toaster richColors position="top-center" />
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* Add other auth routes here */}
          </Route>
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Add other main routes here */}
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
