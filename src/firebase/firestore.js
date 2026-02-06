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
  where,
  writeBatch,
  getDocs,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./Firebase";

// ============= USER PROFILE FUNCTIONS =============

/**
 * Create or update user profile in Firestore
 * This should be called when a user signs up or signs in for the first time
 * @param {string} userId - The authenticated user's ID
 * @param {Object} userData - User data (email, displayName, etc.)
 */
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);

    // Check if user already exists
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        email: userData.email || null,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        emailNotifications: true, // Enable email notifications by default
        reminderDays: 3, // Default to 3 days before renewal
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`User profile created for ${userId}`);
    } else {
      // Update existing user profile with latest data
      await updateDoc(userRef, {
        email: userData.email || userSnap.data().email,
        displayName: userData.displayName || userSnap.data().displayName,
        photoURL: userData.photoURL || userSnap.data().photoURL,
        updatedAt: serverTimestamp(),
      });
      console.log(`User profile updated for ${userId}`);
    }
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string} userId - The authenticated user's ID
 * @returns {Object|null} User profile data or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Update user notification preferences
 * @param {string} userId - The authenticated user's ID
 * @param {Object} preferences - Notification preferences
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...preferences,
      updatedAt: serverTimestamp(),
    });
    console.log(`User preferences updated for ${userId}`);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

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

  // Generate notification for this subscription (don't fail if this errors)
  try {
    await generateNotification(userId, {
      ...dataWithoutId,
      id: docRef.id,
    });
  } catch (error) {
    console.warn("Could not generate notification for subscription:", error);
    // Don't throw - subscription creation succeeded
  }

  return docRef.id;
};

/**
 * Update an existing subscription in Firestore
 * @param {string} userId - The authenticated user's ID
 * @param {string} subscriptionId - The subscription document ID
 * @param {Object} subscriptionData - The updated subscription data
 */
export const updateSubscription = async (
  userId,
  subscriptionId,
  subscriptionData
) => {
  const subscriptionRef = doc(
    db,
    "users",
    userId,
    "subscriptions",
    subscriptionId
  );
  const { id: _id, ...dataWithoutId } = subscriptionData;

  await updateDoc(subscriptionRef, {
    ...dataWithoutId,
    updatedAt: new Date().toISOString(),
  });

  // Delete old notifications and generate new ones (don't fail if this errors)
  try {
    await deleteNotificationsBySubscription(userId, subscriptionId);
    await generateNotification(userId, {
      ...dataWithoutId,
      id: subscriptionId,
    });
  } catch (error) {
    console.warn("Could not update notifications for subscription:", error);
    // Don't throw - subscription update succeeded
  }
};

/**
 * Delete a subscription from Firestore
 * @param {string} userId - The authenticated user's ID
 * @param {string} subscriptionId - The subscription document ID
 */
export const deleteSubscription = async (userId, subscriptionId) => {
  const subscriptionRef = doc(
    db,
    "users",
    userId,
    "subscriptions",
    subscriptionId
  );
  await deleteDoc(subscriptionRef);

  // Delete associated notifications (don't fail if this errors)
  try {
    await deleteNotificationsBySubscription(userId, subscriptionId);
  } catch (error) {
    console.warn("Could not delete notifications for subscription:", error);
    // Don't throw - subscription deletion succeeded
  }
};

// ============= NOTIFICATION FUNCTIONS =============

/**
 * Get reference to a user's notifications collection
 * @param {string} userId - The authenticated user's ID
 * @returns {CollectionReference} Firestore collection reference
 */
const getUserNotificationsRef = (userId) => {
  return collection(db, "users", userId, "notifications");
};

/**
 * Calculate the next renewal date for a subscription
 * @param {string} dueDate - The subscription start date
 * @param {string} billing - Monthly or Yearly
 * @returns {Date} The next renewal date
 */
export const calculateNextRenewal = (dueDate, billing) => {
  const startDate = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);

  let nextRenewal = new Date(startDate);

  if (billing === "Monthly") {
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    while (nextRenewal <= today) {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }
  } else if (billing === "Yearly") {
    nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    while (nextRenewal <= today) {
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    }
  }

  return nextRenewal;
};

/**
 * Generate notification for a subscription
 * @param {string} userId - The authenticated user's ID
 * @param {Object} subscription - The subscription data
 * @param {number} notifyDaysBefore - Days before renewal to notify (default: 3)
 */
export const generateNotification = async (
  userId,
  subscription,
  notifyDaysBefore = 7
) => {
  const renewalDate = calculateNextRenewal(
    subscription.dueDate,
    subscription.billing
  );

  // Calculate sendAt = renewalDate - notifyDaysBefore
  const sendAt = new Date(renewalDate);
  sendAt.setDate(sendAt.getDate() - notifyDaysBefore);

  const notificationsRef = getUserNotificationsRef(userId);

  await addDoc(notificationsRef, {
    subscriptionId: subscription.id,
    subscriptionName: subscription.name,
    dueDate: subscription.dueDate, // Store for recalculation
    billing: subscription.billing, // Store for recalculation
    renewalDate: renewalDate.toISOString(),
    sendAt: sendAt.toISOString(),
    notifyDaysBefore,
    read: false,
    dismissed: false,
    createdAt: new Date().toISOString(),
  });
};

/**
 * Subscribe to real-time notifications for a user
 * @param {string} userId - The authenticated user's ID
 * @param {Function} onSuccess - Callback with notifications array
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = (userId, onSuccess) => {
  const notificationsRef = getUserNotificationsRef(userId);
  const today = new Date().toISOString();

  // Get notifications that should be sent today or earlier and not dismissed
  const q = query(
    notificationsRef,
    where("dismissed", "==", false),
    where("sendAt", "<=", today)
    // Temporarily removed orderBy to test if basic query works
    // orderBy("sendAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
    // Sort in JavaScript instead
    notifications.sort((a, b) => new Date(b.sendAt) - new Date(a.sendAt));
    onSuccess(notifications);
  });
};

/**
 * Mark a notification as read
 * @param {string} userId - The authenticated user's ID
 * @param {string} notificationId - The notification document ID
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  const notificationRef = doc(
    db,
    "users",
    userId,
    "notifications",
    notificationId
  );
  await updateDoc(notificationRef, {
    read: true,
    readAt: new Date().toISOString(),
  });
};

/**
 * Dismiss a notification
 * @param {string} userId - The authenticated user's ID
 * @param {string} notificationId - The notification document ID
 */
export const dismissNotification = async (userId, notificationId) => {
  const notificationRef = doc(
    db,
    "users",
    userId,
    "notifications",
    notificationId
  );
  await updateDoc(notificationRef, {
    dismissed: true,
    dismissedAt: new Date().toISOString(),
  });
};

/**
 * Delete all notifications for a specific subscription
 * @param {string} userId - The authenticated user's ID
 * @param {string} subscriptionId - The subscription document ID
 */
const deleteNotificationsBySubscription = async (userId, subscriptionId) => {
  try {
    const notificationsRef = getUserNotificationsRef(userId);
    const q = query(
      notificationsRef,
      where("subscriptionId", "==", subscriptionId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return; // No notifications to delete
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error deleting notifications:", error);
    // Re-throw to be handled by caller if needed
    throw error;
  }
};
