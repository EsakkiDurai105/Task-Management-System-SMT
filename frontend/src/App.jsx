import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';

import AppLayout from './pages/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Tasks from './pages/Tasks';
import Kanban from './pages/Kanban';
import Completed from './pages/Completed';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <WorkspaceProvider>
          <TaskProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/completed" element={<Completed />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster position="bottom-right" />
          </TaskProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </Router>
  );
}
