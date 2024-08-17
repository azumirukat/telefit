console.log('Script loaded');

//Sign up form password validation
document.getElementById('emailSignupForm').addEventListener('submit', function(event) {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;

    const regex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;

    if (!regex.test(password)) {
        alert('Password must be at least 8 characters long and contain at least one uppercase letter and one number.');
        event.preventDefault();
    }
});
