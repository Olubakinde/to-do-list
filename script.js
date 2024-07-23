document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const todoForm = document.getElementById('todo-form'); // Form element for adding new todos
    const todoInput = document.getElementById('todo-input'); // Input field for entering new todo text
    const todoDate = document.getElementById('todo-date'); // Date picker input for selecting due date
    const todoList = document.getElementById('todo-list'); // List element where todos are displayed
    const progressChartCanvas = document.getElementById('progress-chart'); // Canvas element for the progress chart
    const themeToggle = document.getElementById('theme-toggle'); // Button to toggle between light and dark mode
    let todos = JSON.parse(localStorage.getItem('todos')) || []; // Load todos from localStorage or initialize as an empty array
    let progressChart; // Variable to hold the Chart.js instance

    // Initialize the date picker with flatpickr
    flatpickr(todoDate, {
        dateFormat: "Y-m-d",
    });

    // Event listener for the form submission
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        addTodo(); // Call the function to add a new todo
    });

    // Event listener for theme toggle button
    themeToggle.addEventListener('click', () => {
        // Toggle between dark and light theme by changing the data-theme attribute
        document.documentElement.setAttribute('data-theme', 
            document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
        // Save the current theme to localStorage
        localStorage.setItem('theme', document.documentElement.getAttribute('data-theme'));
    });

    // Function to add a new todo item
    function addTodo() {
        const todoText = todoInput.value.trim(); // Get and trim the input value for todo text
        const todoDateValue = todoDate.value.trim(); // Get and trim the input value for the date

        // Check if both text and date are provided
        if (todoText !== '' && todoDateValue !== '') {
            // Check if a todo with the same text and date already exists
            const existingTodo = todos.find(todo => todo.text === todoText && todo.date === todoDateValue);
            if (!existingTodo) {
                // Create a new todo object
                const todo = {
                    text: todoText,
                    date: todoDateValue,
                    completed: false // Default to not completed
                };
                todos.push(todo); // Add the new todo to the array
                updateLocalStorage(); // Update localStorage with the new todos array
                renderTodos(); // Re-render the todos list
                todoInput.value = ''; // Clear the input fields
                todoDate.value = '';
            } else {
                alert('Task already exists for this date!'); // Alert if the task already exists for the given date
            }
        }
    }

    // Function to render the todos list
    function renderTodos() {
        todoList.innerHTML = ''; // Clear the existing list

        // Loop through each todo and create list items
        todos.forEach((todo, index) => {
            const todoItem = document.createElement('li');
            todoItem.innerHTML = `${todo.text} <span>${todo.date}</span>`;

            // Apply styling if the todo is completed
            if (todo.completed) {
                todoItem.classList.add('completed');
            }

            // Create and add a delete button for each todo
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                todos.splice(index, 1); // Remove the todo from the array
                updateLocalStorage(); // Update localStorage
                renderTodos(); // Re-render the todos list
                updateProgress(); // Update the progress chart
            });

            todoItem.appendChild(deleteBtn); // Append the delete button to the list item

            // Toggle completion status when the list item is clicked
            todoItem.addEventListener('click', () => {
                todo.completed = !todo.completed; // Toggle the completed status
                updateLocalStorage(); // Update localStorage
                renderTodos(); // Re-render the todos list
                updateProgress(); // Update the progress chart
            });

            todoList.appendChild(todoItem); // Append the list item to the list
        });

        updateProgress(); // Update the progress chart after rendering todos
    }

    // Function to update localStorage with the current todos array
    function updateLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Function to update the progress chart
    function updateProgress() {
        const totalTodos = todos.length; // Get the total number of todos
        const completedTodos = todos.filter(todo => todo.completed).length; // Count completed todos
        const progress = totalTodos === 0 ? 0 : (completedTodos / totalTodos) * 100; // Calculate progress percentage

        // Check if the chart instance exists
        if (progressChart) {
            // Update the chart data
            progressChart.data.datasets[0].data = [completedTodos, totalTodos - completedTodos];
            progressChart.update(); // Update the chart
        } else {
            // Create a new Chart.js instance if it does not exist
            progressChart = new Chart(progressChartCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Incomplete'],
                    datasets: [{
                        data: [completedTodos, totalTodos - completedTodos],
                        backgroundColor: ['#28a745', '#ffc107'],
                    }],
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    cutoutPercentage: 70,
                },
            });
        }
    }

    // Load the saved theme from localStorage and apply it
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to 'dark' if no theme is saved
    document.documentElement.setAttribute('data-theme', savedTheme);

    renderTodos(); // Initial rendering of todos
});
