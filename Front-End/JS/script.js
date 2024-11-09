// Redirect to the sign-up page when "Get Started" is clicked
document.getElementById('getStartedBtn').addEventListener('click', function() {
    window.location.href = '/signup'; // Directly redirect to the sign-up page
});

// Function to show the registration section and hide the login section
function showRegisterSection() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'block';
}

// Function to show the login section and hide the registration section
function showLoginSection() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('register-section').style.display = 'none';
}

// Event listener for showing the register section
document.getElementById('show-register').addEventListener('click', showRegisterSection);

// Event listener for showing the login section
document.getElementById('show-login').addEventListener('click', showLoginSection);

// Event listener for the registration form submission
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Gather form data
    const userData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value
    };

    // Send data to the back end using fetch
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json(); // Parse JSON response
    })
    .then(data => {
        console.log(data); // Handle success response
        alert('Registration successful!'); // Alert on success
        window.location.href = '/login'; // Redirect to login after successful registration
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('Registration failed. Please try again.'); // Alert on failure
    });
});
