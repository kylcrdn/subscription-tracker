/**
 * Hook for subscription data and CRUD operations.
 *
 * Responsibilities:
 *  - Sets up a real-time Firestore listener so subscription data stays in sync.
 *  - Provides add / update / delete / bulk-delete handlers that write to Firestore
 *    and show toast notifications on success.
 *  - Triggers Discord webhook checks each time subscription data changes
 *    (see services/discord.js).
 *
 * Used exclusively by HomePage.
 */
import { useState, useEffect } from "react";
import {
  subscribeToSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} from "../firebase/firestore";
import { checkAndNotifyDiscord } from "../services/discord";
import toast from "react-hot-toast";

export function useSubscriptions(userId) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates from Firestore.
  // The callback fires immediately with current data, then again on every change.
  // Discord notifications are checked on each update (deduplication is handled internally).
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToSubscriptions(userId, (subs) => {
      setSubscriptions(subs);
      setLoading(false);
      checkAndNotifyDiscord(subs);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAdd = async (subscriptionData) => {
    await addSubscription(userId, subscriptionData);
    toast.success(`${subscriptionData.name} added successfully!`);
  };

  const handleUpdate = async (subscriptionId, subscriptionData) => {
    await updateSubscription(userId, subscriptionId, subscriptionData);
    toast.success(`${subscriptionData.name} updated successfully!`);
  };

  const handleDelete = async (subscriptionId, name) => {
    await deleteSubscription(userId, subscriptionId);
    toast.success(`${name} deleted successfully!`);
  };

  const handleBulkDelete = async (ids) => {
    await Promise.all(
      Array.from(ids).map((id) => deleteSubscription(userId, id)),
    );
    toast.success(
      `${ids.size} subscription${ids.size > 1 ? "s" : ""} deleted!`,
    );
  };

  return { subscriptions, loading, handleAdd, handleUpdate, handleDelete, handleBulkDelete };
}
