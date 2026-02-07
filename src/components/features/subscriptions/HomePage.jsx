import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { doSignOut } from "../../../firebase/auth";
import { useSubscriptions } from "../../../hooks/useSubscriptions";
import { useSubscriptionFilters } from "../../../hooks/useSubscriptionFilters";
import { useSubscriptionStats } from "../../../hooks/useSubscriptionStats";
import { useScrollToTop } from "../../../hooks/useScrollToTop";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionModal from "./SubscriptionModal";
import ConfirmDialog from "../../common/ConfirmDialog";
const CategoryPieChartModal = lazy(() => import("./CategoryPieChartModal"));
const MonthlyExpensesChartModal = lazy(() => import("./MonthlyExpensesChartModal"));
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

const StatCard = ({ label, value, subtitle, icon, hoverColor, onClick }) => {
  const colors = colorStyles[hoverColor] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={`bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 ${colors.border} transition-all duration-300 ${onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""}`}
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

  // Custom hooks
  const { subscriptions, loading, handleAdd, handleUpdate, handleDelete, handleBulkDelete } =
    useSubscriptions(currentUser?.uid);
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, uniqueCategories, filteredSubscriptions } =
    useSubscriptionFilters(subscriptions);
  const { totalMonthly, totalYearly, categoryData, monthlyExpensesData } =
    useSubscriptionStats(subscriptions);
  const { showScrollTop, scrollToTop } = useScrollToTop();

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showCategoryChart, setShowCategoryChart] = useState(false);
  const [showYearlyChart, setShowYearlyChart] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    subscription: null,
  });

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

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      subscription: null,
    });
  };

  const toggleSelectId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const openBulkDeleteDialog = () => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({
      isOpen: true,
      subscription: { id: "__bulk__", name: `${selectedIds.size} subscription${selectedIds.size > 1 ? "s" : ""}` },
    });
  };

  const confirmDelete = async () => {
    const sub = confirmDialog.subscription;
    if (!sub) return;

    if (sub.id === "__bulk__") {
      try {
        await handleBulkDelete(selectedIds);
        exitSelectionMode();
      } catch (error) {
        console.error("Error deleting subscriptions:", error);
        toast.error("Failed to delete some subscriptions.");
      }
      return;
    }

    try {
      await handleDelete(sub.id, sub.name);
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Failed to delete subscription. Please try again.");
    }
  };

  const handleSaveSubscription = async (subscriptionData) => {
    try {
      if (editingSubscription) {
        await handleUpdate(editingSubscription.id, subscriptionData);
      } else {
        await handleAdd(subscriptionData);
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
            subtitle="Click to view category split"
            icon={<CurrencyIcon />}
            hoverColor="blue"
            onClick={() => setShowCategoryChart(true)}
          />
          <StatCard
            label="Yearly"
            value={`€${totalYearly.toFixed(2)}`}
            subtitle="Click to view monthly trend"
            icon={<ChartIcon />}
            hoverColor="cyan"
            onClick={() => setShowYearlyChart(true)}
          />
          <StatCard
            label="Active Subs"
            value={subscriptions.length}
            icon={<DocumentIcon />}
            hoverColor="purple"
          />
        </div>

        {/* Subscriptions List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Your Subscriptions
          </h2>
          {!selectionMode && filteredSubscriptions.length > 0 && (
            <button
              onClick={() => setSelectionMode(true)}
              className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              aria-label="Select subscriptions to delete"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
          {selectionMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {selectedIds.size} selected
              </span>
              <button
                onClick={openBulkDeleteDialog}
                disabled={selectedIds.size === 0}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={exitSelectionMode}
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

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
                selectionMode={selectionMode}
                selected={selectedIds.has(subscription.id)}
                onToggleSelect={toggleSelectId}
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

      {showCategoryChart && (
        <Suspense fallback={null}>
          <CategoryPieChartModal
            isOpen={showCategoryChart}
            onClose={() => setShowCategoryChart(false)}
            categoryData={categoryData}
          />
        </Suspense>
      )}

      {showYearlyChart && (
        <Suspense fallback={null}>
          <MonthlyExpensesChartModal
            isOpen={showYearlyChart}
            onClose={() => setShowYearlyChart(false)}
            monthlyData={monthlyExpensesData}
            totalYearly={totalYearly}
          />
        </Suspense>
      )}

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
