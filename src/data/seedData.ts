import {
  Category,
  Competition,
  NewsArticle,
  SiteSettings,
  Sport,
  SportEvent,
  Team,
} from '../types';
import { CAPTAIN_PORTRAITS } from './captainsData';

export const HERO_IMAGE = '/src/assets/images/hero_stadium_night_1793946251936.jpg';
export const FOOTBALL_IMAGE = '/src/assets/images/sport_football_1793946251919.jpg';
export const CRICKET_IMAGE = '/src/assets/images/sport_cricket_1793946251930.jpg';
export const BASKETBALL_IMAGE = '/src/assets/images/sport_basketball_1793946252581.jpg';
export const TENNIS_IMAGE = '/src/assets/images/sport_tennis_1793946252731.jpg';

export const INITIAL_SPORTS: Sport[] = [
  {
    id: 'football',
    name: 'Football',
    slug: 'football',
    description: 'International club competitions, domestic leagues, and continental championships.',
    imageUrl: FOOTBALL_IMAGE,
    featured: true,
  },
  {
    id: 'cricket',
    name: 'Cricket',
    slug: 'cricket',
    description: 'Test series, One-Day Internationals, and premier T20 franchise leagues.',
    imageUrl: CRICKET_IMAGE,
    featured: true,
  },
  {
    id: 'basketball',
    name: 'Basketball',
    slug: 'basketball',
    description: 'Pro hardwood action, playoff series, and international FIBA tournaments.',
    imageUrl: BASKETBALL_IMAGE,
    featured: true,
  },
  {
    id: 'tennis',
    name: 'Tennis',
    slug: 'tennis',
    description: 'Grand Slam majors, ATP/WTA Tour masters, and Davis Cup ties.',
    imageUrl: TENNIS_IMAGE,
    featured: true,
  },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'bangladesh',
    name: 'Bangladesh',
    shortName: 'BAN',
    sportId: 'cricket',
    country: 'Bangladesh',
    captain: 'Najmul Hossain Shanto',
    captainPhotoUrl: CAPTAIN_PORTRAITS.cricketBan,
    description: 'Bangladesh National Cricket Team.',
  },
  {
    id: 'south-africa',
    name: 'South Africa',
    shortName: 'RSA',
    sportId: 'cricket',
    country: 'South Africa',
    captain: 'Temba Bavuma',
    captainPhotoUrl: CAPTAIN_PORTRAITS.cricketIntl,
    description: 'South Africa National Cricket Team.',
  },
  {
    id: 'india',
    name: 'India',
    shortName: 'IND',
    sportId: 'cricket',
    country: 'India',
    captain: 'Shubman Gill',
    captainPhotoUrl: CAPTAIN_PORTRAITS.cricketIntl,
    description: 'India National Cricket Team.',
  },
  {
    id: 'west-indies',
    name: 'West Indies',
    shortName: 'WI',
    sportId: 'cricket',
    country: 'West Indies',
    captain: 'Roston Chase',
    captainPhotoUrl: CAPTAIN_PORTRAITS.cricketIntl,
    description: 'West Indies Cricket Team.',
  },
];

export const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'international-cricket',
    name: 'International Cricket',
    sportId: 'cricket',
    country: 'Global',
    season: '2026',
  },
  {
    id: 'english-premier-league',
    name: 'English Premier League',
    sportId: 'football',
    country: 'England',
    season: '2026/27',
  },
  {
    id: 'nba-season',
    name: 'NBA Pro League',
    sportId: 'basketball',
    country: 'USA',
    season: '2026/27',
  },
  {
    id: 'atp-masters',
    name: 'ATP Tour',
    sportId: 'tennis',
    country: 'Global',
    season: '2026',
  },
];

// Live events are populated exclusively from real-time verified sports feeds (zero hardcoded fake scores)
export const INITIAL_EVENTS: SportEvent[] = [];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'match-reports', name: 'Match Reports', slug: 'match-reports' },
  { id: 'tactical-analysis', name: 'Tactical Analysis', slug: 'tactical-analysis' },
  { id: 'tournaments', name: 'Tournaments', slug: 'tournaments' },
  { id: 'announcements', name: 'Announcements', slug: 'announcements' },
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'real-time-sports-hub',
    title: 'KhelaDekH Real-Time Live Score & VPN Relay Broadcast Active',
    slug: 'real-time-sports-hub',
    description:
      'Live international cricket, football, NBA, and tennis fixtures sync every minute with built-in cloud VPN tunnel support.',
    content:
      'KhelaDekH automatically pulls verified live match scores, fixtures, and team captain updates directly from real-time sports networks, backed by built-in cloud VPN stream relay.',
    categoryId: 'announcements',
    imageUrl: FOOTBALL_IMAGE,
    authorId: 'editorial-desk',
    status: 'PUBLISHED',
    featured: true,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'KhelaDekH',
  ownerName: '',
  logoUrl: '/src/assets/images/kheladekh_logo_1793952334814.jpg',
  tagline: 'সরাসরি বিশ্ব ক্রীড়া সম্প্রচার, রিয়েল-টাইম লাইভ স্কোর ও ৫০০+ টিভি চ্যানেল',
  contactEmail: 'factsknown178@gmail.com',
  footerText: '© 2026 KhelaDekH Broadcast Network. All rights reserved.',
  privacyPolicy:
    'KhelaDekH respects your privacy. We collect only the account information you provide (such as your name, email address, and saved sports preferences) to personalize your experience.',
  termsOfService:
    'By accessing KhelaDekH, you agree to use the platform for personal sports viewing, live telemetry, and information.',
  adFreeMode: true,
  sourceAppConfig: {
    enabled: false,
    appName: '',
    sourceUrl: '',
    sourceType: 'website',
    autoSyncStreams: true,
    stripAds: true,
    importedCount: 0,
    adsBlockedCount: 0,
  },
  preRollAd: {
    enabled: false,
    durationSeconds: 0,
    frequencyHours: 0,
    title: '',
    description: '',
    badgeText: '',
    imageUrl: '',
    targetUrl: '',
    ctaText: '',
  },
};
