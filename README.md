# TaskFlow Pro — Dynamic Task Management System

A modern, responsive, and interactive task management system built with **React**, **Node.js (Express)**, and **MySQL 8.0**.

Designed in accordance with the problem statement and methodology slides:
- **Task Input Form**: Title and description with real-time validation, priority picker, category tagging, due date, and dynamic subtask checklists.
- **Dynamic State Management**: Seamlessly tracks additions, edits, completions, and deletions with optimistic UI updates.
- **Drag-and-Drop Reordering**: Interactive HTML5 drag-and-drop reordering in both **Dynamic List View** and **Kanban Board View** (To Do, In Progress, Completed), synchronized directly with the database.
- **MySQL Persistence**: Persistent storage in MySQL database (`taskflow_db.tasks`) ensuring all changes, task order, and metadata remain intact across sessions.
- **Realistic & Interactive UX**:
  - **Sprint Velocity Radial Chart**: Live SVG completion ring and metric cards (Total, In Progress, Completed, Overdue).
  - **Subtask Checklist Tracker**: Add/toggle subtasks within cards with animated progress bars.
  - **Undo Deletion System**: 6-second grace period with toast notification to restore accidentally deleted tasks.
  - **Synthesized Audio Feedback**: Subtle, pleasant Web Audio API feedback for checkmarks, card drops, and deletions (with a mute toggle).
  - **Confetti Celebration**: Fires festive confetti when 100% completion is reached.
  - **Dark / Light Theme Toggle**: Persistent theme preference.

---

## Technology Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React 19, Vite, Lucide Icons, Canvas Confetti | Interactive reactive UI, drag-and-drop orchestration |
| **Backend** | Node.js (v24), Express 4, mysql2 | RESTful API server, batch reordering transactions |
| **Database** | MySQL Server 8.0 | Relational persistence, JSON subtask storage, indexes |
| **Audio** | Web Audio API | Zero-asset synthesized sound effects |

---

## Database Architecture (`taskflow_db`)

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  status ENUM('todo', 'in_progress', 'completed') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  category VARCHAR(50) DEFAULT 'General',
  due_date DATE NULL,
  subtasks JSON NULL,
  `order` INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_order (`order`)
);
```

> **Auto-Initialization**: The backend automatically checks for and creates `taskflow_db` and the `tasks` table upon launch, and pre-seeds realistic sample tasks if the table is empty.

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MySQL Server 8.0 running locally on port `3306`

### 1. Database Configuration
Edit `backend/.env` if your MySQL credentials differ:
```ini
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=taskflow_db
DB_PORT=3306
```

### 2. Start Backend Server
```bash
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:5000`*

### 3. Start Frontend App
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend opens at `http://localhost:5173`*

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get all tasks sorted by `order ASC, created_at DESC` |
| `POST` | `/api/tasks` | Create a new task (auto-computes next order index) |
| `PUT` | `/api/tasks/:id` | Update task fields (title, description, priority, etc.) |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle completion status |
| `PATCH` | `/api/tasks/reorder` | Batch update ordering & columns (Drag and Drop) |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `POST` | `/api/tasks/reset` | Resets MySQL table with default sample tasks |

---

## Interactive Features & Shortcuts

- **Keyboard Shortcut**: Press `Ctrl + N` (or `Cmd + N`) anywhere to open the Add Task modal.
- **Drag-and-Drop in List View**: Grab the vertical grip handle on the left of any task card to move it up or down.
- **Drag-and-Drop in Kanban View**: Drag task cards between "To Do", "In Progress", and "Completed" columns.
- **Audio Feedback**: Click the volume icon in the header to toggle Web Audio sound effects.
- **Search & Filters**: Search in real-time across title, description, and categories; filter by priority or due dates.
