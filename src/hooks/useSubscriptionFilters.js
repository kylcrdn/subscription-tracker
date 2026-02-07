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
