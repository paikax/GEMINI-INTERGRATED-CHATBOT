// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign-in function
function googleSignIn() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            // Redirect to profile page or display user info
            window.location.href = "profile.html";  // Redirect to profile page
        })
        .catch((error) => {
            console.error("Error signing in with Google:", error);
        });
}

// Check for sign-in status
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserInfo(user);  // Display user info on profile page
    }
});

// Attach Google Sign-In to button
document.querySelector('.login-button').addEventListener('click', googleSignIn);

// Display user information on profile page
function displayUserInfo(user) {
    document.querySelector('.profile-name').textContent = `Welcome, ${user.displayName}`;
    document.querySelector('.profile-email').textContent = `Email: ${user.email}`;
    document.querySelector('.profile-picture').src = user.photoURL;
}
