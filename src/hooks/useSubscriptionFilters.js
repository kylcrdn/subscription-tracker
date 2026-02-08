/**
 * Hook for client-side search and category filtering.
 * All filtering is done in memory (via useMemo) — no extra Firestore queries needed.
 *
 * Returns:
 *  - searchQuery / setSearchQuery — text input state for name search
 *  - selectedCategory / setSelectedCategory — dropdown state ("all" or a category name)
 *  - uniqueCategories — sorted list of all categories present in the data (for the dropdown)
 *  - filteredSubscriptions — the subscriptions list after both filters are applied
 */
import { useState, useMemo } from "react";

export function useSubscriptionFilters(subscriptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const uniqueCategories = useMemo(() => {
    const categories = new Set(
      subscriptions
        .map((sub) => sub.category?.trim())
        .filter((cat) => cat && cat.length > 0),
    );
    return Array.from(categories).sort();
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (sub) => sub.category?.trim() === selectedCategory,
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sub) =>
        sub.name?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [subscriptions, searchQuery, selectedCategory]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    uniqueCategories,
    filteredSubscriptions,
  };
}
