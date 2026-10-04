import { GripVertical, Edit3, Trash2, Calendar, MoreVertical, Check } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

export default function TaskCard({ task, index, onEdit, onToggleComplete, onDelete, onDragStart, onDragEnd, onDrop }) {
  let tasksContext;
  try { tasksContext = useTasks(); } catch (e) {} // ignore if outside provider

  const isCompleted = task.completed || task.status === 'completed';
  const priority = ['high', 'medium', 'low', 'urgent'].includes(task.priority?.toLowerCase()) 
    ? task.priority.toLowerCase() 
    : 'medium';

  // Format date if exists
  const formattedDate = task.dueDate 
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(task.dueDate))
    : null;

  // Calculate progress
  let progress = task.progress || 0;
  if (isCompleted) progress = 100;
  else if (task.status === 'in-progress' && progress === 0) progress = 50;

  const handleToggle = () => {
    if (onToggleComplete) {
      onToggleComplete(task.id);
    } else if (tasksContext?.toggleComplete) {
      tasksContext.toggleComplete(task);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?\nThis action cannot be undone.`)) {
      if (onDelete) {
        onDelete(task.id);
      } else if (tasksContext?.deleteTask) {
        tasksContext.deleteTask(task.id);
      }
    }
  };

  return (
    <div className={`task-card-row ${isCompleted ? 'completed' : ''}`}>
      <div className="task-drag-handle">
        <GripVertical size={20} className="text-gray-400" />
      </div>
      
      <div className="task-checkbox">
        <button 
          className={`checkbox-btn ${isCompleted ? 'checked' : ''}`}
          onClick={handleToggle}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>
      </div>
      
      <div className="task-content">
        <h4 className={`task-title ${isCompleted ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className={`task-desc ${isCompleted ? 'text-gray-400' : ''}`}>
            {task.description}
          </p>
        )}
      </div>
      
      <div className="task-meta">
        <span className={`priority-badge ${priority}`}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
        
        <div className="task-progress-wrapper">
          <div className="progress-bar-bg">
            <div 
              className={`progress-bar-fill ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
        
        {formattedDate && (
          <div className="task-due-date">
            <Calendar size={14} />
            <span>Due: {formattedDate}</span>
          </div>
        )}
      </div>
      
      <div className="task-actions">
        <button className="action-btn edit-btn" onClick={() => onEdit(task)}>
          <Edit3 size={18} />
        </button>
        <button className="action-btn delete-btn" onClick={handleDelete}>
          <Trash2 size={18} />
        </button>
        <button className="action-btn more-btn">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
