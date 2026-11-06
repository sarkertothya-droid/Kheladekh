import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { SportEvent } from '../types';
import { useData } from '../context/DataContext';

interface EventCardProps {
  event: SportEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { sports, competitions } = useData();
  const [imgError, setImgError] = useState(false);

  const sport = sports.find((s) => s.id === event.sportId);
  const competition = competitions.find((c) => c.id === event.competitionId);

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group block bg-[#151E2B] rounded-2xl overflow-hidden border border-white/10 hover:border-[#00B7FF]/50 transition-colors"
    >
      <div className="relative aspect-[16/10] bg-[#101722] overflow-hidden">
        {event.thumbnailUrl && !imgError ? (
          <img
            src={event.thumbnailUrl}
            alt={event.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#101722] to-[#151E2B]">
            <Trophy className="w-8 h-8 text-[#00B7FF]/70 mb-2" />
            <span className="text-xs font-medium text-[#A5B1C2] text-center line-clamp-1">
              {sport?.name || 'Sports Event'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151E2B] via-transparent to-transparent" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-[#A5B1C2] mb-2">
          <div className="flex items-center gap-2 truncate">
            <span className="text-white font-medium">{sport?.name || event.sportId}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{competition?.name || event.competitionId}</span>
          </div>
          <span
            className={`font-mono text-xs font-semibold shrink-0 ${
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

        <h3 className="font-display text-base font-bold text-white group-hover:text-[#00B7FF] transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="mt-3 flex items-center justify-between text-xs text-[#A5B1C2] font-mono tabular-nums">
          <span>
            {event.eventDate} · {event.eventTime}
          </span>
          {event.scoreSummary && (
            <span className="text-white font-semibold">{event.scoreSummary}</span>
          )}
        </div>
      </div>
    </Link>
  );
};
