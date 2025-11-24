import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
    apiKey: "",
    authDomain: "travelog-fb4c1.firebaseapp.com",
    projectId: "travelog-fb4c1",
    storageBucket: "travelog-fb4c1.appspot.com",
    messagingSenderId: "473264165544",
    appId: "1:473264165544:web:d1ad2721c9cd8bae89d",
    measurementId: "G-MEASUREMENT_ID" // Optional, if you have it
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Storage is now handled by Supabase
