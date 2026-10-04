import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import EditTaskModal from '../components/EditTaskModal';
import { GripVertical } from 'lucide-react';

export default function Kanban() {
  const { tasks, loading, updateTask } = useTasks();
  const [editingTask, setEditingTask] = useState(null);

  if (loading) return <div className="loading-state">Loading Kanban board...</div>;

  const todoTasks = tasks.filter(t => !t.completed && (t.status === 'todo' || !t.status));
  const inProgressTasks = tasks.filter(t => !t.completed && t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.completed || t.status === 'completed');

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    // Find task
    const task = tasks.find(t => t.id.toString() === taskId.toString());
    if (!task) return;
    
    // Check if status actually changed
    const currentStatus = task.completed ? 'completed' : (task.status || 'todo');
    if (currentStatus === newStatus) return;
    
    await updateTask(task.id, { 
      status: newStatus,
      completed: newStatus === 'completed',
      progress: newStatus === 'completed' ? 100 : (newStatus === 'in_progress' ? 50 : 0)
    });
  };

  const KanbanCard = ({ task }) => (
    <div 
      className="kanban-card" 
      draggable 
      onDragStart={(e) => handleDragStart(e, task.id)}
      onClick={() => setEditingTask(task)}
    >
      <div className="kanban-card-header">
        <span className={`priority-badge ${task.priority || 'medium'}`}>{task.priority || 'medium'}</span>
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <h4 className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</h4>
      {task.dueDate && <p className="kanban-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
      
      {task.status !== 'todo' && (
        <div className="kanban-progress">
          <div className="progress-bar-bg">
            <div 
              className={`progress-bar-fill ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`} 
              style={{ width: `${task.completed ? 100 : (task.progress || 50)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="kanban-page">
      <div className="page-header">
        <h1>Kanban Board</h1>
        <p>Visualize and move your tasks through different stages.</p>
      </div>

      <div className="kanban-board">
        <div 
          className="kanban-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'todo')}
        >
          <div className="column-header">
            <h3>To Do</h3>
            <span className="count">{todoTasks.length}</span>
          </div>
          <div className="column-body">
            {todoTasks.map(task => <KanbanCard key={task.id} task={task} />)}
          </div>
        </div>

        <div 
          className="kanban-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'in-progress')}
        >
          <div className="column-header">
            <h3>In Progress</h3>
            <span className="count">{inProgressTasks.length}</span>
          </div>
          <div className="column-body">
            {inProgressTasks.map(task => <KanbanCard key={task.id} task={task} />)}
          </div>
        </div>

        <div 
          className="kanban-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'completed')}
        >
          <div className="column-header">
            <h3>Completed</h3>
            <span className="count">{completedTasks.length}</span>
          </div>
          <div className="column-body">
            {completedTasks.map(task => <KanbanCard key={task.id} task={task} />)}
          </div>
        </div>
      </div>

      {editingTask && (
        <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
}
