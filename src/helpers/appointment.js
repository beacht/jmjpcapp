import { db } from "../firebase"; // Adjust path based on your project
import { doc, collection, addDoc, updateDoc } from "firebase/firestore";

/**
 * Updates an existing appointment with the provided data.
 * @param {string} appointmentId - The appointment document ID.
 * @param {Object} updates - The fields to update (can include any of the appointment fields).
 */
export const updateAppointment = async (appointmentId, updates) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, {
      ...updates, // Spread the updates into the document
    });
    console.log(`Appointment ${appointmentId} updated.`);
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

/**
 * Creates a new appointment in the "appointments" collection.
 * @param {Object} appointmentData - The data for the new appointment (includes client, date, startTime, endTime, location, etc.).
 */
export const createAppointment = async (appointmentData) => {
  try {
    const appointmentsRef = collection(db, "appointments");

    // Add a new document to the "appointments" collection with the provided data
    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData, // Spread the appointment data into the new document
    });

    console.log(`Appointment created with ID: ${docRef.id}`);
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}