let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            ${task.text}
            <button onclick="deleteTask(${index})" style="float:right;">X</button>
        `;
        list.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();

    if (text === "") return;

    tasks.push({ text });
    saveTasks();
    renderTasks();
    input.value = "";
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function filterTasks() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const list = document.getElementById("taskList").children;

    for (let li of list) {
        li.style.display = li.innerText.toLowerCase().includes(search) ? "" : "none";
    }
}

function toggleMode() {
    document.body.classList.toggle("dark");
}

renderTasks();
