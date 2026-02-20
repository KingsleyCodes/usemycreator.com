import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Sends a global notification to a specific user
 * @param {string} userId - The ID of the recipient (Creator or Business)
 * @param {string} message - The notification text
 * @param {string} link - The dashboard path to redirect to
 * @param {string} type - 'info', 'success', or 'alert'
 */
export const sendNotification = async (userId, message, link = "", type = "info") => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      message,
      link,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};