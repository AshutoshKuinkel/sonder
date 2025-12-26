import admin from 'firebase-admin'

export interface Memory{
  id: string;
  text:string;
  location: admin.firestore.GeoPoint;
  createdAt: admin.firestore.Timestamp;
}