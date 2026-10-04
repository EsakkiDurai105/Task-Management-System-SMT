import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, Sun, Moon, Search, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import { applyAccent } from './SettingsPage';

export default function AppLayout({ toasts = [], onRemoveToast = () => {}, onUndo = () => {} }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('taskflow_theme') || 'light');
  const location = useLocation();

  // Restore theme and accent color from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskflow_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow_theme', theme);
    // Re-apply accent on every theme change so all CSS variables stay in sync
    const savedAccent = localStorage.getItem('taskflow_accent') || 'blue';
    applyAccent(savedAccent);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Loading TaskFlow Pro...</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Restoring your session</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="taskflow-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="taskflow-main">
        <div className="taskflow-topbar">
          <div className="header-left">
            <button
              className="btn-icon mobile-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="top-search">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search tasks..." />
            </div>
          </div>

          <div className="top-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/settings" className="notification-icon" style={{ color: 'inherit' }}>
              <Settings size={20} />
            </Link>
            <div className="current-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>

      <Toast toasts={toasts} onDismiss={onRemoveToast} onUndo={onUndo} />
    </div>
  );
}
