import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhsatK_uAGzSrw4QQAup1NYiniuJ1Qkl0",
  authDomain: "healthlink-360.firebaseapp.com",
  projectId: "healthlink-360",
  storageBucket: "healthlink-360.firebasestorage.app",
  messagingSenderId: "477790303180",
  appId: "1:477790303180:web:501b5c4aa968ab7d10a369",
  measurementId: "G-3C6HWHQFT5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
