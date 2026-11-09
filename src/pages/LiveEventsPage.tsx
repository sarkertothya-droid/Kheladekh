import React, { useState } from 'react';
import { Radio, CheckCircle2, Flame, Trophy, Play } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EventCard } from '../components/EventCard';
import { VideoPlayer } from '../components/VideoPlayer';
import { AutoSyncBar } from '../components/AutoSyncBar';
import { AdsterraBanner320x50, AdsterraNativeBanner } from '../components/AdsterraAds';

export const LiveEventsPage: React.FC = () => {
  const { events } = useData();
  const [activeTab, setActiveTab] = useState<'live' | 'finished'>('live');

  // Strict separation: Live matches ONLY vs Finished matches
  const liveEvents = events.filter((e) => e.published && e.status === 'LIVE');
  const finishedEvents = events.filter((e) => e.published && e.status === 'FINISHED');
  const featuredLive = liveEvents.find((e) => e.authorizedViewingUrl) || liveEvents[0];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 5-Minute Auto-Sync & Real-Time Status Header */}
      <AutoSyncBar />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <span>সরাসরি লাইভ স্পোর্টস সম্প্রচার</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A5B1C2]">
              প্রতি ৫ মিনিটে অটোমেটিক সিঙ্ক হচ্ছে। সমাপ্ত ম্যাচসমূহ সরাসরি লাইভ থেকে আলাদা করে সংরক্ষিত।
            </p>
          </div>
        </div>

        {/* Tab Switcher: Live Now vs Finished Matches */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#101722] rounded-2xl border border-white/10 self-start sm:self-auto shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'live'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-1 ring-white/20'
                : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>সরাসরি চলছে ({liveEvents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finished')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'finished'
                ? 'bg-zinc-800 text-white shadow-md ring-1 ring-white/20'
                : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16D98A]" />
            <span>সমাপ্ত ম্যাচ ({finishedEvents.length})</span>
          </button>
        </div>
      </div>

      {/* Adsterra 320x50 Banner */}
      <AdsterraBanner320x50 />

      {/* Featured Live Stadium Player (Only shown if on Live tab and active live stream exists) */}
      {activeTab === 'live' && featuredLive && (
        <div className="space-y-4">
          <VideoPlayer
            src={featuredLive.authorizedViewingUrl}
            poster={featuredLive.thumbnailUrl}
            title={featuredLive.title}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#151E2B] to-[#101722] p-5 rounded-2xl border border-white/10 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE NOW
                </span>
                <span className="text-xs text-[#A5B1C2] capitalize font-mono">
                  {featuredLive.sportId} · {featuredLive.timezone}
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                {featuredLive.title}
              </h2>
            </div>
            {featuredLive.scoreSummary && (
              <span className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 font-mono text-base font-bold text-[#16D98A] tabular-nums self-start sm:self-auto">
                {featuredLive.scoreSummary}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid Display */}
      {activeTab === 'live' ? (
        liveEvents.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>চলমান সকল লাইভ খেলাসমূহ</span>
              </h2>
              <span className="text-xs text-[#A5B1C2] font-mono">মোট: {liveEvents.length}টি ম্যাচ</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#151E2B] rounded-3xl border border-white/10 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[#A5B1C2]">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              এই মুহূর্তে কোনো সরাসরি খেলা চলছে না
            </h3>
            <p className="text-xs text-[#A5B1C2] max-w-md mx-auto">
              স্বয়ংক্রিয়ভাবে প্রতি ৫ মিনিটে সিঙ্ক হচ্ছে। পূর্ববর্তী সমাপ্ত ম্যাচ দেখতে উপরের "সমাপ্ত ম্যাচ" ট্যাবে ক্লিক করুন।
            </p>
          </div>
        )
      ) : finishedEvents.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>আজকের সমাপ্ত ম্যাচের চূড়ান্ত ফলাফল ও স্কোর</span>
            </h2>
            <span className="text-xs text-[#A5B1C2] font-mono">মোট সমাপ্ত: {finishedEvents.length}টি</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#151E2B] rounded-3xl border border-white/10 p-12 text-center space-y-2">
          <p className="text-base font-bold text-white">কোনো সমাপ্ত ম্যাচ রেকর্ড নেই</p>
          <p className="text-xs text-[#A5B1C2]">নতুন ম্যাচ সমাপ্ত হলে এখানে ফলাফল দৃশ্যমান হবে।</p>
        </div>
      )}

      {/* Adsterra Native Banner */}
      <AdsterraNativeBanner />
    </div>
  );
};
