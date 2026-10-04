import { createContext, useState, useEffect, useCallback } from 'react';
import { taskApi } from '../api/taskApi';
import { toast } from 'react-hot-toast';

export const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError('Unable to load your tasks. Please make sure the backend is running.');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (taskData) => {
    try {
      const created = await taskApi.createTask(taskData);
      setTasks((current) => [...current, created]);
      toast.success('Task created successfully');
      return created;
    } catch (err) {
      toast.error('Could not add that task');
      throw err;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const updated = await taskApi.updateTask(id, updates);
      setTasks((current) => current.map((item) => (item.id === id ? updated : item)));
      toast.success('Task updated successfully');
      return updated;
    } catch (err) {
      toast.error('Could not update the task');
      throw err;
    }
  };

  const toggleComplete = async (task) => {
    const nextStatus = !task.completed;
    
    // Optimistic update
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, completed: nextStatus } : item
      )
    );
    
    try {
      await taskApi.toggleComplete(task.id);
      if (nextStatus) {
        toast.success('Task completed 🎉');
      }
    } catch (err) {
      // Revert optimistic update
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, completed: task.completed } : item
        )
      );
      toast.error('Failed to toggle task');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    const previousTasks = [...tasks];
    
    // Optimistic update
    setTasks((current) => current.filter((item) => item.id !== id));
    
    try {
      await taskApi.deleteTask(id);
      toast.success('Task deleted');
    } catch (err) {
      // Revert optimistic update
      setTasks(previousTasks);
      toast.error('Failed to delete task');
      throw err;
    }
  };

  const reorderTasks = async (reorderedTasks) => {
    setTasks(reorderedTasks);
    try {
      const payload = reorderedTasks.map(t => ({ id: t.id, order: t.order, status: t.completed ? 'completed' : (t.status || 'todo') }));
      await taskApi.reorderTasks(payload);
      toast.success('Task reordered successfully');
    } catch (err) {
      toast.error('Failed to save task order');
      loadTasks(); // Reload to get correct order from backend
      throw err;
    }
  };

  const contextValue = {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    reorderTasks,
    refreshTasks: loadTasks
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}
