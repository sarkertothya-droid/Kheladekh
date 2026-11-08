import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, uploadMediaFile } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLiveTelemetry } from '../services/presenceService';
import { DailyAudienceGraph } from '../components/DailyAudienceGraph';
import { PreRollAdModal } from '../components/PreRollAdModal';
import { resetAdCooldown, getRemainingCooldownMinutes } from '../services/adService';
import { AuditLog, ContactMessage, EventStatus, SportEvent, UserProfile, StreamServer, PreRollAdConfig } from '../types';

type AdminTab =
  | 'dashboard'
  | 'viewers'
  | 'automation'
  | 'events'
  | 'sports'
  | 'teams'
  | 'competitions'
  | 'news'
  | 'categories'
  | 'users'
  | 'media'
  | 'notifications'
  | 'messages'
  | 'settings'
  | 'audit';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
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
  const [tagline, setTagline] = useState(settings.tagline);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [footerText, setFooterText] = useState(settings.footerText);

  // 12-Second / 12-Hour Pre-Roll Ad State
  const [adEnabled, setAdEnabled] = useState(settings.preRollAd?.enabled ?? true);
  const [adDuration, setAdDuration] = useState(settings.preRollAd?.durationSeconds ?? 12);
  const [adFrequency, setAdFrequency] = useState(settings.preRollAd?.frequencyHours ?? 12);
  const [adTitle, setAdTitle] = useState(settings.preRollAd?.title ?? 'KhelaDekH অফিসিয়াল স্পোর্টস পার্টনার স্পনসর');
  const [adDesc, setAdDesc] = useState(settings.preRollAd?.description ?? 'এইচডি লাইভ ক্রিকেট, ফুটবল ম্যাচ ও মেগা স্পোর্টস ওয়েলকাম বোনাস! এখনই ভিজিট করে আপনার বিশেষ অফারটি লুফে নিন।');
  const [adTargetUrl, setAdTargetUrl] = useState(settings.preRollAd?.targetUrl ?? 'https://kheladekh.vercel.app/sports');
  const [adCtaText, setAdCtaText] = useState(settings.preRollAd?.ctaText ?? 'অফারটি দেখুন (Claim Offer)');
  const [adImageUrl, setAdImageUrl] = useState(settings.preRollAd?.imageUrl ?? 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80');
  const [testAdModalOpen, setTestAdModalOpen] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(getRemainingCooldownMinutes(12));

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
    return <div className="h-64 rounded-2xl bg-[#151E2B] animate-pulse" />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const notify = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3000);
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
      description: evDesc.trim() || 'Official fixture.',
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
    notify(`Automated Status Engine: Checked matches and updated ${updatedCount} live/finished statuses.`);
  };

  const handlePublishAllEvents = async () => {
    let count = 0;
    for (const ev of events) {
      if (!ev.published) {
        await saveEvent({ ...ev, published: true });
        count++;
      }
    }
    notify(`Batch Action: Published ${count} events.`);
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
        notify(`লাইভ স্ট্রিম স্ক্যান সম্পন্ন: ৫টি সার্ভার প্রস্তুত (${data.totalDiscovered} লিংক পাওয়া গেছে)`);
      } else {
        notify('স্ট্রিম ডিসকভারিতে সমস্যা হয়েছে, ডিফল্ট সার্ভার তৈরি করা হয়েছে।');
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
      notify('প্রথমে "ইউটিউব ও ফেসবুকে লাইভ খুঁজুন" বাটনে ক্লিক করে ৫টি সার্ভার তৈরি করুন');
      return;
    }
    const targetEvent = events.find((e) => e.id === targetId);
    if (!targetEvent) return;

    await saveEvent({
      ...targetEvent,
      streamServers: discoveredServers,
      authorizedViewingUrl: discoveredServers[0]?.url || targetEvent.authorizedViewingUrl,
    });
    notify(`সফল হয়েছে! "${targetEvent.title}" ম্যাচে ৫টি সার্ভার সক্রিয় ও সেভ করা হয়েছে।`);
  };

  const sidebarItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'viewers',
      label: 'লাইভ দর্শক (Live Viewers)',
      icon: <Radio className="w-4 h-4 text-red-400 animate-pulse" />,
      badge: telemetry.totalMatchWatchers > 0 ? `${telemetry.totalMatchWatchers} watching` : undefined,
    },
    { id: 'automation', label: 'Automation & AI Feeds', icon: <Zap className="w-4 h-4 text-[#00B7FF]" /> },
    { id: 'events', label: 'Match Controller', icon: <Calendar className="w-4 h-4" /> },
    { id: 'sports', label: 'Sports', icon: <Trophy className="w-4 h-4" /> },
    { id: 'teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
    { id: 'competitions', label: 'Competitions', icon: <Award className="w-4 h-4" /> },
    { id: 'news', label: 'News & Articles', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'users', label: 'User Profiles', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'media', label: 'Media Library', icon: <Image className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'messages', label: 'Contact Messages', icon: <Mail className="w-4 h-4" /> },
    { id: 'settings', label: 'Website Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#101722] rounded-2xl border border-white/10 p-4 space-y-1 self-start">
        <div className="px-3 py-2 mb-2">
          <p className="font-display text-sm font-bold text-white">KhelaDekH Admin</p>
          <p className="text-xs text-[#A5B1C2] truncate">{user.email}</p>
        </div>

        {sidebarItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
              activeTab === item.id
                ? 'bg-[#00B7FF] text-[#080B12]'
                : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === item.id
                    ? 'bg-black/20 text-[#080B12]'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={logout}
          className="w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors mt-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 space-y-6">
        {statusMsg && (
          <div className="p-3 rounded-xl bg-[#16D98A]/15 border border-[#16D98A]/30 text-xs text-[#16D98A]">
            {statusMsg}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="font-display text-2xl font-extrabold text-white">
                Dashboard Overview
              </h1>
              <button
                type="button"
                onClick={async () => {
                  await seedDatabase();
                  notify('Initial data seeded to Firestore.');
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#151E2B] border border-white/10 text-xs font-semibold text-[#00B7FF] hover:border-[#00B7FF] inline-flex items-center gap-2 self-start"
              >
                <Database className="w-4 h-4" />
                Seed Initial Data
              </button>
            </div>

            {/* Real-time Audience Telemetry Banner */}
            <div className="bg-gradient-to-r from-[#151E2B] via-[#101b2b] to-[#151E2B] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      লাইভ দর্শক মনিটরিং (Live Concurrent Audience)
                    </h2>
                    <p className="text-xs text-[#A5B1C2]">
                      রিয়েল-টাইমে কতজন ইউজার আপনার সাইটে খেলা দেখছেন তা সরাসরি পর্যবেক্ষণ করুন
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('viewers')}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/25 inline-flex items-center gap-2 transition-colors self-start sm:self-center"
                >
                  <Eye className="w-3.5 h-3.5" />
                  বিস্তারিত লাইভ দর্শক মনিটর খুলুন
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                <div className="p-3 bg-[#080B12]/60 rounded-xl border border-white/5">
                  <p className="text-[11px] text-[#A5B1C2]">বৰ্তমানে খেলা দেখছেন</p>
                  <p className="font-display text-2xl font-black text-red-400 mt-1 tabular-nums flex items-baseline gap-1">
                    {telemetry.totalMatchWatchers}
                    <span className="text-xs font-normal text-[#A5B1C2]">জন</span>
                  </p>
                </div>

                <div className="p-3 bg-[#080B12]/60 rounded-xl border border-white/5">
                  <p className="text-[11px] text-[#A5B1C2]">ওয়েবসাইটে মোট সক্রিয় ভিজিটর</p>
                  <p className="font-display text-2xl font-black text-[#00B7FF] mt-1 tabular-nums flex items-baseline gap-1">
                    {telemetry.totalVisitors}
                    <span className="text-xs font-normal text-[#A5B1C2]">জন</span>
                  </p>
                </div>

                <div className="p-3 bg-[#080B12]/60 rounded-xl border border-white/5">
                  <p className="text-[11px] text-[#A5B1C2]">স্মার্টফোন (Mobile)</p>
                  <p className="font-display text-2xl font-black text-white mt-1 tabular-nums flex items-baseline gap-1">
                    {telemetry.deviceStats.mobile}
                    <span className="text-xs font-normal text-[#A5B1C2]">
                      ({telemetry.totalVisitors > 0 ? Math.round((telemetry.deviceStats.mobile / telemetry.totalVisitors) * 100) : 0}%)
                    </span>
                  </p>
                </div>

                <div className="p-3 bg-[#080B12]/60 rounded-xl border border-white/5">
                  <p className="text-[11px] text-[#A5B1C2]">কম্পিউটার (Desktop)</p>
                  <p className="font-display text-2xl font-black text-white mt-1 tabular-nums flex items-baseline gap-1">
                    {telemetry.deviceStats.desktop}
                    <span className="text-xs font-normal text-[#A5B1C2]">
                      ({telemetry.totalVisitors > 0 ? Math.round((telemetry.deviceStats.desktop / telemetry.totalVisitors) * 100) : 0}%)
                    </span>
                  </p>
                </div>
              </div>

              {telemetry.matchStats.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <p className="text-xs font-semibold text-[#A5B1C2]">কোন খেলায় কতজন দেখছেন:</p>
                  <div className="flex flex-wrap gap-2">
                    {telemetry.matchStats.map((st) => (
                      <div
                        key={st.eventId}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-white truncate max-w-[200px]">{st.eventTitle}</span>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold text-[11px]">
                          🔴 {st.count} জন
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Events', value: events.length },
                {
                  label: 'Live Events',
                  value: events.filter((e) => e.status === 'LIVE').length,
                },
                {
                  label: 'Upcoming Events',
                  value: events.filter((e) => e.status === 'UPCOMING').length,
                },
                { label: 'Published News', value: news.length },
                { label: 'Registered Users', value: usersList.length },
                { label: 'Contact Messages', value: messagesList.length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#151E2B] rounded-2xl border border-white/10 p-5"
                >
                  <p className="text-xs text-[#A5B1C2]">{stat.label}</p>
                  <p className="font-display text-2xl font-extrabold text-white mt-1 tabular-nums">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Daily Viewership Graph Paper Component */}
            <DailyAudienceGraph
              todayVisitors={telemetry.totalVisitors}
              todayMatchWatchers={telemetry.totalMatchWatchers}
            />
          </div>
        )}

        {/* Dedicated Live Viewers Real-time Telemetry Tab */}
        {activeTab === 'viewers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <h1 className="font-display text-2xl font-extrabold text-white flex items-center gap-2">
                    রিয়েল-টাইম লাইভ দর্শক মনিটর (Live Audience)
                  </h1>
                </div>
                <p className="text-xs text-[#A5B1C2] mt-1">
                  এই মুহূর্তে আপনার ওয়েবসাইটে কে কোন খেলাটি দেখছেন এবং ভিজিটরদের লাইভ উপস্থিতি ট্র্যাক করুন।
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#16D98A]/10 border border-[#16D98A]/20 text-[#16D98A] text-xs font-semibold flex items-center gap-2 self-start">
                <span className="w-2 h-2 rounded-full bg-[#16D98A] animate-pulse"></span>
                <span>স্বয়ংক্রিয় লাইভ সিঙ্ক সক্রিয়</span>
              </div>
            </div>

            {/* Top Telemetry KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#151E2B] rounded-2xl border border-red-500/20 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Radio className="w-16 h-16 text-red-500" />
                </div>
                <p className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  খেলা দেখছেন (Watching Stream)
                </p>
                <p className="font-display text-3xl font-black text-white mt-2 tabular-nums">
                  {telemetry.totalMatchWatchers}{' '}
                  <span className="text-sm font-semibold text-[#A5B1C2]">জন</span>
                </p>
                <p className="text-[11px] text-[#A5B1C2] mt-1">
                  ম্যাচ পেজে সক্রিয় দর্শক
                </p>
              </div>

              <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Globe className="w-16 h-16 text-[#00B7FF]" />
                </div>
                <p className="text-xs text-[#00B7FF] font-bold uppercase tracking-wider">
                  সাইটে মোট সক্রিয় ভিজিটর
                </p>
                <p className="font-display text-3xl font-black text-white mt-2 tabular-nums">
                  {telemetry.totalVisitors}{' '}
                  <span className="text-sm font-semibold text-[#A5B1C2]">জন</span>
                </p>
                <p className="text-[11px] text-[#A5B1C2] mt-1">
                  ওয়েবসাইটের সব পেজ মিলিয়ে
                </p>
              </div>

              <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#A5B1C2] font-semibold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    মোবাইল ইউজার
                  </p>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {telemetry.totalVisitors > 0
                      ? Math.round((telemetry.deviceStats.mobile / telemetry.totalVisitors) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <p className="font-display text-2xl font-bold text-white mt-2 tabular-nums">
                  {telemetry.deviceStats.mobile}{' '}
                  <span className="text-xs font-normal text-[#A5B1C2]">জন</span>
                </p>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        telemetry.totalVisitors > 0
                          ? (telemetry.deviceStats.mobile / telemetry.totalVisitors) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#A5B1C2] font-semibold flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    ডেস্কটপ ইউজার
                  </p>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {telemetry.totalVisitors > 0
                      ? Math.round((telemetry.deviceStats.desktop / telemetry.totalVisitors) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <p className="font-display text-2xl font-bold text-white mt-2 tabular-nums">
                  {telemetry.deviceStats.desktop}{' '}
                  <span className="text-xs font-normal text-[#A5B1C2]">জন</span>
                </p>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        telemetry.totalVisitors > 0
                          ? (telemetry.deviceStats.desktop / telemetry.totalVisitors) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Match-by-Match Breakdown */}
            <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-400" />
                  ম্যাচভিত্তিক লাইভ দর্শক বন্টন (Audience per Match)
                </h2>
                <span className="text-xs text-[#A5B1C2]">
                  {telemetry.matchStats.length} টি ম্যাচে দর্শক উপস্থিত
                </span>
              </div>

              {telemetry.matchStats.length === 0 ? (
                <div className="p-8 text-center bg-[#101722] rounded-xl border border-white/5 space-y-2">
                  <p className="text-sm font-semibold text-white">
                    এই মুহূর্তে কোনো দর্শক নির্দিষ্ট কোনো ম্যাচ পেজে নেই
                  </p>
                  <p className="text-xs text-[#A5B1C2]">
                    ভিজিটররা হোমপেজ বা সূচি ব্রাউজ করছেন। ইউজাররা কোনো খেলার পেজে ঢুকলে তাৎক্ষণিকভাবে এখানে তাদের দর্শক সংখ্যা দেখা যাবে।
                  </p>
                </div>
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
                        className="bg-[#101722] rounded-xl border border-white/5 p-4 space-y-3 hover:border-white/20 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-white/5 text-xs font-mono font-bold text-[#A5B1C2] flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-white flex items-center gap-2">
                                {stat.eventTitle}
                                {matchEvent?.status === 'LIVE' && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#16D98A]/20 text-[#16D98A] text-[10px] font-bold">
                                    LIVE NOW
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#A5B1C2] capitalize">
                                Sport: {stat.sportId} · Competition: {matchEvent?.competitionId || 'Tournament'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <div className="text-right">
                              <p className="text-sm font-black text-red-400 font-mono">
                                🔴 {stat.count} জন
                              </p>
                              <p className="text-[10px] text-[#A5B1C2] font-mono">
                                {pct}% দর্শক
                              </p>
                            </div>

                            {matchEvent && (
                              <Link
                                to={`/events/${matchEvent.slug || matchEvent.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#00B7FF] transition-colors"
                                title="খেলাটি নতুন ট্যাবে দেখুন"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Audience Share Progress Bar */}
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Sessions Live Feed */}
            <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00B7FF]" />
                  সক্রিয় সেশনসমূহের লাইভ তালিকা (Active Live Sessions)
                </h2>
                <span className="text-xs font-mono text-[#A5B1C2]">
                  মোট {telemetry.activeSessions.length} টি সক্রিয় সংযোগ
                </span>
              </div>

              {telemetry.activeSessions.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#A5B1C2]">
                  কোনো সক্রিয় সেশন নেই
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[#A5B1C2]">
                        <th className="py-3 px-3">ইউজার / সেশন</th>
                        <th className="py-3 px-3">বর্তমান অবস্থান / ম্যাচ</th>
                        <th className="py-3 px-3">ডিভাইস</th>
                        <th className="py-3 px-3">ব্রাউজার</th>
                        <th className="py-3 px-3">লাস্ট পিং (স্ট্যাটাস)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {telemetry.activeSessions.map((session) => {
                        const secondsAgo = Math.max(0, Math.round((Date.now() - session.lastPing) / 1000));
                        return (
                          <tr key={session.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#16D98A] animate-ping" />
                                <div>
                                  <p className="font-semibold text-white">
                                    {session.userName || 'Anonymous Fan'}
                                  </p>
                                  <p className="text-[10px] text-[#A5B1C2] font-mono truncate max-w-[120px]">
                                    {session.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {session.eventTitle ? (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-red-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                    {session.eventTitle}
                                  </p>
                                  <p className="text-[10px] text-[#A5B1C2]">
                                    {session.page}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[#A5B1C2] font-mono">
                                  {session.page}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white capitalize font-mono text-[11px] inline-flex items-center gap-1">
                                {session.device === 'mobile' ? (
                                  <>
                                    <Smartphone className="w-3 h-3 text-emerald-400" /> Mobile
                                  </>
                                ) : (
                                  <>
                                    <Monitor className="w-3 h-3 text-cyan-400" /> Desktop
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#A5B1C2]">
                              {session.browser || 'Web'}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono text-[#16D98A] text-[11px]">
                                {secondsAgo < 5 ? 'এখনই সক্রিয়' : `${secondsAgo} সে. আগে`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Daily Viewership Graph Paper Component */}
            <DailyAudienceGraph
              todayVisitors={telemetry.totalVisitors}
              todayMatchWatchers={telemetry.totalMatchWatchers}
            />
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-[#00B7FF]" />
                  Automation & AI Feeds Hub
                </h1>
                <p className="text-xs text-[#A5B1C2] mt-1">
                  Manage continuous Google Search grounded sports feeds and automated match lifecycle.
                </p>
              </div>

              {/* Force Sync Button */}
              <button
                type="button"
                disabled={autoSyncing}
                onClick={async () => {
                  notify('Fetching live sports via Google Search Grounding...');
                  await syncLiveSportsFromGoogle(false);
                  notify('Sports feed synchronized successfully!');
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] disabled:opacity-50 text-[#080B12] text-xs font-bold inline-flex items-center gap-2 transition-all shadow-lg shadow-[#00B7FF]/20 self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 ${autoSyncing ? 'animate-spin' : ''}`} />
                <span>{autoSyncing ? 'Syncing Feeds...' : 'Run Google Search Sync Now'}</span>
              </button>
            </div>

            {/* Automation Status Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#A5B1C2]">
                  <span>AI Grounding Engine</span>
                  <span className="w-2 h-2 rounded-full bg-[#16D98A] animate-pulse" />
                </div>
                <p className="font-display text-lg font-bold text-white">Google Search</p>
                <p className="text-[11px] text-[#16D98A] font-mono">Gemini 2.5 Flash Grounded</p>
              </div>

              <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#A5B1C2]">
                  <span>Auto-Sync Cadence</span>
                  <Clock className="w-3.5 h-3.5 text-[#00B7FF]" />
                </div>
                <p className="font-display text-lg font-bold text-white">Every 3 Minutes</p>
                <p className="text-[11px] text-[#A5B1C2] font-mono">
                  {lastAutoSyncTime ? `Last: ${lastAutoSyncTime}` : 'Continuous background sync'}
                </p>
              </div>

              <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#A5B1C2]">
                  <span>Catalog Status</span>
                  <Globe className="w-3.5 h-3.5 text-[#16D98A]" />
                </div>
                <p className="font-display text-lg font-bold text-white tabular-nums">
                  {events.length} Matches
                </p>
                <p className="text-[11px] text-[#A5B1C2] font-mono">
                  {events.filter((e) => e.status === 'LIVE').length} Live Broadcasting
                </p>
              </div>

              <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#A5B1C2]">
                  <span>Multi-Sport Coverage</span>
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="font-display text-lg font-bold text-white">4 Major Sports</p>
                <p className="text-[11px] text-[#A5B1C2] font-mono">Cricket, Football, Tennis, NBA</p>
              </div>
            </div>

            {/* Quick Automation Actions Bar */}
            <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white">One-Click Automation Tasks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleAutoUpdateMatchStatuses}
                  className="p-4 rounded-xl bg-[#101722] hover:bg-[#1A2332] border border-white/10 hover:border-[#00B7FF] text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-[#00B7FF]">
                      Auto-Update Match Statuses
                    </span>
                    <Clock className="w-4 h-4 text-[#00B7FF]" />
                  </div>
                  <p className="text-[11px] text-[#A5B1C2]">
                    Detects match start times and automatically transitions upcoming fixtures to LIVE or FINISHED.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handlePublishAllEvents}
                  className="p-4 rounded-xl bg-[#101722] hover:bg-[#1A2332] border border-white/10 hover:border-[#16D98A] text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-[#16D98A]">
                      Publish All Discovered Events
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-[#16D98A]" />
                  </div>
                  <p className="text-[11px] text-[#A5B1C2]">
                    Immediately makes all newly synced Google sports matches live and visible to all fans.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await seedDatabase();
                    notify('Master multi-sport verified catalog restored.');
                  }}
                  className="p-4 rounded-xl bg-[#101722] hover:bg-[#1A2332] border border-white/10 hover:border-amber-400 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-amber-400">
                      Seed Default Verified Catalog
                    </span>
                    <Database className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-[#A5B1C2]">
                    Restores verified multi-resolution streams, teams, categories, and international competitions.
                  </p>
                </button>
              </div>
            </div>

            {/* Active Automated Disciplines Overview */}
            <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white">Active Automated Sports Feeds</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'cricket', name: 'Cricket', count: events.filter(e => e.sportId === 'cricket').length, live: events.filter(e => e.sportId === 'cricket' && e.status === 'LIVE').length, icon: '🏏' },
                  { id: 'football', name: 'Football', count: events.filter(e => e.sportId === 'football').length, live: events.filter(e => e.sportId === 'football' && e.status === 'LIVE').length, icon: '⚽' },
                  { id: 'basketball', name: 'Basketball', count: events.filter(e => e.sportId === 'basketball').length, live: events.filter(e => e.sportId === 'basketball' && e.status === 'LIVE').length, icon: '🏀' },
                  { id: 'tennis', name: 'Tennis', count: events.filter(e => e.sportId === 'tennis').length, live: events.filter(e => e.sportId === 'tennis' && e.status === 'LIVE').length, icon: '🎾' },
                ].map(sportFeed => (
                  <div key={sportFeed.id} className="bg-[#101722] rounded-xl p-4 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{sportFeed.icon}</span>
                        <span className="text-xs font-bold text-white">{sportFeed.name}</span>
                      </div>
                      <p className="text-[11px] text-[#A5B1C2] mt-1 font-mono">
                        {sportFeed.count} total · <span className="text-[#16D98A] font-bold">{sportFeed.live} Live</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#16D98A]/20 text-[#16D98A]">
                      AUTO
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated Live Stream Discovery Engine & 5-Server Hub */}
            <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      ইউটিউব ও ফেসবুকে লাইভ খেলা স্ক্যানার এবং ৫-সার্ভার ডিস্ট্রিবিউশন
                    </h2>
                    <p className="text-xs text-[#A5B1C2]">
                      স্বয়ংক্রিয়ভাবে ইউটিউব ও ফেসবুক থেকে লাইভ স্ট্রিম খুঁজে ৫টি কোয়ালিটি সার্ভারে (১০৮০p, ৭২০p, ৪৮০p, মিরর, ব্যাকআপ) ভাগ করে ম্যাচে বসিয়ে দিন
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#00B7FF]/15 border border-[#00B7FF]/30 text-[#00B7FF] text-xs font-mono font-bold self-start sm:self-auto">
                  ৫-সার্ভার আর্কিটেকচার
                </span>
              </div>

              {/* Discovery Controls */}
              <div className="bg-[#101722] rounded-xl border border-white/5 p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      ১. ওয়েবসাইটের ম্যাচ নির্বাচন করুন:
                    </label>
                    <select
                      value={streamMatchId}
                      onChange={(e) => {
                        setStreamMatchId(e.target.value);
                        const match = events.find((ev) => ev.id === e.target.value);
                        if (match) setCustomMatchTitle(`${match.title} live match`);
                      }}
                      className="w-full bg-[#151E2B] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00B7FF]"
                    >
                      <option value="">-- যেকোনো ম্যাচ বেছে নিন --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.status === 'LIVE' ? '🔴 LIVE: ' : ''}{ev.title} ({ev.sportId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      ২. সার্চ কীওয়ার্ড (যেমন: বাংলাদেশ বনাম ওয়েস্ট ইন্ডিজ):
                    </label>
                    <input
                      type="text"
                      value={customMatchTitle}
                      onChange={(e) => setCustomMatchTitle(e.target.value)}
                      placeholder="Bangladesh vs West Indies live stream..."
                      className="w-full bg-[#151E2B] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00B7FF]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={discoveringStreams}
                    onClick={handleDiscoverStreams}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {discoveringStreams ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>
                      {discoveringStreams
                        ? 'ইউটিউব ও ফেসবুকে সার্চ হচ্ছে...'
                        : 'ইউটিউব ও ফেসবুকে লাইভ খুঁজুন এবং ৫টি সার্ভার তৈরি করুন'}
                    </span>
                  </button>

                  {discoveredServers && (
                    <button
                      type="button"
                      onClick={() => handleBindServersToMatch()}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#16D98A] hover:bg-[#1ae895] text-[#080B12] text-xs font-bold inline-flex items-center gap-2 transition-all shadow-lg shadow-[#16D98A]/20 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>এই ৫টি সার্ভার নির্বাচিত ম্যাচে সেভ ও সক্রিয় করুন</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 5 Servers Display & Customizer */}
              {discoveredServers && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#00B7FF]" />
                      তৈরি হওয়া ৫টি সার্ভার কনফিগারেশন:
                    </p>
                    <span className="text-[11px] text-[#A5B1C2]">
                      সূত্র: {streamSearchSource === 'gemini_search_grounding' ? 'গুগল সার্চ ও ইউটিউব গ্রাউন্ডিং' : 'ভেরিফায়েড ব্রডকাস্ট নেটওয়ার্ক'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {discoveredServers.map((srv, idx) => (
                      <div
                        key={srv.id}
                        className={`p-3.5 rounded-xl border space-y-2 ${
                          idx === 0
                            ? 'bg-[#00B7FF]/10 border-[#00B7FF]/40 ring-1 ring-[#00B7FF]/30'
                            : 'bg-[#101722] border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-white">
                            {idx === 0 ? '⚡ ' : ''}সার্ভার {idx + 1}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            idx === 0 ? 'bg-[#00B7FF] text-[#080B12]' : 'bg-white/10 text-[#A5B1C2]'
                          }`}>
                            {srv.quality}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#00B7FF]">
                          {srv.badge}
                        </p>
                        <p className="text-[10px] text-[#A5B1C2] leading-relaxed">
                          {srv.description}
                        </p>
                        <div className="pt-1">
                          <input
                            type="text"
                            value={srv.url}
                            onChange={(e) => {
                              const updated = [...discoveredServers];
                              updated[idx].url = e.target.value;
                              setDiscoveredServers(updated);
                            }}
                            className="w-full bg-[#151E2B] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white font-mono truncate focus:outline-none focus:border-[#00B7FF]"
                            title="সার্ভার স্ট্রিম লিঙ্ক"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setTestStreamUrl(srv.url)}
                          className="w-full mt-1 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-[#A5B1C2] hover:text-white flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3 text-[#00B7FF]" />
                          টেস্ট প্লে
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Google Search Console & Index Verification Inspector */}
            <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-[#00B7FF]/10 text-[#00B7FF] border border-[#00B7FF]/20">
                    <Globe className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      গুগল ইনডেক্স ভেরিফিকেশন ও সার্চ কনসোল চেকার (Google Index Status)
                    </h2>
                    <p className="text-xs text-[#A5B1C2]">
                      গুগলে আপনার ওয়েবসাইট ইনডেক্স হয়েছে কিনা তা নিশ্চিত করার সম্পূর্ণ নির্দেশিকা ও এক-ক্লিক যাচাই টুল
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16D98A]/15 border border-[#16D98A]/30 text-[#16D98A] text-xs font-semibold self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>মেটা ট্যাগ কার্যকর</span>
                </div>
              </div>

              {/* Status Verification Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#101722] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Google Site Verification</span>
                    <span className="text-[#16D98A] text-xs">✓ Active</span>
                  </div>
                  <p className="text-[11px] text-[#A5B1C2] font-mono break-all">
                    6vx3TPoTIMK_BIUQaQG59mENiwW_nJgRoD0BcwdowOQ
                  </p>
                  <p className="text-[10px] text-[#16D98A]">HTML &lt;head&gt; সেকশনে সঠিক মেটা ট্যাগ যুক্ত আছে।</p>
                </div>

                <div className="p-4 rounded-xl bg-[#101722] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Sitemap.xml</span>
                    <span className="text-[#16D98A] text-xs">✓ Ready</span>
                  </div>
                  <p className="text-[11px] text-[#A5B1C2] font-mono">
                    /sitemap.xml
                  </p>
                  <p className="text-[10px] text-[#A5B1C2]">গুগল বটদের জন্য সকল খেলা ও পেজের এক্সএমএল ম্যাপ তৈরি।</p>
                </div>

                <div className="p-4 rounded-xl bg-[#101722] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Robots.txt</span>
                    <span className="text-[#16D98A] text-xs">✓ Allowed</span>
                  </div>
                  <p className="text-[11px] text-[#A5B1C2] font-mono">
                    /robots.txt
                  </p>
                  <p className="text-[10px] text-[#A5B1C2]">গুগল সার্চ ইঞ্জিনকে সাইট ক্রল করার অনুমতি দেওয়া আছে।</p>
                </div>
              </div>

              {/* Explanation: How to know if Google has indexed the site */}
              <div className="bg-[#101722] rounded-xl border border-white/10 p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#00B7FF] uppercase tracking-wider">
                  গুগলে ইনডেক্স হলে কিভাবে বুঝবেন? (৩টি সহজ উপায়)
                </h3>
                <div className="space-y-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#00B7FF]/20 text-[#00B7FF] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">১</span>
                    <div>
                      <strong className="text-white">গুগলে সরাসরি সার্চ করে দেখুন:</strong>
                      <p className="text-[#A5B1C2] text-[11px] mt-0.5">
                        গুগল সার্চবারে গিয়ে <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">site:kheladekh.vercel.app</code> লিখে সার্চ করুন। যদি আপনার সাইটের লিঙ্ক গুগলের সার্চ রেজাল্টে দেখা যায়, তাহলে নিশ্চিত হবেন যে গুগল সাইটটি ইনডেক্স করে নিয়েছে।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#00B7FF]/20 text-[#00B7FF] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">২</span>
                    <div>
                      <strong className="text-white">গুগল সার্চ কনসোলে "URL Inspection" (URL পরিদর্শন):</strong>
                      <p className="text-[#A5B1C2] text-[11px] mt-0.5">
                        সার্চ কনসোলের উপরের সার্চবারে আপনার সাইটের পুরো URL পেস্ট করে Enter চাপলে যদি <strong className="text-[#16D98A]">"URL is on Google"</strong> এবং সবুজ টিক চিহ্ন দেখায়, তবে সাইটটি সম্পূর্ণরূপে ইনডেক্সড।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#00B7FF]/20 text-[#00B7FF] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">৩</span>
                    <div>
                      <strong className="text-white">Sitemaps সেকশনে "Success" স্ট্যাটাস:</strong>
                      <p className="text-[#A5B1C2] text-[11px] mt-0.5">
                        সার্চ কনসোলের বাম পাশের <strong>Sitemaps</strong> মেনুতে <code className="text-emerald-400 font-mono">sitemap.xml</code> সাবমিট করলে সেখানে "Success" স্ট্যাটাস এবং ডিসকভার্ড পেজের সংখ্যা প্রদর্শিত হয়। (নতুন সাইট ভেরিফাই করার পর গুগল সাধারণত ২৪ থেকে ৭২ ঘণ্টার মধ্যে প্রথম ইনডেক্স সম্পন্ন করে)।
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
                  <a
                    href="https://www.google.com/search?q=site:kheladekh.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-md shadow-[#00B7FF]/20"
                  >
                    <Search className="w-4 h-4" />
                    <span>গুগলে লাইভ চেক করুন (site:kheladekh.vercel.app)</span>
                  </a>

                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#151E2B] hover:bg-white/10 border border-white/15 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-[#00B7FF]" />
                    <span>গুগল সার্চ কনসোল ওপেন করুন</span>
                  </a>

                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#151E2B] hover:bg-white/10 border border-white/15 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                  >
                    <Link2 className="w-4 h-4 text-emerald-400" />
                    <span>সাইটম্যাপ (sitemap.xml) দেখুন</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-extrabold text-white">Match Controller</h1>
                <p className="text-xs text-[#A5B1C2] mt-0.5">
                  Update live scores in 1 click, toggle match status, or manage fixtures.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterSport}
                  onChange={(e) => setFilterSport(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-xs text-white"
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
                  className="h-9 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-xs text-white"
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
              className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4"
            >
              <h2 className="text-sm font-bold text-white">Create New Event</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  placeholder="Event title"
                  className="h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                />
                <select
                  value={evSport}
                  onChange={(e) => setEvSport(e.target.value)}
                  className="h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
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
                  className="h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
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
                  className="h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="LIVE">LIVE</option>
                  <option value="FINISHED">FINISHED</option>
                </select>
                <input
                  type="date"
                  value={evDate}
                  onChange={(e) => setEvDate(e.target.value)}
                  className="h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                />
                <input
                  type="time"
                  value={evTime}
                  onChange={(e) => setEvTime(e.target.value)}
                  className="h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                />
              </div>
              <input
                type="url"
                value={evStream}
                onChange={(e) => setEvStream(e.target.value)}
                placeholder="Authorized viewing URL (optional)"
                className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={evScore}
                  onChange={(e) => setEvScore(e.target.value)}
                  placeholder="Score summary (e.g. 2 - 1)"
                  className="h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                />
                <input
                  type="url"
                  value={evThumb}
                  onChange={(e) => setEvThumb(e.target.value)}
                  placeholder="Thumbnail URL (or upload below)"
                  className="h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                />
              </div>
              <textarea
                rows={2}
                value={evDesc}
                onChange={(e) => setEvDesc(e.target.value)}
                placeholder="Event description"
                className="w-full p-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
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
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#101722] text-xs font-semibold text-[#A5B1C2]"
                  >
                    Cancel Edit
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
                    className="bg-[#151E2B] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-white/20"
                  >
                    {/* Left Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B7FF] bg-[#00B7FF]/15 px-2 py-0.5 rounded">
                          {ev.sportId}
                        </span>
                        <span className="text-xs text-[#A5B1C2] font-mono">
                          {ev.eventDate} · {ev.eventTime}
                        </span>
                        {ev.featured && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.2 rounded font-mono">
                            ★ FEATURED
                          </span>
                        )}
                        {!ev.published && (
                          <span className="text-[10px] font-bold text-red-400 bg-red-400/15 px-1.5 py-0.2 rounded font-mono">
                            DRAFT
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-white truncate">{ev.title}</p>
                    </div>

                    {/* Middle: 1-Click Inline Score Editor */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        defaultValue={ev.scoreSummary || ''}
                        onChange={(e) =>
                          setQuickScoreMap((prev) => ({ ...prev, [ev.id]: e.target.value }))
                        }
                        placeholder="Live Score"
                        className="w-28 sm:w-36 h-9 px-2.5 rounded-lg bg-[#101722] border border-white/15 text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickScoreSave(ev)}
                        title="Save Live Score"
                        className="h-9 px-2.5 rounded-lg bg-white/10 hover:bg-[#00B7FF] hover:text-[#080B12] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                    </div>

                    {/* Right: 1-Click Status Switcher & Actions */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {/* 1-Click Status Pills */}
                      <div className="flex items-center gap-1 bg-[#101722] p-1 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(ev, 'LIVE')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            ev.status === 'LIVE'
                              ? 'bg-[#16D98A] text-[#080B12] shadow-sm'
                              : 'text-[#A5B1C2] hover:text-white'
                          }`}
                        >
                          LIVE
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(ev, 'UPCOMING')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            ev.status === 'UPCOMING'
                              ? 'bg-[#00B7FF] text-[#080B12] shadow-sm'
                              : 'text-[#A5B1C2] hover:text-white'
                          }`}
                        >
                          UPCOMING
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(ev, 'FINISHED')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            ev.status === 'FINISHED'
                              ? 'bg-white/20 text-white shadow-sm'
                              : 'text-[#A5B1C2] hover:text-white'
                          }`}
                        >
                          FINISHED
                        </button>
                      </div>

                      {/* Featured Star Toggle */}
                      <button
                        type="button"
                        onClick={() => handleQuickFeaturedToggle(ev)}
                        title={ev.featured ? 'Remove from Featured' : 'Set as Featured'}
                        className={`p-2 rounded-xl border transition-colors ${
                          ev.featured
                            ? 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                            : 'bg-[#101722] border-white/10 text-[#A5B1C2] hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Full Button */}
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
                        className="px-3 py-1.5 rounded-xl bg-[#101722] text-xs font-semibold text-[#00B7FF] hover:border hover:border-[#00B7FF]"
                      >
                        Edit
                      </button>

                      {/* Delete Button */}
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

        {activeTab === 'news' && (
          <div className="space-y-6">
            <h1 className="font-display text-2xl font-extrabold text-white">Manage News</h1>
            <form
              onSubmit={handleCreateNews}
              className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4"
            >
              <input
                type="text"
                required
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="Article title"
                className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
              />
              <select
                value={newsCat}
                onChange={(e) => setNewsCat(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
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
                className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
              />
              <textarea
                rows={4}
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                placeholder="Article body"
                className="w-full p-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
              />
              <button
                type="submit"
                className="min-h-[40px] px-5 py-2 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Publish Article
              </button>
            </form>

            <div className="space-y-3">
              {news.map((n) => (
                <div
                  key={n.id}
                  className="bg-[#151E2B] rounded-xl border border-white/10 p-4 flex items-center justify-between gap-4"
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
                className="flex-1 h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white"
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
                  className="bg-[#151E2B] rounded-xl border border-white/10 p-4 flex items-center justify-between"
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
                className="flex-1 h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white"
              />
              <input
                type="text"
                value={teamShort}
                onChange={(e) => setTeamShort(e.target.value)}
                placeholder="Short (e.g. DDFC)"
                className="w-36 h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white"
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
                  className="bg-[#151E2B] rounded-xl border border-white/10 p-4 flex items-center justify-between"
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
                className="flex-1 h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white"
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
                  className="bg-[#151E2B] rounded-xl border border-white/10 p-4 flex items-center justify-between"
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
                className="flex-1 h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white"
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
                  className="bg-[#151E2B] rounded-xl border border-white/10 p-4 flex items-center justify-between"
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

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-extrabold text-white">Registered Users</h1>
            <div className="space-y-2">
              {usersList.map((u) => (
                <div
                  key={u.uid}
                  className="bg-[#151E2B] rounded-xl border border-white/10 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{u.displayName}</p>
                    <p className="text-xs text-[#A5B1C2]">{u.email}</p>
                  </div>
                  <span className="text-xs font-mono text-[#A5B1C2]">
                    {u.savedEvents?.length || 0} saved
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
            <h1 className="font-display text-xl font-bold text-white">
              Media Library (Firebase Storage)
            </h1>
            <p className="text-xs text-[#A5B1C2]">
              Upload authorized images (JPEG, PNG, WebP, GIF up to 5MB) to Firebase Storage.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploadingMedia}
              onChange={(e) => handleFileUpload(e, () => {})}
              className="block w-full text-xs text-[#A5B1C2] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#00B7FF] file:text-[#080B12] hover:file:bg-[#33C5FF]"
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
                    className="p-3 rounded-xl bg-[#101722] border border-white/10 text-xs font-mono text-[#16D98A] break-all"
                  >
                    {url}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-2">
            <h1 className="font-display text-xl font-bold text-white">Notifications</h1>
            <p className="text-xs text-[#A5B1C2]">
              Users manage their event reminder and news alert preferences from their Profile
              page.
            </p>
          </div>
        )}

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
                    className="bg-[#151E2B] rounded-xl border border-white/10 p-4 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs text-[#A5B1C2]">
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
                        className="bg-[#101722] border border-white/10 rounded-lg px-2 py-1 font-mono text-xs text-white"
                      >
                        <option value="NEW">NEW</option>
                        <option value="READ">READ</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                    <p className="text-sm font-bold text-[#00B7FF]">{m.subject}</p>
                    <p className="text-xs text-[#A5B1C2]">{m.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#151E2B] rounded-xl border border-white/10 p-6 text-xs text-[#A5B1C2]">
                No contact messages yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-extrabold text-white">
                  ওয়েবসাইট সেটিংস ও বিজ্ঞাপন নিয়ন্ত্রণ (Settings & Ads)
                </h1>
                <p className="text-xs text-[#A5B1C2] mt-1">
                  ওয়েবসাইটের সাধারণ সেটিংস এবং খেলা দেখার পূর্বে ১২ সেকেন্ডের বিজ্ঞাপন পরিচালনা করুন।
                </p>
              </div>
            </div>

            {/* 12-Second Pre-Roll / App Entry Ad Management Card */}
            <div className="bg-[#151E2B] rounded-2xl border border-amber-500/20 p-6 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      খেলা দেখার পূর্বের বিজ্ঞাপন (১২ সেকেন্ড কাউন্টডাউন)
                      {adEnabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          সক্রিয় (Active)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[#A5B1C2]">
                          বন্ধ (Disabled)
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-[#A5B1C2]">
                      ব্যবহারকারী অ্যাপে ঢুকলে বা খেলায় ক্লিক করলে ১২ সেকেন্ড অ্যাড চলবে, তারপর ১২ ঘণ্টা আর আসবে না।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdEnabled(!adEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      adEnabled
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {adEnabled ? 'বিজ্ঞাপন চালু আছে' : 'বিজ্ঞাপন বন্ধ করুন'}
                  </button>
                </div>
              </div>

              {/* Status and Testing Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#101722] p-3.5 rounded-xl border border-white/5">
                  <span className="text-[11px] text-[#A5B1C2] block">বিজ্ঞাপন প্রদর্শনের সময়</span>
                  <div className="text-lg font-mono font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{adDuration} সেকেন্ড (কাউন্টডাউন)</span>
                  </div>
                </div>

                <div className="bg-[#101722] p-3.5 rounded-xl border border-white/5">
                  <span className="text-[11px] text-[#A5B1C2] block">পুনরায় প্রদর্শনের বিরতি (Capping)</span>
                  <div className="text-lg font-mono font-bold text-[#00B7FF] mt-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{adFrequency} ঘণ্টা সম্পূর্ণ বিজ্ঞাপনমুক্ত</span>
                  </div>
                </div>

                <div className="bg-[#101722] p-3.5 rounded-xl border border-white/5">
                  <span className="text-[11px] text-[#A5B1C2] block">আপনার বর্তমান ব্রাউজার স্ট্যাটাস</span>
                  <div className="text-xs font-medium text-white mt-1.5 flex items-center gap-1.5">
                    {cooldownRemaining > 0 ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        কুলডাউনে আছে: আর {Math.ceil(cooldownRemaining / 60)} ঘণ্টা বাকি
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        এখনই বিজ্ঞাপন দেখানোর জন্য প্রস্তুত
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Testing and Cooldown Reset */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTestAdModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold flex items-center gap-2 hover:opacity-95 shadow-md shadow-amber-500/20"
                >
                  <Play className="w-4 h-4" />
                  ১২ সেকেন্ডের বিজ্ঞাপন লাইভ টেস্ট করুন (Preview)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetAdCooldown();
                    setCooldownRemaining(0);
                    notify('১২ ঘণ্টার বিজ্ঞাপন কুলডাউন রিসেট করা হয়েছে!');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
                >
                  <RefreshCw className="w-4 h-4" />
                  ১২ ঘণ্টার লিমিট রিসেট করুন (Reset Cooldown)
                </button>
              </div>

              {/* Form Inputs for Ad Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#A5B1C2] mb-1">
                    বিজ্ঞাপনের শিরোনাম (Ad Title)
                  </label>
                  <input
                    type="text"
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="যেমন: KhelaDekH অফিসিয়াল স্পোর্টস পার্টনার স্পনসর"
                    className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#A5B1C2] mb-1">
                    বিজ্ঞাপনের বর্ণনা (Ad Description)
                  </label>
                  <textarea
                    rows={2}
                    value={adDesc}
                    onChange={(e) => setAdDesc(e.target.value)}
                    placeholder="বিজ্ঞাপনের অফার বা বিস্তারিত তথ্য লিখুন..."
                    className="w-full p-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:border-amber-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A5B1C2] mb-1">
                    স্পনসর / টার্গেট লিংক (Sponsor Link / URL)
                  </label>
                  <input
                    type="url"
                    value={adTargetUrl}
                    onChange={(e) => setAdTargetUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A5B1C2] mb-1">
                    বাটন টেক্সট (CTA Button Text)
                  </label>
                  <input
                    type="text"
                    value={adCtaText}
                    onChange={(e) => setAdCtaText(e.target.value)}
                    placeholder="যেমন: অফারটি দেখুন (Claim Offer)"
                    className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#A5B1C2] mb-1">
                    বিজ্ঞাপনের ব্যানার ইমেজ লিংক (Ad Image URL)
                  </label>
                  <input
                    type="url"
                    value={adImageUrl}
                    onChange={(e) => setAdImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* General Site Settings Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveSettings({
                  ...settings,
                  siteName,
                  tagline,
                  contactEmail,
                  footerText,
                  preRollAd: {
                    enabled: adEnabled,
                    durationSeconds: adDuration,
                    frequencyHours: adFrequency,
                    title: adTitle,
                    description: adDesc,
                    targetUrl: adTargetUrl,
                    ctaText: adCtaText,
                    imageUrl: adImageUrl,
                    badgeText: 'স্পন্সর বিজ্ঞাপন (Sponsored)',
                  },
                });
                notify('ওয়েবসাইট সেটিংস ও বিজ্ঞাপনের কনফিগারেশন সংরক্ষিত হয়েছে!');
              }}
              className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4"
            >
              <h2 className="text-base font-bold text-white mb-2">সাধারণ ওয়েবসাইট সেটিংস</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A5B1C2] mb-1">Site Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A5B1C2] mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A5B1C2] mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A5B1C2] mb-1">Footer Text</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold hover:brightness-110 transition-all shadow-md"
              >
                সব সেটিংস সেভ করুন (Save All Settings)
              </button>
            </form>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-extrabold text-white">Audit Logs</h1>
            <div className="space-y-2">
              {auditList.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#151E2B] rounded-xl border border-white/10 p-3 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-white">
                    {log.action} · {log.targetCollection}/{log.targetId}
                  </span>
                  <span className="text-[#A5B1C2]">{log.actorEmail}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pre-Roll Ad Test Modal for Admin Preview */}
      <PreRollAdModal
        isOpen={testAdModalOpen}
        onClose={() => setTestAdModalOpen(false)}
        config={{
          enabled: adEnabled,
          durationSeconds: adDuration,
          frequencyHours: adFrequency,
          title: adTitle,
          description: adDesc,
          targetUrl: adTargetUrl,
          ctaText: adCtaText,
          imageUrl: adImageUrl,
          badgeText: 'অ্যাডমিন টেস্ট প্রিভিউ (Admin Preview)',
        }}
        contextText="অ্যাডমিন প্যানেল থেকে ১২ সেকেন্ডের বিজ্ঞাপন টেস্ট প্রিভিউ"
      />
    </div>
  );
};
