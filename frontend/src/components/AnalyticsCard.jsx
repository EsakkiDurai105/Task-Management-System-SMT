import React from 'react';
import { Layers, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AnalyticsCard({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const inProgress = tasks.filter((t) => !t.completed && t.status === 'in_progress').length;
  const todo = tasks.filter((t) => !t.completed && t.status === 'todo').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < todayStr
  ).length;

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  // SVG Radial Circle calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="dashboard-top-widgets" style={{ marginBottom: '24px' }}>
      {/* Radial Progress Ring Card */}
      <div className="progress-widget">
        <div className="overall-progress-card">
          <div className="progress-header">
            <h3>Sprint Velocity</h3>
          </div>
          <div className="progress-body">
            <div className="circular-progress">
              <svg viewBox="0 0 36 36" className="circular-chart blue">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">{percentage}%</text>
              </svg>
            </div>
            <div className="progress-stats">
              <div className="stat-item">
                <span className="dot completed"></span>
                <span className="label">Done</span>
                <span className="value">{completed}</span>
              </div>
              <div className="stat-item">
                <span className="dot in-progress"></span>
                <span className="label">Pending</span>
                <span className="value">{total - completed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Boxes */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <h3>{total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{inProgress + todo}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{completed}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>{overdue}</h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
}
