import { useState } from "react";

export default function SubscriptionCard({ subscription, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get initials from subscription name for fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between hover:bg-gray-800 transition-colors">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg w-12 h-12 flex items-center justify-center overflow-hidden bg-gray-700">
          {subscription.icon && !imageError ? (
            <img
              src={subscription.icon}
              alt={`${subscription.name} icon`}
              className="w-full h-full object-contain bg-white"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-white font-bold text-sm">
              {getInitials(subscription.name)}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-white font-medium">{subscription.name}</h3>
          <p className="text-gray-400 text-sm">{subscription.dueDate}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white font-semibold">
            €{subscription.price.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm">{subscription.billing}</p>
        </div>

        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 text-xl leading-none"
            aria-label="Menu"
          >
            ⋮
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => {
                    onEdit(subscription);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(subscription);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
