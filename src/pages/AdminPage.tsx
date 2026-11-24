import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Users,
  Award,
  Newspaper,
  FolderTree,
  UserCheck,
  Image,
  Bell,
  Mail,
  Settings,
  FileText,
  LogOut,
  Plus,
  Trash2,
  Database,
  Zap,
  RefreshCw,
  Sparkles,
  Check,
  Globe,
  Play,
  CheckCircle2,
  Clock,
  Radio,
  Smartphone,
  Monitor,
  Eye,
  Activity,
  ExternalLink,
  Server,
  Search,
  Link2,
  ShieldCheck,
  Megaphone,
  Tv,
  KeyRound,
  RotateCcw,
  X,
} from 'lucide-react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, uploadMediaFile } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLiveTelemetry } from '../services/presenceService';
import { DailyAudienceGraph } from '../components/DailyAudienceGraph';
import { SourceBridgeTab } from '../components/SourceBridgeTab';
import { VideoPlayer } from '../components/VideoPlayer';
import { PreRollAdModal } from '../components/PreRollAdModal';
import { AdsterraBanner320x50, AdsterraNativeBanner } from '../components/AdsterraAds';
import { isSafeAdUrl, resetAdCooldown } from '../services/adService';
import {
  AdControlConfig,
  AuditLog,
  ContactMessage,
  EventStatus,
  PreRollAdConfig,
  SportEvent,
  StreamServer,
  UserProfile,
} from '../types';

type AdminTab =
  | 'dashboard'
  | 'viewers'
  | 'events'
  | 'ads'
  | 'automation'
  | 'sourceBridge'
  | 'sports'
  | 'teams'
  | 'competitions'
  | 'news'
  | 'categories'
  | 'media'
  | 'users'
  | 'messages'
  | 'notifications'
  | 'settings'
  | 'audit';

const DEFAULT_AD_CONTROL: AdControlConfig = {
  adsEnabled: false,
  bannerEnabled: true,
  nativeEnabled: true,
  smartlinkUrl: '',
  bannerImageUrl: '',
  bannerTitle: 'Watch HD Sports Anywhere',
  bannerSubtitle: 'Official Partner Offer',
  bannerCta: 'Explore Now',
  nativeTitle: 'Sponsored Sports Offer',
  nativeDescription: 'Unlock exclusive match day highlights and partner deals.',
  nativeImageUrl: '',
  nativeTargetUrl: '',
  nativeCta: 'Open Offer',
};

const DEFAULT_PREROLL: PreRollAdConfig = {
  enabled: false,
  durationSeconds: 8,
  frequencyHours: 12,
  title: 'Featured Match Partner',
  description: 'Support live sports broadcasts by visiting our featured partner offer.',
  badgeText: 'SPONSORED',
  imageUrl: '',
  targetUrl: '',
  ctaText: 'Visit Sponsor',
};

const SPORT_TV_MAPPINGS = [
  {
    sport: 'Cricket',
    channels: ['T Sports Live', 'Willow Sports HD', 'GTV Live', 'DD Sports', 'Cricket Gold HD'],
    badge: 'CRICKET',
  },
  {
    sport: 'Football',
    channels: ['beIN SPORTS XTRA', 'FIFA+ Live', 'TyC Sports Internacional', 'Inter TV'],
    badge: 'FOOTBALL',
  },
  {
    sport: 'Tennis',
    channels: ['Tennis Channel HD', 'Eurovision Sport EBU'],
    badge: 'TENNIS',
  },
  {
    sport: 'Basketball',
    channels: ['Fubo Sports Network', 'ACC Digital Network'],
    badge: 'BASKETBALL',
  },
];

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, logout, signInWithGoogle } = useAuth();
  const {
    events,
    sports,
    teams,
    competitions,
    news,
    categories,
    settings,
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
    customChannels,
    autoSyncing,
    lastAutoSyncTime,
    syncLiveSportsFromGoogle,
  } = useData();

  const telemetry = useLiveTelemetry();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [auditList, setAuditList] = useState<AuditLog[]>([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [quickScoreMap, setQuickScoreMap] = useState<Record<string, string>>({});
  const [testStreamUrl, setTestStreamUrl] = useState<string | null>(null);
  const [testStreamTitle, setTestStreamTitle] = useState<string>('Live Stream Preview');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Automated Stream Discovery State
  const [streamMatchId, setStreamMatchId] = useState<string>('');
  const [customMatchTitle, setCustomMatchTitle] = useState<string>('Bangladesh vs West Indies live match');
  const [discoveringStreams, setDiscoveringStreams] = useState<boolean>(false);
  const [discoveredServers, setDiscoveredServers] = useState<StreamServer[] | null>(null);
  const [streamSearchSource, setStreamSearchSource] = useState<string>('');

  // Event form state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [evTitle, setEvTitle] = useState('');
  const [evSport, setEvSport] = useState('football');
  const [evComp, setEvComp] = useState('premier-cup');
  const [evDate, setEvDate] = useState('2026-11-06');
  const [evTime, setEvTime] = useState('20:00');
  const [evStatus, setEvStatus] = useState<EventStatus>('UPCOMING');
  const [evStream, setEvStream] = useState('');
  const [evThumb, setEvThumb] = useState('');
  const [evScore, setEvScore] = useState('');
  const [evDesc, setEvDesc] = useState('');

  // News form state
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCat, setNewsCat] = useState('match-reports');
  const [newsImage, setNewsImage] = useState('');
  const [newsDesc, setNewsDesc] = useState('');
  const [newsContent, setNewsContent] = useState('');

  // Media upload state
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Simple entity inputs
  const [sportName, setSportName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamShort, setTeamShort] = useState('');
  const [compName, setCompName] = useState('');
  const [catName, setCatName] = useState('');

  // Settings form
  const [siteName, setSiteName] = useState(settings.siteName);
  const [ownerName, setOwnerName] = useState(settings.ownerName || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [tagline, setTagline] = useState(settings.tagline);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [footerText, setFooterText] = useState(settings.footerText);
  const [adFreeMode, setAdFreeMode] = useState<boolean>(settings.adFreeMode ?? true);

  // Ad Manager state
  const [adForm, setAdForm] = useState<AdControlConfig>({
    ...DEFAULT_AD_CONTROL,
    ...(settings.adControl || {}),
  });
  const [preRollForm, setPreRollForm] = useState<PreRollAdConfig>({
    ...DEFAULT_PREROLL,
    ...(settings.preRollAd || {}),
  });
  const [savingAds, setSavingAds] = useState(false);
  const [previewPreRollOpen, setPreviewPreRollOpen] = useState(false);

  useEffect(() => {
    setSiteName(settings.siteName);
    setOwnerName(settings.ownerName || '');
    setLogoUrl(settings.logoUrl || '');
    setTagline(settings.tagline);
    setContactEmail(settings.contactEmail);
    setFooterText(settings.footerText);
    setAdFreeMode(settings.adFreeMode ?? true);
    setAdForm({
      ...DEFAULT_AD_CONTROL,
      ...(settings.adControl || {}),
      adsEnabled:
        settings.adFreeMode === false
          ? Boolean(settings.adControl?.adsEnabled ?? true)
          : Boolean(settings.adControl?.adsEnabled ?? false),
    });
    setPreRollForm({
      ...DEFAULT_PREROLL,
      ...(settings.preRollAd || {}),
    });
  }, [settings]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setUsersList(snap.docs.map((d) => d.data() as UserProfile));
      },
      (err) => console.error('Users listener error:', err)
    );
    const unsubMsgs = onSnapshot(
      collection(db, 'contactMessages'),
      (snap) => {
        setMessagesList(snap.docs.map((d) => d.data() as ContactMessage));
      },
      (err) => console.error('Messages listener error:', err)
    );
    const unsubAudit = onSnapshot(
      collection(db, 'auditLogs'),
      (snap) => {
        setAuditList(snap.docs.map((d) => d.data() as AuditLog));
      },
      (err) => console.error('Audit listener error:', err)
    );
    return () => {
      unsubUsers();
      unsubMsgs();
      unsubAudit();
    };
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 rounded-2xl bg-[#0F1623] border border-white/[0.08] animate-pulse" />
        <div className="h-64 rounded-2xl bg-[#0F1623] border border-white/[0.08] animate-pulse" />
      </div>
    );
  }

  const brandName = settings.siteName?.trim() || 'KhelaDekH';
  const brandLogo = settings.logoUrl || '/src/assets/images/kheladekh_logo_1793952334814.jpg';

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-7 rounded-2xl bg-[#0F1623] border border-white/[0.08] text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img
            src={brandLogo}
            alt={brandName}
            className="w-16 h-16 rounded-2xl object-cover border border-white/15 bg-[#080B12]"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/src/assets/images/kheladekh_logo_1793952334814.jpg';
            }}
          />
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#00B7FF]">
              Broadcast Control Center
            </p>
            <h1 className="font-display text-3xl font-black tracking-tight text-white mt-1">
              {brandName}
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              Admin Console Sign-In Required
            </p>
          </div>
        </div>

        {user && !isAdmin ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300 space-y-3">
            <p>
              বর্তমান অ্যাকাউন্টটি ({user.email || user.phoneNumber || 'Guest'}) অ্যাডমিন হিসেবে অনুমোদিত নয়।
            </p>
            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl font-semibold text-xs transition-colors"
            >
              লগআউট করে অ্যাডমিন অ্যাকাউন্টে যান
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-white hover:bg-[#E2E8F0] text-[#080B12] font-bold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{brandName} অ্যাডমিন Google সাইন ইন</span>
            </button>
            <Link
              to="/auth"
              className="block w-full py-2 text-xs text-[#00B7FF] hover:underline font-medium"
            >
              ইমেইল / ফোন OTP সাইন ইন পেজে যান →
            </Link>
          </div>
        )}
      </div>
    );
  }

  const notify = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleSaveAdsConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const urlFields: Array<[string, string | undefined]> = [
      ['Smartlink URL', adForm.smartlinkUrl],
      ['Banner Image URL', adForm.bannerImageUrl],
      ['Native Target URL', adForm.nativeTargetUrl],
      ['Native Image URL', adForm.nativeImageUrl],
      ['Pre-Roll Target URL', preRollForm.targetUrl],
      ['Pre-Roll Image URL', preRollForm.imageUrl],
    ];
    for (const [label, raw] of urlFields) {
      if (raw && raw.trim() && !isSafeAdUrl(raw)) {
        notify(`${label} অবশ্যই বৈধ http:// বা https:// লিংক হতে হবে।`);
        return;
      }
    }

    setSavingAds(true);
    try {
      const nextAdsEnabled = Boolean(adForm.adsEnabled);
      await saveSettings({
        ...settings,
        adFreeMode: !nextAdsEnabled,
        adControl: {
          ...adForm,
          adsEnabled: nextAdsEnabled,
          smartlinkUrl: adForm.smartlinkUrl.trim(),
          bannerImageUrl: adForm.bannerImageUrl?.trim() || '',
          nativeTargetUrl: adForm.nativeTargetUrl?.trim() || '',
          nativeImageUrl: adForm.nativeImageUrl?.trim() || '',
        },
        preRollAd: {
          ...preRollForm,
          durationSeconds: Math.max(0, Math.min(30, Number(preRollForm.durationSeconds || 5))),
          frequencyHours: Math.max(1, Math.min(72, Number(preRollForm.frequencyHours || 12))),
          targetUrl: preRollForm.targetUrl.trim(),
          imageUrl: preRollForm.imageUrl?.trim() || '',
        },
      });
      notify(
        nextAdsEnabled
          ? 'Ad Manager সেভ হয়েছে — আপনার কনফিগার করা অ্যাডগুলো এখন ওয়েবসাইটে চালু আছে।'
          : 'Ad-Free মোড সংরক্ষিত হয়েছে — সকল বিজ্ঞাপন বর্তমানে বন্ধ।'
      );
    } catch (err: any) {
      notify(`সেভ করতে সমস্যা হয়েছে: ${err?.message || 'Permission error'}`);
    } finally {
      setSavingAds(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;
    const slug = evTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newEv: SportEvent = {
      id: editingEventId || `${slug}_${Date.now()}`,
      title: evTitle.trim(),
      slug,
      sportId: evSport,
      competitionId: evComp,
      teamIds: [],
      description: evDesc.trim() || 'Live sports broadcast.',
      eventDate: evDate,
      eventTime: evTime,
      timezone: 'UTC',
      status: evStatus,
      published: true,
      authorizedViewingUrl: evStream.trim(),
      thumbnailUrl: evThumb.trim(),
      scoreSummary: evScore.trim(),
      createdAt: new Date().toISOString(),
    };
    await saveEvent(newEv);
    setEditingEventId(null);
    setEvTitle('');
    setEvStream('');
    setEvThumb('');
    setEvScore('');
    setEvDesc('');
    notify(editingEventId ? 'Event updated.' : 'Event created.');
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim()) return;
    const slug = newsTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    await saveNews({
      id: editingNewsId || `${slug}_${Date.now()}`,
      title: newsTitle.trim(),
      slug,
      description: newsDesc.trim() || newsTitle.trim(),
      content: newsContent.trim() || newsDesc.trim(),
      categoryId: newsCat,
      imageUrl: newsImage.trim(),
      authorId: user.uid,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setEditingNewsId(null);
    setNewsTitle('');
    setNewsImage('');
    setNewsDesc('');
    setNewsContent('');
    notify(editingNewsId ? 'Article updated.' : 'Article published.');
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const url = await uploadMediaFile(file, 'kheladekh');
      setUploadedUrls((prev) => [url, ...prev]);
      onSuccess(url);
      notify('Image uploaded to Firebase Storage.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAutoUpdateMatchStatuses = async () => {
    const now = new Date();
    let updatedCount = 0;
    for (const ev of events) {
      if (!ev.eventDate || !ev.eventTime) continue;
      try {
        const matchDateTime = new Date(`${ev.eventDate}T${ev.eventTime}:00`);
        const diffMinutes = (now.getTime() - matchDateTime.getTime()) / (1000 * 60);

        if (diffMinutes >= 0 && diffMinutes <= 180 && ev.status === 'UPCOMING') {
          await saveEvent({ ...ev, status: 'LIVE', featured: true });
          updatedCount++;
        } else if (diffMinutes > 180 && ev.status === 'LIVE') {
          await saveEvent({ ...ev, status: 'FINISHED', featured: false });
          updatedCount++;
        }
      } catch {
        // Skip malformed dates
      }
    }
    notify(`Automated Status Engine checked matches and updated ${updatedCount} statuses.`);
  };

  const handlePublishAllEvents = async () => {
    let count = 0;
    for (const ev of events) {
      if (!ev.published) {
        await saveEvent({ ...ev, published: true });
        count++;
      }
    }
    notify(`Published ${count} events.`);
  };

  const handleQuickStatusChange = async (event: SportEvent, newStatus: EventStatus) => {
    await saveEvent({ ...event, status: newStatus });
    notify(`Updated "${event.title}" to ${newStatus}`);
  };

  const handleQuickScoreSave = async (event: SportEvent) => {
    const newScore = quickScoreMap[event.id] ?? event.scoreSummary ?? '';
    await saveEvent({ ...event, scoreSummary: newScore });
    notify(`Saved score "${newScore}" for ${event.title}`);
  };

  const handleQuickFeaturedToggle = async (event: SportEvent) => {
    await saveEvent({ ...event, featured: !event.featured });
    notify(`${event.featured ? 'Unpinned from' : 'Pinned to'} featured matches.`);
  };

  const handleDiscoverStreams = async () => {
    setDiscoveringStreams(true);
    try {
      const selectedEv = events.find((e) => e.id === streamMatchId);
      const query = customMatchTitle.trim() || (selectedEv ? selectedEv.title : 'Bangladesh vs West Indies live match');

      const res = await fetch('/api/discover-stream-servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchTitle: query,
          sportId: selectedEv?.sportId || 'cricket',
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.servers)) {
        setDiscoveredServers(data.servers);
        setStreamSearchSource(data.source || 'gemini_grounding');
        notify(`লাইভ টিভি স্ট্রিম স্ক্যান সম্পন্ন: ৫টি সার্ভার প্রস্তুত (${data.totalDiscovered} ফিড পাওয়া গেছে)`);
      } else {
        notify('স্ট্রিম ডিসকভারিতে সমস্যা হয়েছে, ব্যাকআপ টিভি সার্ভার তৈরি হয়েছে।');
      }
    } catch (err: any) {
      notify(`ত্রুটি: ${err.message}`);
    } finally {
      setDiscoveringStreams(false);
    }
  };

  const handleBindServersToMatch = async (targetEventId?: string) => {
    const targetId = targetEventId || streamMatchId;
    if (!targetId) {
      notify('অনুগ্রহ করে একটি ম্যাচ নির্বাচন করুন');
      return;
    }
    if (!discoveredServers || discoveredServers.length === 0) {
      notify('প্রথমে লাইভ টিভি স্ট্রিম স্ক্যান করে ৫টি সার্ভার তৈরি করুন');
      return;
    }
    const targetEvent = events.find((e) => e.id === targetId);
    if (!targetEvent) return;

    await saveEvent({
      ...targetEvent,
      streamServers: discoveredServers,
      authorizedViewingUrl: discoveredServers[0]?.url || targetEvent.authorizedViewingUrl,
    });
    notify(`"${targetEvent.title}" ম্যাচে ৫টি টিভি সার্ভার সেভ করা হয়েছে।`);
  };

  const handleAutoPilotAllMatches = async () => {
    const liveMatches = events.filter((e) => e.status === 'LIVE' || e.status === 'UPCOMING');
    if (liveMatches.length === 0) {
      notify('বর্তমানে কোনো লাইভ বা আসন্ন ম্যাচ পাওয়া যায়নি।');
      return;
    }
    setDiscoveringStreams(true);
    notify(`মোট ${liveMatches.length}টি ম্যাচের জন্য স্পোর্ট-ম্যাচড টিভি চ্যানেল সেট হচ্ছে...`);

    let updatedCount = 0;
    for (const match of liveMatches) {
      try {
        const res = await fetch('/api/discover-stream-servers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchTitle: match.title, sportId: match.sportId }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.servers)) {
          await saveEvent({
            ...match,
            streamServers: data.servers,
            authorizedViewingUrl: data.servers[0]?.url || match.authorizedViewingUrl,
          });
          updatedCount++;
        }
      } catch (e) {
        console.warn(`Failed to auto-sync stream for ${match.title}:`, e);
      }
    }
    setDiscoveringStreams(false);
    notify(`মোট ${updatedCount}টি ম্যাচে স্বয়ংক্রিয়ভাবে ৫টি করে লাইভ টিভি সার্ভার যুক্ত হয়েছে।`);
  };

  const sidebarGroups: {
    title: string;
    items: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[];
  }[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        {
          id: 'viewers',
          label: 'Live Audience',
          icon: <Radio className="w-4 h-4 text-red-400" />,
          badge: telemetry.totalMatchWatchers > 0 ? `${telemetry.totalMatchWatchers}` : undefined,
        },
      ],
    },
    {
      title: 'Broadcast & Ads',
      items: [
        { id: 'events', label: 'Match Controller', icon: <Calendar className="w-4 h-4" /> },
        {
          id: 'ads',
          label: 'Ad Manager',
          icon: <Megaphone className="w-4 h-4 text-amber-400" />,
          badge: settings.adFreeMode === false && settings.adControl?.adsEnabled ? 'LIVE' : 'OFF',
        },
        { id: 'automation', label: 'Auto TV & Feeds', icon: <Zap className="w-4 h-4 text-[#00B7FF]" /> },
        {
          id: 'sourceBridge',
          label: 'Apps Bridge & Brand',
          icon: <ShieldCheck className="w-4 h-4 text-[#16D98A]" />,
          badge: customChannels.length > 0 ? `${customChannels.length}` : undefined,
        },
      ],
    },
    {
      title: 'Catalog',
      items: [
        { id: 'sports', label: 'Sports', icon: <Trophy className="w-4 h-4" /> },
        { id: 'teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
        { id: 'competitions', label: 'Competitions', icon: <Award className="w-4 h-4" /> },
        { id: 'news', label: 'News & Articles', icon: <Newspaper className="w-4 h-4" /> },
        { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
        { id: 'media', label: 'Media Library', icon: <Image className="w-4 h-4" /> },
      ],
    },
    {
      title: 'System & Auth',
      items: [
        { id: 'users', label: 'User Profiles', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'messages', label: 'Contact Messages', icon: <Mail className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings & Auth', icon: <Settings className="w-4 h-4" /> },
        { id: 'audit', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
      ],
    },
  ];

  const flatSidebarItems = sidebarGroups.flatMap((g) => g.items);
  const currentTabMeta = flatSidebarItems.find((item) => item.id === activeTab);
  const adsCurrentlyLive = settings.adFreeMode === false && Boolean(settings.adControl?.adsEnabled);
  const resetOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-5">
      {/* Top Admin Header Bar */}
      <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={brandLogo}
            alt={brandName}
            className="w-9 h-9 rounded-xl object-cover border border-white/10 bg-[#080B12] shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/src/assets/images/kheladekh_logo_1793952334814.jpg';
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B]">
              <span>{brandName} Admin</span>
              <span>/</span>
              <span className="text-[#00B7FF]">{currentTabMeta?.label}</span>
            </div>
            <p className="text-sm font-bold text-white truncate">
              {currentTabMeta?.label || 'Dashboard'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              adsCurrentlyLive
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                : 'bg-[#141D2E] border-white/[0.08] text-[#16D98A]'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>{adsCurrentlyLive ? 'Ads: Active' : 'Ads: Ad-Free'}</span>
          </button>

          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg bg-[#141D2E] hover:bg-white/10 border border-white/[0.08] text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#00B7FF]" />
            <span>View Live Site</span>
          </Link>
        </div>
      </div>

      {/* Mobile Tab Selector (<lg) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {flatSidebarItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors ${
              activeTab === item.id
                ? 'bg-[#00B7FF] text-[#080B12] border-[#00B7FF]'
                : 'bg-[#0F1623] text-[#94A3B8] border-white/[0.08] hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Desktop Grouped Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-[#0F1623] rounded-2xl border border-white/[0.08] p-4 space-y-5 sticky top-20">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[10px] font-mono uppercase tracking-[0.14em] text-[#64748B] mb-1.5">
                {group.title}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full min-h-[38px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#00B7FF] text-[#080B12]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tabular-nums shrink-0 ${
                        activeTab === item.id
                          ? 'bg-black/20 text-[#080B12]'
                          : item.badge === 'LIVE'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-white/[0.06] text-[#CBD5E1]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}

          <div className="pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={logout}
              className="w-full min-h-[38px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Panel */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          {statusMsg && (
            <div className="px-4 py-3 rounded-xl bg-[#16D98A]/10 border border-[#16D98A]/30 text-xs font-medium text-[#16D98A] flex items-center justify-between gap-2">
              <span>{statusMsg}</span>
              <button
                type="button"
                onClick={() => setStatusMsg('')}
                className="text-[#16D98A] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-white">
                    Broadcast Overview
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Real-time match telemetry, TV broadcasts, and Ad Manager controls.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ads')}
                    className="min-h-[38px] px-4 py-2 rounded-xl bg-[#141D2E] border border-white/[0.08] hover:border-amber-400/40 text-xs font-semibold text-amber-300 inline-flex items-center gap-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Ad Manager</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await seedDatabase();
                      notify('Initial catalog synced to Firestore.');
                    }}
                    className="min-h-[38px] px-4 py-2 rounded-xl bg-[#141D2E] border border-white/[0.08] hover:border-[#00B7FF]/40 text-xs font-semibold text-[#00B7FF] inline-flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>Seed Catalog</span>
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Watching Live Now',
                    value: telemetry.totalMatchWatchers,
                    sub: `${telemetry.totalVisitors} total online`,
                    accent: 'text-red-400',
                  },
                  {
                    label: 'Live Matches',
                    value: events.filter((e) => e.status === 'LIVE').length,
                    sub: `${events.length} total fixtures`,
                    accent: 'text-[#16D98A]',
                  },
                  {
                    label: 'Custom TV Channels',
                    value: customChannels.length,
                    sub: `${brandName} Branded`,
                    accent: 'text-[#00B7FF]',
                  },
                  {
                    label: 'Registered Users',
                    value: usersList.length,
                    sub: adsCurrentlyLive ? 'Ads Active' : 'Ad-Free Mode',
                    accent: adsCurrentlyLive ? 'text-amber-300' : 'text-white',
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-2xl bg-[#141D2E] border border-white/[0.08] p-5"
                  >
                    <p className="text-xs text-[#94A3B8]">{kpi.label}</p>
                    <p
                      className={`font-display text-3xl font-black mt-1.5 tabular-nums ${kpi.accent}`}
                    >
                      {kpi.value}
                    </p>
                    <p className="text-[11px] text-[#64748B] font-mono mt-1">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Quick Action Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-mono uppercase tracking-wider text-amber-300">
                      Monetization & Sponsors
                    </p>
                    <h2 className="text-base font-bold text-white">
                      {adsCurrentlyLive
                        ? 'আপনার সাইটে অ্যাডস বর্তমানে চালু আছে'
                        : 'এখন অ্যাড-মুক্ত মোডে চলছে — চাইলে অ্যাড চালু করুন'}
                    </h2>
                    <p className="text-xs text-[#94A3B8]">
                      স্মার্টলিংক, ব্যানার, নেটিভ কার্ড এবং ম্যাচ শুরুর প্রি-রোল পপ-আপ এখান থেকে নিয়ন্ত্রণ করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ads')}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#080B12] text-xs font-bold shrink-0 transition-colors"
                  >
                    Ad Manager
                  </button>
                </div>

                <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#16D98A]">
                      White-Label TV Bridge
                    </p>
                    <h2 className="text-base font-bold text-white">
                      নিজস্ব ব্র্যান্ড ও স্পোর্টস চ্যানেল পরিচালনা
                    </h2>
                    <p className="text-xs text-[#94A3B8]">
                      নতুন M3U/লিংক/অ্যাপস সোর্স থেকে লাইভ চ্যানেল এনে {brandName} নামে যুক্ত করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sourceBridge')}
                    className="px-4 py-2.5 rounded-xl bg-[#16D98A] hover:bg-[#1FE896] text-[#080B12] text-xs font-bold shrink-0 transition-colors"
                  >
                    Open Bridge
                  </button>
                </div>
              </div>

              <DailyAudienceGraph
                todayVisitors={telemetry.totalVisitors}
                todayMatchWatchers={telemetry.totalMatchWatchers}
              />
            </div>
          )}

          {/* 2. AD MANAGER TAB */}
          {activeTab === 'ads' && (
            <form onSubmit={handleSaveAdsConfig} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-white">
                    Ad Manager (অ্যাড কন্ট্রোল প্যানেল)
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    আপনার আগের Smartlink বা ডিরেক্ট অ্যাড লিংক এখানে বসান — ১-ক্লিকে সব অ্যাড চালু বা বন্ধ করতে পারবেন।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetAdCooldown();
                      setPreviewPreRollOpen(true);
                      notify('12h cooldown reset — Live Pre-Roll preview opened.');
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#141D2E] border border-white/[0.08] hover:border-[#00B7FF]/40 text-xs font-semibold text-[#00B7FF] inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Cooldown & Preview Modal</span>
                  </button>
                  <button
                    type="submit"
                    disabled={savingAds}
                    className="min-h-[40px] px-5 py-2 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingAds ? 'Saving...' : 'Save Ad Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Master Ad Switch */}
              <div className="rounded-2xl bg-[#141D2E] border border-white/[0.08] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-300" />
                    <h2 className="text-sm font-bold text-white">
                      Master Ads Status (ওয়েবসাইটের সব অ্যাড চালু / বন্ধ)
                    </h2>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    চালু করলে Home, Live TV এবং Match পেজে আপনার কনফিগার করা Smartlink/Banner/Native/Pre-Roll অ্যাড দেখাবে।
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-[#080B12] p-1 border border-white/[0.08] shrink-0">
                  <button
                    type="button"
                    onClick={() => setAdForm((prev) => ({ ...prev, adsEnabled: false }))}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                      !adForm.adsEnabled
                        ? 'bg-[#16D98A] text-[#080B12]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Ad-Free (OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdForm((prev) => ({ ...prev, adsEnabled: true }))}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                      adForm.adsEnabled
                        ? 'bg-amber-400 text-[#080B12]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Ads Active (ON)
                  </button>
                </div>
              </div>

              {/* Smartlink / Direct Ad URL */}
              <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    ১. Smartlink / Direct Ad URL (আপনার আগের অ্যাড লিংক এখানে দিন)
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    আপনার Adsterra বা যেকোনো পার্টনারের Direct / Smartlink URL এখানে পেস্ট করুন। ব্যানার ও পপ-আপ বাটনে ক্লিক করলে ভিজিটর এই লিংকে যাবে।
                  </p>
                </div>
                <input
                  type="url"
                  value={adForm.smartlinkUrl}
                  onChange={(e) => setAdForm((prev) => ({ ...prev, smartlinkUrl: e.target.value }))}
                  placeholder="https://your-smartlink-domain.com/..."
                  className="w-full h-11 px-3.5 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white font-mono focus:border-[#00B7FF] outline-none"
                />
              </div>

              {/* Banner & Native Slot Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Banner Ad */}
                <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white">২. Banner Strip Ad</h2>
                      <p className="text-xs text-[#94A3B8]">প্লেয়ার ও হোমপেজের নিচে দেখাবে</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adForm.bannerEnabled}
                        onChange={(e) =>
                          setAdForm((prev) => ({ ...prev, bannerEnabled: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#00B7FF]"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={adForm.bannerTitle || ''}
                      onChange={(e) =>
                        setAdForm((prev) => ({ ...prev, bannerTitle: e.target.value }))
                      }
                      placeholder="Banner Title"
                      className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={adForm.bannerSubtitle || ''}
                      onChange={(e) =>
                        setAdForm((prev) => ({ ...prev, bannerSubtitle: e.target.value }))
                      }
                      placeholder="Subtitle / Sponsor"
                      className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="url"
                      value={adForm.bannerImageUrl || ''}
                      onChange={(e) =>
                        setAdForm((prev) => ({ ...prev, bannerImageUrl: e.target.value }))
                      }
                      placeholder="Banner Image URL (optional)"
                      className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      value={adForm.bannerCta || ''}
                      onChange={(e) =>
                        setAdForm((prev) => ({ ...prev, bannerCta: e.target.value }))
                      }
                      placeholder="CTA Button Text"
                      className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="pt-2 space-y-1.5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                      Live Banner Preview
                    </p>
                    <AdsterraBanner320x50 previewOverride={adForm} />
                  </div>
                </div>

                {/* Native Promo Card */}
                <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white">৩. Native Promo Card</h2>
                      <p className="text-xs text-[#94A3B8]">ম্যাচ ও টিভি চ্যানেল গ্রিডের মাঝে দেখাবে</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adForm.nativeEnabled}
                        onChange={(e) =>
                          setAdForm((prev) => ({ ...prev, nativeEnabled: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#00B7FF]"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={adForm.nativeTitle || ''}
                      onChange={(e) =>
                        setAdForm((prev) => ({ ...prev, nativeTitle: e.target.value }))
                      }
                      placeholder="Promo Title"
                      className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={adForm.nativeCta || ''}
                      onChange={(e) =>
                        setAdForm((prev) => ({ ...prev, nativeCta: e.target.value }))
                      }
                      placeholder="CTA Text"
                      className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="url"
                      value={adForm.nativeTargetUrl || ''}
                      onChange={(e) =>
                        setAdForm((prev) => ({ ...prev, nativeTargetUrl: e.target.value }))
                      }
                      placeholder="Custom Target URL (falls back to Smartlink)"
                      className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white font-mono"
                    />
                    <input
                      type="url"
                      value={adForm.nativeImageUrl || ''}
                      onChange={(e) =>
                        setAdForm((prev) => ({ ...prev, nativeImageUrl: e.target.value }))
                      }
                      placeholder="Image URL (optional)"
                      className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                  <input
                    type="text"
                    value={adForm.nativeDescription || ''}
                    onChange={(e) =>
                      setAdForm((prev) => ({ ...prev, nativeDescription: e.target.value }))
                    }
                    placeholder="Short promo description"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                  />

                  <div className="pt-2 space-y-1.5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                      Live Native Preview
                    </p>
                    <AdsterraNativeBanner previewOverride={adForm} />
                  </div>
                </div>
              </div>

              {/* Pre-Roll Match Interstitial Modal Settings */}
              <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      ৪. Pre-Roll Match Interstitial Modal (খেলা শুরুর আগে পপ-আপ অ্যাড)
                    </h2>
                    <p className="text-xs text-[#94A3B8]">
                      ম্যাচ পেজে ঢোকার সময় কুলডাউন অনুযায়ী একবার এই মডালটি দেখাবে।
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preRollForm.enabled}
                      onChange={(e) =>
                        setPreRollForm((prev) => ({ ...prev, enabled: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#00B7FF]"
                    />
                    <span>Pre-Roll Active</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      Countdown (Seconds)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={preRollForm.durationSeconds}
                      onChange={(e) =>
                        setPreRollForm((prev) => ({
                          ...prev,
                          durationSeconds: Number(e.target.value),
                        }))
                      }
                      className="w-full h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      Frequency Cooldown (Hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={preRollForm.frequencyHours}
                      onChange={(e) =>
                        setPreRollForm((prev) => ({
                          ...prev,
                          frequencyHours: Number(e.target.value),
                        }))
                      }
                      className="w-full h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">Badge Label</label>
                    <input
                      type="text"
                      value={preRollForm.badgeText}
                      onChange={(e) =>
                        setPreRollForm((prev) => ({ ...prev, badgeText: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">Button CTA</label>
                    <input
                      type="text"
                      value={preRollForm.ctaText}
                      onChange={(e) =>
                        setPreRollForm((prev) => ({ ...prev, ctaText: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={preRollForm.title}
                    onChange={(e) =>
                      setPreRollForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Pre-Roll Headline"
                    className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                  />
                  <input
                    type="url"
                    value={preRollForm.targetUrl}
                    onChange={(e) =>
                      setPreRollForm((prev) => ({ ...prev, targetUrl: e.target.value }))
                    }
                    placeholder="Pre-Roll Target URL (falls back to Smartlink)"
                    className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white font-mono"
                  />
                  <input
                    type="url"
                    value={preRollForm.imageUrl || ''}
                    onChange={(e) =>
                      setPreRollForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                    placeholder="Banner/Poster Image URL (optional)"
                    className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    value={preRollForm.description}
                    onChange={(e) =>
                      setPreRollForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Sponsor description"
                    className="h-10 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </form>
          )}

          {/* 3. SOURCE BRIDGE */}
          {activeTab === 'sourceBridge' && (
            <SourceBridgeTab
              onNotify={notify}
              onTestPlay={(url, title) => {
                setTestStreamUrl(url);
                setTestStreamTitle(title || 'Live Source Preview');
              }}
            />
          )}

          {/* 4. LIVE VIEWERS TELEMETRY */}
          {activeTab === 'viewers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-white">
                    Live Audience Monitor
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    এই মুহূর্তে কোন খেলায় কতজন দর্শক লাইভ দেখছেন তার রিয়েল-টাইম হিসাব।
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-[#16D98A]/10 border border-[#16D98A]/25 text-[#16D98A] text-xs font-mono font-semibold self-start">
                  Realtime Sync Active
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-[#141D2E] border border-white/[0.08] p-5">
                  <p className="text-xs text-red-400 font-semibold">Watching Live Match</p>
                  <p className="font-display text-3xl font-black text-white mt-2 tabular-nums">
                    {telemetry.totalMatchWatchers}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">Active stream viewers</p>
                </div>

                <div className="rounded-2xl bg-[#141D2E] border border-white/[0.08] p-5">
                  <p className="text-xs text-[#00B7FF] font-semibold">Total Online Visitors</p>
                  <p className="font-display text-3xl font-black text-white mt-2 tabular-nums">
                    {telemetry.totalVisitors}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">Across all pages</p>
                </div>

                <div className="rounded-2xl bg-[#141D2E] border border-white/[0.08] p-5">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span className="inline-flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      Mobile
                    </span>
                    <span className="font-mono text-emerald-400 tabular-nums">
                      {telemetry.totalVisitors > 0
                        ? Math.round((telemetry.deviceStats.mobile / telemetry.totalVisitors) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <p className="font-display text-2xl font-bold text-white mt-2 tabular-nums">
                    {telemetry.deviceStats.mobile}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#141D2E] border border-white/[0.08] p-5">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span className="inline-flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-[#00B7FF]" />
                      Desktop
                    </span>
                    <span className="font-mono text-[#00B7FF] tabular-nums">
                      {telemetry.totalVisitors > 0
                        ? Math.round((telemetry.deviceStats.desktop / telemetry.totalVisitors) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <p className="font-display text-2xl font-bold text-white mt-2 tabular-nums">
                    {telemetry.deviceStats.desktop}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-400" />
                    Audience per Match
                  </h2>
                  <span className="text-xs font-mono text-[#64748B] tabular-nums">
                    {telemetry.matchStats.length} active matches
                  </span>
                </div>

                {telemetry.matchStats.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] py-4">
                    এই মুহূর্তে কোনো ম্যাচ পেজে সক্রিয় দর্শক নেই।
                  </p>
                ) : (
                  <div className="space-y-3">
                    {telemetry.matchStats.map((stat, idx) => {
                      const matchEvent = events.find((e) => e.id === stat.eventId);
                      const pct =
                        telemetry.totalMatchWatchers > 0
                          ? Math.round((stat.count / telemetry.totalMatchWatchers) * 100)
                          : 100;

                      return (
                        <div
                          key={stat.eventId}
                          className="rounded-xl bg-[#141D2E] border border-white/[0.08] p-4 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xs font-mono text-[#64748B] tabular-nums">
                                #{idx + 1}
                              </span>
                              <p className="text-sm font-bold text-white truncate">
                                {stat.eventTitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-mono font-bold text-red-400 tabular-nums">
                                {stat.count} watching ({pct}%)
                              </span>
                              {matchEvent && (
                                <Link
                                  to={`/events/${matchEvent.slug || matchEvent.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#00B7FF] hover:text-white"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#00B7FF] h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00B7FF]" />
                    Active Live Sessions ({telemetry.activeSessions.length})
                  </h2>
                </div>
                {telemetry.activeSessions.length === 0 ? (
                  <p className="text-xs text-[#94A3B8]">কোনো সক্রিয় সেশন নেই</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-[#94A3B8]">
                          <th className="py-2.5 px-3">User / Session</th>
                          <th className="py-2.5 px-3">Page / Match</th>
                          <th className="py-2.5 px-3">Device</th>
                          <th className="py-2.5 px-3">Last Ping</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {telemetry.activeSessions.map((session) => {
                          const secondsAgo = Math.max(
                            0,
                            Math.round((Date.now() - session.lastPing) / 1000)
                          );
                          return (
                            <tr key={session.id}>
                              <td className="py-2.5 px-3 text-white font-medium">
                                {session.userName || 'Guest'}
                              </td>
                              <td className="py-2.5 px-3 text-[#94A3B8] font-mono">
                                {session.eventTitle || session.page}
                              </td>
                              <td className="py-2.5 px-3 text-[#CBD5E1] capitalize">
                                {session.device}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[#16D98A] tabular-nums">
                                {secondsAgo < 5 ? 'Live' : `${secondsAgo}s ago`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <DailyAudienceGraph
                todayVisitors={telemetry.totalVisitors}
                todayMatchWatchers={telemetry.totalMatchWatchers}
              />
            </div>
          )}

          {/* 5. AUTOMATION & AUTO TV */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-white">
                    Auto TV & Live Sports Feeds
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    প্রতিটি খেলার জন্য সেই খেলাটি সম্প্রচারকারী টিভি চ্যানেল অটো-ম্যাচ করে লাইভ স্ট্রিম চালু রাখে।
                  </p>
                </div>

                <button
                  type="button"
                  disabled={autoSyncing}
                  onClick={async () => {
                    notify('Syncing live sports schedule...');
                    await syncLiveSportsFromGoogle(false);
                    notify('Sports feed synchronized.');
                  }}
                  className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] disabled:opacity-50 text-[#080B12] text-xs font-bold inline-flex items-center gap-2 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-4 h-4 ${autoSyncing ? 'animate-spin' : ''}`} />
                  <span>{autoSyncing ? 'Syncing...' : 'Sync Sports & TV Channels'}</span>
                </button>
              </div>

              {/* Sport -> Broadcaster TV Mapping */}
              <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-[#16D98A]" />
                    <span>Sport-Matched Live TV Broadcasters (স্বয়ংক্রিয় টিভি চ্যানেল ম্যাপিং)</span>
                  </h2>
                  <span className="text-[11px] font-mono text-[#64748B]">
                    {lastAutoSyncTime ? `Last Sync: ${lastAutoSyncTime}` : 'Every 3 min auto'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SPORT_TV_MAPPINGS.map((row) => (
                    <div
                      key={row.sport}
                      className="rounded-xl bg-[#141D2E] border border-white/[0.08] p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{row.sport}</span>
                        <span className="px-2 py-0.5 rounded bg-[#00B7FF]/15 text-[#00B7FF] text-[10px] font-mono font-bold">
                          {row.badge}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {row.channels.map((ch) => (
                          <span
                            key={ch}
                            className="px-2.5 py-1 rounded-lg bg-[#080B12] border border-white/[0.08] text-[11px] text-[#CBD5E1]"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Automation Tasks */}
              <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                <h2 className="text-sm font-bold text-white">One-Click Automation Tasks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleAutoUpdateMatchStatuses}
                    className="p-4 rounded-xl bg-[#141D2E] hover:bg-white/[0.06] border border-white/[0.08] text-left transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">Auto-Update Statuses</span>
                      <Clock className="w-4 h-4 text-[#00B7FF]" />
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">
                      সময় অনুযায়ী আসন্ন ম্যাচগুলোকে LIVE বা FINISHED হিসেবে আপডেট করে।
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishAllEvents}
                    className="p-4 rounded-xl bg-[#141D2E] hover:bg-white/[0.06] border border-white/[0.08] text-left transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">Publish All Matches</span>
                      <CheckCircle2 className="w-4 h-4 text-[#16D98A]" />
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">
                      সিঙ্ক হওয়া সকল ম্যাচ সাথে সাথে ভিজিটরদের জন্য পাবলিশ করে।
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await seedDatabase();
                      notify('Master verified catalog restored.');
                    }}
                    className="p-4 rounded-xl bg-[#141D2E] hover:bg-white/[0.06] border border-white/[0.08] text-left transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">Seed Default Catalog</span>
                      <Database className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">
                      ডিফল্ট স্পোর্টস, ক্যাটাগরি এবং টুর্নামেন্ট পুনরুদ্ধার করে।
                    </p>
                  </button>
                </div>
              </div>

              {/* Automated 5-Server Live TV Discovery Hub */}
              <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">
                      ম্যাচ অনুযায়ী লাইভ টিভি ও ৫-সার্ভার অটো-স্ক্যানার
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      যেকোনো ম্যাচ সিলেক্ট করে তার সম্প্রচারকারী লাইভ টিভি চ্যানেলগুলোতে ৫টি সার্ভার সেট করুন।
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#00B7FF]/15 text-[#00B7FF] text-xs font-mono font-bold self-start">
                    5-Server Auto-Failover
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      ১. ম্যাচ নির্বাচন করুন
                    </label>
                    <select
                      value={streamMatchId}
                      onChange={(e) => {
                        setStreamMatchId(e.target.value);
                        const match = events.find((ev) => ev.id === e.target.value);
                        if (match) setCustomMatchTitle(`${match.title} live match`);
                      }}
                      className="w-full h-11 bg-[#080B12] border border-white/10 rounded-xl px-3 text-xs text-white focus:border-[#00B7FF] outline-none"
                    >
                      <option value="">-- যেকোনো ম্যাচ বেছে নিন --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.status === 'LIVE' ? 'LIVE: ' : ''}{ev.title} ({ev.sportId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      ২. ম্যাচ / চ্যানেল কীওয়ার্ড
                    </label>
                    <input
                      type="text"
                      value={customMatchTitle}
                      onChange={(e) => setCustomMatchTitle(e.target.value)}
                      placeholder="Bangladesh vs West Indies live match"
                      className="w-full h-11 bg-[#080B12] border border-white/10 rounded-xl px-3 text-xs text-white focus:border-[#00B7FF] outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={discoveringStreams}
                    onClick={handleDiscoverStreams}
                    className="min-h-[42px] px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#080B12] text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {discoveringStreams ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>
                      {discoveringStreams
                        ? 'টিভি ফিড খোঁজা হচ্ছে...'
                        : 'লাইভ টিভি খুঁজুন ও ৫টি সার্ভার তৈরি করুন'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={discoveringStreams}
                    onClick={handleAutoPilotAllMatches}
                    className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    <span>সকল ম্যাচে অটো-টিভি সার্ভার বসান</span>
                  </button>

                  {discoveredServers && (
                    <button
                      type="button"
                      onClick={() => handleBindServersToMatch()}
                      className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#16D98A] hover:bg-[#1FE896] text-[#080B12] text-xs font-bold inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>নির্বাচিত ম্যাচে সেভ করুন</span>
                    </button>
                  )}
                </div>

                {discoveredServers && (
                  <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Server className="w-4 h-4 text-[#00B7FF]" />
                        তৈরি হওয়া ৫টি সার্ভার
                      </span>
                      <span className="font-mono">{streamSearchSource || 'TV Broadcaster Network'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {discoveredServers.map((srv, idx) => (
                        <div
                          key={srv.id}
                          className="p-3.5 rounded-xl bg-[#141D2E] border border-white/[0.08] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Server {idx + 1}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#00B7FF] font-mono">
                              {srv.quality}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-[#16D98A] truncate">
                            {srv.badge}
                          </p>
                          <input
                            type="text"
                            value={srv.url}
                            onChange={(e) => {
                              const updated = [...discoveredServers];
                              updated[idx].url = e.target.value;
                              setDiscoveredServers(updated);
                            }}
                            className="w-full bg-[#080B12] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white font-mono truncate outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setTestStreamUrl(srv.url)}
                            className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-white flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3 text-[#00B7FF]" />
                            Test Play
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. MATCH CONTROLLER */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-white">Match Controller</h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Update live scores, toggle match status, or add new broadcasts.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={filterSport}
                    onChange={(e) => setFilterSport(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-[#0F1623] border border-white/10 text-xs text-white"
                  >
                    <option value="all">All Sports</option>
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="tennis">Tennis</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-[#0F1623] border border-white/10 text-xs text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="LIVE">Live Now</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="FINISHED">Finished</option>
                  </select>
                </div>
              </div>

              <form
                onSubmit={handleCreateEvent}
                className="bg-[#0F1623] rounded-2xl border border-white/[0.08] p-6 space-y-4"
              >
                <h2 className="text-sm font-bold text-white">
                  {editingEventId ? 'Edit Match' : 'Create New Match'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    placeholder="Event title"
                    className="h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                  />
                  <select
                    value={evSport}
                    onChange={(e) => setEvSport(e.target.value)}
                    className="h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={evComp}
                    onChange={(e) => setEvComp(e.target.value)}
                    className="h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                  >
                    {competitions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={evStatus}
                    onChange={(e) => setEvStatus(e.target.value as EventStatus)}
                    className="h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="LIVE">LIVE</option>
                    <option value="FINISHED">FINISHED</option>
                  </select>
                  <input
                    type="date"
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    className="h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                  />
                  <input
                    type="time"
                    value={evTime}
                    onChange={(e) => setEvTime(e.target.value)}
                    className="h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                  />
                </div>
                <input
                  type="url"
                  value={evStream}
                  onChange={(e) => setEvStream(e.target.value)}
                  placeholder="Broadcast stream URL (optional)"
                  className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={evScore}
                    onChange={(e) => setEvScore(e.target.value)}
                    placeholder="Score summary (e.g. 2 - 1)"
                    className="h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                  />
                  <input
                    type="url"
                    value={evThumb}
                    onChange={(e) => setEvThumb(e.target.value)}
                    placeholder="Thumbnail URL (optional)"
                    className="h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={evDesc}
                  onChange={(e) => setEvDesc(e.target.value)}
                  placeholder="Event description"
                  className="w-full p-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="min-h-[40px] px-5 py-2 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> {editingEventId ? 'Update Event' : 'Add Event'}
                  </button>
                  {editingEventId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEventId(null);
                        setEvTitle('');
                        setEvStream('');
                        setEvThumb('');
                        setEvScore('');
                        setEvDesc('');
                      }}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-[#141D2E] text-xs font-semibold text-[#94A3B8]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-3">
                {events
                  .filter((e) => filterSport === 'all' || e.sportId === filterSport)
                  .filter((e) => filterStatus === 'all' || e.status === filterStatus)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-[#141D2E] rounded-2xl border border-white/[0.08] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B7FF] bg-[#00B7FF]/15 px-2 py-0.5 rounded">
                            {ev.sportId}
                          </span>
                          <span className="text-xs text-[#94A3B8] font-mono tabular-nums">
                            {ev.eventDate} · {ev.eventTime}
                          </span>
                          {ev.featured && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 px-1.5 py-0.5 rounded font-mono">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="text"
                          defaultValue={ev.scoreSummary || ''}
                          onChange={(e) =>
                            setQuickScoreMap((prev) => ({ ...prev, [ev.id]: e.target.value }))
                          }
                          placeholder="Live Score"
                          className="w-28 sm:w-36 h-9 px-2.5 rounded-lg bg-[#080B12] border border-white/10 text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickScoreSave(ev)}
                          className="h-9 px-2.5 rounded-lg bg-white/10 hover:bg-[#00B7FF] hover:text-[#080B12] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <div className="flex items-center gap-1 bg-[#080B12] p-1 rounded-xl border border-white/[0.08]">
                          {(['LIVE', 'UPCOMING', 'FINISHED'] as EventStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleQuickStatusChange(ev, st)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                                ev.status === st
                                  ? st === 'LIVE'
                                    ? 'bg-[#16D98A] text-[#080B12]'
                                    : st === 'UPCOMING'
                                    ? 'bg-[#00B7FF] text-[#080B12]'
                                    : 'bg-white/20 text-white'
                                  : 'text-[#94A3B8] hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickFeaturedToggle(ev)}
                          className={`p-2 rounded-xl border transition-colors ${
                            ev.featured
                              ? 'bg-amber-400/15 border-amber-400/35 text-amber-300'
                              : 'bg-[#080B12] border-white/10 text-[#94A3B8]'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingEventId(ev.id);
                            setEvTitle(ev.title);
                            setEvSport(ev.sportId);
                            setEvComp(ev.competitionId);
                            setEvDate(ev.eventDate);
                            setEvTime(ev.eventTime);
                            setEvStatus(ev.status);
                            setEvStream(ev.authorizedViewingUrl || '');
                            setEvThumb(ev.thumbnailUrl || '');
                            setEvScore(ev.scoreSummary || '');
                            setEvDesc(ev.description);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#080B12] text-xs font-semibold text-[#00B7FF] border border-white/10"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteEvent(ev.id)}
                          aria-label="Delete event"
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 7. NEWS */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-white">Manage News</h1>
              <form
                onSubmit={handleCreateNews}
                className="bg-[#0F1623] rounded-2xl border border-white/[0.08] p-6 space-y-4"
              >
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="Article title"
                  className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                />
                <select
                  value={newsCat}
                  onChange={(e) => setNewsCat(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newsDesc}
                  onChange={(e) => setNewsDesc(e.target.value)}
                  placeholder="Short summary"
                  className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                />
                <textarea
                  rows={4}
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Article body"
                  className="w-full p-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                />
                <button
                  type="submit"
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Publish Article
                </button>
              </form>

              <div className="space-y-2.5">
                {news.map((n) => (
                  <div
                    key={n.id}
                    className="bg-[#141D2E] rounded-xl border border-white/[0.08] p-4 flex items-center justify-between gap-4"
                  >
                    <p className="text-sm font-bold text-white">{n.title}</p>
                    <button
                      type="button"
                      onClick={() => deleteNews(n.id)}
                      aria-label="Delete article"
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. SPORTS */}
          {activeTab === 'sports' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-white">Manage Sports</h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!sportName.trim()) return;
                  const slug = sportName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  await saveSport({ id: slug, name: sportName.trim(), slug });
                  setSportName('');
                  notify('Sport saved.');
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={sportName}
                  onChange={(e) => setSportName(e.target.value)}
                  placeholder="Sport name"
                  className="flex-1 h-11 px-3 rounded-xl bg-[#0F1623] border border-white/10 text-sm text-white"
                />
                <button
                  type="submit"
                  className="px-5 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold"
                >
                  Add Sport
                </button>
              </form>
              <div className="space-y-2">
                {sports.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#141D2E] rounded-xl border border-white/[0.08] p-4 flex items-center justify-between"
                  >
                    <span className="text-sm font-semibold text-white">{s.name}</span>
                    <button
                      type="button"
                      onClick={() => deleteSport(s.id)}
                      className="p-2 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. TEAMS */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-white">Manage Teams</h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!teamName.trim()) return;
                  const id = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  await saveTeam({
                    id,
                    name: teamName.trim(),
                    shortName: teamShort.trim() || teamName.slice(0, 3).toUpperCase(),
                    sportId: sports[0]?.id || 'football',
                  });
                  setTeamName('');
                  setTeamShort('');
                  notify('Team saved.');
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="flex-1 h-11 px-3 rounded-xl bg-[#0F1623] border border-white/10 text-sm text-white"
                />
                <input
                  type="text"
                  value={teamShort}
                  onChange={(e) => setTeamShort(e.target.value)}
                  placeholder="Short (e.g. BAN)"
                  className="w-36 h-11 px-3 rounded-xl bg-[#0F1623] border border-white/10 text-sm text-white"
                />
                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold"
                >
                  Add Team
                </button>
              </form>
              <div className="space-y-2">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="bg-[#141D2E] rounded-xl border border-white/[0.08] p-4 flex items-center justify-between"
                  >
                    <span className="text-sm font-semibold text-white">
                      {t.name} ({t.shortName})
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteTeam(t.id)}
                      className="p-2 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. COMPETITIONS */}
          {activeTab === 'competitions' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-white">
                Manage Competitions
              </h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!compName.trim()) return;
                  const id = compName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  await saveCompetition({
                    id,
                    name: compName.trim(),
                    sportId: sports[0]?.id || 'football',
                  });
                  setCompName('');
                  notify('Competition saved.');
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="Competition name"
                  className="flex-1 h-11 px-3 rounded-xl bg-[#0F1623] border border-white/10 text-sm text-white"
                />
                <button
                  type="submit"
                  className="px-5 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold"
                >
                  Add Competition
                </button>
              </form>
              <div className="space-y-2">
                {competitions.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#141D2E] rounded-xl border border-white/[0.08] p-4 flex items-center justify-between"
                  >
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => deleteCompetition(c.id)}
                      className="p-2 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-white">
                Manage Categories
              </h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!catName.trim()) return;
                  const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  await saveCategory({ id: slug, name: catName.trim(), slug });
                  setCatName('');
                  notify('Category saved.');
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 h-11 px-3 rounded-xl bg-[#0F1623] border border-white/10 text-sm text-white"
                />
                <button
                  type="submit"
                  className="px-5 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold"
                >
                  Add Category
                </button>
              </form>
              <div className="space-y-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#141D2E] rounded-xl border border-white/[0.08] p-4 flex items-center justify-between"
                  >
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => deleteCategory(c.id)}
                      className="p-2 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-extrabold text-white">
                Registered Users ({usersList.length})
              </h1>
              <div className="space-y-2">
                {usersList.map((u) => (
                  <div
                    key={u.uid}
                    className="bg-[#141D2E] rounded-xl border border-white/[0.08] p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{u.displayName}</p>
                      <p className="text-xs text-[#94A3B8] truncate">
                        {u.email || u.phoneNumber || 'Guest Session'}
                        {u.phoneNumber && u.phoneVerified ? ` · ${u.phoneNumber} (Verified)` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#00B7FF] tabular-nums shrink-0">
                      {u.savedEvents?.length || 0} saved
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. MEDIA */}
          {activeTab === 'media' && (
            <div className="bg-[#0F1623] rounded-2xl border border-white/[0.08] p-6 space-y-4">
              <h1 className="font-display text-xl font-bold text-white">
                Media Library (Firebase Storage)
              </h1>
              <p className="text-xs text-[#94A3B8]">
                Upload images (JPEG, PNG, WebP, GIF up to 5MB) to Firebase Storage.
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploadingMedia}
                onChange={(e) => handleFileUpload(e, () => {})}
                className="block w-full text-xs text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#00B7FF] file:text-[#080B12] hover:file:bg-[#33C5FF]"
              />
              {uploadingMedia && (
                <p className="text-xs text-[#00B7FF]">Uploading to Firebase Storage...</p>
              )}
              {uploadedUrls.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-white">Uploaded URLs:</p>
                  {uploadedUrls.map((url) => (
                    <div
                      key={url}
                      className="p-3 rounded-xl bg-[#080B12] border border-white/10 text-xs font-mono text-[#16D98A] break-all"
                    >
                      {url}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 14. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-[#0F1623] rounded-2xl border border-white/[0.08] p-6 space-y-2">
              <h1 className="font-display text-xl font-bold text-white">Notifications</h1>
              <p className="text-xs text-[#94A3B8]">
                Users manage event reminders and news alerts from their Profile page.
              </p>
            </div>
          )}

          {/* 15. MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-extrabold text-white">
                Contact Messages
              </h1>
              {messagesList.length > 0 ? (
                <div className="space-y-3">
                  {messagesList.map((m) => (
                    <div
                      key={m.id}
                      className="bg-[#141D2E] rounded-xl border border-white/[0.08] p-4 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                        <span className="text-white font-semibold">
                          {m.name} ({m.email})
                        </span>
                        <select
                          value={m.status}
                          onChange={async (e) => {
                            await updateDoc(doc(db, 'contactMessages', m.id), {
                              status: e.target.value,
                            });
                            notify('Message status updated.');
                          }}
                          className="bg-[#080B12] border border-white/10 rounded-lg px-2 py-1 font-mono text-xs text-white"
                        >
                          <option value="NEW">NEW</option>
                          <option value="READ">READ</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </div>
                      <p className="text-sm font-bold text-[#00B7FF]">{m.subject}</p>
                      <p className="text-xs text-[#94A3B8]">{m.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#0F1623] rounded-xl border border-white/[0.08] p-6 text-xs text-[#94A3B8]">
                  No contact messages yet.
                </div>
              )}
            </div>
          )}

          {/* 16. WEBSITE SETTINGS & FIREBASE AUTH SETUP */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="font-display text-2xl font-extrabold text-white">
                  Website Settings & Firebase Auth Setup
                </h1>
                <p className="text-xs text-[#94A3B8] mt-1">
                  সাইটের নাম, লোগো, কন্টাক্ট ইমেইল এবং Firebase Sign-In ও ব্র্যান্ড কনফিগারেশন।
                </p>
              </div>

              {/* Firebase Console 1-Click Checklist */}
              <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-5 h-5 text-[#00B7FF]" />
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        Firebase Auth & Google Branding Setup (Project: powerful-minutia-6bcxw)
                      </h2>
                      <p className="text-xs text-[#94A3B8]">
                        কোডে Phone OTP, Google, Email/Password ও Anonymous সব চালু করা আছে। নিচের ৩টি অপশন Firebase Console-এ অন করলেই লাইভ কাজ করবে:
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://console.firebase.google.com/project/powerful-minutia-6bcxw/authentication/providers"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 self-start"
                  >
                    <span>Open Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[#141D2E] border border-white/[0.08] p-4 space-y-1.5">
                    <p className="text-xs font-bold text-white">1. Sign-In Providers</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Authentication → Sign-in method থেকে <strong className="text-white">Google</strong>,{' '}
                      <strong className="text-white">Email/Password</strong>,{' '}
                      <strong className="text-white">Phone</strong> এবং{' '}
                      <strong className="text-white">Anonymous</strong> Enable করুন।
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#141D2E] border border-white/[0.08] p-4 space-y-1.5">
                    <p className="text-xs font-bold text-white">2. Email Sender & Short Reset Link</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Templates → Sender name দিন:{' '}
                      <code className="text-[#16D98A] font-mono">KhelaDekH Support Team</code> এবং Action URL দিন:{' '}
                      <code className="text-[#00B7FF] font-mono break-all">
                        {resetOrigin ? `${resetOrigin}/reset` : '/reset'}
                      </code>
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#141D2E] border border-white/[0.08] p-4 space-y-1.5">
                    <p className="text-xs font-bold text-white">3. Google Sign-In Title</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Google Cloud OAuth Consent Screen ও Firebase Project Settings-এ Public App Name দিন:{' '}
                      <code className="text-amber-300 font-mono">KhelaDekH</code>।
                    </p>
                  </div>
                </div>
              </div>

              {/* General Brand Settings Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await saveSettings({
                    ...settings,
                    siteName: siteName.trim() || 'KhelaDekH',
                    ownerName: ownerName.trim(),
                    logoUrl: logoUrl.trim() || settings.logoUrl,
                    tagline,
                    contactEmail: contactEmail.trim() || 'support@kheladekh.com',
                    footerText,
                    adFreeMode,
                    adControl: settings.adControl
                      ? { ...settings.adControl, adsEnabled: !adFreeMode }
                      : undefined,
                  });
                  notify('ওয়েবসাইটের সকল সেটিংস সংরক্ষিত হয়েছে।');
                }}
                className="bg-[#0F1623] rounded-2xl border border-white/[0.08] p-6 space-y-4"
              >
                <h2 className="text-sm font-bold text-white">সাধারণ ওয়েবসাইট ও ব্র্যান্ড সেটিংস</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Site / Brand Name</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Owner Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="আপনার নাম"
                      className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Logo URL</label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="/src/assets/images/kheladekh_logo_1793952334814.jpg"
                      className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Support Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-[#94A3B8] mb-1">Tagline</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-[#94A3B8] mb-1">Footer Text</label>
                    <input
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#080B12] border border-white/10 text-sm text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="min-h-[42px] px-6 py-2.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold transition-colors"
                >
                  সব সেটিংস সেভ করুন
                </button>
              </form>
            </div>
          )}

          {/* 17. AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-extrabold text-white">Audit Logs</h1>
              <div className="space-y-2">
                {auditList.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#141D2E] rounded-xl border border-white/[0.08] p-3 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-white">
                      {log.action} · {log.targetCollection}/{log.targetId}
                    </span>
                    <span className="text-[#94A3B8]">{log.actorEmail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Stream Preview Modal */}
      {testStreamUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-[#0F1623] border border-white/15 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#16D98A] font-mono font-bold">
                  Live Stream Preview ({brandName})
                </p>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {testStreamTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTestStreamUrl(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <VideoPlayer src={testStreamUrl} title={testStreamTitle} />
          </div>
        </div>
      )}

      {/* Pre-Roll Ad Live Preview Modal */}
      <PreRollAdModal
        forcePreview
        config={preRollForm}
        isOpen={previewPreRollOpen}
        onClose={() => setPreviewPreRollOpen(false)}
        contextText="Admin Pre-Roll Live Preview"
      />
    </div>
  );
};
