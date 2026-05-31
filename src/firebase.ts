import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAhWtwMJqL31ucE6K097tDe3BMW1gFitRw",
  authDomain: "studyquest-c8ce5.firebaseapp.com",
  projectId: "studyquest-c8ce5",
  storageBucket: "studyquest-c8ce5.firebasestorage.app",
  messagingSenderId: "271260630879",
  appId: "1:271260630879:web:90ecd60470cc9b463e80ea"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  GET = "GET",
  WRITE = "WRITE",
  DELETE = "DELETE"
}

export const handleFirestoreError = (
  error: unknown,
  operation: OperationType,
  path: string
) => {
  console.error(`Firestore ${operation} error at ${path}:`, error);
};

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login error:", error);
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};