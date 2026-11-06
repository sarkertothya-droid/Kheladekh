import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Radio, Calendar, Trophy, Newspaper } from 'lucide-react';
import { useData } from '../context/DataContext';
import { HERO_IMAGE } from '../data/seedData';
import { EventCard } from '../components/EventCard';
import { NewsCard } from '../components/NewsCard';

export const HomePage: React.FC = () => {
  const { events, sports, news, loading } = useData();

  const publishedEvents = events.filter((e) => e.published);
  const liveEvents = publishedEvents.filter((e) => e.status === 'LIVE');
  const upcomingEvents = publishedEvents.filter((e) => e.status === 'UPCOMING');
  const publishedNews = news.filter((n) => n.status === 'PUBLISHED').slice(0, 3);

  return (
    <div className="space-y-14">
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
              to="/live"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Radio className="w-4 h-4" />
              Watch Live
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

      {/* Live Events Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-[#16D98A]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Live Now</h2>
          </div>
          <Link
            to="/live"
            className="text-xs font-semibold text-[#00B7FF] hover:underline inline-flex items-center gap-1"
          >
            View all live <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
