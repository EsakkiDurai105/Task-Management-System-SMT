import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Globe, Check } from 'lucide-react';

const ACCENT_MAP = {
  blue:    { value: '#2563eb', hover: '#1d4ed8', glow: 'rgba(37,99,235,0.18)',   rgb: '37,99,235',    secondary: '#4f46e5' },
  indigo:  { value: '#4f46e5', hover: '#4338ca', glow: 'rgba(79,70,229,0.18)',   rgb: '79,70,229',    secondary: '#7c3aed' },
  emerald: { value: '#10b981', hover: '#059669', glow: 'rgba(16,185,129,0.18)',  rgb: '16,185,129',   secondary: '#06b6d4' },
  rose:    { value: '#f43f5e', hover: '#e11d48', glow: 'rgba(244,63,94,0.18)',   rgb: '244,63,94',    secondary: '#ec4899' },
  amber:   { value: '#f59e0b', hover: '#d97706', glow: 'rgba(245,158,11,0.18)',  rgb: '245,158,11',   secondary: '#f97316' },
};

export function applyAccent(name) {
  const c = ACCENT_MAP[name] || ACCENT_MAP.blue;
  document.documentElement.style.setProperty('--primary',           c.value);
  document.documentElement.style.setProperty('--primary-hover',     c.hover);
  document.documentElement.style.setProperty('--primary-glow',      c.glow);
  document.documentElement.style.setProperty('--primary-rgb',       c.rgb);
  document.documentElement.style.setProperty('--primary-secondary', c.secondary);
  document.documentElement.style.setProperty('--sidebar-active',    c.value);
}

export default function SettingsPage() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('taskflow_theme') || 'light'
  );
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem('taskflow_accent') || 'blue'
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem('taskflow_language') || 'English'
  );
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  // Restore saved accent on mount (in case of hard refresh)
  useEffect(() => {
    applyAccent(accentColor);
  }, []); // eslint-disable-line

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('taskflow_theme', newTheme);
    showToast(`Switched to ${newTheme} mode`);
  };

  const handleAccentChange = (name) => {
    setAccentColor(name);
    applyAccent(name);
    localStorage.setItem('taskflow_accent', name);
    showToast(`Accent color changed to ${name}`);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    // Only persist the preference — do NOT set document.documentElement.lang
    // (that would trigger browser page translation)
    localStorage.setItem('taskflow_language', newLang);
    showToast(`Language preference saved: ${newLang}`);
  };

  const accentOptions = Object.keys(ACCENT_MAP);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your appearance and preferences</p>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div className={`settings-toast ${toast.type}`}>
          <Check size={15} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ─── Theme & Colors ─── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Palette size={18} className="settings-section-icon" />
          <div>
            <h2 className="settings-section-title">Theme &amp; Colors</h2>
            <p className="settings-section-desc">Personalise the look and feel of TaskFlow</p>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="settings-row">
          <div className="settings-row-label">
            <strong>Theme Mode</strong>
            <span>Choose light or dark interface</span>
          </div>
          <div className="theme-toggle-group">
            <button
              className={`theme-option-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={16} />
              Light
            </button>
            <button
              className={`theme-option-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={16} />
              Dark
            </button>
          </div>
        </div>

        {/* Accent color */}
        <div className="settings-row" style={{ alignItems: 'flex-start' }}>
          <div className="settings-row-label">
            <strong>Accent Color</strong>
            <span>Applied to buttons, links and highlights</span>
          </div>
          <div className="accent-color-grid">
            {accentOptions.map(name => {
              const c = ACCENT_MAP[name];
              const isSelected = accentColor === name;
              return (
                <button
                  key={name}
                  className={`accent-swatch ${isSelected ? 'selected' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => handleAccentChange(name)}
                  title={name.charAt(0).toUpperCase() + name.slice(1)}
                  aria-label={`Select ${name} accent color`}
                >
                  {isSelected && <Check size={14} strokeWidth={3} color="#fff" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Language ─── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Globe size={18} className="settings-section-icon" />
          <div>
            <h2 className="settings-section-title">Language &amp; Region</h2>
            <p className="settings-section-desc">Your language preference is saved locally</p>
          </div>
        </div>

        <div className="settings-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div className="settings-row-label">
            <strong>Interface Language</strong>
            <span>This preference is saved and remembered across sessions</span>
          </div>
          <div>
            <select
              className="language-select"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="English">🇺🇸  English (US)</option>
              <option value="Spanish">🇪🇸  Español</option>
              <option value="French">🇫🇷  Français</option>
              <option value="German">🇩🇪  Deutsch</option>
              <option value="Japanese">🇯🇵  日本語</option>
              <option value="Tamil">🇮🇳  தமிழ்</option>
              <option value="Hindi">🇮🇳  हिन्दी</option>
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Note: UI translations are not yet implemented. This saves your preference only.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
