import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { doSignOut } from "../../firebase/auth";
import {
  subscribeToSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} from "../../firebase/firestore";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionModal from "./SubscriptionModal";

const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
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
);

const CurrencyIcon = () => (
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
);

const ChartIcon = () => (
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
);

const DocumentIcon = () => (
  <svg
    className="w-4 h-4 text-purple-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const InboxIcon = () => (
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
);

const ArrowUpIcon = () => (
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
      d="M5 15l7-7 7 7"
    />
  </svg>
);

const StatCard = ({ label, value, subtitle, icon, hoverColor }) => (
  <div
    className={`bg-linear-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-${hoverColor}-500/30 transition-all duration-300`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">
        {label}
      </span>
      <div
        className={`w-8 h-8 rounded-lg bg-${hoverColor}-500/10 flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
  </div>
);

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToSubscriptions(currentUser.uid, (subs) => {
      setSubscriptions(subs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) return subscriptions;
    const query = searchQuery.toLowerCase();
    return subscriptions.filter((sub) =>
      sub.name?.toLowerCase().includes(query),
    );
  }, [subscriptions, searchQuery]);

  const { totalMonthly, totalYearly } = useMemo(() => {
    const monthly = subscriptions.reduce((sum, sub) => {
      if (sub.billing === "Monthly") return sum + sub.price;
      if (sub.billing === "Yearly") return sum + sub.price / 12;
      return sum;
    }, 0);

    const yearly = subscriptions.reduce((sum, sub) => {
      if (sub.billing === "Monthly") return sum + sub.price * 12;
      if (sub.billing === "Yearly") return sum + sub.price;
      return sum;
    }, 0);

    return { totalMonthly: monthly, totalYearly: yearly };
  }, [subscriptions]);

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const openModal = (subscription = null) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
  };

  const handleDeleteSubscription = async (subscription) => {
    if (
      !window.confirm(`Are you sure you want to delete ${subscription.name}?`)
    )
      return;

    try {
      await deleteSubscription(currentUser.uid, subscription.id);
    } catch (error) {
      console.error("Error deleting subscription:", error);
    }
  };

  const handleSaveSubscription = async (subscriptionData) => {
    try {
      if (editingSubscription) {
        await updateSubscription(
          currentUser.uid,
          editingSubscription.id,
          subscriptionData,
        );
      } else {
        await addSubscription(currentUser.uid, subscriptionData);
      }
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                SubTracker
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {currentUser?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-blue-500/50 hover:border-cyan-400 rounded-lg transition-all duration-200 hover:bg-gray-800/50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar and Add Button */}
        <div className="flex justify-end gap-3 mb-8">
          <div className="relative w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
          >
            <PlusIcon />
            Add
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Monthly"
            value={`€${totalMonthly.toFixed(2)}`}
            icon={<CurrencyIcon />}
            hoverColor="blue"
          />
          <StatCard
            label="Yearly"
            value={`€${totalYearly.toFixed(2)}`}
            subtitle={`€${(totalYearly / 12).toFixed(2)} per month average`}
            icon={<ChartIcon />}
            hoverColor="cyan"
          />
          <StatCard
            label="Active Subs"
            value={subscriptions.length}
            icon={<DocumentIcon />}
            hoverColor="purple"
          />
        </div>

        {/* Subscriptions List */}
        <h2 className="text-xl font-bold text-white mb-4">
          Your Subscriptions
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
              <InboxIcon />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery
                ? "No matching subscriptions"
                : "No subscriptions yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Start tracking your subscriptions to see your spending insights"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => openModal()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Your First Subscription
              </button>
            )}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 gap-4">
              {filteredSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onEdit={openModal}
                  onDelete={handleDeleteSubscription}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveSubscription}
        subscription={editingSubscription}
      />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-gray-800 hover:bg-gray-700 border border-blue-500/50 hover:border-cyan-400 text-white rounded-full shadow-lg transition-all duration-200 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon />
        </button>
      )}
    </div>
  );
}
