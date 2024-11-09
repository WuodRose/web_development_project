// Select DOM elements
const transactionForm = document.getElementById('transactionForm');
const transactionType = document.getElementById('transactionType');
const transactionCategory = document.getElementById('transactionCategory');
const transactionName = document.getElementById('transactionName');
const transactionDescription = document.getElementById('transactionDescription');
const transactionAmount = document.getElementById('transactionAmount');
const transactionDate = document.getElementById('transactionDate');

// Initialize Charts
const expensePieChartCtx = document.getElementById('expensePieChart').getContext('2d');
const incomeExpenseLineChartCtx = document.getElementById('incomeExpenseLineChart').getContext('2d');

let expensePieChart;
let incomeExpenseLineChart;

// Event listener for form submission
transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // Prevent page reload

    // Create a transaction object
    const transactionData = {
        type: transactionType.value,
        category: transactionCategory.value,
        name: transactionName.value,
        description: transactionDescription.value,
        amount: parseFloat(transactionAmount.value),
        date: transactionDate.value
    };

    // Send the transaction to the backend
    try {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Transaction added successfully!');
            updateCharts();  // Update charts on successful addition
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add transaction.');
    }

    // Clear the form
    transactionForm.reset();
});

// Function to fetch and display chart data
async function updateCharts() {
    try {
        const response = await fetch('/api/transactions');
        const transactions = await response.json();

        if (response.ok) {
            const { expensesData, incomeData, pieChartData } = processChartData(transactions);

            // Update pie chart
            if (expensePieChart) {
                expensePieChart.data.labels = Object.keys(pieChartData);
                expensePieChart.data.datasets[0].data = Object.values(pieChartData);
                expensePieChart.update();
            } else {
                expensePieChart = new Chart(expensePieChartCtx, {
                    type: 'pie',
                    data: {
                        labels: Object.keys(pieChartData),
                        datasets: [{
                            data: Object.values(pieChartData),
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                        }]
                    }
                });
            }

            // Update line chart
            if (incomeExpenseLineChart) {
                incomeExpenseLineChart.data.labels = incomeData.dates;
                incomeExpenseLineChart.data.datasets = [
                    { label: 'Income', data: incomeData.values, borderColor: 'green', fill: false },
                    { label: 'Expenses', data: expensesData.values, borderColor: 'red', fill: false }
                ];
                incomeExpenseLineChart.update();
            } else {
                incomeExpenseLineChart = new Chart(incomeExpenseLineChartCtx, {
                    type: 'line',
                    data: {
                        labels: incomeData.dates,
                        datasets: [
                            { label: 'Income', data: incomeData.values, borderColor: 'green', fill: false },
                            { label: 'Expenses', data: expensesData.values, borderColor: 'red', fill: false }
                        ]
                    }
                });
            }
        } else {
            console.error('Error fetching transactions:', transactions.message);
        }
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}

// Helper function to process chart data
function processChartData(transactions) {
    const expensesData = { dates: [], values: [] };
    const incomeData = { dates: [], values: [] };
    const pieChartData = {};

    transactions.forEach(({ type, category, amount, date }) => {
        if (type === 'Income') {
            incomeData.dates.push(date);
            incomeData.values.push(amount);
        } else if (type === 'Expense') {
            expensesData.dates.push(date);
            expensesData.values.push(amount);

            // Categorize for pie chart
            pieChartData[category] = (pieChartData[category] || 0) + amount;
        }
    });

    return { expensesData, incomeData, pieChartData };
}

// Initialize the charts when the page loads
window.onload = updateCharts;
