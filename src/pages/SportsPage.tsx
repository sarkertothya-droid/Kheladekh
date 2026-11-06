import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EventCard } from '../components/EventCard';
import { EventStatus } from '../types';

export const SportsPage: React.FC = () => {
  const { sports, events, competitions } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSport = searchParams.get('sport') || 'all';
  const [selectedSport, setSelectedSport] = useState<string>(initialSport);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | EventStatus>('ALL');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [query, setQuery] = useState<string>('');

  const countries = useMemo(() => {
    const set = new Set<string>();
    competitions.forEach((c) => {
      if (c.country) set.add(c.country);
    });
    return Array.from(set);
  }, [competitions]);

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
    if (sportId === 'all') {
      searchParams.delete('sport');
    } else {
      searchParams.set('sport', sportId);
    }
    setSearchParams(searchParams);
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => e.published)
      .filter((e) => (selectedSport === 'all' ? true : e.sportId === selectedSport))
      .filter((e) => (selectedStatus === 'ALL' ? true : e.status === selectedStatus))
      .filter((e) =>
        selectedCompetition === 'all' ? true : e.competitionId === selectedCompetition
      )
      .filter((e) => {
        if (selectedCountry === 'all') return true;
        const comp = competitions.find((c) => c.id === e.competitionId);
        return comp?.country === selectedCountry;
      })
      .filter((e) => (dateFilter ? e.eventDate === dateFilter : true))
      .filter((e) =>
        query.trim()
          ? e.title.toLowerCase().includes(query.toLowerCase()) ||
            e.description.toLowerCase().includes(query.toLowerCase())
          : true
      );
  }, [
    events,
    selectedSport,
    selectedStatus,
    selectedCompetition,
    selectedCountry,
    dateFilter,
    query,
    competitions,
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Browse Sports &amp; Fixtures
        </h1>
        <p className="text-sm text-[#A5B1C2] mt-1">
          Filter matches by discipline, competition, country, date, or status.
        </p>
      </div>

      {/* Sport Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => handleSportChange('all')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            selectedSport === 'all'
              ? 'bg-[#00B7FF] text-[#080B12]'
              : 'bg-[#151E2B] text-[#A5B1C2] hover:text-white'
          }`}
        >
          All Sports
        </button>
        {sports.map((sport) => (
          <button
            key={sport.id}
            type="button"
            onClick={() => handleSportChange(sport.id)}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              selectedSport === sport.id
                ? 'bg-[#00B7FF] text-[#080B12]'
                : 'bg-[#151E2B] text-[#A5B1C2] hover:text-white'
            }`}
          >
            {sport.name}
          </button>
        ))}
      </div>

      {/* Secondary Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#101722] p-4 rounded-2xl border border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A5B1C2] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search matches..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white placeholder-[#A5B1C2] focus:outline-none focus:border-[#00B7FF]"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | EventStatus)}
          aria-label="Filter by status"
          className="h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
        >
          <option value="ALL">All Statuses</option>
          <option value="LIVE">LIVE</option>
          <option value="UPCOMING">UPCOMING</option>
          <option value="FINISHED">FINISHED</option>
        </select>

        <select
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          aria-label="Filter by competition"
          className="h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
        >
          <option value="all">All Competitions</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          aria-label="Filter by country"
          className="h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
        >
          <option value="all">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          aria-label="Filter by date"
          className="h-11 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
        />
      </div>

      {/* Results */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-10 text-center">
          <p className="text-base font-semibold text-white">No matching events found</p>
          <p className="text-xs text-[#A5B1C2] mt-1">
            Try clearing your date or competition filters to see more fixtures.
          </p>
        </div>
      )}
    </div>
  );
};
