const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.'));

const tasksFile = 'tasks.json';

async function readTasks() {
    try {
        const data = await fs.readFile(tasksFile, 'utf8');
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData.tasks) ? parsedData.tasks : [];
    } catch (error) {
        return [];
    }
}

async function writeTasks(tasks) {
    await fs.writeFile(tasksFile, JSON.stringify({ tasks: tasks || [] }, null, 2));
}

app.get('/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json({ tasks });
    } catch (error) {
        res.status(500).send('Error reading tasks');
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const existingTasks = await readTasks();
        const newTask = req.body.task;
        existingTasks.push(newTask);
        await writeTasks(existingTasks);
        res.json({ message: 'Task added successfully', tasks: existingTasks });
    } catch (error) {
        res.status(500).send('Error saving task');
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const tasks = await readTasks();
        const taskIndex = tasks.findIndex(task => task.id === req.params.id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
            await writeTasks(tasks);
            res.json({ message: 'Task updated successfully', tasks });
        } else {
            res.status(404).send('Task not found');
        }
    } catch (error) {
        res.status(500).send('Error updating task');
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        let tasks = await readTasks();
        tasks = tasks.filter(task => task.id !== req.params.id);
        await writeTasks(tasks);
        res.json({ message: 'Task deleted successfully', tasks });
    } catch (error) {
        res.status(500).send('Error deleting task');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});