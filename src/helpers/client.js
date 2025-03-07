import { db } from "../firebase"; // Adjust path based on your project
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";

/**
 * Creates a new client in the "clients" collection.
 * @param {string} phone - Digits-only phone number.
 * @param {Object} data - Additional client data (optional).
 */
export const createNewClient = async (phone, data = {}) => {
  try {
    await setDoc(doc(db, "clients", phone), {
      adminNotes: "", // Default empty string
      dob: "", // Default empty string
      email: "", // Default empty string
      firstName: "", // Default empty string
      language: "", // Default empty string
      lastName: "", // Default empty string
      menstrual: "", // Default empty string
      notes: "", // Default empty string
      phone,
      unableToAct: false, // Default false
      unableToSchedule: false, // Default false
      verified: false, // Default false
      ...data, // Spread in any additional data passed
    });
    console.log(`Client ${phone} created.`);
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

/**
 * Updates an existing client.
 * @param {string} phone - Digits-only phone number.
 * @param {Object} updates - Fields to update.
 */
export const updateClient = async (phone, updates) => {
  try {
    const clientRef = doc(db, "clients", phone);
    await updateDoc(clientRef, {
      ...updates,
    });
    console.log(`Client ${phone} updated.`);
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};
