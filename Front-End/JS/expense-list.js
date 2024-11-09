document.addEventListener('DOMContentLoaded', () => {
    const expenseListBody = document.getElementById('expense-list-body');
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Function to render expenses in the table
    const renderExpenses = (expenses) => {
        expenseListBody.innerHTML = ''; // Clear current list
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.expense || expense.type}</td>
                <td>${expense.category}</td>
                <td>${expense.amount}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn" data-amount="${expense.amount}">Delete</button>
                </td>
            `;
            expenseListBody.appendChild(row);
        });

        // Optional: Add delete functionality
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const amountToDelete = parseFloat(this.getAttribute('data-amount'));
                const updatedTransactions = transactions.filter(transaction => transaction.amount !== amountToDelete);
                localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
                renderExpenses(updatedTransactions); // Re-render with updated transactions
                updateCharts(updatedTransactions); // Update charts with new data
            });
        });

        // Call the function to update charts after rendering expenses
        updateCharts(expenses);
    };

    // Fetch expenses from the server or local storage
    const fetchExpenses = async () => {
        const response = await fetch('/api/expenses');
        if (response.ok) {
            const expenses = await response.json();
            renderExpenses(expenses);
        } else {
            console.error('Failed to fetch expenses');
            renderExpenses(transactions); // Render from local storage if fetch fails
        }
    };

    // Function to update charts with expense data
    const updateCharts = (expenses) => {
        // Group expenses by category for the Pie and Bar charts
        const categories = [...new Set(expenses.map(expense => expense.category))];
        const categoryData = categories.map(category => {
            return expenses
                .filter(expense => expense.category === category)
                .reduce((total, expense) => total + expense.amount, 0);
        });

        // Pie Chart
        const pieCtx = document.getElementById('pie-chart').getContext('2d');
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryData,
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4caf50', '#f44336'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Bar Chart
        const barCtx = document.getElementById('bar-chart').getContext('2d');
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Expenses by Category',
                    data: categoryData,
                    backgroundColor: '#42a5f5',
                    borderColor: '#1e88e5',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Line Chart for Expenses Over Time
        const lineCtx = document.getElementById('line-chart').getContext('2d');
        const dates = expenses.map(expense => expense.date);
        const amounts = expenses.map(expense => expense.amount);

        new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Expenses Over Time',
                    data: amounts,
                    fill: false,
                    borderColor: '#42a5f5',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Initial fetch on page load
    fetchExpenses();
});

document.addEventListener('DOMContentLoaded', () => {
    const expenseListBody = document.getElementById('expense-list-body');

    // Function to render expenses in the table
    const renderExpenses = (expenses) => {
        expenseListBody.innerHTML = ''; // Clear current list
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.type}</td>
                <td>${expense.category}</td>
                <td>${expense.name || expense.description}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn" data-amount="${expense.amount}">Delete</button>
                </td>
            `;
            expenseListBody.appendChild(row);
        });

        // Add delete functionality
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const amountToDelete = parseFloat(this.getAttribute('data-amount'));
                await deleteTransaction(amountToDelete); // Call delete function
                fetchExpenses(); // Refresh the list
            });
        });
    };

    // Fetch expenses from the server
    const fetchExpenses = async () => {
        try {
            const response = await fetch('/api/transactions');
            if (response.ok) {
                const expenses = await response.json();
                renderExpenses(expenses);
            } else {
                console.error('Failed to fetch expenses');
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    // Function to delete a transaction
    const deleteTransaction = async (amount) => {
        try {
            const response = await fetch(`/api/transactions/${amount}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete transaction');
            }
            alert('Transaction deleted successfully!');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction.');
        }
    };

    // Initial fetch on page load
    fetchExpenses();
});
