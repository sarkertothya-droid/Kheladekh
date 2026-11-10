import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Radio, Calendar, Trophy, Newspaper, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { HERO_IMAGE } from '../data/seedData';
import { EventCard } from '../components/EventCard';
import { NewsCard } from '../components/NewsCard';
import { AutoSyncBar } from '../components/AutoSyncBar';
import { StadiumSoundboard } from '../components/StadiumSoundboard';
import { AdsterraBanner320x50, AdsterraNativeBanner } from '../components/AdsterraAds';

export const HomePage: React.FC = () => {
  const { events, sports, news, loading } = useData();
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const publishedEvents = events.filter((e) => e.published);
  const filteredEvents =
    selectedSport === 'all'
      ? publishedEvents
      : publishedEvents.filter((e) => e.sportId === selectedSport);

  const liveEvents = filteredEvents.filter((e) => e.status === 'LIVE');
  const upcomingEvents = filteredEvents.filter((e) => e.status === 'UPCOMING');
  const finishedEvents = filteredEvents.filter((e) => e.status === 'FINISHED');
  const allLive = publishedEvents.filter((e) => e.status === 'LIVE');
  const publishedNews = news.filter((n) => n.status === 'PUBLISHED').slice(0, 3);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 5-Minute Auto-Sync Real-Time Notification Bar */}
      <AutoSyncBar />

      {/* Live Match Ticker Tape */}
      {allLive.length > 0 && (
        <div className="bg-[#101722] border border-white/10 rounded-2xl p-2.5 flex items-center gap-3 overflow-hidden shadow-lg">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 font-mono text-xs font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE TICKER
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
            {allLive.map((m) => (
              <Link
                key={m.id}
                to={`/events/${m.slug}`}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/10 hover:border-[#00B7FF] text-xs transition-colors flex items-center gap-2 group"
              >
                <span className="font-semibold text-white group-hover:text-[#00B7FF] truncate max-w-[150px] sm:max-w-[200px]">
                  {m.title}
                </span>
                {m.scoreSummary && (
                  <span className="px-1.5 py-0.5 rounded bg-[#16D98A]/20 text-[#16D98A] font-mono text-[11px] font-bold">
                    {m.scoreSummary}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#101722]">
        <div className="aspect-[16/9] md:aspect-[21/9] w-full relative">
          <img
            src={HERO_IMAGE}
            alt="KhelaDekH Stadium Night"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-[#080B12]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B12]/90 via-[#080B12]/40 to-transparent" />
        </div>

        <div className="relative md:absolute md:inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12 max-w-2xl">
          <p className="text-xs font-semibold text-[#00B7FF] tracking-wide mb-2">
            KhelaDekH Sports &amp; Entertainment
          </p>
          <h1
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Every Match, Live Score, and Official Broadcast in One Place
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#A5B1C2] leading-relaxed">
            Follow live football, cricket, basketball, and tennis fixtures with verified match
            schedules and authorized viewing links.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/stadium"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#00B7FF] text-white text-sm font-bold hover:brightness-110 transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0 shadow-xl shadow-[#00B7FF]/25 ring-2 ring-white/30 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>৪-স্ক্রিন স্টেডিয়াম স্টুডিও (এক্সক্লুসিভ)</span>
            </Link>
            <Link
              to="/tv"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-sm font-bold hover:brightness-110 transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-red-600/30 ring-1 ring-white/20"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Live TV (১০০০+ চ্যানেল)
            </Link>
            <Link
              to="/live"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Radio className="w-4 h-4" />
              Watch Live Matches
            </Link>
            <Link
              to="/sports"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#151E2B] text-white border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              Browse Sports
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🚀 EXCLUSIVE FEATURE BANNER: Stadium Studio Pro (Only on this website!) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#101722] via-[#162130] to-[#101722] border-2 border-[#00B7FF]/40 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B7FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>অন্য কোনো ওয়েবসাইটে নেই • শুধু KhelaDekH-এ!</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>স্টেডিয়াম স্টুডিও প্রো™ (৪-স্ক্রিন মাল্টিভিউ)</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A5B1C2] leading-relaxed">
              একই সাথে ৪টি লাইভ খেলা বা টিভি চ্যানেল দেখুন, ১-ট্যাপে সাউন্ড ট্রান্সফার করুন এবং নিচের লাইভ ভুভুজেলা ও করতালি সাউন্ড বাজিয়ে খেলা উপভোগ করুন!
            </p>

            {/* Quick Interactive Stadium Sound triggers right on homepage */}
            <div className="pt-2">
              <span className="text-[11px] font-mono font-bold text-[#64748B] block mb-1.5 uppercase">
                টেস্ট করুন স্টেডিয়াম সাউন্ড এফেক্টস:
              </span>
              <StadiumSoundboard compact />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              to="/stadium"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A] text-[#080B12] font-black text-sm text-center flex items-center justify-center gap-2 shadow-xl shadow-[#00B7FF]/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>৪-স্ক্রিন মোড চালু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="text-[11px] text-center text-[#A5B1C2] font-mono">
              ⚡ জিরো ব্যান্ডউইথ অডিও সিন্থেসিস
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Sport Filter Control Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-[#101722] rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Sports', icon: '🏆', total: publishedEvents.length },
          { id: 'cricket', label: 'Cricket', icon: '🏏', total: publishedEvents.filter(e => e.sportId === 'cricket').length },
          { id: 'football', label: 'Football', icon: '⚽', total: publishedEvents.filter(e => e.sportId === 'football').length },
          { id: 'basketball', label: 'Basketball', icon: '🏀', total: publishedEvents.filter(e => e.sportId === 'basketball').length },
          { id: 'tennis', label: 'Tennis', icon: '🎾', total: publishedEvents.filter(e => e.sportId === 'tennis').length },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedSport(s.id)}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              selectedSport === s.id
                ? 'bg-[#00B7FF] text-[#080B12] shadow-md shadow-[#00B7FF]/20'
                : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                selectedSport === s.id
                  ? 'bg-black/20 text-[#080B12]'
                  : 'bg-white/10 text-[#A5B1C2]'
              }`}
            >
              {s.total}
            </span>
          </button>
        ))}
      </div>

      {/* Live Events Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-[#16D98A]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Live Now</h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16D98A]/10 text-[#16D98A] text-[11px] font-mono font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16D98A] animate-pulse" />
              Auto-updating
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/live"
              className="text-xs font-semibold text-[#00B7FF] hover:underline inline-flex items-center gap-1"
            >
              View all live <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-[#151E2B] animate-pulse" />
            ))}
          </div>
        ) : liveEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-sm font-medium text-white">No live matches at this moment.</p>
            <p className="text-xs text-[#A5B1C2] mt-1">
              Check upcoming fixtures below or browse by sport.
            </p>
          </div>
        )}
      </section>

      {/* Adsterra 320x50 Monetization Banner */}
      <AdsterraBanner320x50 />

      {/* Upcoming Events Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#00B7FF]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Upcoming Fixtures
            </h2>
          </div>
          <Link
            to="/upcoming"
            className="text-xs font-semibold text-[#00B7FF] hover:underline inline-flex items-center gap-1"
          >
            Full schedule <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-sm font-medium text-white">No upcoming fixtures scheduled.</p>
          </div>
        )}
      </section>

      {/* Adsterra Native Monetization Banner */}
      <AdsterraNativeBanner />

      {/* Finished / Ended Matches Section */}
      {finishedEvents.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#16D98A]" />
              </span>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                  সমাপ্ত ম্যাচের ফলাফল (Recent Match Results / Ended)
                </h2>
                <p className="text-xs text-[#A5B1C2]">
                  চূড়ান্ত ফলাফল ও স্কোরসহ ইতিপূর্বে শেষ হওয়া ম্যাচসমূহ
                </p>
              </div>
            </div>
            <Link
              to="/live"
              className="text-xs font-semibold text-[#00B7FF] hover:underline inline-flex items-center gap-1"
            >
              সকল ফলাফল <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishedEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* 1000+ Live TV Channels Feature Spotlight Banner */}
      <section className="relative rounded-3xl overflow-hidden border border-red-500/30 bg-gradient-to-r from-[#1B0F15] via-[#151E2B] to-[#0A1926] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-500">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
                নতুন সংযোজন: ১০০০+ লাইভ টিভি চ্যানেল
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              কোনো ভিডিও নয়, সার্বক্ষণিক লাইভ স্ট্রিমিং ও টিভি চ্যানেল
            </h2>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              দেশি-বিদেশি খেলাধুলার চ্যানেল, স্পোর্টস নেটওয়ার্ক, লাইভ নিউজ, বিনোদন ও সিনেমার সরাসরি ব্রডকাস্ট। ক্যাটাগরিভিত্তিক ভাগ করা রয়েছে।
            </p>
          </div>

          <Link
            to="/tv"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-black text-sm inline-flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-red-600/30 ring-1 ring-white/20 self-start md:self-auto shrink-0"
          >
            <span>লাইভ টিভি খুলুন (Live TV)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Popular Sports */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#00B7FF]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Popular Sports
            </h2>
          </div>
          <Link
            to="/sports"
            className="text-xs font-semibold text-[#00B7FF] hover:underline inline-flex items-center gap-1"
          >
            All sports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {sports.map((sport) => (
            <Link
              key={sport.id}
              to={`/sports?sport=${sport.id}`}
              className="group relative rounded-2xl overflow-hidden bg-[#151E2B] border border-white/10 hover:border-[#00B7FF]/50 transition-colors aspect-[4/3]"
            >
              {sport.imageUrl && (
                <img
                  src={sport.imageUrl}
                  alt={sport.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-[#080B12]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-base sm:text-lg font-bold text-white">
                  {sport.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Newspaper className="w-5 h-5 text-[#00B7FF]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Latest News</h2>
          </div>
          <Link
            to="/news"
            className="text-xs font-semibold text-[#00B7FF] hover:underline inline-flex items-center gap-1"
          >
            All articles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedNews.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
};
