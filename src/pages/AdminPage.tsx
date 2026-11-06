import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
} from 'lucide-react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, uploadMediaFile } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AuditLog, ContactMessage, EventStatus, SportEvent, UserProfile } from '../types';

type AdminTab =
  | 'dashboard'
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
  } = useData();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [auditList, setAuditList] = useState<AuditLog[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

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

  const sidebarItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'sports', label: 'Sports', icon: <Trophy className="w-4 h-4" /> },
    { id: 'teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
    { id: 'competitions', label: 'Competitions', icon: <Award className="w-4 h-4" /> },
    { id: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <Image className="w-4 h-4" /> },
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
            className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
              activeTab === item.id
                ? 'bg-[#00B7FF] text-[#080B12]'
                : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
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
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <h1 className="font-display text-2xl font-extrabold text-white">Manage Events</h1>
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
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[#151E2B] rounded-xl border border-white/10 p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{ev.title}</p>
                    <p className="text-xs text-[#A5B1C2] font-mono">
                      {ev.status} · {ev.eventDate} {ev.eventTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#101722] text-xs font-semibold text-[#00B7FF]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvent(ev.id)}
                      aria-label="Delete event"
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
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
          <div className="space-y-6">
            <h1 className="font-display text-2xl font-extrabold text-white">
              Website Settings
            </h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveSettings({
                  ...settings,
                  siteName,
                  tagline,
                  contactEmail,
                  footerText,
                });
                notify('Settings updated.');
              }}
              className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4 max-w-xl"
            >
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
              <button
                type="submit"
                className="min-h-[40px] px-5 py-2 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold"
              >
                Save Settings
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
    </div>
  );
};
