/**
 * Browser Desktop & In-App Notification Manager for KhelaDekH
 * Detects live matches involving user's favorite teams or saved events and triggers notifications.
 */

export interface MatchNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  eventId?: string;
}

export class NotificationManager {
  private static STORAGE_KEY_SEEN = 'kheladekh_notified_matches_v1';
  private static LOGO_ICON = '/src/assets/images/kheladekh_logo_1793952334814.jpg';

  /**
   * Check if the browser supports Desktop Notifications
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Current notification permission state: 'granted' | 'denied' | 'default'
   */
  public static getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request permission from user to show notifications
   */
  public static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return 'denied';
    }
  }

  /**
   * Show a system notification if permission is granted
   */
  public static sendSystemNotification(payload: MatchNotificationPayload): boolean {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || this.LOGO_ICON,
        badge: this.LOGO_ICON,
        tag: payload.eventId ? `match_${payload.eventId}` : undefined,
        data: { url: payload.url || '/live' },
      };

      const notification = new Notification(payload.title, options);
      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        if (payload.url) {
          window.location.href = payload.url;
        }
        notification.close();
      };
      return true;
    } catch (err) {
      console.error('Error triggering Notification:', err);
      return false;
    }
  }

  /**
   * Check if an event was already notified to prevent duplicate popup alerts in the session
   */
  public static hasBeenNotified(eventId: string): boolean {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_SEEN);
      if (!raw) return false;
      const seen: string[] = JSON.parse(raw);
      return seen.includes(eventId);
    } catch {
      return false;
    }
  }

  /**
   * Mark an event as notified
   */
  public static markAsNotified(eventId: string): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_SEEN);
      const seen: string[] = raw ? JSON.parse(raw) : [];
      if (!seen.includes(eventId)) {
        seen.push(eventId);
        // keep last 100
        if (seen.length > 100) seen.shift();
        localStorage.setItem(this.STORAGE_KEY_SEEN, JSON.stringify(seen));
      }
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Register service worker if available
   */
  public static registerServiceWorker(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }
}
