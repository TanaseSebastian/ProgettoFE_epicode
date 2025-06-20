// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Import Auth
import { getFirestore } from "firebase/firestore";  // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiFIMIv0jhkTlxxamThv-HLbMR9N2wOfI",
  authDomain: "expense-tracker-9f662.firebaseapp.com",
  projectId: "expense-tracker-9f662",
  storageBucket: "expense-tracker-9f662.appspot.com",
  messagingSenderId: "15097670902",
  appId: "1:15097670902:web:b7179140f9ff89a5f090d7",
  measurementId: "G-RH3B8W4QPB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore services
const auth = getAuth(app);  // Initialize Auth
const db = getFirestore(app);  // Initialize Firestore

export { auth, db };  // Export auth and db to use in other parts of your app
