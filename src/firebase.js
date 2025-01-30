// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDva2Q4XR_OVHdehCzkBQoLbcIfHmoWqeQ",
    authDomain: "booking-5061a.firebaseapp.com",
    projectId: "booking-5061a",
    storageBucket: "booking-5061a.firebasestorage.app",
    messagingSenderId: "633840352393",
    appId: "1:633840352393:web:f686a5ceb49819e63f1a58",
    measurementId: "G-GV9LL8K81J"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
