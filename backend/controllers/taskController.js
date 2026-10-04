const { getPool, resetSampleTasks } = require('../config/db');

// Helper to normalize task row returned from MySQL
function formatTaskRow(row) {
  if (!row) return null;
  let parsedSubtasks = [];
  if (row.subtasks) {
    if (typeof row.subtasks === 'string') {
      try {
        parsedSubtasks = JSON.parse(row.subtasks);
      } catch (e) {
        parsedSubtasks = [];
      }
    } else if (Array.isArray(row.subtasks)) {
      parsedSubtasks = row.subtasks;
    }
  }

  let formattedDate = null;
  if (row.due_date) {
    try {
      const d = new Date(row.due_date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split('T')[0];
      }
    } catch (e) {
      formattedDate = null;
    }
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    completed: Boolean(row.completed),
    status: row.status || 'todo',
    priority: row.priority || 'medium',
    category: row.category || 'General',
    dueDate: formattedDate,
    subtasks: parsedSubtasks,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/tasks - Retrieve all tasks ordered by `order`
exports.getAllTasks = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY `order` ASC, created_at DESC');
    const tasks = rows.map(formatTaskRow);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    console.error('[getAllTasks Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve tasks', error: error.message });
  }
};

// POST /api/tasks - Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, subtasks, status } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const pool = getPool();

    // Determine highest order index to append new task at the end
    const [orderResult] = await pool.query('SELECT COALESCE(MAX(`order`), -1) AS maxOrder FROM tasks');
    const newOrder = (orderResult[0]?.maxOrder ?? -1) + 1;

    const taskStatus = status && ['todo', 'in_progress', 'completed'].includes(status) ? status : 'todo';
    const isCompleted = taskStatus === 'completed';
    const taskPriority = priority && ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium';
    const taskCategory = category?.trim() || 'General';
    const jsonSubtasks = JSON.stringify(Array.isArray(subtasks) ? subtasks : []);
    const validDueDate = dueDate ? dueDate : null;

    const insertQuery = `
      INSERT INTO tasks (title, description, completed, status, priority, category, due_date, subtasks, \`order\`)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertQuery, [
      title.trim(),
      description?.trim() || '',
      isCompleted,
      taskStatus,
      taskPriority,
      taskCategory,
      validDueDate,
      jsonSubtasks,
      newOrder
    ]);

    const [createdRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    const createdTask = formatTaskRow(createdRows[0]);

    res.status(201).json({ success: true, message: 'Task created successfully', data: createdTask });
  } catch (error) {
    console.error('[createTask Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
  }
};

// PUT /api/tasks/:id - Update task details
exports.updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    }

    const { title, description, priority, category, dueDate, subtasks, status, completed } = req.body;

    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ success: false, message: 'Task title cannot be empty.' });
    }

    const pool = getPool();
    const [existingRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const current = existingRows[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDescription = description !== undefined ? description.trim() : current.description;
    const newPriority = priority !== undefined ? priority : current.priority;
    const newCategory = category !== undefined ? category.trim() : current.category;
    const newDueDate = dueDate !== undefined ? (dueDate || null) : current.due_date;
    const newSubtasks = subtasks !== undefined ? JSON.stringify(subtasks) : current.subtasks;

    let newStatus = status !== undefined ? status : current.status;
    let newCompleted = completed !== undefined ? Boolean(completed) : Boolean(current.completed);

    // Synchronize status and completed if one changed
    if (completed !== undefined && status === undefined) {
      newStatus = newCompleted ? 'completed' : (current.status === 'completed' ? 'todo' : current.status);
    } else if (status !== undefined && completed === undefined) {
      newCompleted = newStatus === 'completed';
    }

    const updateQuery = `
      UPDATE tasks 
      SET title = ?, description = ?, priority = ?, category = ?, due_date = ?, subtasks = ?, status = ?, completed = ?
      WHERE id = ?
    `;

    await pool.query(updateQuery, [
      newTitle,
      newDescription,
      newPriority,
      newCategory,
      newDueDate,
      newSubtasks,
      newStatus,
      newCompleted,
      taskId
    ]);

    const [updatedRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    res.json({ success: true, message: 'Task updated successfully', data: formatTaskRow(updatedRows[0]) });
  } catch (error) {
    console.error('[updateTask Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
};

// PATCH /api/tasks/:id/toggle - Toggle completion status
exports.toggleComplete = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = rows[0];
    const isNowCompleted = !task.completed;
    const newStatus = isNowCompleted ? 'completed' : 'todo';

    await pool.query('UPDATE tasks SET completed = ?, status = ? WHERE id = ?', [
      isNowCompleted,
      newStatus,
      taskId
    ]);

    const [updatedRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    res.json({ success: true, message: 'Task completion toggled', data: formatTaskRow(updatedRows[0]) });
  } catch (error) {
    console.error('[toggleComplete Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle task', error: error.message });
  }
};

// PATCH /api/tasks/reorder - Reorder tasks via Drag and Drop
// Expects body: { tasks: [ { id: 1, order: 0, status: 'todo' }, ... ] }
exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid reorder payload. Expecting an array of tasks.' });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const item of tasks) {
        if (item.id !== undefined && item.order !== undefined) {
          if (item.status) {
            const isCompleted = item.status === 'completed';
            await connection.query(
              'UPDATE tasks SET `order` = ?, status = ?, completed = ? WHERE id = ?',
              [item.order, item.status, isCompleted, item.id]
            );
          } else {
            await connection.query(
              'UPDATE tasks SET `order` = ? WHERE id = ?',
              [item.order, item.id]
            );
          }
        }
      }

      await connection.commit();
      connection.release();

      const [updatedRows] = await pool.query('SELECT * FROM tasks ORDER BY `order` ASC');
      res.json({
        success: true,
        message: 'Tasks reordered successfully',
        data: updatedRows.map(formatTaskRow)
      });
    } catch (txErr) {
      await connection.rollback();
      connection.release();
      throw txErr;
    }
  } catch (error) {
    console.error('[reorderTasks Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder tasks', error: error.message });
  }
};

// DELETE /api/tasks/:id - Delete task
exports.deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const deletedTask = formatTaskRow(rows[0]);
    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({ success: true, message: 'Task deleted successfully', data: deletedTask });
  } catch (error) {
    console.error('[deleteTask Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
  }
};

// POST /api/tasks/reset - Reset sample tasks
exports.resetTasks = async (req, res) => {
  try {
    await resetSampleTasks();
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY `order` ASC');
    res.json({ success: true, message: 'Sample tasks reloaded successfully', data: rows.map(formatTaskRow) });
  } catch (error) {
    console.error('[resetTasks Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to reset sample tasks', error: error.message });
  }
};
