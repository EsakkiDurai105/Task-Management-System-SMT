import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import EditTaskModal from '../components/EditTaskModal';

export default function Calendar() {
  const { tasks, loading } = useTasks();
  const [editingTask, setEditingTask] = useState(null);

  if (loading) return <div className="loading-state">Loading calendar...</div>;

  const tasksWithDates = tasks.filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Calendar</h1>
        <p>Your tasks organized by due date.</p>
      </div>

      <div className="calendar-list-simple">
        {tasksWithDates.length > 0 ? (
          tasksWithDates.map(task => (
            <div key={task.id} className="calendar-item" onClick={() => setEditingTask(task)}>
              <div className="cal-date">
                <strong>{new Date(task.dueDate).getDate()}</strong>
                <span>{new Date(task.dueDate).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="cal-content">
                <h4 className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</h4>
                <span className={`priority-badge ${task.priority || 'medium'}`}>{task.priority || 'medium'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No tasks with due dates found.</p>
          </div>
        )}
      </div>
      
      {editingTask && (
        <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
}
