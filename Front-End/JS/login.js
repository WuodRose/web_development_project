document.getElementById("login-form").addEventListener("submit", loginUser);

function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed'); // Handle error response
        }
        return response.json(); // Parse the JSON response
    })
    .then(data => {
        // Save user session or token if needed
        alert(data.message); // Show success message
        window.location.href = '/dashboard'; // Redirect to the dashboard
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login failed. Please check your credentials and try again.'); // Alert on failure
    });
}
