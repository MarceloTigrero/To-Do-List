const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const downloadBtn = document.getElementById('download-btn');
const downloadCsvBtn = document.getElementById('download-csv-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const newTask = {
            text: taskText,
            completed: false,
            timestamp: new Date().toISOString()
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `list-group-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <span>${task.text}</span>
            <div>
                <button class="btn ${task.completed ? 'checked-btn' : 'btn-primary'}" onclick="toggleTask(${index})">
                    ${task.completed ? 'Desmarcar' : 'Completar'}
                </button>
                <button class="btn btn-danger" onclick="deleteTask(${index})">Borrar</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function downloadTasks() {
    const tasksText = tasks.map(task => `${task.completed ? '[x]' : '[ ]'} ${task.text} (${new Date(task.timestamp).toLocaleString()})`).join('\n');
    const blob = new Blob([tasksText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tareas.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadCsv() {
    const header = 'Tarea,Completada,Fecha y Hora\n';
    const csvContent = tasks.map(task => 
        `"${task.text}",${task.completed ? 'Sí' : 'No'},"${new Date(task.timestamp).toLocaleString()}"`
    ).join('\n');
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tareas.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

addTaskBtn.addEventListener('click', addTask);
downloadBtn.addEventListener('click', downloadTasks);
downloadCsvBtn.addEventListener('click', downloadCsv);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

renderTasks();
