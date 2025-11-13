/* script.js for SmartTask Manager - polished frontend */
const STORAGE_KEY = 'smartTasks_v1';
const THEME_KEY = 'smartTheme_v1';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
const taskListEl = document.getElementById('taskList');
const form = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterCategory = document.getElementById('filterCategory');
const taskCount = document.getElementById('taskCount');
const themeToggle = document.getElementById('themeToggle');
const clearCompleted = document.getElementById('clearCompleted');
const clearAll = document.getElementById('clearAll');

// theme
function applyTheme(theme){
  if(theme === 'dark'){
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
    themeToggle.setAttribute('aria-pressed','true');
  }else{
    document.body.classList.remove('dark');
    themeToggle.textContent = '🌙';
    themeToggle.setAttribute('aria-pressed','false');
  }
  localStorage.setItem(THEME_KEY, theme);
}
applyTheme(localStorage.getItem(THEME_KEY) || 'light');
themeToggle.addEventListener('click', () => {
  const current = document.body.classList.contains('dark') ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// save load
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// helpers
function createTaskObject(text, category, priority){
  return {
    id: Date.now().toString(),
    text,
    category,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  };
}

// render
function renderTasks(){
  const q = searchInput.value.trim().toLowerCase();
  const status = filterStatus.value;
  const cat = filterCategory.value;
  taskListEl.innerHTML = '';

  const filtered = tasks.filter(t => {
    if(status === 'pending' && t.completed) return false;
    if(status === 'completed' && !t.completed) return false;
    if(cat !== 'all' && t.category !== cat) return false;
    if(q && !t.text.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="task-left">
        <button class="checkbox ${task.completed ? 'checked' : ''}" aria-label="Toggle complete" title="Toggle complete">
          ${task.completed ? '✓' : ''}
        </button>

        <div style="min-width:0;">
          <div class="task-title" title="${escapeHtml(task.text)}">${escapeHtml(task.text)}</div>
          <div class="task-meta">
            <span class="chip">${escapeHtml(task.category)}</span>
            &nbsp;•&nbsp;
            <span style="color:var(--muted);font-weight:600">${task.priority}</span>
            &nbsp;•&nbsp;
            <time datetime="${task.createdAt}">${timeAgo(task.createdAt)}</time>
          </div>
        </div>
      </div>

      <div class="task-actions">
        <button class="icon-btn edit-btn" title="Edit">✏️</button>
        <button class="icon-btn delete-btn" title="Delete">🗑️</button>
      </div>
    `;

    taskListEl.appendChild(li);
  });

  taskCount.textContent = `${tasks.length} tasks`;
}

// simple sanitize
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// time ago small helper
function timeAgo(iso){
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if(diff < 60) return `${diff}s ago`;
  if(diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if(diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// add
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if(!text) return;
  const category = categorySelect.value || 'General';
  const priority = prioritySelect.value || 'medium';
  const task = createTaskObject(text, category, priority);
  tasks.unshift(task); // newest first
  saveTasks();
  renderTasks();
  taskInput.value = '';
});

// delegation for buttons inside list
taskListEl.addEventListener('click', e => {
  const li = e.target.closest('li.task-item');
  if(!li) return;
  const id = li.dataset.id;
  const taskIndex = tasks.findIndex(t => t.id === id);
  if(taskIndex < 0) return;

  if(e.target.closest('.checkbox')){
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks();
    renderTasks();
    return;
  }

  if(e.target.closest('.delete-btn')){
    if(confirm('Delete this task?')) {
      tasks.splice(taskIndex,1);
      saveTasks();
      renderTasks();
    }
    return;
  }

  if(e.target.closest('.edit-btn')){
    const newText = prompt('Edit task description', tasks[taskIndex].text);
    if(newText !== null) {
      tasks[taskIndex].text = newText.trim() || tasks[taskIndex].text;
      saveTasks();
      renderTasks();
    }
    return;
  }
});

// search and filters
[searchInput, filterStatus, filterCategory].forEach(el => {
  el.addEventListener('input', () => renderTasks());
});

// clear completed
clearCompleted.addEventListener('click', () => {
  const countDone = tasks.filter(t => t.completed).length;
  if(!countDone){ alert('No completed tasks'); return; }
  if(confirm(`Remove ${countDone} completed tasks?`)) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  }
});

// clear all
clearAll.addEventListener('click', () => {
  if(!tasks.length){ alert('No tasks to clear'); return; }
  if(confirm('Remove all tasks?')) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// init
loadTasks();
renderTasks();
