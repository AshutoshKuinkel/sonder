import admin from "firebase-admin";
import path from "path";
import "dotenv/config";

let db: FirebaseFirestore.Firestore;

export const connectFirestore = (serviceAccountPath: string) => {
  if (db) return db;

  if (!serviceAccountPath) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not set");
  }

  const serviceAccount = require(
    path.resolve(serviceAccountPath)
  );

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  db = admin.firestore();
  console.log("✅ Connected to Firestore");

  return db;
};