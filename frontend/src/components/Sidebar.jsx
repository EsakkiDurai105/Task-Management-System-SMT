import { NavLink } from 'react-router-dom';
import { 
  Check, 
  House, 
  ClipboardList, 
  Columns3, 
  CircleCheck, 
  CalendarDays, 
  ChartNoAxesColumnIncreasing, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: House },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/kanban', label: 'Kanban', icon: Columns3 },
  { path: '/completed', label: 'Completed', icon: CircleCheck },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/analytics', label: 'Analytics', icon: ChartNoAxesColumnIncreasing }
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  // Fallback if no user is provided for redesign preview
  const currentUser = user || {
    name: 'Esakki Durai M',
    email: 'esakkiduraim@gmail.com',
    initials: 'ED'
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <aside className={`taskflow-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <Check size={28} strokeWidth={4} color="white" />
          </span>
          <div className="brand-text">
            <strong>TaskFlow</strong>
            <small>Plan. Do. Achieve.</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => { if (isOpen) onClose(); }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="motivation-card">
            <p>"A little progress each day leads to big results."</p>
          </div>

          <div className="sidebar-user">
            <div className="avatar">{currentUser.initials || currentUser.name.substring(0, 2).toUpperCase()}</div>
            <div className="user-info">
              <strong>{currentUser.name}</strong>
              <small>{currentUser.email}</small>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      
      {isOpen && <div className="nav-scrim" onClick={onClose} aria-label="Close navigation" />}
    </>
  );
}
