/**
 * Main dashboard page — the core of the application once logged in.
 *
 * Architecture overview:
 *  - Data & CRUD:   useSubscriptions     → real-time Firestore data + add/update/delete handlers
 *  - Filtering:     useSubscriptionFilters → client-side search + category filtering
 *  - Stats:         useSubscriptionStats  → computes totals and chart data (memoized)
 *  - Scroll:        useScrollToTop        → floating "back to top" button
 *
 * UI sections (top to bottom):
 *  1. Sticky header with user email, theme toggle, notification bell, and sign-out button
 *  2. Toolbar with category dropdown, search input, and "Add" button
 *  3. Three stat cards (monthly cost, yearly cost, active count) — clicking opens chart modals
 *  4. Subscription list with per-card edit/delete menus and optional bulk-select mode
 *  5. Modals: SubscriptionModal (add/edit), CategoryPieChartModal, MonthlyExpensesChartModal, ConfirmDialog
 *
 * Chart modals are lazy-loaded (React.lazy + Suspense) to keep the initial bundle small.
 */
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
const SubscriptionOverviewModal = lazy(() => import("./SubscriptionOverviewModal"));
import NotificationBell from "./NotificationBell";
import ThemeToggle from "../../common/ThemeToggle";
import Icon from "../../common/Icon";
import toast from "react-hot-toast";
import "./subscriptions.css";

const SearchIcon = () => (
  <Icon className="ui-icon">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </Icon>
);

const PlusIcon = ({ className = "ui-icon" }) => (
  <Icon className={className}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

const CurrencyIcon = () => (
  <Icon className="ui-icon dashboard-icon--emerald">
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-3 1-3 2.5s1.5 2 3 2.5c1.5.5 3 1 3 2.5s-1.5 2.5-3 2.5c-1 0-2-.5-2.5-1.5" />
    <path d="M12 6v2M12 16v2" />
  </Icon>
);

const ChartIcon = () => (
  <Icon className="ui-icon dashboard-icon--green">
    <path d="M4 20h16" />
    <path d="M4 20V10l4-6 4 8 4-4 4 6v6" />
  </Icon>
);

const DocumentIcon = () => (
  <Icon className="ui-icon dashboard-icon--teal">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
    <path d="M14 2v6h6M8 13h8M8 17h8" />
  </Icon>
);

const InboxIcon = () => (
  <Icon className="dashboard-empty-state__icon">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </Icon>
);

const ArrowUpIcon = () => (
  <Icon className="ui-icon">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
);

const colorStyles = {
  emerald: {
    accent: "dashboard-stat-card__accent--emerald",
    iconText: "dashboard-stat-card__icon--emerald",
    valueText: "dashboard-stat-card__value--emerald",
  },
  green: {
    accent: "dashboard-stat-card__accent--green",
    iconText: "dashboard-stat-card__icon--green",
    valueText: "dashboard-stat-card__value--green",
  },
  teal: {
    accent: "dashboard-stat-card__accent--teal",
    iconText: "dashboard-stat-card__icon--teal",
    valueText: "dashboard-stat-card__value--teal",
  },
};

/** Reusable stat card shown in the dashboard grid. Optionally clickable to open a chart modal. */
const StatCard = ({ label, value, subtitle, icon, hoverColor, onClick }) => {
  const colors = colorStyles[hoverColor] || colorStyles.emerald;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={`dashboard-stat-card${onClick ? " dashboard-stat-card--interactive" : ""}`}
    >
      <div className={`dashboard-stat-card__accent ${colors.accent}`} />
      <div className="dashboard-stat-card__header">
        <span className="dashboard-stat-card__label">
          {label}
        </span>
        <div className={colors.iconText}>
          {icon}
        </div>
      </div>
      <div className={`dashboard-stat-card__value ${colors.valueText}`}>
        {value}
      </div>
      {subtitle && <div className="dashboard-stat-card__subtitle">{subtitle}</div>}
    </div>
  );
};

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Data hooks — each hook has a single responsibility (see hooks/ folder for details)
  const { subscriptions, loading, handleAdd, handleUpdate, handleDelete, handleBulkDelete } =
    useSubscriptions(currentUser?.uid);
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, uniqueCategories, filteredSubscriptions } =
    useSubscriptionFilters(subscriptions);
  const { totalMonthly, totalYearly, categoryData, monthlyExpensesData } =
    useSubscriptionStats(subscriptions);
  const { showScrollTop, scrollToTop } = useScrollToTop();

  // Local UI state for modals, selection mode, and confirm dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showCategoryChart, setShowCategoryChart] = useState(false);
  const [showYearlyChart, setShowYearlyChart] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
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

  // Handles both single and bulk deletes — distinguished by the sentinel id "__bulk__"
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
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__content">
          <div className="dashboard-header__row">
            <div>
              <h1 className="dashboard-brand">
                SubTracker
              </h1>
              <p className="dashboard-header__email">
                {currentUser?.email}
              </p>
            </div>
            <div className="dashboard-header__actions">
              <NotificationBell userId={currentUser?.uid} />
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="ui-button ui-button--quiet"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Search Bar, Category Filter and Add Button */}
        <div className="dashboard-toolbar">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ui-select dashboard-toolbar__select"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="dashboard-search">
            <div className="dashboard-search__icon">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ui-input dashboard-search__input"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="ui-button ui-button--primary dashboard-toolbar__add"
          >
            <PlusIcon />
            Add
          </button>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <StatCard
            label="Monthly"
            value={`€${totalMonthly.toFixed(2)}`}
            subtitle="Click to view category split"
            icon={<CurrencyIcon />}
            hoverColor="emerald"
            onClick={() => setShowCategoryChart(true)}
          />
          <StatCard
            label="Yearly"
            value={`€${totalYearly.toFixed(2)}`}
            subtitle="Click to view monthly trend"
            icon={<ChartIcon />}
            hoverColor="green"
            onClick={() => setShowYearlyChart(true)}
          />
          <StatCard
            label="Active Subs"
            value={subscriptions.length}
            subtitle="Click to view overview"
            icon={<DocumentIcon />}
            hoverColor="teal"
            onClick={() => setShowOverview(true)}
          />
        </div>

        {/* Subscriptions List */}
        <div className="dashboard-list-heading">
          <h2>
            Your Subscriptions
          </h2>
          {!selectionMode && filteredSubscriptions.length > 0 && (
            <button
              onClick={() => setSelectionMode(true)}
              className="ui-icon-button dashboard-list-heading__select"
              aria-label="Select subscriptions to delete"
            >
              <svg className="ui-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
          {selectionMode && (
            <div className="dashboard-list-heading__selection-actions">
              <span className="ui-muted">
                {selectedIds.size} selected
              </span>
              <button
                onClick={openBulkDeleteDialog}
                disabled={selectedIds.size === 0}
                className="ui-button ui-button--danger dashboard-selection-button"
              >
                Delete
              </button>
              <button
                onClick={exitSelectionMode}
                className="ui-button ui-button--quiet dashboard-selection-button"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="ui-spinner" />
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-state__illustration">
              <InboxIcon />
            </div>
            <h3 className="dashboard-empty-state__title">
              {searchQuery
                ? "No matching subscriptions"
                : "No subscriptions yet"}
            </h3>
            <p className="dashboard-empty-state__description">
              {searchQuery
                ? "Try a different search term"
                : "Start tracking your subscriptions to see your spending insights"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => openModal()}
                className="ui-button ui-button--primary"
              >
                <PlusIcon className="ui-icon dashboard-add-first__icon" />
                Add Your First Subscription
              </button>
            )}
          </div>
        ) : (
          <div className="dashboard-subscription-list">
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

      {showOverview && (
        <Suspense fallback={null}>
          <SubscriptionOverviewModal
            isOpen={showOverview}
            onClose={() => setShowOverview(false)}
            subscriptions={subscriptions}
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
          className="ui-icon-button dashboard-scroll-top"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon />
        </button>
      )}
    </div>
  );
}
