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
