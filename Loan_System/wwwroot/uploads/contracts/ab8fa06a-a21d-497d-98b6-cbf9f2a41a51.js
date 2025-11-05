let input = document.getElementById("taskinput");

// Style input field
input.style.cssText = "width:70%;margin:10px";

// Style parent element
input.parentElement.style.cssText = "background-color:gray;padding:30px;margin:70px;border-radius:10px";

// Style button
input.nextElementSibling.style.cssText = "background-color:green;padding:10px;border-radius:10px;border:none;cursor:pointer;color:white;";

// Hover effect for button
input.nextElementSibling.addEventListener("mouseover", function () {
    input.nextElementSibling.style.backgroundColor = "darkgreen";
});

input.nextElementSibling.addEventListener("mouseout", function () {
    input.nextElementSibling.style.backgroundColor = "green";
});

// Function to load tasks from localStorage
function loadTasks() {
    let list = document.getElementById("tasklist");
    list.innerHTML = ""; // Clear list before adding items

    let tasks = JSON.parse(localStorage.getItem("task-Items")) || [];

    tasks.forEach((taskText, index) => {
        let listItem = document.createElement("li");
        listItem.textContent = taskText;
        listItem.style.cssText = "background:white;padding:10px;margin:5px;border-radius:5px;list-style:none;display:flex;justify-content:space-between;align-items:center;";

        // Create delete button
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.cssText = "background:red;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-left:10px;";
        deleteButton.addEventListener("click", function () {
            deleteTask(index);
        });

        listItem.appendChild(deleteButton);
        list.appendChild(listItem);
    });
}

// Function to delete task from localStorage and update UI
function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem("task-Items")) || [];
    tasks.splice(index, 1); // Remove the task at the specified index
    localStorage.setItem("task-Items", JSON.stringify(tasks)); // Save updated list
    loadTasks(); // Reload the list
}

// Click event to add task to list
input.nextElementSibling.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    let taskText = input.value.trim();
    if (taskText === "") return;

    let tasks = JSON.parse(localStorage.getItem("task-Items")) || [];
    tasks.push(taskText);
    localStorage.setItem("task-Items", JSON.stringify(tasks));

    loadTasks(); // Reload tasks from localStorage
    input.value = ""; // Clear input field after adding
});

// Load tasks when page loads
document.addEventListener("DOMContentLoaded", loadTasks);
