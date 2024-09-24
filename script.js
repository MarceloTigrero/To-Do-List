const todoList = document.getElementById('todo-list');
const addItemForm = document.getElementById('add-item-form');
const newItemInput = document.getElementById('new-item');
const addItemBtn = document.getElementById('add-item-btn');

let items = [];

addItemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newItem = newItemInput.value.trim();
  if (newItem !== '') {
    items.push({ text: newItem, completed: false });
    renderList();
    newItemInput.value = '';
  }
});

function renderList() {
  todoList.innerHTML = '';
  items.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item.text;
    if (item.completed) {
      listItem.classList.add('completed');
    }
    listItem.addEventListener('click', () => {
      item.completed = !item.completed;
      renderList();
    });
    todoList.appendChild(listItem);
  });
}

renderList();