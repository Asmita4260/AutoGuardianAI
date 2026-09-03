// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyADnqaePscGWG0JJilgHc-X7yL_cD_Cixw",
    authDomain: "autoguardianai-9c16e.firebaseapp.com",
    projectId: "autoguardianai-9c16e",
    storageBucket: "autoguardianai-9c16e.firebasestorage.app",
    messagingSenderId: "853537757004",
    appId: "1:853537757004:web:304ccadbc5bbf61925e1e9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export
export { auth, provider };