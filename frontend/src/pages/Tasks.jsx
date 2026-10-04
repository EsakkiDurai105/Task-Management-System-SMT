import { useState, useMemo, useRef, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import EditTaskModal from '../components/EditTaskModal';
import { ArrowDownUp, LayoutList, Grid3X3, Columns3, Plus, ChevronDown, Check } from 'lucide-react';

/* ─── Shared Custom Dropdown (same design as ControlsBar) ─── */
function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="custom-select-wrapper" ref={ref}>
      <button
        className="custom-select-trigger"
        onClick={() => setOpen(prev => !prev)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="custom-select-label">{selectedOption?.label}</span>
        <ChevronDown size={14} className={`custom-select-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="custom-select-dropdown" role="listbox">
          {options.map(opt => (
            <button
              key={opt.value}
              className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              role="option"
              aria-selected={value === opt.value}
              type="button"
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={13} className="option-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

export default function Tasks() {
  const { tasks, loading, error, reorderTasks, addTask } = useTasks();
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);

  const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply filter
    if (filter === 'todo') {
      result = result.filter(t => !t.completed && t.status !== 'in_progress' && t.status !== 'completed');
    } else if (filter === 'in_progress') {
      result = result.filter(t => t.status === 'in_progress');
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed || t.status === 'completed');
    } else if (filter === 'overdue') {
      result = result.filter(t => {
        if (t.completed || t.status === 'completed') return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
      });
    }

    // Apply sort
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sort === 'dueDate') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sort === 'priority') {
      result.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));
    }

    return result;
  }, [tasks, filter, sort]);

  const handleDragStart = (e, index) => {
    setDraggedItem(filteredAndSortedTasks[index]);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, index) => {
    if (!draggedItem) return;
    let items = [...tasks].filter(item => item.id !== draggedItem.id);
    const targetIdx = tasks.findIndex(t => t.id === filteredAndSortedTasks[index].id);
    items.splice(targetIdx >= 0 ? targetIdx : 0, 0, draggedItem);
    const newOrder = items.map((t, idx) => ({ ...t, order: idx }));
    reorderTasks(newOrder);
    setDraggedItem(null);
  };

  if (loading) return <div className="loading-state">Loading tasks...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="tasks-page">
      {/* ── Page Header with Add Task button ── */}
      <div className="tasks-page-header">
        <div className="tasks-page-header-text">
          <h1>Tasks</h1>
          <p>Manage all your tasks in <span style={{ color: 'var(--primary)' }}>one place.</span></p>
        </div>
        <button
          className="btn btn-primary tasks-add-btn"
          onClick={() => setIsAddModalOpen(true)}
          title="Add Task (Ctrl+N)"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      {/* ── Controls: filters + sort + view ── */}
      <div className="tasks-controls">
        {/* Status filter pills */}
        <div className="status-filters">
          {[
            { key: 'all',         label: 'All' },
            { key: 'todo',        label: 'To Do' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed',   label: 'Completed' },
            { key: 'overdue',     label: 'Overdue' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={filter === key ? 'active' : ''}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right-side: Sort dropdown + view toggles */}
        <div className="view-controls">
          {/* Custom Sort Dropdown — same design as ControlsBar dropdowns */}
          <div className="tasks-sort-dropdown">
            <ArrowDownUp size={15} className="tasks-sort-icon" />
            <CustomSelect
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
            />
          </div>

          <div className="view-toggles">
            <button className={view === 'list'   ? 'active' : ''} onClick={() => setView('list')}   title="List view">
              <LayoutList size={16} />
            </button>
            <button className={view === 'grid'   ? 'active' : ''} onClick={() => setView('grid')}   title="Grid view">
              <Grid3X3 size={16} />
            </button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')} title="Kanban view">
              <Columns3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Task List ── */}
      <div className={`task-list-container ${view}-view`}>
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task, index) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => setDraggedItem(null)}
            >
              <TaskCard task={task} onEdit={setEditingTask} />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No tasks found for the current filter.</p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {editingTask && (
        <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}

      {/* Add Task modal via TaskFormModal if available — or use QuickAddTask for now */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Task</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}
              >✕</button>
            </div>
            <div className="modal-form">
              <QuickAddTaskInline onDone={() => setIsAddModalOpen(false)} addTask={addTask} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Mini add-task form used inside the modal */
function QuickAddTaskInline({ onDone, addTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSubmitting(true);
      await addTask({ title, description, priority, status: 'todo' });
      onDone();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Task Title *</label>
        <input
          className="form-input"
          type="text"
          placeholder="What do you want to do?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          className="form-input"
          type="text"
          placeholder="Add description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Priority</label>
        <select
          className="form-input"
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        <button type="button" className="btn-cancel" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting || !title.trim()}>
          <Plus size={16} />
          {submitting ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
