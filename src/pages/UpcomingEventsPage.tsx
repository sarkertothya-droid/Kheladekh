import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const UpcomingEventsPage: React.FC = () => {
  const { events, sports, competitions, toggleSavedEvent } = useData();
  const { user, profile } = useAuth();

  const upcoming = events.filter((e) => e.published && e.status === 'UPCOMING');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-[#00B7FF]" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Upcoming Fixtures
          </h1>
          <p className="text-sm text-[#A5B1C2]">
            Save matches to your profile to keep track of kick-off times.
          </p>
        </div>
      </div>

      {upcoming.length > 0 ? (
        <div className="space-y-4">
          {upcoming.map((event) => {
            const sport = sports.find((s) => s.id === event.sportId);
            const comp = competitions.find((c) => c.id === event.competitionId);
            const isSaved = profile?.savedEvents.includes(event.id) || false;

            return (
              <div
                key={event.id}
                className="bg-[#151E2B] rounded-2xl border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#A5B1C2]">
                    <span className="text-[#00B7FF] font-semibold">
                      {sport?.name || event.sportId}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{comp?.name || event.competitionId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {event.eventDate} at {event.eventTime} ({event.timezone})
                    </span>
                  </div>
                  <Link
                    to={`/events/${event.slug}`}
                    className="font-display text-lg font-bold text-white hover:text-[#00B7FF] transition-colors block"
                  >
                    {event.title}
                  </Link>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => toggleSavedEvent(event.id)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                        isSaved
                          ? 'bg-[#16D98A]/15 text-[#16D98A] border border-[#16D98A]/30'
                          : 'bg-[#101722] text-white border border-white/10 hover:border-[#00B7FF]'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <BellOff className="w-4 h-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Remind Me
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#101722] text-xs font-semibold text-[#A5B1C2] hover:text-white border border-white/10 inline-flex items-center"
                    >
                      Sign in to save
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-10 text-center">
          <p className="text-base font-semibold text-white">No upcoming fixtures scheduled.</p>
        </div>
      )}
    </div>
  );
};
