import { auth, provider } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ================================
// GET ELEMENTS
// ================================

const registerForm = document.getElementById("registerForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
);

const googleRegister = document.getElementById("googleRegister");


// ================================
// PASSWORD SHOW / HIDE
// ================================

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");

    } else {

        password.type = "password";

        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");

    }

});


toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPassword.type === "password") {

        confirmPassword.type = "text";

        toggleConfirmPassword.classList.remove("fa-eye");
        toggleConfirmPassword.classList.add("fa-eye-slash");

    } else {

        confirmPassword.type = "password";

        toggleConfirmPassword.classList.remove("fa-eye-slash");
        toggleConfirmPassword.classList.add("fa-eye");

    }

});


// ================================
// REGISTER WITH EMAIL AND PASSWORD
// ================================

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const fullName = nameInput.value.trim();

    const email = emailInput.value.trim();

    const pass = password.value;

    const confirmPass = confirmPassword.value;


    // Check Name

    if (fullName === "") {

        alert("Please enter your full name.");

        return;

    }


    // Check Password Length

    if (pass.length < 6) {

        alert("Password must contain at least 6 characters.");

        return;

    }


    // Check Password Match

    if (pass !== confirmPass) {

        alert("Passwords do not match!");

        return;

    }


    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                pass
            );


        // Save User Name

        await updateProfile(userCredential.user, {

            displayName: fullName

        });


        console.log(
            "Registered User:",
            userCredential.user
        );


        alert("Registration Successful! Please Login.");


        // Redirect Login Page

        window.location.href = "./login.html";


    } catch (error) {

        console.error("Registration Error:", error);


        if (error.code === "auth/email-already-in-use") {

            alert("This email is already registered. Please Login.");

        }

        else if (error.code === "auth/invalid-email") {

            alert("Please enter a valid email address.");

        }

        else if (error.code === "auth/weak-password") {

            alert("Password is too weak.");

        }

        else {

            alert("Registration Failed: " + error.message);

        }

    }

});


// ================================
// GOOGLE REGISTRATION
// ================================

googleRegister.addEventListener("click", async () => {

    try {

        const result = await signInWithPopup(
            auth,
            provider
        );


        console.log(
            "Google User:",
            result.user
        );


        alert("Google Registration Successful!");


        window.location.href = "./dashboard.html";


    } catch (error) {

        console.error(
            "Google Registration Error:",
            error
        );


        alert(
            "Google Registration Failed: " +
            error.message
        );

    }

});


console.log("Register Page Loaded Successfully");