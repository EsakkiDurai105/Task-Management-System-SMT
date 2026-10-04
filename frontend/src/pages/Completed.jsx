import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import EditTaskModal from '../components/EditTaskModal';

export default function Completed() {
  const { tasks, loading, error } = useTasks();
  const [editingTask, setEditingTask] = useState(null);

  if (loading) return <div className="loading-state">Loading completed tasks...</div>;
  if (error) return <div className="error-state">{error}</div>;

  const completedTasks = tasks.filter(t => t.completed || t.status === 'completed')
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return (
    <div className="completed-page tasks-page">
      <div className="page-header">
        <h1>Completed Tasks</h1>
        <p>Review everything you've accomplished.</p>
      </div>

      <div className="task-list-container list-view">
        {completedTasks.length > 0 ? (
          completedTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
          ))
        ) : (
          <div className="empty-state">
            <p>No completed tasks yet. Keep working!</p>
          </div>
        )}
      </div>

      {editingTask && (
        <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
}
