import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { InAppAlert, SportEvent } from '../types';
import { NotificationManager } from '../services/notificationManager';

interface NotificationContextType {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  alerts: InAppAlert[];
  unreadCount: number;
  markAlertAsRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  testNotification: () => void;
  bannerVisible: boolean;
  dismissBanner: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { events, teams, updateNotificationPreferences } = useData();

  const [permission, setPermission] = useState<NotificationPermission>(
    NotificationManager.getPermission()
  );
  const [isSupported] = useState<boolean>(NotificationManager.isSupported());
  const [alerts, setAlerts] = useState<InAppAlert[]>(() => {
    try {
      const saved = localStorage.getItem('kheladekh_inapp_alerts_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bannerVisible, setBannerVisible] = useState<boolean>(false);
  const previousStatusMap = useRef<Map<string, string>>(new Map());
  const isInitialLoad = useRef<boolean>(true);

  // Sync alerts to local storage
  useEffect(() => {
    try {
      localStorage.setItem('kheladekh_inapp_alerts_v1', JSON.stringify(alerts.slice(0, 30)));
    } catch {
      // ignore storage quota issues
    }
  }, [alerts]);

  // Register service worker on mount
  useEffect(() => {
    NotificationManager.registerServiceWorker();
    setPermission(NotificationManager.getPermission());

    // Show request banner if user is signed in and permission is default
    const dismissed = sessionStorage.getItem('kheladekh_notif_banner_dismissed');
    if (NotificationManager.isSupported() && Notification.permission === 'default' && !dismissed) {
      setBannerVisible(true);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const perm = await NotificationManager.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      setBannerVisible(false);
      if (profile && updateNotificationPreferences) {
        updateNotificationPreferences({
          ...profile.notificationPreferences,
          browserNotifications: true,
        });
      }
      // Send a confirmation welcome notification
      NotificationManager.sendSystemNotification({
        title: 'KhelaDekH Alerts Activated 🔔',
        body: 'You will receive live match alerts when your favorite teams start playing!',
        url: '/live',
      });
    }
    return perm;
  }, [profile, updateNotificationPreferences]);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    sessionStorage.setItem('kheladekh_notif_banner_dismissed', 'true');
  }, []);

  const addAlert = useCallback((alert: Omit<InAppAlert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: InAppAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev.slice(0, 29)]);
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Monitor live events and match favorite teams / saved events
  useEffect(() => {
    if (!events || events.length === 0) return;

    // Build a map of current statuses
    const currentStatuses = new Map<string, string>();
    events.forEach((ev) => {
      currentStatuses.set(ev.id, ev.status);
    });

    // If first load, just record initial statuses so we don't spam notifications for already-live events unless relevant
    if (isInitialLoad.current) {
      previousStatusMap.current = currentStatuses;
      isInitialLoad.current = false;
      return;
    }

    // Favorite team IDs and Saved Event IDs
    const favTeamIds = new Set(profile?.favoriteTeams || []);
    const savedEventIds = new Set(profile?.savedEvents || []);

    events.forEach((event: SportEvent) => {
      const prevStatus = previousStatusMap.current.get(event.id);
      const isNowLive = event.status === 'LIVE';
      const becameLive = prevStatus && prevStatus !== 'LIVE' && isNowLive;

      // Check if event features user's favorite teams
      const matchesFavTeam = event.teamIds && event.teamIds.some((tId) => favTeamIds.has(tId));
      const isSaved = savedEventIds.has(event.id);

      // Trigger condition:
      // 1) Became live recently, OR
      // 2) Is live and hasn't been notified yet in this browser session
      const shouldNotify = (becameLive || (isNowLive && !NotificationManager.hasBeenNotified(event.id))) &&
        (matchesFavTeam || isSaved || profile?.notificationPreferences?.newEvents);

      if (shouldNotify) {
        NotificationManager.markAsNotified(event.id);

        // Find team names for the message
        const matchedTeams = teams
          .filter((t) => event.teamIds?.includes(t.id))
          .map((t) => t.name);

        const teamLabel = matchedTeams.length > 0 ? matchedTeams.join(' vs ') : event.title;
        const notifTitle = `🔴 MATCH LIVE: ${teamLabel}`;
        const notifBody = matchesFavTeam
          ? `Your favorite team is now playing in ${event.title}! Watch live on KhelaDekH.`
          : `${event.title} is now broadcasting live on KhelaDekH!`;
        const matchUrl = `/events/${event.slug || event.id}`;

        // 1. Send system desktop/mobile browser notification
        NotificationManager.sendSystemNotification({
          title: notifTitle,
          body: notifBody,
          url: matchUrl,
          eventId: event.id,
        });

        // 2. Add in-app alert banner/toast
        addAlert({
          title: notifTitle,
          body: notifBody,
          eventId: event.id,
          slug: event.slug,
          teamNames: matchedTeams,
        });
      }
    });

    previousStatusMap.current = currentStatuses;
  }, [events, profile, teams, addAlert]);

  // Manual test notification for demo/testing
  const testNotification = useCallback(() => {
    const demoTitle = '🔴 LIVE NOW: Bangladesh vs West Indies';
    const demoBody = 'Your favorite team Bangladesh is playing Day 2 Test! Click to watch live stream.';
    NotificationManager.sendSystemNotification({
      title: demoTitle,
      body: demoBody,
      url: '/live',
      eventId: 'test_demo',
    });
    addAlert({
      title: demoTitle,
      body: demoBody,
      slug: 'ban-vs-wi-2nd-test',
      teamNames: ['Bangladesh', 'West Indies'],
    });
  }, [addAlert]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <NotificationContext.Provider
      value={{
        permission,
        isSupported,
        requestPermission,
        alerts,
        unreadCount,
        markAlertAsRead,
        clearAllAlerts,
        testNotification,
        bannerVisible,
        dismissBanner,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
