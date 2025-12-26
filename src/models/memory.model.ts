import { CustomError } from "../middlewares/errorHandler.middleware";
import admin from "firebase-admin";
import { Memory } from "../types/memory.type";

const MEMORIES_COLLECTION = "memories";
// create memory,
export async function createMemoryModel(
  db: FirebaseFirestore.Firestore,
  text: string,
  latitude: number,
  longitude: number
): Promise<String> {
  try {
    const memory = {
      text,
      location: new admin.firestore.GeoPoint(latitude, longitude),
      createdAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection(MEMORIES_COLLECTION).add(memory);

    return docRef.id;
  } catch (err: any) {
    console.error("Error creating memory:", err);
    throw new CustomError(`Failed to Create Memory`, 500);
  }
}

// fetch memories {We don't wanna just pinpoint the users location on earth right
// i guess that'd just be creepy and shit, better if we roughly approximate the
// lat and longitude, maybe ± 100-200 m is fine}, maybe look further into geohasing
// but we should be able to fetch close by memories well and then
export async function fetchNearbyMemoriesModel(
  db: FirebaseFirestore.Firestore,
  latitude: number,
  longitude: number,
  radiusInDegrees: number = 0.001
): Promise<Memory[]> {
  try {
    const minLat = latitude - radiusInDegrees;
    const maxLat = latitude + radiusInDegrees;
    const minLng = longitude - radiusInDegrees;
    const maxLng = longitude + radiusInDegrees;

    // Firestore doesn't support geoqueries natively, so we query by latitude range
    // and filter longitude in memory
    const snapshot = await db
      .collection(MEMORIES_COLLECTION)
      .where('location.latitude', '>=', minLat)
      .where('location.latitude', '<=', maxLat)
      .get();

      const memories:Memory[] = [];

      snapshot.forEach((doc)=>{
        const data = doc.data();
        const lng = data.location.longitude;

        if (lng >= minLng && lng <= maxLng){
          memories.push({
            id: doc.id,
            text:data.text,
            location: data.location,
            createdAt: data.createdAt,
          });
        }
      });

      return memories
  } catch (err: any) {
    console.error("Error fetching memories:", err);
    throw new CustomError(`Failed to Fetch Memories`, 500);
  }
}

// no deletion and no update

// maybe a fetch all memories within certain country or like snap map that shows the red thing for hot areas around the world.....
// i gotta think about how this would work alright, would the memories sort of fly towards the user in the form of paper planes
// and then drop like minecraft books etc.. ahh nvm, I think they should just like sort of hover as subtle glowing paper planes
// and then when user clicks them they drop a minecraft style book and once opened you can see the memory.

// This is our google def of geohashing:
//Geohashing is a system that converts geographic coordinates (latitude and longitude) into a short,
//alphanumeric string, creating a hierarchical grid system where longer strings pinpoint smaller,
//more precise areas on Earth. It enables efficient storage and searching of location data, allowing
//apps to quickly find nearby places by comparing short string prefixes rather than complex coordinates.
