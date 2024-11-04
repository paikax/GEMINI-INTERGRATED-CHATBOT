const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const showLogin = document.getElementById('showLogin');
const showRegister = document.getElementById('showRegister');
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

 // Registration form submission
 document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const fullName = document.getElementById('regFullName').value;
    const gender = document.getElementById('regGender').value;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        document.getElementById('regError').textContent = 'Passwords do not match';
        document.getElementById('regError').style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, fullName, gender }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('regSuccess').textContent = 'Registration successful!';
            document.getElementById('regSuccess').style.display = 'block';
            document.getElementById('regError').style.display = 'none';
            setTimeout(() => {
                showLogin.click();
            }, 2000);
        } else {
            document.getElementById('regError').textContent = data.error || 'Registration failed';
            document.getElementById('regError').style.display = 'block';
            document.getElementById('regSuccess').style.display = 'none';
        }
    } catch (error) {
        document.getElementById('regError').textContent = 'Server error';
        document.getElementById('regError').style.display = 'block';
        document.getElementById('regSuccess').style.display = 'none';
    }
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        console.log("calling")
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('loginSuccess').textContent = 'Login successful!';
            document.getElementById('loginSuccess').style.display = 'block';
            document.getElementById('loginError').style.display = 'none';
            localStorage.setItem('userId', data.user.userId);
            
            // Redirect to dashboard or home page
             window.location.href = "http://127.0.0.1:5500/public/home.html";
        } else {
            document.getElementById('loginError').textContent = data.error || 'Login failed';
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('loginSuccess').style.display = 'none';
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Server error';
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('loginSuccess').style.display = 'none';
    }
});