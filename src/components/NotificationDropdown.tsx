import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, Radio, ExternalLink, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const NotificationDropdown: React.FC = () => {
  const {
    alerts,
    unreadCount,
    markAlertAsRead,
    clearAllAlerts,
    permission,
    requestPermission,
    testNotification,
    isSupported,
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatTimestamp = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#A5B1C2] hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00B7FF] text-[9px] font-bold text-[#080B12]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#101722] border border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-white">Match Alerts</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold text-[#00B7FF] bg-[#00B7FF]/10 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {alerts.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllAlerts}
                  title="Clear all alerts"
                  className="text-xs text-[#A5B1C2] hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#A5B1C2] hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Permission Prompt Banner if default */}
          {isSupported && permission !== 'granted' && (
            <div className="bg-[#151E2B] p-3 border-b border-white/10 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between text-[#A5B1C2]">
                <span>Desktop notifications are {permission === 'denied' ? 'blocked' : 'off'}.</span>
              </div>
              {permission === 'default' && (
                <button
                  type="button"
                  onClick={async () => {
                    await requestPermission();
                  }}
                  className="w-full py-1.5 rounded-lg bg-[#00B7FF] text-[#080B12] font-semibold text-xs text-center hover:bg-[#33C5FF] transition-colors"
                >
                  Enable Desktop Alerts
                </button>
              )}
              {permission === 'denied' && (
                <p className="text-[11px] text-[#A5B1C2]">
                  Please allow notifications in your browser site settings to receive live match popups.
                </p>
              )}
            </div>
          )}

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => markAlertAsRead(alert.id)}
                  className={`p-4 transition-colors hover:bg-white/5 flex gap-3 ${
                    alert.read ? 'opacity-70' : 'bg-[#151E2B]/40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16D98A]/10 text-[#16D98A]">
                      <Radio className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-white truncate">
                        {alert.title}
                      </h4>
                      <span className="text-[10px] text-[#A5B1C2] shrink-0 font-mono">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-[#A5B1C2] leading-snug line-clamp-2">
                      {alert.body}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <Link
                        to={alert.slug ? `/events/${alert.slug}` : '/live'}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00B7FF] hover:underline"
                      >
                        Watch Match <ExternalLink className="w-3 h-3" />
                      </Link>

                      {!alert.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00B7FF]" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#A5B1C2]">
                <Bell className="w-8 h-8 text-[#A5B1C2]/40 mx-auto mb-2" />
                <p className="font-semibold text-white">No alerts yet</p>
                <p className="mt-1">
                  You'll be alerted whenever matches involving your favorite teams start live.
                </p>
              </div>
            )}
          </div>

          {/* Footer with Test button */}
          <div className="p-3 bg-[#151E2B] border-t border-white/10 flex items-center justify-between text-xs text-[#A5B1C2]">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="hover:text-white font-medium"
            >
              Notification Settings
            </Link>
            <button
              type="button"
              onClick={testNotification}
              className="text-[#00B7FF] hover:underline font-semibold"
            >
              Send Test Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
