import { useState, useEffect } from 'react';
import { Search, Sun, Moon, Bell, Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('taskflow_theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');

  const dateText = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="taskflow-topbar">
      <div className="header-left">
        <button className="mobile-menu" onClick={onMenuClick} aria-label="Open navigation">
          <Menu size={24} />
        </button>
        <div className="top-search">
          <Search size={20} className="search-icon" />
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search tasks, categories..." 
          />
        </div>
      </div>

      <div className="top-actions">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          title="Toggle light or dark mode"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <span className="current-date">{dateText}</span>
      </div>
    </header>
  );
}
