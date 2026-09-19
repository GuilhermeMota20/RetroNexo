import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { appConfig, firebaseConfigured } from "./config";

const app = firebaseConfigured ? initializeApp(appConfig.firebase) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
