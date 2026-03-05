import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  UserPlus,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Define Notification type
interface Notification {
  id: string;
  type: "appointment" | "patient" | "report" | "alert" | "success";
  title: string;
  message: string;
  time: string;
  unread: boolean;
  icon: string;
  createdAt?: string;
}

export default function NotificationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Fetch notifications when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Also fetch on mount for the badge count
  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Optional: Set up polling for real-time updates
      const interval = setInterval(fetchNotifications, 30000); // every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();

      // Transform API response to match component format
      const formattedNotifications = data.map((notif) => ({
        id: notif._id || notif.id,
        type: mapNotificationType(notif.type),
        title: notif.title,
        message: notif.message,
        time: formatTime(notif.createdAt),
        unread: !notif.read,
        icon: mapIconType(notif.type),
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Optimistically update UI
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from UI
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update UI
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Helper functions
  const mapNotificationType = (type: string): string => {
    const typeMap: Record<string, string> = {
      appointment_created: "appointment",
      patient_registered: "patient",
      lab_results_ready: "report",
      appointment_cancelled: "alert",
      payment_received: "success",
    };
    return typeMap[type] || "alert";
  };

  const mapIconType = (type: string): string => {
    const iconMap: Record<string, string> = {
      appointment_created: "calendar",
      patient_registered: "user",
      lab_results_ready: "file",
      appointment_cancelled: "alert",
      payment_received: "check",
    };
    return iconMap[type] || "bell";
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const getIcon = (iconType: string) => {
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
        return <Bell {...iconProps} className="text-gray-500" />;
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
                  {loading
                    ? "Loading..."
                    : unreadCount > 0
                      ? `${unreadCount} unread`
                      : "All caught up!"}
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
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
          </div>
        </>
      )}
    </div>
  );
}
