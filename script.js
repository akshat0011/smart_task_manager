/* ---------------------------------------
   SMARTTASK MANAGER - CLEAN JS VERSION
----------------------------------------*/

const STORAGE_KEY = "smarttasks_v1";
const THEME_KEY = "theme_preference";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

/* DOM Elements */
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const prioritySelect = document.getElementById("prioritySelect");
const addBtn = document.getElementById("addBtn");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const filterCategory = document.getElementById("filterCategory");

const taskList = document.getElementById("taskList");
const clearCompleted = document.getElementById("clearCompleted");
const clearAll = document.getElementById("clearAll");

const themeToggle = document.getElementById("themeToggle");


/* ---------------------------------------
   THEME HANDLING
----------------------------------------*/
function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem(THEME_KEY, theme);
}

applyTheme(localStorage.getItem(THEME_KEY) || "light");

themeToggle.addEventListener("click", () => {
    const current = localStorage.getItem(THEME_KEY) === "dark" ? "light" : "dark";
    applyTheme(current);
});


/* ---------------------------------------
   TASK CREATION
----------------------------------------*/
addBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (!text) return;

    const task = {
        id: Date.now(),
        text,
        category: categorySelect.value,
        priority: prioritySelect.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    taskInput.value = "";
});


/* ---------------------------------------
   SAVE & LOAD
----------------------------------------*/
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}


/* ---------------------------------------
   RENDER TASKS
----------------------------------------*/
function renderTasks() {
    const query = searchInput.value.toLowerCase();
    const status = filterStatus.value;
    const cat = filterCategory.value;

    taskList.innerHTML = "";

    tasks
        .filter(t => {
            if (status === "pending" && t.completed) return false;
            if (status === "completed" && !t.completed) return false;
            if (cat !== "all" && t.category !== cat) return false;
            if (query && !t.text.toLowerCase().includes(query)) return false;
            return true;
        })
        .forEach(task => {
            const li = document.createElement("li");
            li.className = "task-item";
            if (task.completed) li.style.opacity = "0.6";

            li.innerHTML = `
                <div class="task-left">
                    <div class="task-title">${task.text}</div>
                    <div class="task-meta">
                        <span class="chip">${task.category}</span> • 
                        ${task.priority.toUpperCase()} • 
                        ${timeAgo(task.createdAt)}
                    </div>
                </div>

                <div class="task-actions">
                    <button class="icon-btn complete-btn" data-id="${task.id}">✔</button>
                    <button class="icon-btn edit-btn" data-id="${task.id}">✏️</button>
                    <button class="icon-btn delete-btn" data-id="${task.id}">🗑️</button>
                </div>
            `;

            taskList.appendChild(li);
        });
}


/* ---------------------------------------
   TASK ACTIONS (EDIT / DELETE / COMPLETE)
----------------------------------------*/

taskList.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);

    if (e.target.classList.contains("delete-btn")) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }

    if (e.target.classList.contains("complete-btn")) {
        const t = tasks.find(t => t.id === id);
        t.completed = !t.completed;
        saveTasks();
        renderTasks();
    }

    if (e.target.classList.contains("edit-btn")) {
        const t = tasks.find(t => t.id === id);
        const newText = prompt("Edit Task:", t.text);
        if (newText) {
            t.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }
});


/* ---------------------------------------
   CLEARING TASKS
----------------------------------------*/
clearCompleted.addEventListener("click", () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
});

clearAll.addEventListener("click", () => {
    if (confirm("Delete ALL tasks?")) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
});


/* ---------------------------------------
   FILTERS & SEARCH
----------------------------------------*/

[searchInput, filterStatus, filterCategory].forEach(el => {
    el.addEventListener("input", renderTasks);
});


/* ---------------------------------------
   HELPER: TIME AGO
----------------------------------------*/
function timeAgo(date) {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
}


/* INIT */
renderTasks();
