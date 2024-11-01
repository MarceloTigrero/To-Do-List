const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const downloadBtn = document.getElementById('download-btn');
const downloadCsvBtn = document.getElementById('download-csv-btn');

let tasks = [];

function loadTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(data => {
            tasks = data.tasks;
            renderTasks();
        })
        .catch(error => console.error('Error loading tasks:', error));
}
  // Check if HTTPS is available
  const isSecure = window.location.protocol === 'https:';

  // Create broadcast channel with fallback
  let todoChannel;
  try {
      todoChannel = new BroadcastChannel('todo-sync');
  } catch (e) {
      // Fallback for environments where BroadcastChannel is not available
      todoChannel = {
          postMessage: () => {},
          onmessage: () => {}
      };
  }

  // Listen for messages from other tabs
  todoChannel.onmessage = (event) => {
      if (event.data.type === 'update') {
          loadTasks(); // Refresh the task list
      }
  };

  // Function to broadcast changes
  function broadcastUpdate() {
      todoChannel.postMessage({
          type: 'update'
      });
  }

  function addTask() {
      const taskText = taskInput.value.trim();
      if (taskText) {
          const newTask = {
              id: Date.now().toString(),
              text: taskText,
              completed: false,
              timestamp: new Date().toISOString()
          };
          fetch('/tasks', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ task: newTask }),
          })
          .then(response => response.json())
          .then(data => {
              tasks = data.tasks;
              renderTasks();
              taskInput.value = '';
              broadcastUpdate();
          })
          .catch(error => console.error('Error adding task:', error));
      }
  }

  function toggleTask(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
          task.completed = !task.completed;
          fetch(`/tasks/${taskId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ completed: task.completed }),
          })
          .then(response => response.json())
          .then(data => {
              tasks = data.tasks;
              renderTasks();
              broadcastUpdate();
          })
          .catch(error => console.error('Error updating task:', error));
      }
  }

  function deleteTask(taskId) {
      fetch(`/tasks/${taskId}`, {
          method: 'DELETE',
      })
      .then(response => response.json())
      .then(data => {
          tasks = data.tasks;
          renderTasks();
          broadcastUpdate();
      })
      .catch(error => console.error('Error deleting task:', error));
  }
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `list-group-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <span>${task.text}</span>
            <div>
                <button class="btn ${task.completed ? 'checked-btn' : 'btn-primary'}" onclick="toggleTask('${task.id}')">
                    ${task.completed ? 'Desmarcar' : 'Completar'}
                </button>
                <button class="btn btn-danger" onclick="deleteTask('${task.id}')">Borrar</button>
            </div>
        `;
        taskList.appendChild(li);
    });
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
        `"${task.text}",${task.completed ? 'Si' : 'No'},"${new Date(task.timestamp).toLocaleString()}"`
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

loadTasks();
