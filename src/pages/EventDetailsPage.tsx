import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Calendar, Clock, MessageSquare, Activity, BarChart3, Users, Eye, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { EventCard } from '../components/EventCard';
import { LiveMatchChat } from '../components/LiveMatchChat';
import { LiveMatchStats } from '../components/LiveMatchStats';
import { LiveMatchPoll } from '../components/LiveMatchPoll';
import { useViewerPresence, useMatchViewers } from '../services/presenceService';
import { shouldDisplayAd } from '../services/adService';
import { PreRollAdModal } from '../components/PreRollAdModal';
import { StreamServer } from '../types';

export const EventDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const autoFullscreen = searchParams.get('fullscreen') === 'true';
  const initialResolution = searchParams.get('res') || undefined;
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'chat' | 'stats' | 'poll'>('chat');

  const { events, sports, competitions, teams, toggleSavedEvent, settings } = useData();
  const { user, profile } = useAuth();
  const [showMatchAd, setShowMatchAd] = useState(false);

  const event = events.find((e) => e.slug === slug || e.id === slug);
  const matchViewersCount = useMatchViewers(event?.id);

  // Automated live stream discovery state
  const [autoServers, setAutoServers] = useState<StreamServer[] | null>(
    event?.streamServers && event.streamServers.length > 0 ? event.streamServers : null
  );
  const [isSearchingStreams, setIsSearchingStreams] = useState(false);
  const [autoSearchStatus, setAutoSearchStatus] = useState<string | null>(null);

  // Trigger live stream auto-discovery whenever match is loaded
  const discoverLiveStreams = (forceRefresh = false) => {
    if (!event) return;
    setIsSearchingStreams(true);
    setAutoSearchStatus('লাইভ স্ট্রিম স্বয়ংক্রিয়ভাবে অনুসন্ধান ও ৫টি সার্ভার তৈরি হচ্ছে...');

    fetch('/api/discover-stream-servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchTitle: event.title, sportId: event.sportId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.servers && data.servers.length > 0) {
          setAutoServers(data.servers);
          setAutoSearchStatus(`⚡ লাইভ স্ট্রিম স্বয়ংক্রিয়ভাবে সংযোগ সম্পন্ন (${data.servers.length}টি সার্ভার প্রস্তুত)`);
          setTimeout(() => setAutoSearchStatus(null), 5000);
        } else {
          setAutoSearchStatus('ডিফল্ট হাই-স্পিড সার্ভার সক্রিয় রয়েছে');
          setTimeout(() => setAutoSearchStatus(null), 3000);
        }
      })
      .catch((err) => {
        console.warn('Auto stream search error:', err);
        setAutoSearchStatus(null);
      })
      .finally(() => setIsSearchingStreams(false));
  };

  useEffect(() => {
    if (!event) return;
    const hasExistingLiveFeed =
      event.streamServers &&
      event.streamServers.length > 0 &&
      !event.authorizedViewingUrl?.includes('test-streams.mux.dev');

    if (!hasExistingLiveFeed) {
      discoverLiveStreams(false);
    }
  }, [event?.id, event?.title]);

  useEffect(() => {
    const adConfig = settings?.preRollAd;
    if (adConfig && adConfig.enabled === false) return;

    const freq = adConfig?.frequencyHours || 12;
    if (shouldDisplayAd(freq)) {
      setShowMatchAd(true);
    }
  }, [settings?.preRollAd, event?.id]);

  useViewerPresence({
    page: event ? `/events/${event.slug || event.id}` : window.location.pathname,
    eventId: event?.id || null,
    eventTitle: event?.title || null,
    sportId: event?.sportId || null,
    userId: user?.uid || null,
    userName: profile?.displayName || user?.displayName || 'Fan',
    enabled: Boolean(event),
  });

  if (!event) {
    return (
      <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-10 text-center">
        <h1 className="font-display text-xl font-bold text-white">Event not found</h1>
        <Link
          to="/sports"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#00B7FF]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sports
        </Link>
      </div>
    );
  }

  const sport = sports.find((s) => s.id === event.sportId);
  const competition = competitions.find((c) => c.id === event.competitionId);
  const eventTeams = teams.filter((t) => event.teamIds.includes(t.id));
  const isSaved = profile?.savedEvents.includes(event.id) || false;
  const relatedEvents = events
    .filter((e) => e.published && e.id !== event.id && e.sportId === event.sportId)
    .slice(0, 3);

  return (
    <div className="space-y-10">
      {/* 12-Second Pre-Roll Match Ad Modal (12-hour frequency cap) */}
      <PreRollAdModal
        config={settings?.preRollAd}
        isOpen={showMatchAd}
        onClose={() => setShowMatchAd(false)}
        contextText={`"${event.title}" খেলা শুরু হওয়ার পূর্বে সংক্ষিপ্ত ১২ সেকেন্ড বিজ্ঞাপন`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/sports"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A5B1C2] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Fixtures
        </Link>

        {/* Auto Stream Search Status & Re-Sync Trigger */}
        <div className="flex items-center gap-2">
          {autoSearchStatus && (
            <div className="px-3 py-1 rounded-full bg-[#00B7FF]/15 border border-[#00B7FF]/30 text-[#00B7FF] text-xs font-medium flex items-center gap-1.5 animate-fade-in shadow-sm">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>{autoSearchStatus}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isSearchingStreams}
            onClick={() => discoverLiveStreams(true)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all border border-white/10 disabled:opacity-50"
            title="লাইভ স্ট্রিম স্বয়ংক্রিয়ভাবে পুনরায় অনুসন্ধান করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00B7FF] ${isSearchingStreams ? 'animate-spin' : ''}`} />
            <span>{isSearchingStreams ? 'অটো-সার্চ হচ্ছে...' : 'অটো লাইভ স্ট্রিম রিফ্রেশ'}</span>
          </button>
        </div>
      </div>

      {/* Official Viewing Player with 5 Multi-bitrate Servers */}
      <VideoPlayer
        src={autoServers?.[0]?.url || event.authorizedViewingUrl}
        servers={autoServers || event.streamServers}
        poster={event.thumbnailUrl}
        title={event.title}
        autoFullscreen={autoFullscreen}
        initialResolution={initialResolution}
      />

      {/* Interactive Match Center Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-1.5 bg-[#151E2B] rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveInteractiveTab('chat')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeInteractiveTab === 'chat'
                ? 'bg-[#00B7FF] text-[#080B12] shadow-md shadow-[#00B7FF]/20'
                : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>লাইভ চ্যাট (Live Chat)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInteractiveTab('stats')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeInteractiveTab === 'stats'
                ? 'bg-[#00B7FF] text-[#080B12] shadow-md shadow-[#00B7FF]/20'
                : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>ম্যাচ ইনটেল ও পরিসংখ্যান (Stats)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInteractiveTab('poll')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeInteractiveTab === 'poll'
                ? 'bg-[#00B7FF] text-[#080B12] shadow-md shadow-[#00B7FF]/20'
                : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ফ্যান প্রেডিকশন পোল (Fan Poll)</span>
          </button>
        </div>

        {activeInteractiveTab === 'chat' && (
          <LiveMatchChat
            eventId={event.id}
            eventTitle={event.title}
            teams={eventTeams}
          />
        )}

        {activeInteractiveTab === 'stats' && (
          <LiveMatchStats
            event={event}
            teams={eventTeams}
          />
        )}

        {activeInteractiveTab === 'poll' && (
          <LiveMatchPoll
            eventId={event.id}
            teams={eventTeams}
          />
        )}
      </div>

      {/* Event Header & Metadata */}
      <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#A5B1C2]">
              <span className="text-[#00B7FF] font-semibold">
                {sport?.name || event.sportId}
              </span>
              <span aria-hidden="true">·</span>
              <span>{competition?.name || event.competitionId}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-mono font-semibold ${
                  event.status === 'LIVE'
                    ? 'text-[#16D98A]'
                    : event.status === 'UPCOMING'
                    ? 'text-[#00B7FF]'
                    : 'text-[#A5B1C2]'
                }`}
              >
                {event.status}
              </span>

              {/* Real-time Concurrent Watchers Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-semibold text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="tabular-nums">
                  {matchViewersCount > 0 ? `${matchViewersCount} জন এখন দেখছেন` : '১ জন দেখছেন'}
                </span>
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              {event.title}
            </h1>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => toggleSavedEvent(event.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shrink-0 transition-colors ${
                isSaved
                  ? 'bg-[#16D98A]/15 text-[#16D98A] border border-[#16D98A]/30'
                  : 'bg-[#101722] text-white border border-white/10 hover:border-[#00B7FF]'
              }`}
            >
              {isSaved ? (
                <>
                  <BellOff className="w-4 h-4" /> Saved
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" /> Save Event
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#A5B1C2] font-mono tabular-nums border-y border-white/10 py-4">
          <span className="inline-flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00B7FF]" />
            {event.eventDate}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00B7FF]" />
            {event.eventTime} ({event.timezone})
          </span>
          {event.scoreSummary && (
            <span className="text-white font-bold text-sm">{event.scoreSummary}</span>
          )}
        </div>

        <p className="text-sm text-[#A5B1C2] leading-relaxed">{event.description}</p>

        {eventTeams.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-white mb-3">Participating Teams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eventTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-[#101722] rounded-xl p-4 border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{team.name}</p>
                    <p className="text-xs text-[#A5B1C2]">{team.country}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#00B7FF]">
                    {team.shortName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-white mb-4">Related Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((rel) => (
              <EventCard key={rel.id} event={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
