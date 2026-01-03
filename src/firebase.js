import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDj1Tki0iWTE8YRriy6mY8g0P46YvhTDgo",
  authDomain: "today-felt-like.firebaseapp.com",
  projectId: "today-felt-like",
  storageBucket: "today-felt-like.appspot.com",
  messagingSenderId: "229445716078",
  appId: "1:229445716078:web:8eb37f8158897e96bd3e7f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
