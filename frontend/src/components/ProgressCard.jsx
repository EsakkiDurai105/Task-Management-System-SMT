import { Link } from 'react-router-dom';

export default function ProgressCard({ tasks }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed || t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress' || (!t.completed && t.progress > 0)).length;
  const todoTasks = totalTasks - completedTasks - inProgressTasks;

  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="overall-progress-card">
      <div className="progress-header">
        <h3>Overall Progress</h3>
        <Link to="/analytics" className="view-analytics-link">View Analytics →</Link>
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
            <span className="label">Completed</span>
            <span className="value">{completedTasks}</span>
          </div>
          <div className="stat-item">
            <span className="dot in-progress"></span>
            <span className="label">In Progress</span>
            <span className="value">{inProgressTasks}</span>
          </div>
          <div className="stat-item">
            <span className="dot todo"></span>
            <span className="label">To Do</span>
            <span className="value">{todoTasks}</span>
          </div>
        </div>
      </div>
      
      <div className="progress-footer">
        <div className="linear-progress-container">
          <div className="linear-progress-bar" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="progress-text">
          <span>{completedTasks} of {totalTasks} tasks completed</span>
          <span>{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
