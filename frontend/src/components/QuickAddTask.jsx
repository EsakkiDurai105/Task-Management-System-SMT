import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

export default function QuickAddTask() {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'detailed'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      setSubmitting(true);
      await addTask({
        title,
        description,
        priority: 'medium',
        status: 'todo'
      });
      setTitle('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quick-add-container">
      <div className="quick-add-tabs">
        <button 
          className={`tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
          onClick={() => setActiveTab('quick')}
        >
          <Plus size={16} /> Quick Add
        </button>
        <button 
          className={`tab-btn ${activeTab === 'detailed' ? 'active' : ''}`}
          onClick={() => setActiveTab('detailed')}
        >
          Add Detailed Task
        </button>
      </div>

      <form className="quick-add-form" onSubmit={handleSubmit}>
        <div className="inputs-row">
          <div className="input-group flex-1">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to do?" 
              required
            />
          </div>
          <div className="input-group flex-1">
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description (optional)" 
            />
          </div>
          <button type="submit" className="add-task-btn" disabled={submitting || !title.trim()}>
            <Plus size={18} /> {submitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
