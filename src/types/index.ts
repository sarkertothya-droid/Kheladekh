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
  thumbnailUrl?: string;
  scoreSummary?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  footerText: string;
  privacyPolicy: string;
  termsOfService: string;
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
