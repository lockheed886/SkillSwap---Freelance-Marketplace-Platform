// client/src/pages/notifications/NotificationPreferences.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    email: {
      projectUpdates: true,
      bidUpdates: true,
      messages: true,
      platformAnnouncements: true
    },
    inApp: {
      projectUpdates: true,
      bidUpdates: true,
      messages: true,
      platformAnnouncements: true
    },
    sms: {
      projectUpdates: false,
      bidUpdates: false,
      messages: false,
      platformAnnouncements: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotificationPreferences();
      setPreferences(data);
    } catch (err) {
      setError('Failed to fetch notification preferences: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (channel, type) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await notificationService.updateNotificationPreferences(preferences);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update notification preferences: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2">Loading your notification preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <Link to="/notifications" className="bg-gray-500 text-white px-4 py-2 rounded">
          Back to Notifications
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          Your notification preferences have been updated successfully!
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Manage Your Notification Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose how and when you want to receive notifications.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notification Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In-App
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Project Updates</div>
                  <div className="text-xs text-gray-500">
                    New projects, status changes, milestones
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.inApp.projectUpdates}
                      onChange={() => handleToggle('inApp', 'projectUpdates')}
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.email.projectUpdates}
                      onChange={() => handleToggle('email', 'projectUpdates')}
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.sms.projectUpdates}
                      onChange={() => handleToggle('sms', 'projectUpdates')}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Bid Updates</div>
                  <div className="text-xs text-gray-500">
                    New bids, bid responses, counter offers
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.inApp.bidUpdates}
                      onChange={() => handleToggle('inApp', 'bidUpdates')}
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.email.bidUpdates}
                      onChange={() => handleToggle('email', 'bidUpdates')}
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.sms.bidUpdates}
                      onChange={() => handleToggle('sms', 'bidUpdates')}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Messages</div>
                  <div className="text-xs text-gray-500">
                    New messages, chat notifications
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.inApp.messages}
                      onChange={() => handleToggle('inApp', 'messages')}
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.email.messages}
                      onChange={() => handleToggle('email', 'messages')}
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.sms.messages}
                      onChange={() => handleToggle('sms', 'messages')}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Platform Announcements</div>
                  <div className="text-xs text-gray-500">
                    Updates, new features, maintenance
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.inApp.platformAnnouncements}
                      onChange={() => handleToggle('inApp', 'platformAnnouncements')}
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.email.platformAnnouncements}
                      onChange={() => handleToggle('email', 'platformAnnouncements')}
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600"
                      checked={preferences.sms.platformAnnouncements}
                      onChange={() => handleToggle('sms', 'platformAnnouncements')}
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-4 py-4 sm:px-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
