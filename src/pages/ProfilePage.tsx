import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogOut, Check, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { EventCard } from '../components/EventCard';
import { VpnRegion } from '../types';

const VPN_REGION_OPTIONS: { value: VpnRegion; label: string }[] = [
  { value: 'auto', label: 'Auto Cloud Relay (Fastest)' },
  { value: 'sg', label: 'Singapore (SG) — Asia Low Latency' },
  { value: 'uk', label: 'United Kingdom (UK) — Cricket & EPL' },
  { value: 'eu', label: 'Europe (DE) — Continental Sports' },
  { value: 'us', label: 'United States (US) — NBA & ATP' },
];

export const ProfilePage: React.FC = () => {
  const { user, profile, loading, logout } = useAuth();
  const {
    sports,
    teams,
    events,
    vpnMode,
    vpnRegion,
    updateVpnSettings,
    toggleFavoriteSport,
    toggleFavoriteTeam,
    updateNotificationPreferences,
    updateDisplayName,
  } = useData();

  const [nameInput, setNameInput] = useState(profile?.displayName || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [vpnSavedNotice, setVpnSavedNotice] = useState(false);

  if (loading) {
    return <div className="h-64 rounded-2xl bg-[#151E2B] animate-pulse" />;
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  const savedEventObjects = events.filter((e) => profile.savedEvents.includes(e.id));

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    await updateDisplayName(nameInput.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleToggleVpnMode = async () => {
    await updateVpnSettings(!vpnMode, vpnRegion);
    setVpnSavedNotice(true);
    setTimeout(() => setVpnSavedNotice(false), 2500);
  };

  const handleChangeVpnRegion = async (nextRegion: VpnRegion) => {
    await updateVpnSettings(vpnMode, nextRegion);
    setVpnSavedNotice(true);
    setTimeout(() => setVpnSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            {profile.displayName}
          </h1>
          <p className="text-xs text-[#A5B1C2] mt-1">{profile.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#101722] border border-white/10 text-xs font-semibold text-white hover:border-red-400/50 inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Account Settings */}
      <section className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-white">Account Settings</h2>
        <form onSubmit={handleNameSave} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Display name"
            className="flex-1 h-11 px-3 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
          />
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold hover:bg-[#33C5FF] transition-colors"
          >
            Save Name
          </button>
        </form>
        {savedNotice && (
          <p className="text-xs text-[#16D98A] inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Profile updated
          </p>
        )}
      </section>

      {/* Streaming Network & VPN Mode */}
      <section className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-xl border ${vpnMode ? 'bg-[#16D98A]/15 border-[#16D98A]/30 text-[#16D98A]' : 'bg-[#00B7FF]/10 border-[#00B7FF]/25 text-[#00B7FF]'}`}>
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Streaming Network &amp; VPN Mode</h2>
              <p className="text-xs text-[#A5B1C2]">
                Configure stream proxy routing, regional headers, and extended retry timeouts for reliable playback.
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
              vpnMode
                ? 'bg-[#16D98A]/15 text-[#16D98A] border-[#16D98A]/30'
                : 'bg-white/5 text-[#A5B1C2] border-white/10'
            }`}
          >
            {vpnMode ? `RELAY ACTIVE (${vpnRegion.toUpperCase()})` : 'DIRECT STREAMING'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#101722] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">VPN Mode</p>
            <p className="text-xs text-[#A5B1C2]">
              Routes HLS manifests and video segments through the cloud relay with extended network timeouts (20s/25s) and automatic retries.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={vpnMode}
            aria-label="Toggle VPN Mode"
            onClick={handleToggleVpnMode}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B7FF]/60 ${
              vpnMode
                ? 'bg-[#16D98A] border-[#16D98A]'
                : 'bg-[#1A2434] border-white/15'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                vpnMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#101722] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-[#00B7FF] shrink-0" />
            <div>
              <label htmlFor="profile-vpn-region" className="text-sm font-semibold text-white block">
                VPN Relay Region
              </label>
              <p className="text-xs text-[#A5B1C2]">
                Select preferred relay edge node for streaming requests.
              </p>
            </div>
          </div>
          <select
            id="profile-vpn-region"
            value={vpnRegion}
            onChange={(e) => handleChangeVpnRegion(e.target.value as VpnRegion)}
            className="h-10 px-3 rounded-xl bg-[#151E2B] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-[#00B7FF] cursor-pointer"
          >
            {VPN_REGION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#101722] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {vpnSavedNotice && (
          <p className="text-xs text-[#16D98A] inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> VPN network settings updated
          </p>
        )}
      </section>

      {/* Favorite Sports */}
      <section className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-white">Favorite Sports</h2>
        <div className="flex flex-wrap gap-2.5">
          {sports.map((sport) => {
            const active = profile.favoriteSports.includes(sport.id);
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => toggleFavoriteSport(sport.id)}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#00B7FF] text-[#080B12]'
                    : 'bg-[#101722] text-[#A5B1C2] border border-white/10 hover:text-white'
                }`}
              >
                {sport.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Favorite Teams */}
      <section className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-white">Favorite Teams</h2>
        <div className="flex flex-wrap gap-2.5">
          {teams.map((team) => {
            const active = profile.favoriteTeams.includes(team.id);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => toggleFavoriteTeam(team.id)}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#16D98A] text-[#080B12]'
                    : 'bg-[#101722] text-[#A5B1C2] border border-white/10 hover:text-white'
                }`}
              >
                {team.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Notification Preferences</h2>
          <span className="text-xs text-[#00B7FF] font-medium">Desktop &amp; In-App</span>
        </div>

        {/* Browser Push Permission State & Action */}
        <div className="p-4 rounded-xl bg-[#101722] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Live Match Push Notifications</p>
            <p className="text-xs text-[#A5B1C2] mt-0.5">
              Receive desktop system popups when your favorite teams start playing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' ? (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await Notification.requestPermission();
                    if (res === 'granted') {
                      await updateNotificationPreferences({
                        ...profile.notificationPreferences,
                        browserNotifications: true,
                      });
                      new Notification('KhelaDekH Push Enabled 🔔', {
                        body: 'You will now receive alerts when your favorite teams start live!',
                        icon: '/src/assets/images/kheladekh_logo_1793952334814.jpg',
                      });
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold hover:bg-[#33C5FF] transition-colors whitespace-nowrap"
              >
                Enable Push Alerts
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16D98A]/10 text-[#16D98A] text-xs font-semibold">
                <Check className="w-3.5 h-3.5" /> Push Enabled
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {(
            [
              { key: 'eventReminders', label: 'Match kick-off reminders' },
              { key: 'newEvents', label: 'New tournament fixtures' },
              { key: 'newsAlerts', label: 'Breaking sports news' },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between p-3 rounded-xl bg-[#101722] border border-white/10 cursor-pointer"
            >
              <span className="text-sm text-white">{item.label}</span>
              <input
                type="checkbox"
                checked={profile.notificationPreferences[item.key]}
                onChange={(e) =>
                  updateNotificationPreferences({
                    ...profile.notificationPreferences,
                    [item.key]: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#00B7FF]"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Saved Events */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-white">Saved Events</h2>
        {savedEventObjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedEventObjects.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-sm text-[#A5B1C2]">
              You haven’t saved any events yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
