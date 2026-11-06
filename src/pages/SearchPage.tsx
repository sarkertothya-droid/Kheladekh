import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EventCard } from '../components/EventCard';
import { NewsCard } from '../components/NewsCard';

export const SearchPage: React.FC = () => {
  const { events, sports, news } = useData();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const matchedSports = useMemo(
    () => (q ? sports.filter((s) => s.name.toLowerCase().includes(q)) : []),
    [sports, q]
  );

  const matchedEvents = useMemo(
    () =>
      q
        ? events.filter(
            (e) =>
              e.published &&
              (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
          )
        : [],
    [events, q]
  );

  const matchedNews = useMemo(
    () =>
      q
        ? news.filter(
            (n) =>
              n.status === 'PUBLISHED' &&
              (n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q))
          )
        : [],
    [news, q]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Search</h1>
        <p className="text-sm text-[#A5B1C2] mt-1">
          Find live matches, upcoming fixtures, sports, and news articles.
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="w-5 h-5 text-[#A5B1C2] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams, tournaments, sports, or news..."
          autoFocus
          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[#151E2B] border border-white/10 text-sm text-white placeholder-[#A5B1C2] focus:outline-none focus:border-[#00B7FF]"
        />
      </div>

      {!q ? (
        <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-sm text-[#A5B1C2]">
            Start typing above to search across KhelaDekH.
          </p>
        </div>
      ) : matchedSports.length === 0 && matchedEvents.length === 0 && matchedNews.length === 0 ? (
        <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-base font-semibold text-white">No results for "{query}"</p>
        </div>
      ) : (
        <div className="space-y-10">
          {matchedSports.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-white mb-4">Sports</h2>
              <div className="flex flex-wrap gap-3">
                {matchedSports.map((s) => (
                  <Link
                    key={s.id}
                    to={`/sports?sport=${s.id}`}
                    className="px-4 py-2.5 rounded-xl bg-[#151E2B] border border-white/10 text-sm font-semibold text-white hover:border-[#00B7FF]"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {matchedEvents.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-white mb-4">Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedEvents.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          )}

          {matchedNews.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-white mb-4">News</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedNews.map((n) => (
                  <NewsCard key={n.id} article={n} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
