// This file contains the JavaScript code for client-side functionality. 

document.addEventListener('DOMContentLoaded', function() {
    // Example function to handle habit submission
    const habitForm = document.getElementById('habit-form');
    if (habitForm) {
        habitForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const habitName = document.getElementById('habit_name').value;
            if (habitName) {
                // Logic to submit the habit to the server
                fetch('/habits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ habit_name: habitName }),
                })
                .then(response => response.json())
                .then(data => {
                    // Handle success or error
                    console.log(data);
                    // Optionally, refresh the habits list or update the UI
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }
        });
    }
});