import admin from 'firebase-admin'

export interface Memory{
  id: string;
  text:string;
  latitude:number;
  longitude:number;
  geohash:string;
  createdAt: admin.firestore.Timestamp;
}