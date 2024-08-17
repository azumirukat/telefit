//Settings form password validation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Validation script is running');
    const form = document.getElementById('settingsForm');

    form.addEventListener('submit', function(event) {
        const passwordInput = document.getElementById('password');
        const password = passwordInput.value;

        // Only validate password if the user has entered a new one
        if (password) {
            const regex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;

            if (!regex.test(password)) {
                alert('New password must be at least 8 characters long and contain at least one uppercase letter and one number.');
                event.preventDefault(); // Prevent form submission
            }
        }
    });
});