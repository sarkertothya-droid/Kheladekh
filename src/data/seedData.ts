import {
  Category,
  Competition,
  NewsArticle,
  SiteSettings,
  Sport,
  SportEvent,
  Team,
} from '../types';

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
    description: 'Bangladesh National Cricket Team.',
  },
  {
    id: 'west-indies',
    name: 'West Indies',
    shortName: 'WI',
    sportId: 'cricket',
    country: 'West Indies',
    description: 'West Indies Cricket Team.',
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    shortName: 'AFG',
    sportId: 'cricket',
    country: 'Afghanistan',
    description: 'Afghanistan National Cricket Team.',
  },
  {
    id: 'zimbabwe',
    name: 'Zimbabwe',
    shortName: 'ZIM',
    sportId: 'cricket',
    country: 'Zimbabwe',
    description: 'Zimbabwe National Cricket Team.',
  },
];

export const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'wi-tour-ban-2026',
    name: 'West Indies Tour of Bangladesh',
    sportId: 'cricket',
    country: 'Bangladesh',
    season: '2026',
  },
  {
    id: 'zim-tour-afg-2026',
    name: 'Zimbabwe Tour of Afghanistan',
    sportId: 'cricket',
    country: 'UAE',
    season: '2026',
  },
  {
    id: 'uefa-europa-league',
    name: 'UEFA Europa League',
    sportId: 'football',
    country: 'Europe',
    season: '2026/27',
  },
  {
    id: 'afc-champions-league-two',
    name: 'AFC Champions League Two',
    sportId: 'football',
    country: 'Asia',
    season: '2026/27',
  },
];

export const INITIAL_EVENTS: SportEvent[] = [
  {
    id: 'ban-vs-wi-2nd-test',
    title: 'Bangladesh vs West Indies — 2nd Test (Day 2)',
    slug: 'ban-vs-wi-2nd-test',
    sportId: 'cricket',
    competitionId: 'wi-tour-ban-2026',
    teamIds: ['bangladesh', 'west-indies'],
    description:
      'Day 2 of the 2nd Test match between Bangladesh and West Indies at Sylhet International Cricket Stadium.',
    eventDate: '2026-11-05',
    eventTime: '09:30',
    timezone: 'UTC+6',
    status: 'LIVE',
    published: true,
    featured: true,
    authorizedViewingUrl: 'https://live-par-2-abr.livepush.io/live/bigbuckbunnyclip/index.m3u8',
    thumbnailUrl: CRICKET_IMAGE,
    scoreSummary: 'Sylhet · Day 2',
    createdAt: '2026-11-05T03:30:00Z',
    updatedAt: '2026-11-05T03:30:00Z',
  },
  {
    id: 'afg-vs-zim-test',
    title: 'Afghanistan vs Zimbabwe — Test Match (Day 1)',
    slug: 'afg-vs-zim-test',
    sportId: 'cricket',
    competitionId: 'zim-tour-afg-2026',
    teamIds: ['afghanistan', 'zimbabwe'],
    description:
      'Day 1 of the Test match between Afghanistan and Zimbabwe at Sharjah Cricket Stadium.',
    eventDate: '2026-11-05',
    eventTime: '10:00',
    timezone: 'UTC+4',
    status: 'LIVE',
    published: true,
    featured: true,
    authorizedViewingUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    thumbnailUrl: CRICKET_IMAGE,
    scoreSummary: 'Sharjah · Day 1',
    createdAt: '2026-11-05T06:00:00Z',
    updatedAt: '2026-11-05T06:00:00Z',
  },
  {
    id: 'uefa-europa-league-md4',
    title: 'UEFA Europa League — League Phase Matchday 4',
    slug: 'uefa-europa-league-md4',
    sportId: 'football',
    competitionId: 'uefa-europa-league',
    teamIds: [],
    description:
      'European club football action across the UEFA Europa League league phase.',
    eventDate: '2026-11-05',
    eventTime: '20:00',
    timezone: 'UTC+1',
    status: 'LIVE',
    published: true,
    featured: true,
    authorizedViewingUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnailUrl: FOOTBALL_IMAGE,
    scoreSummary: 'Matchday 4',
    createdAt: '2026-11-05T19:00:00Z',
    updatedAt: '2026-11-05T19:00:00Z',
  },
  {
    id: 'afc-champions-league-two-gs',
    title: 'AFC Champions League Two — Group Stage',
    slug: 'afc-champions-league-two-gs',
    sportId: 'football',
    competitionId: 'afc-champions-league-two',
    teamIds: [],
    description:
      'Continental club football fixtures in the AFC Champions League Two group stage.',
    eventDate: '2026-11-05',
    eventTime: '18:00',
    timezone: 'UTC+8',
    status: 'UPCOMING',
    published: true,
    featured: false,
    authorizedViewingUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnailUrl: FOOTBALL_IMAGE,
    createdAt: '2026-11-05T10:00:00Z',
    updatedAt: '2026-11-05T10:00:00Z',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'match-reports', name: 'Match Reports', slug: 'match-reports' },
  { id: 'tactical-analysis', name: 'Tactical Analysis', slug: 'tactical-analysis' },
  { id: 'tournaments', name: 'Tournaments', slug: 'tournaments' },
  { id: 'announcements', name: 'Announcements', slug: 'announcements' },
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'premier-cup-quarterfinals-preview',
    title: 'Premier Champions Cup Quarter-Finals: Tactical Breakdown',
    slug: 'premier-cup-quarterfinals-preview',
    description:
      'How high-pressing midfields and compact back fours are shaping the knockout rounds of this year’s Premier Champions Cup.',
    content:
      'The knockout stage of the Premier Champions Cup has delivered high-tempo football across every venue. Coaches have favored aggressive counter-pressing in the middle third, forcing turnovers high up the pitch.\n\nDhaka Dynamos FC and Chattogram Kings headline tonight’s fixture list, with both clubs relying on pacey wingers to stretch opposing full-backs.',
    categoryId: 'tactical-analysis',
    imageUrl: FOOTBALL_IMAGE,
    authorId: 'editorial-desk',
    status: 'PUBLISHED',
    featured: true,
    publishedAt: '2026-11-05T11:30:00Z',
    createdAt: '2026-11-05T11:30:00Z',
    updatedAt: '2026-11-05T11:30:00Z',
  },
  {
    id: 't20-series-pace-bowling-impact',
    title: 'Pace Bowlers Set the Tone in T20 International Series',
    slug: 't20-series-pace-bowling-impact',
    description:
      'Hard lengths and variations into the pitch have kept batters in check during the powerplay overs.',
    content:
      'Across the opening two fixtures of the T20 International Series, fast bowlers have accounted for over 65% of powerplay wickets. Disciplined yorkers at the death have further restricted late-innings acceleration.',
    categoryId: 'match-reports',
    imageUrl: CRICKET_IMAGE,
    authorId: 'editorial-desk',
    status: 'PUBLISHED',
    featured: true,
    publishedAt: '2026-11-05T09:15:00Z',
    createdAt: '2026-11-05T09:15:00Z',
    updatedAt: '2026-11-05T09:15:00Z',
  },
  {
    id: 'hardcourt-masters-schedule-update',
    title: 'Hardcourt Masters 1000 Announces Weekend Order of Play',
    slug: 'hardcourt-masters-schedule-update',
    description:
      'Evening session semifinals begin Saturday at 18:00 local time on Centre Court.',
    content:
      'Tournament organizers have confirmed the weekend schedule for the Hardcourt Masters 1000. Fans can follow live match updates and official broadcast links directly on KhelaDekH.',
    categoryId: 'tournaments',
    imageUrl: TENNIS_IMAGE,
    authorId: 'editorial-desk',
    status: 'PUBLISHED',
    featured: false,
    publishedAt: '2026-11-04T16:00:00Z',
    createdAt: '2026-11-04T16:00:00Z',
    updatedAt: '2026-11-04T16:00:00Z',
  },
];

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'KhelaDekH',
  tagline: 'Live Sports, Fixtures, News & Official Broadcasts',
  contactEmail: 'support@kheladekh.example.com',
  footerText: '© 2026 KhelaDekH. All rights reserved.',
  privacyPolicy:
    'KhelaDekH respects your privacy. We collect only the account information you provide (such as your name, email address, and saved sports preferences) to personalize your experience. This sample policy must be reviewed by legal counsel before public launch.',
  termsOfService:
    'By accessing KhelaDekH, you agree to use the platform solely for lawful, personal, and non-commercial sports viewing and information. All official broadcast links belong to their respective rights holders. These sample terms must be reviewed by legal counsel before public launch.',
  preRollAd: {
    enabled: true,
    durationSeconds: 12,
    frequencyHours: 12,
    title: 'KhelaDekH অফিসিয়াল স্পোর্টস পার্টনার স্পনসর',
    description: 'এইচডি লাইভ ক্রিকেট, ফুটবল ম্যাচ ও মেগা স্পোর্টস ওয়েলকাম বোনাস! এখনই ভিজিট করে আপনার বিশেষ অফারটি লুফে নিন।',
    badgeText: 'স্পন্সর বিজ্ঞাপন (Sponsored)',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://uplcm.com/4/12214527',
    ctaText: 'অফারটি দেখুন (Claim Offer)',
  },
};
