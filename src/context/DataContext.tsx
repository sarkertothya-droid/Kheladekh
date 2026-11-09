import React, { createContext, useContext, useEffect, useState } from 'react';
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
} from '../types';
import { useAuth } from './AuthContext';

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

const DataContext = createContext<DataContextType | undefined>(undefined);

const AUTO_SYNC_INTERVAL_SEC = 300; // Exactly 5 minutes (300 seconds) as requested

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [sports, setSports] = useState<Sport[]>(INITIAL_SPORTS);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [events, setEvents] = useState<SportEvent[]>(INITIAL_EVENTS);
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState<string | null>(null);
  const [nextSyncSeconds, setNextSyncSeconds] = useState<number>(AUTO_SYNC_INTERVAL_SEC);

  // Automated Sports Feed Sync from server (Google Search grounded) - 5 minute cycle
  const syncLiveSportsFromGoogle = async (silent = true) => {
    try {
      setAutoSyncing(true);
      setNextSyncSeconds(AUTO_SYNC_INTERVAL_SEC);
      const res = await fetch('/api/sports/auto-feed');
      if (!res.ok) throw new Error('Auto feed request failed');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setLastAutoSyncTime(new Date().toLocaleTimeString());

        // Process incoming items
        for (const item of json.data) {
          const sportKey = item.sportId || 'football';
          const defaultThumb =
            sportKey === 'cricket'
              ? CRICKET_IMAGE
              : sportKey === 'football'
              ? FOOTBALL_IMAGE
              : sportKey === 'basketball'
              ? BASKETBALL_IMAGE
              : TENNIS_IMAGE;

          const teamIds: string[] = [];
          if (item.teamA?.name) {
            const tAId = item.teamA.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            teamIds.push(tAId);
            const teamAObj: Team = {
              id: tAId,
              name: item.teamA.name,
              shortName: item.teamA.shortName || item.teamA.name.slice(0, 3).toUpperCase(),
              sportId: sportKey,
              country: item.teamA.country || 'International',
            };
            await setDoc(doc(db, 'teams', tAId), teamAObj, { merge: true }).catch(() => {});
          }

          if (item.teamB?.name) {
            const tBId = item.teamB.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            teamIds.push(tBId);
            const teamBObj: Team = {
              id: tBId,
              name: item.teamB.name,
              shortName: item.teamB.shortName || item.teamB.name.slice(0, 3).toUpperCase(),
              sportId: sportKey,
              country: item.teamB.country || 'International',
            };
            await setDoc(doc(db, 'teams', tBId), teamBObj, { merge: true }).catch(() => {});
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
          await setDoc(doc(db, 'competitions', compId), compObj, { merge: true }).catch(() => {});

          const evId = item.id || `${item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_auto`;
          const evObj: SportEvent = {
            id: evId,
            title: item.title,
            slug: item.id || evId,
            sportId: sportKey,
            competitionId: compId,
            teamIds,
            description: item.description || 'Live match automatically updated from Google Sports feed.',
            eventDate: item.eventDate || new Date().toISOString().split('T')[0],
            eventTime: item.eventTime || 'Live',
            timezone: item.timezone || 'UTC',
            status: (item.status === 'FINISHED' || item.status === 'UPCOMING' || item.status === 'LIVE') ? item.status : 'LIVE',
            published: true,
            featured: item.status === 'LIVE',
            authorizedViewingUrl: item.authorizedViewingUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            thumbnailUrl: defaultThumb,
            scoreSummary: item.scoreSummary || (item.status === 'LIVE' ? 'In Progress' : item.status === 'FINISHED' ? 'FT: Concluded' : ''),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(doc(db, 'events', evId), evObj, { merge: true }).catch(() => {});
        }
      }
    } catch (err) {
      if (!silent) console.warn('Auto-sync sports failed:', err);
    } finally {
      setAutoSyncing(false);
    }
  };

  // Real-time 1-second countdown ticker for exactly 5-minute (300s) auto-sync
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

  // Auto-transition past events to FINISHED if their date is before today
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    events.forEach((ev) => {
      if (ev.status === 'LIVE' && ev.eventDate && ev.eventDate < todayStr) {
        const updated: SportEvent = {
          ...ev,
          status: 'FINISHED',
          featured: false,
          scoreSummary: ev.scoreSummary?.startsWith('FT') ? ev.scoreSummary : `FT: ${ev.scoreSummary || 'Ended'}`,
          updatedAt: new Date().toISOString(),
        };
        setDoc(doc(db, 'events', ev.id), updated, { merge: true }).catch(() => {});
      }
    });
  }, [events.length]);

  useEffect(() => {
    let mounted = true;
    testFirestoreConnection().then((connected) => {
      if (mounted) setIsFirestoreConnected(connected);
    });

    // Run initial auto-sync once connected
    syncLiveSportsFromGoogle(true);

    const unsubSports = onSnapshot(
      collection(db, 'sports'),
      (snap) => {
        if (!snap.empty) {
          setSports(snap.docs.map((d) => d.data() as Sport));
        }
        setLoading(false);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'sports')
    );

    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      (snap) => {
        if (!snap.empty) {
          setTeams(snap.docs.map((d) => d.data() as Team));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'teams')
    );

    const unsubComps = onSnapshot(
      collection(db, 'competitions'),
      (snap) => {
        if (!snap.empty) {
          setCompetitions(snap.docs.map((d) => d.data() as Competition));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'competitions')
    );

    const unsubEvents = onSnapshot(
      collection(db, 'events'),
      (snap) => {
        if (!snap.empty) {
          setEvents(snap.docs.map((d) => d.data() as SportEvent));
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
