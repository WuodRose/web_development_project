document.addEventListener('DOMContentLoaded', () => {
    const transactionForm = document.getElementById('transactionForm');

    transactionForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const transactionData = {
            type: document.getElementById('transactionType').value,
            category: document.getElementById('transactionCategory').value,
            name: document.getElementById('transactionName').value,
            description: document.getElementById('transactionDescription').value,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            date: document.getElementById('transactionDate').value,
        };

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });

            if (response.ok) {
                const newTransaction = await response.json();
                alert('Transaction added successfully!');
                transactionForm.reset();
                addTransactionToList(newTransaction); // Update the list directly
            } else {
                throw new Error('Failed to add transaction');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error adding the transaction.');
        }
    });

    async function updateExpenseList() {
        const response = await fetch('/api/transactions');
        const transactions = await response.json();
        
        const tbody = document.getElementById('expense-list-body');
        tbody.innerHTML = ''; // Clear existing rows

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.name}</td>
                <td>${transaction.category}</td>
                <td>$${transaction.amount.toFixed(2)}</td>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Optionally call this to populate the list on page load
    updateExpenseList();
});
