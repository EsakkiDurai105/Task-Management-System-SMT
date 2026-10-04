import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, List, LayoutGrid, X, ChevronDown, Check } from 'lucide-react';

// Custom styled dropdown component
function CustomSelect({ value, onChange, options, label }) {
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
        <span className="custom-select-label">{selectedOption?.label || label}</span>
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
              {opt.emoji && <span className="option-emoji">{opt.emoji}</span>}
              <span>{opt.label}</span>
              {value === opt.value && <Check size={13} className="option-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Tasks' },
  { value: 'active', label: 'Active Only' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent', emoji: '🔴' },
  { value: 'high', label: 'High', emoji: '🟠' },
  { value: 'medium', label: 'Medium', emoji: '🔵' },
  { value: 'low', label: 'Low', emoji: '🟢' },
];

export default function ControlsBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  viewMode,
  onViewModeChange,
  onOpenCreateModal,
  hideKanban = false,
}) {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...(categories || []).map(cat => ({ value: cat, label: cat }))
  ];

  return (
    <div className="controls-bar">
      <div className="controls-left">
        {/* Search input */}
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Custom Dropdowns */}
        <CustomSelect
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={STATUS_OPTIONS}
          label="All Tasks"
        />
        <CustomSelect
          value={priorityFilter}
          onChange={onPriorityFilterChange}
          options={PRIORITY_OPTIONS}
          label="All Priorities"
        />
        {categoryOptions.length > 1 && (
          <CustomSelect
            value={categoryFilter}
            onChange={onCategoryFilterChange}
            options={categoryOptions}
            label="All Categories"
          />
        )}
      </div>

      <div className="controls-right">
        {/* View Switcher */}
        {onViewModeChange && !hideKanban && (
          <div className="view-switcher" role="tablist">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              role="tab"
              aria-selected={viewMode === 'list'}
              title="List view"
            >
              <List size={16} />
              <span>List</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => onViewModeChange('kanban')}
              role="tab"
              aria-selected={viewMode === 'kanban'}
              title="Kanban view"
            >
              <LayoutGrid size={16} />
              <span>Kanban</span>
            </button>
          </div>
        )}

        {/* Add Task Button */}
        <button
          className="btn btn-primary add-task-btn-ctrl"
          onClick={onOpenCreateModal}
          title="Create task (Ctrl+N)"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
