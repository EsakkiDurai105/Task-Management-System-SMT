import { useState, useEffect } from 'react';
import { ListTodo, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import StatsCard from '../components/StatsCard';
import ProgressCard from '../components/ProgressCard';
import QuickAddTask from '../components/QuickAddTask';
import TaskCard from '../components/TaskCard';
import EditTaskModal from '../components/EditTaskModal';

export default function Dashboard() {
  const { tasks, loading, error } = useTasks();
  const [greeting, setGreeting] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed || t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => {
    if (t.completed || t.status === 'completed') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0);
  }).length;

  const filteredTasks = tasks.filter(t => {
    if (filter === 'todo') return !t.completed && t.status !== 'in_progress' && t.status !== 'completed';
    if (filter === 'in_progress') return t.status === 'in_progress';
    if (filter === 'completed') return t.completed || t.status === 'completed';
    if (filter === 'overdue') {
      if (t.completed || t.status === 'completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0);
    }
    return true; // all
  }).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 5);

  if (loading) return <div className="loading-state">Loading your dashboard...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="greeting-section">
          <h1>{greeting}, Esakki! 👋</h1>
          <p>Stay focused, keep going, and make it happen.</p>
        </div>
      </div>

      <div className="dashboard-top-widgets">
        <div className="stats-grid">
          <StatsCard icon={ListTodo} value={totalTasks} label="Total Tasks" colorClass="blue" />
          <StatsCard icon={CheckCircle2} value={completedTasks} label="Completed" colorClass="green" />
          <StatsCard icon={Clock} value={inProgressTasks} label="In Progress" colorClass="orange" />
          <StatsCard icon={CalendarDays} value={overdueTasks} label="Overdue" colorClass="red" />
        </div>
        
        <div className="progress-widget">
          <ProgressCard tasks={tasks} />
        </div>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h2>My Tasks</h2>
          <div className="status-filters">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({totalTasks})</button>
            <button className={filter === 'todo' ? 'active' : ''} onClick={() => setFilter('todo')}>To Do ({totalTasks - completedTasks - inProgressTasks})</button>
            <button className={filter === 'in_progress' ? 'active' : ''} onClick={() => setFilter('in_progress')}>In Progress ({inProgressTasks})</button>
            <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed ({completedTasks})</button>
            <button className={filter === 'overdue' ? 'active' : ''} onClick={() => setFilter('overdue')}>Overdue ({overdueTasks})</button>
          </div>
        </div>

        <div className="task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
            ))
          ) : (
            <div className="empty-state">
              <p>No tasks found for this filter.</p>
            </div>
          )}
        </div>
      </div>

      {editingTask && (
        <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
}
