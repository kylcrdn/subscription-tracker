import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { doSignOut } from "../../firebase/auth";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionModal from "./SubscriptionModal";

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Sample subscriptions - you'll later replace this with Firebase data
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      name: "Netflix",
      logo: "NF",
      color: "#E50914",
      dueDate: "7 days from now",
      price: 15.99,
      currency: "€",
      billing: "Monthly",
      category: "Entertainment",
    },
    {
      id: 2,
      name: "Spotify",
      logo: "SP",
      color: "#1DB954",
      dueDate: "3 days from now",
      price: 9.99,
      currency: "€",
      billing: "Monthly",
      category: "Music",
    },
    {
      id: 3,
      name: "Adobe Creative Cloud",
      logo: "AC",
      color: "#FF0000",
      dueDate: "14 days from now",
      price: 54.99,
      currency: "€",
      billing: "Monthly",
      category: "Software",
    },
  ]);

  // Edit a subscription
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  // Calculate total monthly spending
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    if (sub.billing === "Monthly") return sum + sub.price;
    if (sub.billing === "Yearly") return sum + sub.price / 12;
    return sum;
  }, 0);

  // Calculate total yearly spending
  const totalYearly = subscriptions.reduce((sum, sub) => {
    if (sub.billing === "Monthly") return sum + sub.price * 12;
    if (sub.billing === "Yearly") return sum + sub.price;
    return sum;
  }, 0);

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAddSubscription = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDeleteSubscription = (subscription) => {
    if (
      window.confirm(`Are you sure you want to delete ${subscription.name}?`)
    ) {
      setSubscriptions((prev) =>
        prev.filter((item) => item.id !== subscription.id)
      );
    }
  };

  const handleSaveSubscription = (subscriptionData) => {
    if (editingSubscription) {
      // Update existing subscription
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === editingSubscription.id ? subscriptionData : sub
        )
      );
    } else {
      // Add new subscription
      setSubscriptions((prev) => [...prev, subscriptionData]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                SubTracker
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {currentUser?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-200 hover:bg-gray-800/50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Monthly */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                Monthly
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{totalMonthly.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {subscriptions.length} active subscription
              {subscriptions.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Total Yearly */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                Yearly
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{totalYearly.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              €{(totalYearly / 12).toFixed(2)} per month average
            </div>
          </div>

          {/* Add New Button */}
          <button
            onClick={handleAddSubscription}
            className="bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border border-blue-400/20 rounded-2xl p-6 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-white font-semibold">Add Subscription</span>
              <span className="text-blue-100 text-sm mt-1">
                Track a new service
              </span>
            </div>
          </button>
        </div>

        {/* Subscriptions List */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Your Subscriptions
          </h2>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No subscriptions yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start tracking your subscriptions to see your spending insights
            </p>
            <button
              onClick={handleAddSubscription}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Your First Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={handleEditSubscription}
                onDelete={handleDeleteSubscription}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSubscription}
        subscription={editingSubscription}
      />
    </div>
  );
}
