const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  multipleStatements: true,
};

const DB_NAME = process.env.DB_NAME || 'taskflow_db';

let pool;

async function initializeDatabase() {
  try {
    // 1. Initial connection without database selected to ensure DB exists
    const initialConnection = await mysql.createConnection(dbConfig);
    console.log(`[Database] Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);

    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[Database] Database '${DB_NAME}' verified/created.`);
    await initialConnection.end();

    // 2. Create the connection pool with database selected
    pool = mysql.createPool({
      ...dbConfig,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // 3. Create tasks table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        status ENUM('todo', 'in_progress', 'completed') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        category VARCHAR(50) DEFAULT 'General',
        due_date DATE NULL,
        subtasks JSON NULL,
        \`order\` INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_order (\`order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createTableQuery);
    console.log(`[Database] 'tasks' table verified/created.`);

    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
      avatar VARCHAR(10) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    await pool.query(`CREATE TABLE IF NOT EXISTS workspaces (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL,
      type ENUM('personal','company') NOT NULL DEFAULT 'personal', owner_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    await pool.query(`CREATE TABLE IF NOT EXISTS workspace_members (
      workspace_id INT NOT NULL, user_id INT NOT NULL,
      role ENUM('admin','member') NOT NULL DEFAULT 'member',
      PRIMARY KEY (workspace_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    // 4. Check if tasks exist; if empty, seed realistic tasks
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM tasks');
    if (rows[0].count === 0) {
      console.log(`[Database] Seeding initial sample tasks...`);
      await seedInitialTasks();
    }
  } catch (error) {
    console.error('[Database Error] Initialization failed:', error.message);
    throw error;
  }
}

async function seedInitialTasks() {
  const sampleTasks = [
    {
      title: 'Design Responsive Task Management Interface',
      description: 'Create modern UI layouts with list and Kanban views, dark/light theme options, and quick-action toolbars.',
      completed: true,
      status: 'completed',
      priority: 'high',
      category: 'Design',
      due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      order: 0,
      subtasks: JSON.stringify([
        { id: 'st-1', text: 'Color palette & glassmorphism variables', completed: true },
        { id: 'st-2', text: 'Responsive card layouts for mobile/desktop', completed: true },
        { id: 'st-3', text: 'SVG completion chart design', completed: true }
      ])
    },
    {
      title: 'Implement Interactive Drag-and-Drop Reordering',
      description: 'Use native HTML5 Drag and Drop API to allow seamless rearranging of tasks in list view and across Kanban board columns.',
      completed: false,
      status: 'in_progress',
      priority: 'urgent',
      category: 'Frontend',
      due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      order: 1,
      subtasks: JSON.stringify([
        { id: 'st-4', text: 'Add draggable attributes and drag handles', completed: true },
        { id: 'st-5', text: 'Handle dragover and drop target visual indicators', completed: true },
        { id: 'st-6', text: 'Sync reordered positions with backend API', completed: false }
      ])
    },
    {
      title: 'Build Node.js & MySQL REST API',
      description: 'Develop endpoints for CRUD operations, batch reordering, completion toggling, and data persistence.',
      completed: true,
      status: 'completed',
      priority: 'high',
      category: 'Backend',
      due_date: new Date().toISOString().split('T')[0],
      order: 2,
      subtasks: JSON.stringify([
        { id: 'st-7', text: 'Database pool & schema auto-initialization', completed: true },
        { id: 'st-8', text: 'CRUD route handlers with input validation', completed: true },
        { id: 'st-9', text: 'Batch reorder transaction logic', completed: true }
      ])
    },
    {
      title: 'Configure Dynamic Form Validation & Real-time Feedback',
      description: 'Ensure title, description, priority, and date inputs validate properly with inline error hints and character indicators.',
      completed: false,
      status: 'todo',
      priority: 'medium',
      category: 'Frontend',
      due_date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      order: 3,
      subtasks: JSON.stringify([
        { id: 'st-10', text: 'Real-time title length validation', completed: false },
        { id: 'st-11', text: 'Subtask dynamic add/remove list', completed: false }
      ])
    },
    {
      title: 'Conduct End-to-End Testing & Verification',
      description: 'Verify cross-session persistence across browser refreshes, test drag reordering consistency, and verify responsiveness.',
      completed: false,
      status: 'todo',
      priority: 'low',
      category: 'QA',
      due_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      order: 4,
      subtasks: JSON.stringify([
        { id: 'st-12', text: 'Test database persistence across page reloads', completed: false },
        { id: 'st-13', text: 'Test multi-device responsive viewports', completed: false }
      ])
    }
  ];

  const insertQuery = `
    INSERT INTO tasks (title, description, completed, status, priority, category, due_date, \`order\`, subtasks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const t of sampleTasks) {
    await pool.query(insertQuery, [
      t.title,
      t.description,
      t.completed,
      t.status,
      t.priority,
      t.category,
      t.due_date,
      t.order,
      t.subtasks
    ]);
  }
  console.log(`[Database] Sample tasks seeded successfully.`);
}

module.exports = {
  initializeDatabase,
  getPool: () => {
    if (!pool) {
      throw new Error('Database pool has not been initialized. Call initializeDatabase first.');
    }
    return pool;
  },
  resetSampleTasks: async () => {
    if (!pool) throw new Error('Database not initialized');
    await pool.query('DELETE FROM tasks');
    await seedInitialTasks();
  }
};
