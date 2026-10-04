import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import {
  CheckCircle2, Clock, AlertTriangle, Layers,
  TrendingUp, BarChart3, PieChart, Calendar,
  Flame, Target, Zap, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

/** Animated SVG donut ring */
function DonutRing({ segments, size = 140, stroke = 14, label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}>
        {/* track */}
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--border-color)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const len = (seg.pct / 100) * circ;
          const el = (
            <circle key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{label}</span>
        {sublabel && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sublabel}</span>}
      </div>
    </div>
  );
}

/** Horizontal bar row */
function HBar({ label, value, max, color, count }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="an-hbar-row">
      <span className="an-hbar-label">{label}</span>
      <div className="an-hbar-track">
        <div className="an-hbar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="an-hbar-count">{count}</span>
    </div>
  );
}

/** Vertical bar column for charts */
function VBar({ height, color, label, value, max }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4;
  return (
    <div className="an-vbar-wrap">
      <span className="an-vbar-val">{value > 0 ? value : ''}</span>
      <div className="an-vbar-track">
        <div className="an-vbar-fill" style={{ height: `${pct}%`, background: color }} />
      </div>
      <span className="an-vbar-label">{label}</span>
    </div>
  );
}

/** Stat card with trend */
function StatCard({ icon: Icon, iconBg, iconColor, value, label, trend, trendUp }) {
  return (
    <div className="an-stat-card">
      <div className="an-stat-icon" style={{ background: iconBg, color: iconColor }}>
        <Icon size={20} />
      </div>
      <div className="an-stat-body">
        <span className="an-stat-value">{value}</span>
        <span className="an-stat-label">{label}</span>
      </div>
      {trend !== undefined && (
        <div className={`an-stat-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function Analytics() {
  const { tasks, loading } = useTasks();

  const data = useMemo(() => {
    const total     = tasks.length;
    const completed = tasks.filter(t => t.completed || t.status === 'completed').length;
    const inProg    = tasks.filter(t => !t.completed && t.status === 'in_progress').length;
    const todo      = tasks.filter(t => !t.completed && (t.status === 'todo' || !t.status) && t.status !== 'in_progress').length;
    const todayStr  = new Date().toISOString().split('T')[0];
    const overdue   = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
    const dueToday  = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;

    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    /* Priority counts (open only) */
    const priorities = ['urgent', 'high', 'medium', 'low'].map(p => ({
      key: p, label: p.charAt(0).toUpperCase() + p.slice(1),
      count: tasks.filter(t => t.priority === p && !t.completed).length,
      color: { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#10b981' }[p],
    }));
    const maxPri = Math.max(...priorities.map(p => p.count), 1);

    /* Status donut segments (% of total) */
    const donutSegs = [
      { label: 'Completed',   color: '#10b981', pct: total > 0 ? (completed / total) * 100 : 0 },
      { label: 'In Progress', color: '#f59e0b', pct: total > 0 ? (inProg / total) * 100 : 0 },
      { label: 'To Do',       color: '#6366f1', pct: total > 0 ? (todo / total) * 100 : 0 },
      { label: 'Overdue',     color: '#ef4444', pct: total > 0 ? (overdue / total) * 100 : 0 },
    ];

    /* Progress with % per task */
    const avgProgress = tasks.length > 0
      ? Math.round(tasks.reduce((s, t) => s + (t.progress || (t.completed ? 100 : 0)), 0) / tasks.length)
      : 0;

    /* Last 4 weeks — weekly task completions */
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = new Date(); start.setDate(start.getDate() - (7 - i) * 7); start.setHours(0,0,0,0);
      const end   = new Date(start); end.setDate(end.getDate() + 7);
      const count = tasks.filter(t => {
        const d = new Date(t.updated_at || t.created_at || 0);
        return (t.completed || t.status === 'completed') && d >= start && d < end;
      }).length;
      return { label: `W${i + 1}`, count };
    });
    const maxWeek = Math.max(...weeks.map(w => w.count), 1);

    /* Daily (last 7 days) */
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      const ds = d.toISOString().split('T')[0];
      const created   = tasks.filter(t => (t.created_at || '').startsWith(ds)).length;
      const completed = tasks.filter(t => (t.completed || t.status === 'completed') && (t.updated_at || '').startsWith(ds)).length;
      return { label: DAY_NAMES[d.getDay()], created, completed };
    });
    const maxDay = Math.max(...days.map(d => Math.max(d.created, d.completed)), 1);

    /* Category breakdown */
    const catMap = {};
    tasks.forEach(t => {
      const c = t.category || 'Uncategorised';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const categories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
    const maxCat = Math.max(...categories.map(c => c.count), 1);
    const CAT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

    /* Top tasks by progress */
    const topTasks = [...tasks]
      .filter(t => !t.completed)
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 5);

    return {
      total, completed, inProg, todo, overdue, dueToday,
      completionPct, avgProgress,
      donutSegs, priorities, maxPri,
      weeks, maxWeek,
      days, maxDay,
      categories, maxCat, CAT_COLORS,
      topTasks,
    };
  }, [tasks]);

  if (loading) {
    return (
      <div className="an-loading">
        <div className="an-spinner" />
        <p>Crunching your data…</p>
      </div>
    );
  }

  return (
    <div className="an-page">
      {/* ── Header ── */}
      <div className="an-header">
        <div>
          <h1 className="an-title">Analytics</h1>
          <p className="an-subtitle">Deep dive into your productivity &amp; task patterns.</p>
        </div>
        <div className="an-header-badge">
          <BarChart3 size={15} />
          <span>{data.total} tasks analysed</span>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="an-kpi-row">
        <StatCard icon={Layers}       iconBg="rgba(var(--primary-rgb),.12)" iconColor="var(--primary)" value={data.total}          label="Total Tasks"   />
        <StatCard icon={CheckCircle2} iconBg="rgba(16,185,129,.12)"         iconColor="#10b981"         value={data.completed}      label="Completed"     trendUp={true}  trend={`${data.completionPct}%`} />
        <StatCard icon={Clock}        iconBg="rgba(245,158,11,.12)"         iconColor="#f59e0b"         value={data.inProg}         label="In Progress"   />
        <StatCard icon={Target}       iconBg="rgba(99,102,241,.12)"         iconColor="#6366f1"         value={`${data.avgProgress}%`} label="Avg Progress" />
        <StatCard icon={AlertTriangle} iconBg={data.overdue > 0 ? 'rgba(239,68,68,.1)' : 'rgba(100,116,139,.1)'} iconColor={data.overdue > 0 ? '#ef4444' : 'var(--text-muted)'} value={data.overdue} label="Overdue" trendUp={false} trend={data.overdue > 0 ? 'needs attention' : undefined} />
        <StatCard icon={Zap}          iconBg="rgba(139,92,246,.12)"        iconColor="#8b5cf6"         value={data.dueToday}       label="Due Today"     />
      </div>

      {/* ── Row 1: Donut + Priority bars ── */}
      <div className="an-row-2col">

        {/* Status breakdown donut */}
        <div className="an-card">
          <div className="an-card-head">
            <div className="an-card-title"><PieChart size={16} /> Task Status Breakdown</div>
          </div>
          <div className="an-donut-section">
            <DonutRing
              segments={data.donutSegs}
              size={160} stroke={16}
              label={`${data.completionPct}%`}
              sublabel="done"
            />
            <div className="an-donut-legend">
              {data.donutSegs.map((s, i) => (
                <div key={i} className="an-legend-row">
                  <span className="an-legend-dot" style={{ background: s.color }} />
                  <span className="an-legend-label">{s.label}</span>
                  <span className="an-legend-pct">{Math.round(s.pct)}%</span>
                </div>
              ))}
              <div className="an-donut-total">
                <span>{data.total} tasks total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority breakdown bars */}
        <div className="an-card">
          <div className="an-card-head">
            <div className="an-card-title"><Flame size={16} /> Open Tasks by Priority</div>
          </div>
          <div className="an-priority-section">
            {data.priorities.map(p => (
              <HBar key={p.key}
                label={p.label}
                value={p.count}
                max={data.maxPri}
                color={p.color}
                count={p.count}
              />
            ))}
            {data.priorities.every(p => p.count === 0) && (
              <p className="an-empty-note">🎉 No open tasks — great work!</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Daily bar chart ── */}
      <div className="an-card">
        <div className="an-card-head">
          <div className="an-card-title"><BarChart3 size={16} /> Daily Activity — Last 7 Days</div>
          <div className="an-chart-legend">
            <span><i style={{ background: 'var(--primary)' }} /> Created</span>
            <span><i style={{ background: '#10b981' }} /> Completed</span>
          </div>
        </div>
        <div className="an-grouped-bar-wrap">
          {data.days.map((d, i) => (
            <div key={i} className="an-grouped-bar-col">
              <div className="an-grouped-bars">
                <VBar value={d.created}   max={data.maxDay} color="var(--primary)"  label="" />
                <VBar value={d.completed} max={data.maxDay} color="#10b981" label="" />
              </div>
              <span className="an-grouped-day">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 3: Weekly trend + Categories ── */}
      <div className="an-row-2col">

        {/* Weekly trend */}
        <div className="an-card">
          <div className="an-card-head">
            <div className="an-card-title"><TrendingUp size={16} /> Weekly Completion Trend</div>
            <span className="an-card-sub">Last 8 weeks</span>
          </div>
          <div className="an-trend-wrap">
            {data.weeks.map((w, i) => (
              <VBar key={i} value={w.count} max={data.maxWeek}
                color={`rgba(var(--primary-rgb),${0.4 + (i / data.weeks.length) * 0.6})`}
                label={w.label}
              />
            ))}
          </div>
          <div className="an-trend-total">
            <CheckCircle2 size={13} style={{ color: '#10b981' }} />
            <span>{data.weeks.reduce((s, w) => s + w.count, 0)} completed in 8 weeks</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="an-card">
          <div className="an-card-head">
            <div className="an-card-title"><Layers size={16} /> Tasks by Category</div>
          </div>
          {data.categories.length === 0 ? (
            <p className="an-empty-note">No category data yet.</p>
          ) : (
            <div className="an-priority-section">
              {data.categories.map((c, i) => (
                <HBar key={c.name}
                  label={c.name}
                  value={c.count}
                  max={data.maxCat}
                  color={data.CAT_COLORS[i % data.CAT_COLORS.length]}
                  count={c.count}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Top in-progress tasks ── */}
      <div className="an-card">
        <div className="an-card-head">
          <div className="an-card-title"><Target size={16} /> Top Active Tasks by Progress</div>
          <span className="an-card-sub">Open tasks ranked by completion %</span>
        </div>
        {data.topTasks.length === 0 ? (
          <div className="an-empty-note">🎉 All tasks are complete!</div>
        ) : (
          <div className="an-top-tasks">
            {data.topTasks.map((t, i) => {
              const pct = t.progress || 0;
              const PRIORITY_COLOR = { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#10b981' };
              const barColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : 'var(--primary)';
              return (
                <div key={t.id} className="an-top-task-row">
                  <span className="an-top-rank">#{i + 1}</span>
                  <div className="an-top-body">
                    <div className="an-top-row">
                      <span className="an-top-title">{t.title}</span>
                      <span className="an-top-badge"
                        style={{ background: `${PRIORITY_COLOR[t.priority] || '#3b82f6'}18`, color: PRIORITY_COLOR[t.priority] || '#3b82f6' }}>
                        {t.priority || 'medium'}
                      </span>
                    </div>
                    <div className="an-top-bar-row">
                      <div className="an-top-bar-bg">
                        <div className="an-top-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                      <span className="an-top-pct">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Row 5: Summary insight cards ── */}
      <div className="an-insight-row">
        <div className="an-insight-card" style={{ borderLeft: '4px solid #10b981' }}>
          <CheckCircle2 size={22} style={{ color: '#10b981' }} />
          <div>
            <strong>Completion Rate</strong>
            <p>{data.completionPct}% of all tasks are done</p>
          </div>
        </div>
        <div className="an-insight-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <Target size={22} style={{ color: 'var(--primary)' }} />
          <div>
            <strong>Average Progress</strong>
            <p>{data.avgProgress}% across all active tasks</p>
          </div>
        </div>
        <div className="an-insight-card" style={{ borderLeft: `4px solid ${data.overdue > 0 ? '#ef4444' : '#10b981'}` }}>
          <AlertTriangle size={22} style={{ color: data.overdue > 0 ? '#ef4444' : '#10b981' }} />
          <div>
            <strong>{data.overdue > 0 ? `${data.overdue} Task${data.overdue > 1 ? 's' : ''} Overdue` : 'No Overdue Tasks'}</strong>
            <p>{data.overdue > 0 ? 'Review and reschedule or complete them.' : 'Everything is on track — nice!'}</p>
          </div>
        </div>
        <div className="an-insight-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <Calendar size={22} style={{ color: '#f59e0b' }} />
          <div>
            <strong>{data.dueToday} Due Today</strong>
            <p>{data.dueToday > 0 ? "Focus on today's tasks first." : "Nothing due today — stay ahead!"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
