import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { doSignOut } from "../../../firebase/auth";
import {
  subscribeToSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} from "../../../firebase/firestore";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionModal from "./SubscriptionModal";
import ConfirmDialog from "../../common/ConfirmDialog";
import NotificationBell from "./NotificationBell";
import toast from "react-hot-toast";

const Icon = ({ children, className = "w-4 h-4", ...props }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </Icon>
);

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <Icon className={className}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

const CurrencyIcon = () => (
  <Icon className="w-4 h-4 text-blue-400">
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-3 1-3 2.5s1.5 2 3 2.5c1.5.5 3 1 3 2.5s-1.5 2.5-3 2.5c-1 0-2-.5-2.5-1.5" />
    <path d="M12 6v2M12 16v2" />
  </Icon>
);

const ChartIcon = () => (
  <Icon className="w-4 h-4 text-cyan-400">
    <path d="M4 20h16" />
    <path d="M4 20V10l4-6 4 8 4-4 4 6v6" />
  </Icon>
);

const DocumentIcon = () => (
  <Icon className="w-4 h-4 text-purple-400">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
    <path d="M14 2v6h6M8 13h8M8 17h8" />
  </Icon>
);

const InboxIcon = () => (
  <Icon className="w-8 h-8 text-gray-500">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </Icon>
);

const ArrowUpIcon = () => (
  <Icon className="w-5 h-5">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
);

const colorStyles = {
  blue: {
    border: "hover:border-blue-500/30",
    bg: "bg-blue-500/10",
  },
  cyan: {
    border: "hover:border-cyan-500/30",
    bg: "bg-cyan-500/10",
  },
  purple: {
    border: "hover:border-purple-500/30",
    bg: "bg-purple-500/10",
  },
};

const StatCard = ({ label, value, subtitle, icon, hoverColor }) => {
  const colors = colorStyles[hoverColor] || colorStyles.blue;

  return (
    <div
      className={`bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 ${colors.border} transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
};

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    subscription: null,
  });

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

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (sub) => sub.category?.trim() === selectedCategory,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sub) =>
        sub.name?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [subscriptions, searchQuery, selectedCategory]);

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

  const handleDeleteSubscription = (subscription) => {
    setConfirmDialog({
      isOpen: true,
      subscription,
    });
  };

  const confirmDelete = async () => {
    const subscription = confirmDialog.subscription;
    if (!subscription) return;

    try {
      await deleteSubscription(currentUser.uid, subscription.id);
      toast.success(`${subscription.name} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Failed to delete subscription. Please try again.");
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      subscription: null,
    });
  };

  const handleSaveSubscription = async (subscriptionData) => {
    try {
      if (editingSubscription) {
        await updateSubscription(
          currentUser.uid,
          editingSubscription.id,
          subscriptionData,
        );
        toast.success(`${subscriptionData.name} updated successfully!`);
      } else {
        await addSubscription(currentUser.uid, subscriptionData);
        toast.success(`${subscriptionData.name} added successfully!`);
      }
    } catch (error) {
      console.error("Error saving subscription:", error);
      const action = editingSubscription ? "update" : "add";
      toast.error(`Failed to ${action} subscription. Please try again.`);
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
            <div className="flex items-center gap-3">
              <NotificationBell userId={currentUser?.uid} />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-blue-500/50 hover:border-cyan-400 rounded-lg transition-all duration-200 hover:bg-gray-800/50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar, Category Filter and Add Button */}
        <div className="flex justify-end gap-3 mb-8">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="relative w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search by name"
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
        )}
      </main>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveSubscription}
        subscription={editingSubscription}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDelete}
        title="Delete Subscription"
        message={`Are you sure you want to delete ${confirmDialog.subscription?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
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
