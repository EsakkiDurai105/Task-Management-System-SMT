import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';

export function useTasks() {
  const context = useContext(TaskContext);
  
  if (context === undefined || context === null) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  
  return context;
}
