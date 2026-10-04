const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Task Routes
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.patch('/reorder', taskController.reorderTasks);
router.put('/reorder', taskController.reorderTasks);
router.put('/:id', taskController.updateTask);
router.patch('/:id/toggle', taskController.toggleComplete);
router.delete('/:id', taskController.deleteTask);
router.post('/reset', taskController.resetTasks);

module.exports = router;
