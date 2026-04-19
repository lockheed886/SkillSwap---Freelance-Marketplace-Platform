// client/src/pages/notifications/NotificationsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { formatDate, timeAgo } from '../../utils/displayHelpers';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (filter === 'unread') params.isRead = false;
      if (filter === 'read') params.isRead = true;
      
      const data = await notificationService.getUserNotifications(params);
      setNotifications(data.docs || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch notifications: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read: ' + (err.message || 'Unknown error'));
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (err) {
      setError('Failed to mark all notifications as read: ' + (err.message || 'Unknown error'));
      console.error(err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteUserNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      setError('Failed to delete notification: ' + (err.message || 'Unknown error'));
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project_posted':
      case 'project_updated':
      case 'project_cancelled':
      case 'project_completed':
        return '📋';
      case 'bid_accepted':
      case 'bid_rejected':
      case 'counter_offer_received':
        return '💰';
      case 'new_message':
        return '💬';
      case 'verification_approved':
      case 'verification_rejected':
      case 'verification_required':
        return '🔐';
      case 'platform_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex space-x-2">
          <Link to="/notifications/preferences" className="bg-indigo-600 text-white px-4 py-2 rounded">
            Notification Preferences
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Your Notifications</h2>
            <p className="mt-1 text-sm text-gray-500">
              Stay updated with your projects, bids, and messages.
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <button
              onClick={handleMarkAllAsRead}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200"
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 bg-gray-50">
            <p className="text-gray-500">No notifications found.</p>
          </div>
        ) : (
          <div>
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`p-4 ${!notification.isRead ? 'bg-indigo-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                        {notification.link && (
                          <Link
                            to={notification.link}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                            onClick={() => {
                              if (!notification.isRead) {
                                handleMarkAsRead(notification._id);
                              }
                            }}
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(page * 10, (totalPages - 1) * 10 + notifications.length)}
                      </span>{' '}
                      of <span className="font-medium">{(totalPages - 1) * 10 + notifications.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>
                      {[...Array(totalPages).keys()].map((i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            page === i + 1
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
