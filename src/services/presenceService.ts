import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ActiveSession } from '../types';

function getSessionId(): string {
  const STORAGE_KEY = 'kheladekh_session_id';
  try {
    let sid = sessionStorage.getItem(STORAGE_KEY);
    if (!sid) {
      sid = 'ks_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem(STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return 'ks_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  }
}

function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Browser';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  return 'Web Browser';
}

export interface ViewerContext {
  page: string;
  eventId?: string | null;
  eventTitle?: string | null;
  sportId?: string | null;
  userId?: string | null;
  userName?: string;
  enabled?: boolean;
}

/**
 * Pings Firestore with the active presence of this viewer.
 */
export async function sendHeartbeat(context: ViewerContext): Promise<void> {
  if (context.enabled === false) return;
  const sessionId = getSessionId();
  const sessionRef = doc(db, 'activeSessions', sessionId);

  const payload: ActiveSession = {
    id: sessionId,
    page: context.page || '/',
    eventId: context.eventId || null,
    eventTitle: context.eventTitle || null,
    sportId: context.sportId || null,
    device: detectDevice(),
    browser: detectBrowser(),
    lastPing: Date.now(),
    userId: context.userId || null,
    userName: context.userName || 'Anonymous Fan',
  };

  try {
    await setDoc(sessionRef, payload, { merge: true });
  } catch (err) {
    // Non-critical, ignore transient presence write drops
    console.warn('Presence heartbeat error:', err);
  }
}

/**
 * Remove session on leave
 */
export async function endSession(): Promise<void> {
  const sessionId = getSessionId();
  try {
    const sessionRef = doc(db, 'activeSessions', sessionId);
    await deleteDoc(sessionRef);
  } catch {
    // Ignore cleanup errors on unload
  }
}

/**
 * Hook to attach presence tracking to any page or match view.
 * Sends heartbeat every 25 seconds.
 */
export function useViewerPresence(context: ViewerContext) {
  useEffect(() => {
    if (context.enabled === false) return;

    // Initial ping
    sendHeartbeat(context);

    // Periodic heartbeat every 25s
    const timer = setInterval(() => {
      sendHeartbeat(context);
    }, 25000);

    // Pagehide / beforeunload cleanup
    const handleUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [context.page, context.eventId, context.eventTitle, context.userId]);
}

export interface MatchViewerStat {
  eventId: string;
  eventTitle: string;
  sportId: string;
  count: number;
}

export interface LiveTelemetry {
  totalVisitors: number;
  totalMatchWatchers: number;
  matchStats: MatchViewerStat[];
  deviceStats: { mobile: number; desktop: number; tablet: number };
  activeSessions: ActiveSession[];
  loading: boolean;
}

/**
 * Real-time hook for Admin to see active concurrent viewers and what matches they are watching.
 */
export function useLiveTelemetry(): LiveTelemetry {
  const [telemetry, setTelemetry] = useState<LiveTelemetry>({
    totalVisitors: 0,
    totalMatchWatchers: 0,
    matchStats: [],
    deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
    activeSessions: [],
    loading: true,
  });

  useEffect(() => {
    const colRef = collection(db, 'activeSessions');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const now = Date.now();
        // A session is considered active if pinged within the last 60 seconds
        const active: ActiveSession[] = [];
        const matchMap = new Map<string, { eventTitle: string; sportId: string; count: number }>();
        const devices = { mobile: 0, desktop: 0, tablet: 0 };
        let matchWatchers = 0;

        snapshot.forEach((d) => {
          const data = d.data() as ActiveSession;
          if (data && data.lastPing && now - data.lastPing < 60000) {
            active.push(data);

            if (data.device === 'mobile') devices.mobile++;
            else if (data.device === 'tablet') devices.tablet++;
            else devices.desktop++;

            if (data.eventId) {
              matchWatchers++;
              const cur = matchMap.get(data.eventId) || {
                eventTitle: data.eventTitle || 'Live Match',
                sportId: data.sportId || 'sports',
                count: 0,
              };
              cur.count++;
              if (data.eventTitle) cur.eventTitle = data.eventTitle;
              if (data.sportId) cur.sportId = data.sportId;
              matchMap.set(data.eventId, cur);
            }
          }
        });

        const matchStats: MatchViewerStat[] = Array.from(matchMap.entries()).map(([eventId, val]) => ({
          eventId,
          eventTitle: val.eventTitle,
          sportId: val.sportId,
          count: val.count,
        })).sort((a, b) => b.count - a.count);

        setTelemetry({
          totalVisitors: active.length,
          totalMatchWatchers: matchWatchers,
          matchStats,
          deviceStats: devices,
          activeSessions: active.sort((a, b) => b.lastPing - a.lastPing),
          loading: false,
        });
      },
      (error) => {
        console.warn('Telemetry onSnapshot error:', error);
        setTelemetry((prev) => ({ ...prev, loading: false }));
      }
    );

    // Re-check stale sessions every 10 seconds locally to keep counters fresh
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const now = Date.now();
        const active = prev.activeSessions.filter((s) => s.lastPing && now - s.lastPing < 60000);
        if (active.length === prev.activeSessions.length) return prev;

        const matchMap = new Map<string, { eventTitle: string; sportId: string; count: number }>();
        const devices = { mobile: 0, desktop: 0, tablet: 0 };
        let matchWatchers = 0;

        active.forEach((data) => {
          if (data.device === 'mobile') devices.mobile++;
          else if (data.device === 'tablet') devices.tablet++;
          else devices.desktop++;

          if (data.eventId) {
            matchWatchers++;
            const cur = matchMap.get(data.eventId) || {
              eventTitle: data.eventTitle || 'Live Match',
              sportId: data.sportId || 'sports',
              count: 0,
            };
            cur.count++;
            matchMap.set(data.eventId, cur);
          }
        });

        const matchStats: MatchViewerStat[] = Array.from(matchMap.entries()).map(([eventId, val]) => ({
          eventId,
          eventTitle: val.eventTitle,
          sportId: val.sportId,
          count: val.count,
        })).sort((a, b) => b.count - a.count);

        return {
          ...prev,
          totalVisitors: active.length,
          totalMatchWatchers: matchWatchers,
          matchStats,
          deviceStats: devices,
          activeSessions: active,
        };
      });
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return telemetry;
}

/**
 * Hook for a specific match to get active real-time viewers count.
 */
export function useMatchViewers(eventId?: string): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!eventId) {
      setCount(0);
      return;
    }

    const colRef = collection(db, 'activeSessions');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const now = Date.now();
        let matchCount = 0;
        snapshot.forEach((d) => {
          const data = d.data() as ActiveSession;
          if (data && data.eventId === eventId && data.lastPing && now - data.lastPing < 60000) {
            matchCount++;
          }
        });
        setCount(matchCount);
      },
      () => {
        setCount(0);
      }
    );

    return () => unsubscribe();
  }, [eventId]);

  return count;
}
