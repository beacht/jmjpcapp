import { db } from "../firebase"; // Adjust path based on your project
import { collection, doc, getDoc } from "firebase/firestore";

/**
 * Fetches a location document from the "locations" collection by a location ID.
 * @param {number} locationId - The location ID to search for.
 * @returns {Object|null} - The location document data or null if not found.
 */
export const getLocationById = async (locationId) => {
  try {
    const locationRef = doc(db, "locations", locationId.toString()); // Ensure the location ID is passed as a string
    const docSnapshot = await getDoc(locationRef);

    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      console.log(`Location with ID ${locationId} not found.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching location:", error);
    throw error;
  }
};
