const API_BASE = '/api/tasks';

export const taskApi = {
  // Fetch all tasks from MySQL
  async getAllTasks() {
    try {
      const response = await fetch(`${API_BASE}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('API Error (getAllTasks):', error);
      throw error;
    }
  },

  // Create a new task in MySQL
  async createTask(taskData) {
    try {
      const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
      }
      return data.data;
    } catch (error) {
      console.error('API Error (createTask):', error);
      throw error;
    }
  },

  // Update existing task
  async updateTask(id, updates) {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
      }
      return data.data;
    } catch (error) {
      console.error('API Error (updateTask):', error);
      throw error;
    }
  },

  // Toggle completion status
  async toggleComplete(id) {
    try {
      const response = await fetch(`${API_BASE}/${id}/toggle`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle task');
      }
      return data.data;
    } catch (error) {
      console.error('API Error (toggleComplete):', error);
      throw error;
    }
  },

  // Reorder tasks in MySQL via Drag and Drop
  // tasksPayload: Array of { id, order, status }
  async reorderTasks(tasksPayload) {
    try {
      const response = await fetch(`${API_BASE}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksPayload }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reorder tasks');
      }
      return data.data;
    } catch (error) {
      console.error('API Error (reorderTasks):', error);
      throw error;
    }
  },

  // Delete task from MySQL
  async deleteTask(id) {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete task');
      }
      return data.data;
    } catch (error) {
      console.error('API Error (deleteTask):', error);
      throw error;
    }
  },

  // Reset to default sample tasks
  async resetTasks() {
    try {
      const response = await fetch(`${API_BASE}/reset`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset tasks');
      }
      return data.data;
    } catch (error) {
      console.error('API Error (resetTasks):', error);
      throw error;
    }
  }
};
