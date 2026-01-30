/**
 * Firestore service for managing user subscriptions
 * Data structure: users/{userId}/subscriptions/{subscriptionId}
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "./Firebase";

/**
 * Get reference to a user's subscriptions collection
 * @param {string} userId - The authenticated user's ID
 * @returns {CollectionReference} Firestore collection reference
 */
const getUserSubscriptionsRef = (userId) => {
  return collection(db, "users", userId, "subscriptions");
};

/**
 * Subscribe to real-time updates for a user's subscriptions
 * @param {string} userId - The authenticated user's ID
 * @param {Function} onSuccess - Callback with subscriptions array
 * @param {Function} onError - Optional error callback
 * @returns {Function} Unsubscribe function
 */
export const subscribeToSubscriptions = (userId, onSuccess, onError) => {
  const subscriptionsRef = getUserSubscriptionsRef(userId);
  const q = query(subscriptionsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const subscriptions = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      onSuccess(subscriptions);
    },
    (error) => {
      console.error("Error fetching subscriptions:", error);
      if (onError) onError(error);
    }
  );
};

/**
 * Add a new subscription to Firestore
 * @param {string} userId - The authenticated user's ID
 * @param {Object} subscriptionData - The subscription data to add
 * @returns {Promise<string>} The new document ID
 */
export const addSubscription = async (userId, subscriptionData) => {
  const subscriptionsRef = getUserSubscriptionsRef(userId);
  const { id: _id, ...dataWithoutId } = subscriptionData;

  const docRef = await addDoc(subscriptionsRef, {
    ...dataWithoutId,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
};

/**
 * Update an existing subscription in Firestore
 * @param {string} userId - The authenticated user's ID
 * @param {string} subscriptionId - The subscription document ID
 * @param {Object} subscriptionData - The updated subscription data
 */
export const updateSubscription = async (userId, subscriptionId, subscriptionData) => {
  const subscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  const { id: _id, ...dataWithoutId } = subscriptionData;

  await updateDoc(subscriptionRef, {
    ...dataWithoutId,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Delete a subscription from Firestore
 * @param {string} userId - The authenticated user's ID
 * @param {string} subscriptionId - The subscription document ID
 */
export const deleteSubscription = async (userId, subscriptionId) => {
  const subscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  await deleteDoc(subscriptionRef);
};
