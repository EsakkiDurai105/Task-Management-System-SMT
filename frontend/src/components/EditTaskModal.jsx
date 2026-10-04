import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

export default function EditTaskModal({ task, onClose }) {
  const { updateTask } = useTasks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    progress: 0,
    dueDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.completed ? 'completed' : (task.status || 'todo'),
        priority: task.priority || 'medium',
        progress: task.completed ? 100 : (task.progress || 0),
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);
      
      const updates = {
        ...formData,
        completed: formData.status === 'completed'
      };
      
      await updateTask(task.id, updates);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Task Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="form-group half">
              <label>Priority</label>
              <select 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Due Date</label>
              <input 
                type="date" 
                value={formData.dueDate} 
                onChange={e => setFormData({...formData, dueDate: e.target.value})} 
              />
            </div>
            
            <div className="form-group half">
              <label>Progress (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={formData.progress} 
                onChange={e => setFormData({...formData, progress: parseInt(e.target.value) || 0})} 
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
