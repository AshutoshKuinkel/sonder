import admin from "firebase-admin";
import path from "path";
import "dotenv/config";

let db: FirebaseFirestore.Firestore;

export const connectFirestore = (serviceAccountPath: string) => {
  if (db) return db;

  if (!serviceAccountPath) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not set");
  }

  if (process.env.NODE_ENV === "development") {
    const serviceAccount = require(path.resolve(serviceAccountPath));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } else {
    const serviceAccount = JSON.parse(serviceAccountPath);

    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n"
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  db = admin.firestore();
  console.log("✅ Connected to Firestore");

  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error("Firestore not initialized. Call connectFirestore first.");
  }
  return db;
};
