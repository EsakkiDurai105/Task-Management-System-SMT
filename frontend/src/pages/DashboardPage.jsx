import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useTasks } from '../hooks/useTasks';
import {
  CheckCircle2, Clock, AlertTriangle, Layers,
  TrendingUp, ArrowRight, CalendarDays, Flame,
  ListTodo, Zap, Target, BarChart3,
} from 'lucide-react';

/* ── Circular SVG Progress Ring ── */
function ProgressRing({ pct = 0, size = 120, stroke = 9, color = 'var(--primary)', trackColor, label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="db-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor || 'var(--border-color)'} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="db-ring-inner">
        <span className="db-ring-pct">{Math.round(pct)}%</span>
        {label && <span className="db-ring-label">{label}</span>}
        {sublabel && <span className="db-ring-sublabel">{sublabel}</span>}
      </div>
    </div>
  );
}

/* ── Mini sparkline bar chart ── */
function MiniBarChart({ data = [], color = 'var(--primary)' }) {
  const max = Math.max(...data, 1);
  return (
    <div className="db-sparkline">
      {data.map((v, i) => (
        <div
          key={i}
          className="db-spark-bar"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: v === 0 ? 0.18 : 1 }}
        />
      ))}
    </div>
  );
}

/* ── Priority dot ── */
const PRIORITY_META = {
  urgent: { color: '#ef4444', label: 'Urgent', bg: '#fef2f2' },
  high:   { color: '#f97316', label: 'High',   bg: '#fff7ed' },
  medium: { color: '#3b82f6', label: 'Medium',  bg: '#eff6ff' },
  low:    { color: '#10b981', label: 'Low',     bg: '#f0fdf4' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { tasks, loading } = useTasks();

  /* ── Greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? { text: 'Good morning', emoji: '☀️' }
                 : hour < 17 ? { text: 'Good afternoon', emoji: '🌤️' }
                 :              { text: 'Good evening',  emoji: '🌙' };
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  /* ── Derived stats ── */
  const stats = useMemo(() => {
    const total      = tasks.length;
    const completed  = tasks.filter(t => t.completed || t.status === 'completed').length;
    const inProgress = tasks.filter(t => !t.completed && t.status === 'in_progress').length;
    const todo       = tasks.filter(t => !t.completed && (t.status === 'todo' || !t.status) && t.status !== 'in_progress').length;
    const todayStr   = new Date().toISOString().split('T')[0];
    const overdue    = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
    const dueToday   = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;

    /* priority breakdown */
    const byPriority = ['urgent', 'high', 'medium', 'low'].map(p => ({
      key: p,
      count: tasks.filter(t => t.priority === p && !t.completed).length,
    }));

    /* last 7 days completions */
    const weekBars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().split('T')[0];
      return tasks.filter(t => (t.completed || t.status === 'completed') && (t.updated_at || t.created_at || '').startsWith(ds)).length;
    });

    /* recent incomplete tasks */
    const recent = tasks
      .filter(t => !t.completed && t.status !== 'completed')
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);

    /* upcoming due */
    const upcoming = tasks
      .filter(t => !t.completed && t.dueDate && t.dueDate >= todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 4);

    return { total, completed, inProgress, todo, overdue, dueToday, completionPct, inProgressPct, byPriority, weekBars, recent, upcoming };
  }, [tasks]);

  if (loading) {
    return (
      <div className="db-loading">
        <div className="db-loading-spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="db-page">

      {/* ══════════ HERO ══════════ */}
      <div className="db-hero">
        <div className="db-hero-left">
          <span className="db-hero-emoji">{greeting.emoji}</span>
          <div>
            <h1 className="db-hero-title">
              {greeting.text}, <span className="db-hero-name">{user?.name?.split(' ')[0] || 'there'}!
              </span>
            </h1>
            <p className="db-hero-sub">{today} · {currentWorkspace?.name || 'Personal Workspace'}</p>
          </div>
        </div>
        <div className="db-hero-right">
          <div className="db-hero-pill">
            <Layers size={13} />
            <span>{currentWorkspace?.type === 'company' ? 'Team Workspace' : 'Personal Tasks'}</span>
          </div>
          <Link to="/tasks" className="db-hero-cta">
            <Zap size={14} /> Go to Tasks <ArrowRight size={14} />
          </Link>
        </div>
        {/* decorative blobs */}
        <div className="db-hero-blob db-hero-blob-1" />
        <div className="db-hero-blob db-hero-blob-2" />
      </div>

      {/* ══════════ STAT CARDS ROW ══════════ */}
      <div className="db-stat-row">
        <div className="db-stat-card db-stat-total">
          <div className="db-stat-icon-box" style={{ background: 'rgba(var(--primary-rgb),0.12)', color: 'var(--primary)' }}>
            <ListTodo size={20} />
          </div>
          <div className="db-stat-info">
            <span className="db-stat-num">{stats.total}</span>
            <span className="db-stat-lbl">Total Tasks</span>
          </div>
          <div className="db-stat-trend">
            <TrendingUp size={14} />
          </div>
        </div>

        <div className="db-stat-card db-stat-done">
          <div className="db-stat-icon-box" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="db-stat-info">
            <span className="db-stat-num">{stats.completed}</span>
            <span className="db-stat-lbl">Completed</span>
          </div>
          <div className="db-stat-trend" style={{ color: '#10b981' }}>
            <CheckCircle2 size={14} />
          </div>
        </div>

        <div className="db-stat-card db-stat-progress">
          <div className="db-stat-icon-box" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div className="db-stat-info">
            <span className="db-stat-num">{stats.inProgress}</span>
            <span className="db-stat-lbl">In Progress</span>
          </div>
        </div>

        <div className="db-stat-card db-stat-overdue" style={{ borderColor: stats.overdue > 0 ? '#fecaca' : undefined }}>
          <div className="db-stat-icon-box" style={{ background: stats.overdue > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)', color: stats.overdue > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="db-stat-info">
            <span className="db-stat-num" style={{ color: stats.overdue > 0 ? '#ef4444' : undefined }}>{stats.overdue}</span>
            <span className="db-stat-lbl">Overdue</span>
          </div>
          {stats.overdue > 0 && <div className="db-stat-trend" style={{ color: '#ef4444' }}><Flame size={14} /></div>}
        </div>

        <div className="db-stat-card">
          <div className="db-stat-icon-box" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
            <CalendarDays size={20} />
          </div>
          <div className="db-stat-info">
            <span className="db-stat-num">{stats.dueToday}</span>
            <span className="db-stat-lbl">Due Today</span>
          </div>
        </div>
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="db-main-grid">

        {/* ── Left column ── */}
        <div className="db-col-left">

          {/* Progress rings card */}
          <div className="db-card db-progress-card">
            <div className="db-card-header">
              <div className="db-card-title">
                <Target size={16} />
                <span>Overall Progress</span>
              </div>
              <span className="db-card-sub">{stats.total} tasks total</span>
            </div>
            <div className="db-rings-row">
              <div className="db-ring-item">
                <ProgressRing
                  pct={stats.completionPct}
                  size={130}
                  stroke={10}
                  color="var(--primary)"
                  label="Done"
                  sublabel={`${stats.completed}/${stats.total}`}
                />
                <p className="db-ring-caption">Completion</p>
              </div>
              <div className="db-ring-item">
                <ProgressRing
                  pct={stats.inProgressPct}
                  size={130}
                  stroke={10}
                  color="#f59e0b"
                  label="Active"
                  sublabel={`${stats.inProgress} tasks`}
                />
                <p className="db-ring-caption">In Progress</p>
              </div>
              <div className="db-ring-item">
                <ProgressRing
                  pct={stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0}
                  size={130}
                  stroke={10}
                  color="#ef4444"
                  label="Late"
                  sublabel={`${stats.overdue} tasks`}
                />
                <p className="db-ring-caption">Overdue</p>
              </div>
            </div>

            {/* Linear summary bar */}
            <div className="db-linear-bar-wrap">
              <div className="db-linear-bar">
                <div className="db-linear-seg" style={{ width: `${stats.completionPct}%`, background: '#10b981' }} title="Completed" />
                <div className="db-linear-seg" style={{ width: `${stats.inProgressPct}%`, background: '#f59e0b' }} title="In Progress" />
              </div>
              <div className="db-linear-legend">
                <span><i style={{ background: '#10b981' }} /> Completed</span>
                <span><i style={{ background: '#f59e0b' }} /> In Progress</span>
                <span><i style={{ background: 'var(--border-color)' }} /> To Do</span>
              </div>
            </div>
          </div>

          {/* Weekly activity sparkline */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">
                <BarChart3 size={16} />
                <span>Weekly Activity</span>
              </div>
              <span className="db-card-sub">Last 7 days</span>
            </div>
            <div className="db-weekly-wrap">
              <MiniBarChart data={stats.weekBars} color="var(--primary)" />
              <div className="db-weekly-labels">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </div>
            <div className="db-weekly-total">
              <CheckCircle2 size={14} style={{ color: '#10b981' }} />
              <span>{stats.weekBars.reduce((s, v) => s + v, 0)} tasks completed this week</span>
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">
                <Flame size={16} />
                <span>Priority Breakdown</span>
              </div>
              <span className="db-card-sub">Open tasks only</span>
            </div>
            <div className="db-priority-list">
              {stats.byPriority.map(({ key, count }) => {
                const m = PRIORITY_META[key];
                const pct = stats.todo + stats.inProgress > 0
                  ? Math.round((count / (stats.todo + stats.inProgress)) * 100) : 0;
                return (
                  <div key={key} className="db-priority-row">
                    <div className="db-priority-label">
                      <span className="db-priority-dot" style={{ background: m.color }} />
                      <span>{m.label}</span>
                    </div>
                    <div className="db-priority-bar-wrap">
                      <div className="db-priority-bar">
                        <div className="db-priority-bar-fill" style={{ width: `${pct}%`, background: m.color }} />
                      </div>
                    </div>
                    <span className="db-priority-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="db-col-right">

          {/* Recent tasks */}
          <div className="db-card db-recent-card">
            <div className="db-card-header">
              <div className="db-card-title">
                <ListTodo size={16} />
                <span>Recent Tasks</span>
              </div>
              <Link to="/tasks" className="db-card-link">View all <ArrowRight size={13} /></Link>
            </div>
            {stats.recent.length === 0 ? (
              <div className="db-empty">
                <CheckCircle2 size={32} style={{ color: '#10b981', marginBottom: 8 }} />
                <p>All caught up! No open tasks.</p>
                <Link to="/tasks" className="db-empty-link">+ Add a task</Link>
              </div>
            ) : (
              <div className="db-task-list">
                {stats.recent.map(task => {
                  const m = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                  const isOverdue = task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];
                  return (
                    <div key={task.id} className="db-task-row">
                      <div className="db-task-status-dot" style={{
                        background: task.status === 'in_progress' ? '#f59e0b' : 'var(--border-color)'
                      }} />
                      <div className="db-task-body">
                        <p className="db-task-title">{task.title}</p>
                        <div className="db-task-meta">
                          <span className="db-task-badge" style={{ background: m.bg, color: m.color }}>
                            {m.label}
                          </span>
                          {task.dueDate && (
                            <span className="db-task-due" style={{ color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
                              <CalendarDays size={11} />
                              {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="db-task-progress-mini">
                        <div className="db-task-prog-bg">
                          <div className="db-task-prog-fill" style={{
                            width: `${task.progress || 0}%`,
                            background: task.status === 'in_progress' ? '#f59e0b' : 'var(--primary)',
                          }} />
                        </div>
                        <span>{task.progress || 0}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming due dates */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">
                <CalendarDays size={16} />
                <span>Upcoming Deadlines</span>
              </div>
              <Link to="/calendar" className="db-card-link">Calendar <ArrowRight size={13} /></Link>
            </div>
            {stats.upcoming.length === 0 ? (
              <div className="db-empty" style={{ padding: '20px 0' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming deadlines 🎉</p>
              </div>
            ) : (
              <div className="db-upcoming-list">
                {stats.upcoming.map(task => {
                  const due = new Date(task.dueDate + 'T00:00:00');
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const diff = Math.round((due - today) / 86400000);
                  const m = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                  return (
                    <div key={task.id} className="db-upcoming-row">
                      <div className="db-upcoming-date">
                        <span className="db-upcoming-day">{due.getDate()}</span>
                        <span className="db-upcoming-mon">{due.toLocaleDateString('en-US', { month: 'short' })}</span>
                      </div>
                      <div className="db-upcoming-body">
                        <p className="db-upcoming-title">{task.title}</p>
                        <span className="db-upcoming-diff" style={{ color: diff === 0 ? '#ef4444' : diff === 1 ? '#f59e0b' : 'var(--text-muted)' }}>
                          {diff === 0 ? 'Due today' : diff === 1 ? 'Due tomorrow' : `In ${diff} days`}
                        </span>
                      </div>
                      <span className="db-upcoming-badge" style={{ background: m.bg, color: m.color }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
