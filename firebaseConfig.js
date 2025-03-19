// Firebase configuration
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };

const firebaseConfig = {
  apiKey: "AIzaSyDdz4TESL9J19AI4LyQMdv8U76mPb6cAT4",
  authDomain: "nacos-1f7e6.firebaseapp.com",
  projectId: "nacos-1f7e6",
  storageBucket: "nacos-1f7e6.firebasestorage.app",
  messagingSenderId: "1065295977532",
  appId: "1:1065295977532:web:a264acdc6341b90480f739",
  measurementId: "G-JFYE023S88",
};
// Initialize Firebase - do this only once
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics };
