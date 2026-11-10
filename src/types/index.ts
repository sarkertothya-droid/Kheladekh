export type EventStatus = 'LIVE' | 'UPCOMING' | 'FINISHED';

export interface Sport {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  featured?: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  sportId: string;
  country?: string;
  description?: string;
  logoUrl?: string;
}

export interface Competition {
  id: string;
  name: string;
  sportId: string;
  country?: string;
  season?: string;
}

export interface StreamServer {
  id: string;
  name: string;
  quality: string;
  url: string;
  badge?: string;
  description?: string;
}

export interface SportEvent {
  id: string;
  title: string;
  slug: string;
  sportId: string;
  competitionId: string;
  teamIds: string[];
  description: string;
  eventDate: string;
  eventTime: string;
  timezone: string;
  status: EventStatus;
  published: boolean;
  featured?: boolean;
  authorizedViewingUrl?: string;
  streamServers?: StreamServer[];
  thumbnailUrl?: string;
  scoreSummary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyAnalytics {
  date: string;
  visitors: number;
  matchViewers: number;
  mobileCount: number;
  desktopCount: number;
  avgWatchMinutes: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  categoryId: string;
  imageUrl?: string;
  authorId: string;
  status: 'PUBLISHED' | 'DRAFT';
  featured?: boolean;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface NotificationPreferences {
  eventReminders: boolean;
  newEvents: boolean;
  newsAlerts: boolean;
  browserNotifications?: boolean;
}

export interface InAppAlert {
  id: string;
  title: string;
  body: string;
  eventId?: string;
  slug?: string;
  teamNames?: string[];
  timestamp: number;
  read: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  favoriteSports: string[];
  favoriteTeams: string[];
  savedEvents: string[];
  notificationPreferences: NotificationPreferences;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
}

export interface PreRollAdConfig {
  enabled: boolean;
  durationSeconds: number; // default 12
  frequencyHours: number; // default 12
  title: string;
  description: string;
  badgeText: string;
  imageUrl?: string;
  targetUrl: string;
  ctaText: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  footerText: string;
  privacyPolicy: string;
  termsOfService: string;
  preRollAd?: PreRollAdConfig;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  createdAt: string;
}

export interface MatchChatMessage {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  teamSupport?: string;
  createdAt: string;
}

export interface ActiveSession {
  id: string;
  page: string;
  eventId?: string | null;
  eventTitle?: string | null;
  sportId?: string | null;
  device: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  lastPing: number;
  userId?: string | null;
  userName?: string;
}

export interface LiveTvChannel {
  channelNumber: number;
  id: string;
  name: string;
  channelId?: string;
  category: string;
  country?: string;
  logo?: string | null;
  streamUrl: string;
  quality?: string;
  isLive: boolean;
  featured?: boolean;
  language?: string;
}

export interface SupportChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'support' | 'bot';
  text: string;
  createdAt: string;
}

