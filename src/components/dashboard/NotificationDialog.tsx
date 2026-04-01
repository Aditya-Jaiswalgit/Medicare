import React, { useState } from "react";
import {
  Bell,
  X,
  UserPlus,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function NotificationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      title: "New Appointment Request",
      message: "Sarah Miller requested an appointment for Feb 12, 2:00 PM",
      time: "5 min ago",
      unread: true,
      icon: "calendar",
    },
    {
      id: 2,
      type: "patient",
      title: "New Patient Registration",
      message:
        "Michael Chen completed registration and uploaded insurance documents",
      time: "15 min ago",
      unread: true,
      icon: "user",
    },
    {
      id: 3,
      type: "report",
      title: "Lab Results Available",
      message: "Lab results for John Anderson are ready for review",
      time: "1 hour ago",
      unread: true,
      icon: "file",
    },
    {
      id: 4,
      type: "alert",
      title: "Appointment Cancellation",
      message:
        "David Wilson cancelled his appointment scheduled for today at 3:00 PM",
      time: "2 hours ago",
      unread: false,
      icon: "alert",
    },
    {
      id: 5,
      type: "success",
      title: "Payment Received",
      message: "Payment of $250 received from Emily Chen",
      time: "3 hours ago",
      unread: false,
      icon: "check",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const clearAll = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const getIcon = (iconType) => {
    const iconProps = { size: 20, className: "flex-shrink-0" };
    switch (iconType) {
      case "calendar":
        return <Calendar {...iconProps} className="text-blue-500" />;
      case "user":
        return <UserPlus {...iconProps} className="text-green-500" />;
      case "file":
        return <FileText {...iconProps} className="text-purple-500" />;
      case "alert":
        return <AlertCircle {...iconProps} className="text-orange-500" />;
      case "check":
        return <CheckCircle {...iconProps} className="text-teal-500" />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dialog */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <div className="fixed md:absolute inset-x-4 md:inset-x-auto top-20 md:top-12 md:right-0 mx-auto md:mx-0 w-auto md:w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-[calc(100vh-6rem)] md:max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Notifications
                </h3>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-gray-400 text-sm mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        notification.unread ? "bg-blue-50" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(notification.icon)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                              aria-label="Remove notification"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {notification.time}
                            </span>
                            {notification.unread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <button className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors py-1">
                  View All Notifications
                </button>
              </div>
            )} */}
          </div>
        </>
      )}
    </div>
  );
}
