document.addEventListener('DOMContentLoaded', () => {
    const totalAmountInput = document.getElementById('total-amount');
    const totalAmountButton = document.getElementById('total-amount-button');
    const checkAmountButton = document.getElementById('check-amount');
    const productTitleInput = document.getElementById('product-title');
    const descriptionInput = document.getElementById('Description');
    const userAmountInput = document.getElementById('user-amount');
    const expenseDateInput = document.getElementById('expense-date');

    const amountSpan = document.getElementById('amount');
    const expenditureSpan = document.getElementById('expenditure-value');
    const balanceSpan = document.getElementById('balance-amount');

    let totalAmount = 0;
    let expenditure = 0;

    // Function to calculate and update totals
    const updateTotals = () => {
        expenditure = parseFloat(userAmountInput.value) || 0;
        const balance = totalAmount - expenditure;

        amountSpan.textContent = totalAmount;
        expenditureSpan.textContent = expenditure;
        balanceSpan.textContent = balance;
    };

    // Set budget button click event
    totalAmountButton.addEventListener('click', () => {
        const value = parseFloat(totalAmountInput.value);
        if (!isNaN(value) && value > 0) {
            totalAmount = value;
            updateTotals();
            totalAmountInput.value = ''; // Clear input
        } else {
            alert('Please enter a valid budget amount.');
        }
    });

    // Add expense button click event
    checkAmountButton.addEventListener('click', async () => {
        const title = productTitleInput.value;
        const description = descriptionInput.value;
        const amount = parseFloat(userAmountInput.value);
        const date = expenseDateInput.value;

        if (title && description && !isNaN(amount) && amount > 0 && date) {
            const expense = {
                description,
                amount,
                category: title, // Assuming category is derived from product title
                date
            };

            // Send expense data to the server
            const response = await fetch('/api/add-expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expense)
            });

            if (response.ok) {
                alert('Expense added successfully');
                // Clear inputs
                productTitleInput.value = '';
                descriptionInput.value = '';
                userAmountInput.value = '';
                expenseDateInput.value = '';
            } else {
                alert('Failed to add expense');
            }
        } else {
            alert('Please fill in all the fields with valid data.');
        }
    });
});
