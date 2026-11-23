import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../services/firebase';
import {
  BASKETBALL_IMAGE,
  CRICKET_IMAGE,
  FOOTBALL_IMAGE,
  INITIAL_CATEGORIES,
  INITIAL_COMPETITIONS,
  INITIAL_EVENTS,
  INITIAL_NEWS,
  INITIAL_SETTINGS,
  INITIAL_SPORTS,
  INITIAL_TEAMS,
  TENNIS_IMAGE,
} from '../data/seedData';
import {
  AuditLog,
  Category,
  Competition,
  ContactMessage,
  NewsArticle,
  NotificationPreferences,
  SiteSettings,
  Sport,
  SportEvent,
  Team,
  VpnRegion,
} from '../types';
import { useAuth } from './AuthContext';

export interface StreamNetworkConfig {
  resolvedUrl: string;
  isRelayed: boolean;
  headers: Record<string, string>;
  hlsConfig: {
    enableWorker: boolean;
    lowLatencyMode: boolean;
    backBufferLength: number;
    manifestLoadingTimeOut: number;
    manifestLoadingMaxRetry: number;
    fragLoadingTimeOut: number;
    fragLoadingMaxRetry: number;
    xhrSetup?: (xhr: XMLHttpRequest, url: string) => void;
  };
}

interface DataContextType {
  sports: Sport[];
  teams: Team[];
  competitions: Competition[];
  events: SportEvent[];
  news: NewsArticle[];
  categories: Category[];
  settings: SiteSettings;
  loading: boolean;
  isFirestoreConnected: boolean;
  autoSyncing: boolean;
  lastAutoSyncTime: string | null;
  nextSyncSeconds: number;
  autoSyncIntervalSeconds: number;
  vpnMode: boolean;
  vpnRegion: VpnRegion;
  updateVpnSettings: (enabled: boolean, region?: VpnRegion) => Promise<void>;
  getStreamNetworkConfig: (rawUrl: string, overrideVpn?: boolean, overrideRegion?: VpnRegion) => StreamNetworkConfig;
  syncLiveSportsFromGoogle: (silent?: boolean) => Promise<void>;
  toggleFavoriteSport: (sportId: string) => Promise<void>;
  toggleFavoriteTeam: (teamId: string) => Promise<void>;
  toggleSavedEvent: (eventId: string) => Promise<void>;
  updateNotificationPreferences: (prefs: NotificationPreferences) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  seedDatabase: () => Promise<void>;
  saveEvent: (event: SportEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  saveNews: (article: NewsArticle) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  saveSport: (sport: Sport) => Promise<void>;
  deleteSport: (id: string) => Promise<void>;
  saveTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  saveCompetition: (comp: Competition) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;
  saveCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveSettings: (newSettings: SiteSettings) => Promise<void>;
}

import { resolveMatchCaptains, VERIFIED_SPORTS_STREAMS } from '../data/captainsData';

const DataContext = createContext<DataContextType | undefined>(undefined);

const AUTO_SYNC_INTERVAL_SEC = 60; // Continuous 1-minute Real-Time Sports auto-sync
const ADMIN_EMAIL = 'factsknown178@gmail.com';
const SYNC_STORAGE_KEY = 'kheladekh_real_sports_v3';

const LEGACY_FAKE_EVENT_PREFIXES = [
  'ban-vs-wi-live-',
  'rma-vs-mci-live-',
  'ind-vs-aus-live-',
  'lal-vs-gsw-upcoming-',
  'cricket-ban-wi-',
  'cricket-ind-aus-',
  'football-rma-bar-',
  'tennis-alc-sin-',
  'football-mci-liv-',
  'basketball-lal-gsw-',
  'football-ars-bay-',
  'cricket-ban-sl-',
  'match-',
];

const isLegacyFakeEventId = (id: string) =>
  LEGACY_FAKE_EVENT_PREFIXES.some((prefix) => id.startsWith(prefix));

const isCartoonStream = (url?: string) =>
  !url ||
  url.includes('bigbuckbunny') ||
  url.includes('bipbop') ||
  url.includes('x36xhzz') ||
  url.includes('mov_bbb') ||
  url.includes('v_645516');

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [sports, setSports] = useState<Sport[]>(INITIAL_SPORTS);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [events, setEvents] = useState<SportEvent[]>(() => {
    try {
      localStorage.removeItem('kheladekh_google_sports_cache_v2');
      const cached = localStorage.getItem(SYNC_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as SportEvent[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((e) => !isLegacyFakeEventId(e.id));
        }
      }
    } catch {}
    return INITIAL_EVENTS;
  });
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState<string | null>(null);
  const [nextSyncSeconds, setNextSyncSeconds] = useState<number>(AUTO_SYNC_INTERVAL_SEC);
  const [vpnMode, setVpnMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kheladekh_vpn_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [vpnRegion, setVpnRegion] = useState<VpnRegion>(() => {
    try {
      const saved = localStorage.getItem('kheladekh_vpn_region') as VpnRegion | null;
      return saved && ['auto', 'sg', 'uk', 'eu', 'us'].includes(saved) ? saved : 'auto';
    } catch {
      return 'auto';
    }
  });

  // Sync VPN preference when authenticated user profile loads from Firestore
  useEffect(() => {
    if (profile) {
      if (typeof profile.vpnMode === 'boolean') {
        setVpnMode(profile.vpnMode);
        try {
          localStorage.setItem('kheladekh_vpn_mode', String(profile.vpnMode));
        } catch {}
      }
      if (profile.vpnRegion && ['auto', 'sg', 'uk', 'eu', 'us'].includes(profile.vpnRegion)) {
        setVpnRegion(profile.vpnRegion);
        try {
          localStorage.setItem('kheladekh_vpn_region', profile.vpnRegion);
        } catch {}
      }
    }
  }, [profile?.uid, profile?.vpnMode, profile?.vpnRegion]);

  const getStreamNetworkConfig = useCallback((
    rawUrl: string,
    overrideVpn?: boolean,
    overrideRegion?: VpnRegion
  ): StreamNetworkConfig => {
    const activeVpn = typeof overrideVpn === 'boolean' ? overrideVpn : vpnMode;
    const activeRegion = overrideRegion || vpnRegion;
    const cleanUrl = (rawUrl || '').trim();
    const lowerUrl = cleanUrl.toLowerCase();
    const isEmbedUrl =
      lowerUrl.includes('youtube.com') ||
      lowerUrl.includes('youtube-nocookie.com') ||
      lowerUrl.includes('youtu.be') ||
      lowerUrl.includes('facebook.com') ||
      lowerUrl.includes('/embed/') ||
      lowerUrl.includes('dailymotion.com');

    const requiresCorsRelay =
      lowerUrl.includes('amagi.tv') ||
      lowerUrl.includes('wurl.com') ||
      lowerUrl.includes('antenaplay.ro') ||
      lowerUrl.includes('multistream.it');

    const shouldRelay = Boolean(
      (activeVpn || requiresCorsRelay) &&
        cleanUrl &&
        !isEmbedUrl &&
        !cleanUrl.startsWith('/api/vpn-relay')
    );

    const resolvedUrl = shouldRelay
      ? `/api/vpn-relay?region=${encodeURIComponent(activeRegion)}&url=${encodeURIComponent(cleanUrl)}`
      : cleanUrl;

    const headers: Record<string, string> = {
      'X-KhelaDekH-VPN-Mode': activeVpn || requiresCorsRelay ? 'enabled' : 'standard',
      'X-KhelaDekH-VPN-Region': activeRegion,
    };

    return {
      resolvedUrl,
      isRelayed: shouldRelay || cleanUrl.startsWith('/api/vpn-relay'),
      headers,
      hlsConfig: {
        enableWorker: true,
        lowLatencyMode: !shouldRelay,
        backBufferLength: shouldRelay ? 90 : 60,
        manifestLoadingTimeOut: shouldRelay ? 20000 : 12000,
        manifestLoadingMaxRetry: shouldRelay ? 4 : 2,
        fragLoadingTimeOut: shouldRelay ? 25000 : 15000,
        fragLoadingMaxRetry: shouldRelay ? 6 : 3,
        xhrSetup: (xhr: XMLHttpRequest, requestUrl: string) => {
          if (requestUrl.includes('/api/vpn-relay')) {
            xhr.setRequestHeader('X-KhelaDekH-VPN-Mode', activeVpn ? 'enabled' : 'auto');
            xhr.setRequestHeader('X-KhelaDekH-VPN-Region', activeRegion);
          }
        },
      },
    };
  }, [vpnMode, vpnRegion]);

  const canWriteAdminCollections =
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Automated Real-Time Sports Feed Sync (updates UI immediately for all users!)
  const syncLiveSportsFromGoogle = async (silent = true) => {
    try {
      setAutoSyncing(true);
      setNextSyncSeconds(AUTO_SYNC_INTERVAL_SEC);
      const res = await fetch(`/api/sports/auto-feed${silent ? '' : '?force=true'}`, {
        headers: {
          'X-KhelaDekH-VPN-Mode': vpnMode ? 'enabled' : 'standard',
          'X-KhelaDekH-VPN-Region': vpnRegion,
        },
      });
      if (!res.ok) throw new Error('Auto feed request failed');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setLastAutoSyncTime(new Date().toLocaleTimeString());

        const syncedTeams: Team[] = [];
        const syncedComps: Competition[] = [];
        const syncedEvents: SportEvent[] = [];

        for (let idx = 0; idx < json.data.length; idx++) {
          const item = json.data[idx];
          const sportKey = (item.sportId || 'football').toLowerCase();
          const defaultThumb =
            sportKey === 'cricket'
              ? CRICKET_IMAGE
              : sportKey === 'football'
              ? FOOTBALL_IMAGE
              : sportKey === 'basketball'
              ? BASKETBALL_IMAGE
              : TENNIS_IMAGE;

          const teamIds: string[] = [];
          const resolvedCaps = resolveMatchCaptains({
            title: item.title,
            sportId: sportKey,
            teamAName: item.teamA?.name,
            teamBName: item.teamB?.name,
            teamACaptain: item.teamA?.captain,
            teamBCaptain: item.teamB?.captain,
          });

          if (resolvedCaps.teamAName) {
            const tAId = resolvedCaps.teamAName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            teamIds.push(tAId);
            const teamAObj: Team = {
              id: tAId,
              name: resolvedCaps.teamAName,
              shortName: item.teamA?.shortName || resolvedCaps.teamAName.slice(0, 3).toUpperCase(),
              sportId: sportKey,
              country: item.teamA?.country || 'International',
              captain: resolvedCaps.teamACaptain,
              captainPhotoUrl: resolvedCaps.teamACaptainPhoto,
            };
            syncedTeams.push(teamAObj);
            if (canWriteAdminCollections && tAId) {
              setDoc(doc(db, 'teams', tAId), teamAObj, { merge: true }).catch(() => {});
            }
          }

          if (resolvedCaps.teamBName) {
            const tBId = resolvedCaps.teamBName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            teamIds.push(tBId);
            const teamBObj: Team = {
              id: tBId,
              name: resolvedCaps.teamBName,
              shortName: item.teamB?.shortName || resolvedCaps.teamBName.slice(0, 3).toUpperCase(),
              sportId: sportKey,
              country: item.teamB?.country || 'International',
              captain: resolvedCaps.teamBCaptain,
              captainPhotoUrl: resolvedCaps.teamBCaptainPhoto,
            };
            syncedTeams.push(teamBObj);
            if (canWriteAdminCollections && tBId) {
              setDoc(doc(db, 'teams', tBId), teamBObj, { merge: true }).catch(() => {});
            }
          }

          const compId = (item.competition || 'International')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-');
          const compObj: Competition = {
            id: compId,
            name: item.competition || 'International Cup',
            sportId: sportKey,
            country: 'International',
          };
          syncedComps.push(compObj);
          if (canWriteAdminCollections && compId) {
            setDoc(doc(db, 'competitions', compId), compObj, { merge: true }).catch(() => {});
          }

          const evId = item.id || `${item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_auto`;
          const safeStreamUrl =
            item.authorizedViewingUrl && !isCartoonStream(item.authorizedViewingUrl)
              ? item.authorizedViewingUrl
              : sportKey === 'cricket'
              ? VERIFIED_SPORTS_STREAMS.GTV_LIVE
              : sportKey === 'football'
              ? VERIFIED_SPORTS_STREAMS.FIFA_PLUS
              : VERIFIED_SPORTS_STREAMS.ACC_SPORTS;

          const evObj: SportEvent = {
            id: evId,
            title: item.title,
            slug: item.id || evId,
            sportId: sportKey,
            competitionId: compId,
            teamIds,
            teamAName: resolvedCaps.teamAName,
            teamBName: resolvedCaps.teamBName,
            teamACaptain: resolvedCaps.teamACaptain,
            teamBCaptain: resolvedCaps.teamBCaptain,
            teamACaptainPhoto: resolvedCaps.teamACaptainPhoto,
            teamBCaptainPhoto: resolvedCaps.teamBCaptainPhoto,
            venue: item.venue || 'International Stadium',
            description: item.description || 'Real-time live match synced on KhelaDekH.',
            eventDate: item.eventDate || new Date().toISOString().split('T')[0],
            eventTime: item.eventTime || 'Live',
            timezone: item.timezone || 'UTC',
            status:
              item.status === 'FINISHED' || item.status === 'UPCOMING' || item.status === 'LIVE'
                ? item.status
                : 'LIVE',
            published: true,
            featured: item.status === 'LIVE',
            authorizedViewingUrl: safeStreamUrl,
            thumbnailUrl: defaultThumb,
            scoreSummary:
              item.scoreSummary ||
              (item.status === 'LIVE'
                ? 'Live In Progress'
                : item.status === 'FINISHED'
                ? 'FT: Concluded'
                : 'Upcoming'),
            updatedAt: new Date().toISOString(),
          };

          syncedEvents.push(evObj);
          if (canWriteAdminCollections && evId) {
            setDoc(doc(db, 'events', evId), evObj, { merge: true }).catch(() => {});
          }
        }

        if (syncedTeams.length > 0) {
          setTeams((prev) => {
            const map = new Map<string, Team>();
            prev.forEach((t) => map.set(t.id, t));
            syncedTeams.forEach((t) => map.set(t.id, t));
            return Array.from(map.values());
          });
        }

        if (syncedComps.length > 0) {
          setCompetitions((prev) => {
            const map = new Map<string, Competition>();
            prev.forEach((c) => map.set(c.id, c));
            syncedComps.forEach((c) => map.set(c.id, c));
            return Array.from(map.values());
          });
        }

        if (syncedEvents.length > 0) {
          setEvents((prev) => {
            const map = new Map<string, SportEvent>();
            // Preserve only custom manual admin-created events (never legacy fake fixtures)
            prev.forEach((ev) => {
              if (
                !isLegacyFakeEventId(ev.id) &&
                !ev.id.startsWith('bbc-') &&
                !ev.id.startsWith('cb-') &&
                !ev.id.startsWith('espn-')
              ) {
                map.set(ev.id, ev);
              }
            });
            syncedEvents.forEach((ev) => map.set(ev.id, ev));
            const merged = Array.from(map.values()).sort((a, b) => {
              const rank = { LIVE: 0, UPCOMING: 1, FINISHED: 2 };
              return (rank[a.status] ?? 2) - (rank[b.status] ?? 2);
            });
            try {
              localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
    } catch (err) {
      if (!silent) console.warn('Auto-sync sports failed:', err);
    } finally {
      setAutoSyncing(false);
    }
  };

  // Real-time 1-second countdown ticker for continuous 1-minute auto-sync
  useEffect(() => {
    const timer = setInterval(() => {
      setNextSyncSeconds((prev) => {
        if (prev <= 1) {
          syncLiveSportsFromGoogle(true);
          return AUTO_SYNC_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Clean up any stale legacy mock events from Firestore when admin is signed in
  useEffect(() => {
    if (!canWriteAdminCollections) return;
    const todayStr = new Date().toISOString().split('T')[0];
    events.forEach((ev) => {
      if (isLegacyFakeEventId(ev.id)) {
        deleteDoc(doc(db, 'events', ev.id)).catch(() => {});
      } else if (ev.status === 'LIVE' && ev.eventDate && ev.eventDate < todayStr) {
        const updated: SportEvent = {
          ...ev,
          status: 'FINISHED',
          featured: false,
          scoreSummary: ev.scoreSummary?.startsWith('FT')
            ? ev.scoreSummary
            : `FT: ${ev.scoreSummary || 'Ended'}`,
          updatedAt: new Date().toISOString(),
        };
        setDoc(doc(db, 'events', ev.id), updated, { merge: true }).catch(() => {});
      }
    });
  }, [events.length, canWriteAdminCollections]);

  useEffect(() => {
    let mounted = true;
    testFirestoreConnection().then((connected) => {
      if (mounted) setIsFirestoreConnected(connected);
    });

    // Run initial real-time sports sync immediately
    syncLiveSportsFromGoogle(true);

    const unsubSports = onSnapshot(
      collection(db, 'sports'),
      (snap) => {
        if (!snap.empty) {
          setSports(snap.docs.map((d) => d.data() as Sport));
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'sports');
      }
    );

    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      (snap) => {
        if (!snap.empty) {
          const fsTeams = snap.docs.map((d) => d.data() as Team);
          setTeams((prev) => {
            const map = new Map<string, Team>();
            prev.forEach((t) => map.set(t.id, t));
            fsTeams.forEach((t) => map.set(t.id, t));
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'teams')
    );

    const unsubComps = onSnapshot(
      collection(db, 'competitions'),
      (snap) => {
        if (!snap.empty) {
          const fsComps = snap.docs.map((d) => d.data() as Competition);
          setCompetitions((prev) => {
            const map = new Map<string, Competition>();
            prev.forEach((c) => map.set(c.id, c));
            fsComps.forEach((c) => map.set(c.id, c));
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'competitions')
    );

    const unsubEvents = onSnapshot(
      collection(db, 'events'),
      (snap) => {
        if (!snap.empty) {
          const todayStr = new Date().toISOString().split('T')[0];
          const fsEvents = snap.docs
            .map((d) => d.data() as SportEvent)
            .filter((ev) => !isLegacyFakeEventId(ev.id) && (!ev.eventDate || ev.eventDate >= todayStr))
            .map((ev) => {
              const caps = resolveMatchCaptains(ev);
              return {
                ...ev,
                ...caps,
                authorizedViewingUrl: isCartoonStream(ev.authorizedViewingUrl)
                  ? VERIFIED_SPORTS_STREAMS.GTV_LIVE
                  : ev.authorizedViewingUrl,
              };
            });

          if (fsEvents.length > 0) {
            setEvents((prev) => {
              const map = new Map<string, SportEvent>();
              // Keep live API-synced events authoritative over older Firestore snapshots
              fsEvents.forEach((ev) => map.set(ev.id, ev));
              prev.forEach((ev) => {
                if (
                  ev.id.startsWith('bbc-') ||
                  ev.id.startsWith('cb-') ||
                  ev.id.startsWith('espn-')
                ) {
                  map.set(ev.id, ev);
                }
              });
              return Array.from(map.values()).sort((a, b) => {
                const rank = { LIVE: 0, UPCOMING: 1, FINISHED: 2 };
                return (rank[a.status] ?? 2) - (rank[b.status] ?? 2);
              });
            });
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'events')
    );

    const unsubNews = onSnapshot(
      collection(db, 'news'),
      (snap) => {
        if (!snap.empty) {
          setNews(snap.docs.map((d) => d.data() as NewsArticle));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'news')
    );

    const unsubCats = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        if (!snap.empty) {
          setCategories(snap.docs.map((d) => d.data() as Category));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'categories')
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as SiteSettings);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'settings/global')
    );

    return () => {
      mounted = false;
      unsubSports();
      unsubTeams();
      unsubComps();
      unsubEvents();
      unsubNews();
      unsubCats();
      unsubSettings();
    };
  }, []);

  const logAudit = async (action: string, targetCollection: string, targetId: string) => {
    if (!user) return;
    const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const entry: AuditLog = {
      id,
      actorUid: user.uid,
      actorEmail: user.email || '',
      action,
      targetCollection,
      targetId,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'auditLogs', id), entry);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${id}`);
    }
  };

  const toggleFavoriteSport = async (sportId: string) => {
    if (!user || !profile) return;
    const exists = profile.favoriteSports.includes(sportId);
    const updated = exists
      ? profile.favoriteSports.filter((s) => s !== sportId)
      : [...profile.favoriteSports, sportId];
    try {
      await updateDoc(doc(db, 'users', user.uid), { favoriteSports: updated });
      await refreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleFavoriteTeam = async (teamId: string) => {
    if (!user || !profile) return;
    const exists = profile.favoriteTeams.includes(teamId);
    const updated = exists
      ? profile.favoriteTeams.filter((t) => t !== teamId)
      : [...profile.favoriteTeams, teamId];
    try {
      await updateDoc(doc(db, 'users', user.uid), { favoriteTeams: updated });
      await refreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleSavedEvent = async (eventId: string) => {
    if (!user || !profile) return;
    const exists = profile.savedEvents.includes(eventId);
    const updated = exists
      ? profile.savedEvents.filter((e) => e !== eventId)
      : [...profile.savedEvents, eventId];
    try {
      await updateDoc(doc(db, 'users', user.uid), { savedEvents: updated });
      await refreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateNotificationPreferences = async (prefs: NotificationPreferences) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { notificationPreferences: prefs });
      await refreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateDisplayName = async (displayName: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName });
      await refreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateVpnSettings = useCallback(async (enabled: boolean, region?: VpnRegion) => {
    const nextRegion = region || vpnRegion;
    setVpnMode(enabled);
    if (region) setVpnRegion(nextRegion);

    try {
      localStorage.setItem('kheladekh_vpn_mode', String(enabled));
      localStorage.setItem('kheladekh_vpn_region', nextRegion);
    } catch {}

    if (user && !user.uid.startsWith('usr_') && !user.uid.startsWith('admin_owner_')) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          vpnMode: enabled,
          vpnRegion: nextRegion,
        });
        await refreshProfile();
      } catch (err) {
        console.warn('Firestore VPN preference sync note:', err);
      }
    }
  }, [vpnRegion, user, refreshProfile]);

  const submitContactMessage = async (
    msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
  ) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payload: ContactMessage = {
      ...msg,
      id,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'contactMessages', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `contactMessages/${id}`);
    }
  };

  const seedDatabase = async () => {
    for (const s of INITIAL_SPORTS) {
      await setDoc(doc(db, 'sports', s.id), s);
    }
    for (const t of INITIAL_TEAMS) {
      await setDoc(doc(db, 'teams', t.id), t);
    }
    for (const c of INITIAL_COMPETITIONS) {
      await setDoc(doc(db, 'competitions', c.id), c);
    }
    for (const e of INITIAL_EVENTS) {
      await setDoc(doc(db, 'events', e.id), e);
    }
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }
    for (const n of INITIAL_NEWS) {
      await setDoc(doc(db, 'news', n.id), n);
    }
    await setDoc(doc(db, 'settings', 'global'), INITIAL_SETTINGS);
    await logAudit('SEED_DATABASE', 'all', 'initial_seed');
  };

  const saveEvent = async (event: SportEvent) => {
    try {
      await setDoc(doc(db, 'events', event.id), {
        ...event,
        updatedAt: new Date().toISOString(),
      });
      await logAudit('SAVE_EVENT', 'events', event.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `events/${event.id}`);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      await logAudit('DELETE_EVENT', 'events', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
    }
  };

  const saveNews = async (article: NewsArticle) => {
    try {
      await setDoc(doc(db, 'news', article.id), {
        ...article,
        updatedAt: new Date().toISOString(),
      });
      await logAudit('SAVE_NEWS', 'news', article.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `news/${article.id}`);
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
      await logAudit('DELETE_NEWS', 'news', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
    }
  };

  const saveSport = async (sport: Sport) => {
    try {
      await setDoc(doc(db, 'sports', sport.id), sport);
      await logAudit('SAVE_SPORT', 'sports', sport.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `sports/${sport.id}`);
    }
  };

  const deleteSport = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'sports', id));
      await logAudit('DELETE_SPORT', 'sports', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `sports/${id}`);
    }
  };

  const saveTeam = async (team: Team) => {
    try {
      await setDoc(doc(db, 'teams', team.id), team);
      await logAudit('SAVE_TEAM', 'teams', team.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `teams/${team.id}`);
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teams', id));
      await logAudit('DELETE_TEAM', 'teams', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `teams/${id}`);
    }
  };

  const saveCompetition = async (comp: Competition) => {
    try {
      await setDoc(doc(db, 'competitions', comp.id), comp);
      await logAudit('SAVE_COMPETITION', 'competitions', comp.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `competitions/${comp.id}`);
    }
  };

  const deleteCompetition = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'competitions', id));
      await logAudit('DELETE_COMPETITION', 'competitions', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `competitions/${id}`);
    }
  };

  const saveCategory = async (cat: Category) => {
    try {
      await setDoc(doc(db, 'categories', cat.id), cat);
      await logAudit('SAVE_CATEGORY', 'categories', cat.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      await logAudit('DELETE_CATEGORY', 'categories', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const saveSettings = async (newSettings: SiteSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), newSettings);
      await logAudit('SAVE_SETTINGS', 'settings', 'global');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/global');
    }
  };

  return (
    <DataContext.Provider
      value={{
        sports,
        teams,
        competitions,
        events,
        news,
        categories,
        settings,
        loading,
        isFirestoreConnected,
        autoSyncing,
        lastAutoSyncTime,
        nextSyncSeconds,
        autoSyncIntervalSeconds: AUTO_SYNC_INTERVAL_SEC,
        vpnMode,
        vpnRegion,
        updateVpnSettings,
        getStreamNetworkConfig,
        syncLiveSportsFromGoogle,
        toggleFavoriteSport,
        toggleFavoriteTeam,
        toggleSavedEvent,
        updateNotificationPreferences,
        updateDisplayName,
        submitContactMessage,
        seedDatabase,
        saveEvent,
        deleteEvent,
        saveNews,
        deleteNews,
        saveSport,
        deleteSport,
        saveTeam,
        deleteTeam,
        saveCompetition,
        deleteCompetition,
        saveCategory,
        deleteCategory,
        saveSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
