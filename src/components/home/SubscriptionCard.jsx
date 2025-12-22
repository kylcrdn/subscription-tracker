import { useState } from "react";

export default function SubscriptionCard({ subscription, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between hover:bg-gray-800 transition-colors">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 rounded-lg p-2 w-12 h-12 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {subscription.logo}
          </span>
        </div>

        <div>
          <h3 className="text-white font-medium">{subscription.name}</h3>
          <p className="text-gray-400 text-sm">{subscription.dueDate}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white font-semibold">{subscription.price}</p>
          <p className="text-gray-400 text-sm">{subscription.billing}</p>
        </div>

        {/* Three-dot menu (no icon library) */}
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
