import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// -----------------------------
// Show / Hide Password
// -----------------------------

const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");

toggle.addEventListener("click", () => {

    if (password.type === "password") {
        password.type = "text";
        toggle.classList.remove("fa-eye");
        toggle.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        toggle.classList.remove("fa-eye-slash");
        toggle.classList.add("fa-eye");
    }

});

// -----------------------------
// Login
// -----------------------------

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const pass = password.value;

    try {

        await signInWithEmailAndPassword(auth, email, pass);

        alert("Login Successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        alert(error.message);

    }

});