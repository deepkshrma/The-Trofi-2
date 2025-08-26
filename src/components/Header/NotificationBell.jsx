import React, { useState, useEffect, useRef } from "react";
import { GoBellFill } from "react-icons/go";

function NotificationBell() {
  const [count, setCount] = useState(9);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    "New user registered",
    "System update available",
    "You have a new message",
  ]);

  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const clearNotifications = () => {
    setCount(0);
    setNotifications([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell with badge */}
      <div onClick={toggleDropdown} className="cursor-pointer relative">
        {count > 0 && (
          <div
            className="flex justify-center items-center w-[15px] h-[15px] 
              bg-red-500 absolute right-0 rounded-xl 
              text-white text-[11px] z-10"
          >
            {count}
          </div>
        )}

        <GoBellFill
          className="w-7 h-7 text-blue-500 
            transition-transform duration-200 
            hover:scale-110 hover:rotate-6 hover:drop-shadow-lg"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl z-20 
             border border-orange-100 flex flex-col"
        >
          {/* Header with Clear All */}
          {notifications.length > 0 && (
            <div className="border-b border-orange-100 bg-orange-50 rounded-t-xl px-4 py-2 flex justify-end">
              <button
                onClick={clearNotifications}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Notifications list */}
          <ul className="max-h-64 overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              notifications.map((note, index) => (
                <li
                  key={index}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                >
                  {note}
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                No notifications
              </li>
            )}
          </ul>

          {/* Footer with Show All */}
          {notifications.length > 0 && (
            <div className="border-t border-orange-100 bg-orange-50 rounded-b-xl px-4 py-2 flex justify-center">
              <button
                onClick={() => alert("Navigate to All Notifications Page")}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                Show All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
