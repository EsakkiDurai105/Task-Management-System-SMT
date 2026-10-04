import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="taskflow-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="taskflow-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
