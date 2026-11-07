import React from 'react';
import { Radio } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EventCard } from '../components/EventCard';
import { VideoPlayer } from '../components/VideoPlayer';

export const LiveEventsPage: React.FC = () => {
  const { events, autoSyncing, lastAutoSyncTime, syncLiveSportsFromGoogle } = useData();
  const liveEvents = events.filter((e) => e.published && e.status === 'LIVE');
  const featuredLive = liveEvents.find((e) => e.authorizedViewingUrl) || liveEvents[0];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-[#16D98A]" />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Live Events
            </h1>
            <p className="text-sm text-[#A5B1C2]">
              Real-time multi-sport matches automatically synced from worldwide live broadcasts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => syncLiveSportsFromGoogle(false)}
          disabled={autoSyncing}
          className="self-start sm:self-auto min-h-[40px] px-4 py-2 rounded-xl bg-[#151E2B] border border-white/10 text-xs font-semibold text-white hover:border-[#00B7FF] inline-flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <span className={`h-2 w-2 rounded-full bg-[#16D98A] ${autoSyncing ? 'animate-ping' : ''}`} />
          {autoSyncing ? 'Checking Live Feed...' : lastAutoSyncTime ? `Synced ${lastAutoSyncTime}` : 'Check Live Feed'}
        </button>
      </div>

      {featuredLive && (
        <div className="space-y-4">
          <VideoPlayer
            src={featuredLive.authorizedViewingUrl}
            poster={featuredLive.thumbnailUrl}
            title={featuredLive.title}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#151E2B] p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-xs font-mono font-semibold text-[#16D98A]">LIVE</span>
              <h2 className="font-display text-lg font-bold text-white">{featuredLive.title}</h2>
            </div>
            {featuredLive.scoreSummary && (
              <span className="font-mono text-base font-bold text-white tabular-nums">
                {featuredLive.scoreSummary}
              </span>
            )}
          </div>
        </div>
      )}

      {liveEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-10 text-center">
          <p className="text-base font-semibold text-white">
            No live events are currently broadcasting.
          </p>
          <p className="text-xs text-[#A5B1C2] mt-1">
            Check the Upcoming page for scheduled start times.
          </p>
        </div>
      )}
    </div>
  );
};
