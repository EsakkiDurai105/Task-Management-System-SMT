import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

export default function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({});
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setPriority(initialData.priority || 'medium');
        setStatus(initialData.status || (initialData.completed ? 'completed' : 'todo'));
        setCategory(initialData.category || 'General');
        setDueDate(initialData.dueDate || '');
        setSubtasks(initialData.subtasks ? [...initialData.subtasks] : []);
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('todo');
        setCategory('General');
        setDueDate('');
        setSubtasks([]);
      }
      setNewSubtaskText('');
      setErrors({});

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters.';
    } else if (title.trim().length > 120) {
      newErrors.title = 'Title cannot exceed 120 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubtask = (e) => {
    e?.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newItem = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newSubtaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newItem]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check if subtask input has pending text
    let finalSubtasks = [...subtasks];
    if (newSubtaskText.trim()) {
      finalSubtasks.push({
        id: `st-${Date.now()}`,
        text: newSubtaskText.trim(),
        completed: false
      });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      completed: status === 'completed',
      category: category.trim() || 'General',
      dueDate: dueDate || null,
      subtasks: finalSubtasks
    };

    onSubmit(payload);
  };

  // Quick Date Helpers
  const setQuickDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {initialData ? 'Edit Task Details' : 'Create New Task'}
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Task Title <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <input
                id="task-title"
                ref={titleInputRef}
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Implement drag-and-drop handler"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                maxLength={120}
              />
              {errors.title && (
                <div className="form-error-hint">
                  <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {errors.title}
                </div>
              )}
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-description">
                Description (Optional)
              </label>
              <textarea
                id="task-description"
                className="form-textarea"
                rows={3}
                placeholder="Add context, specifications, or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Priority & Status Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🔵 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Category & Due Date Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-category">Category / Tag</label>
                <input
                  id="task-category"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Frontend, Backend, Design"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-duedate">Due Date</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    id="task-duedate"
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {dueDate && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => setDueDate('')}
                      title="Clear date"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-blue)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={() => setQuickDate(0)}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-blue)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={() => setQuickDate(1)}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-blue)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={() => setQuickDate(7)}
                  >
                    +1 Week
                  </button>
                </div>
              </div>
            </div>

            {/* Subtasks / Checklist */}
            <div className="subtasks-form-section">
              <label className="form-label">Subtasks / Checklist ({subtasks.length})</label>
              
              {subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {subtasks.map((st, idx) => (
                    <div
                      key={st.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={Boolean(st.completed)}
                          onChange={() => handleToggleSubtask(idx)}
                        />
                        <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-muted)' : 'inherit' }}>
                          {st.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(idx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        aria-label="Delete subtask"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="subtask-item-input">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a checklist item and hit Enter or +"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddSubtask}
                  style={{ padding: '8px 12px' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
