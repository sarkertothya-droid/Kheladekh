import React from 'react';
import { Bell, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const NotificationPermissionBanner: React.FC = () => {
  const { bannerVisible, requestPermission, dismissBanner, permission, isSupported } =
    useNotification();

  if (!isSupported || !bannerVisible || permission === 'granted') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#101722] via-[#151E2B] to-[#101722] border-b border-[#00B7FF]/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00B7FF]/20 text-[#00B7FF] shrink-0">
            <Bell className="w-3.5 h-3.5" />
          </span>
          <span className="text-[#E2E8F0]">
            <strong className="text-white">Get Live Match Alerts:</strong> Receive instant desktop notifications when your favorite teams kick off!
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={async () => {
              await requestPermission();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#00B7FF] text-[#080B12] font-bold text-xs hover:bg-[#33C5FF] transition-colors"
          >
            Allow Alerts
          </button>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Dismiss banner"
            className="p-1.5 text-[#A5B1C2] hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
