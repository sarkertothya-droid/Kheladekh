import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Calendar, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { EventCard } from '../components/EventCard';

export const EventDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { events, sports, competitions, teams, toggleSavedEvent } = useData();
  const { user, profile } = useAuth();

  const event = events.find((e) => e.slug === slug || e.id === slug);

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
      <Link
        to="/sports"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#A5B1C2] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Fixtures
      </Link>

      {/* Official Viewing Player */}
      <VideoPlayer
        src={event.authorizedViewingUrl}
        poster={event.thumbnailUrl}
        title={event.title}
      />

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
