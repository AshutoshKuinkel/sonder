import { CustomError } from "../middlewares/errorHandler.middleware";
import admin from "firebase-admin";
import { Memory } from "../types/memory.type";
import * as geohash from "ngeohash";

const MEMORIES_COLLECTION = "memories";
// create memory,
export async function createMemoryModel(
  db: FirebaseFirestore.Firestore,
  text: string,
  latitude: number,
  longitude: number
): Promise<String> {
  try {
    // Generate 7-char geohash (~150m precision)
    const geoHash = geohash.encode(latitude, longitude, 7);

    const memory = {
      text,
      latitude,
      longitude,
      geohash: geoHash,
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
  radiusInMeters: number = 200
): Promise<Memory[]> {
  try {
    const centerHash = geohash.encode(latitude, longitude, 7);

    // Get neighboring geohashes to cover the radius
    const neighbors = geohash.neighbors(centerHash);
    const hashesToQuery = [centerHash, ...Object.values(neighbors)];

    const allMemories: Memory[] = [];

    for (const hash of hashesToQuery) {
      const snapshot = await db
        .collection(MEMORIES_COLLECTION)
        .where("geohash", ">=", hash)
        .where("geohash", "<=", hash + "~")
        .get();

      snapshot.forEach((doc) => {
        const data = doc.data();
        allMemories.push({
          id: doc.id,
          text: data.text,
          latitude: data.latitude,
          longitude: data.longitude,
          geohash: data.geohash,
          createdAt: data.createdAt,
        });
      });
    }

    // Filter by actual distance to ensure we're within radius
    const filteredMemories = allMemories.filter((memory) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        memory.latitude,
        memory.longitude
      );
      return distance * 1000 <= radiusInMeters; // convert km to meters
    });

    // Remove duplicates (same memory might appear in multiple geohash regions)
    const uniqueMemories = Array.from(
      new Map(filteredMemories.map((m) => [m.id, m])).values()
    );

    return uniqueMemories;
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

/**
 * Calculate distance between two points (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
