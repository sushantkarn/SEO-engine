export interface SourceFreshness {
  source: "gsc" | "ga4" | "gbp" | "serp" | "indexing";
  fetchedAt: string;
  expiresAt?: string;
  stale: boolean;
}

export interface SearchConsoleSnapshot {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  queries?: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  pages?: Array<{ url: string; clicks: number; impressions: number; ctr: number; position: number }>;
  freshness: SourceFreshness;
}

export interface AnalyticsSnapshot {
  sessions: number;
  users: number;
  pageViews: number;
  engagementSeconds?: number;
  conversions?: number;
  landingPages?: Array<{ url: string; sessions: number; users: number; conversions?: number }>;
  freshness: SourceFreshness;
}

export interface BusinessProfileSnapshot {
  views: number;
  searches: number;
  websiteClicks: number;
  calls: number;
  directionRequests: number;
  searchTerms?: Array<{ term: string; impressions: number }>;
  freshness: SourceFreshness;
}

export interface SerpSnapshot {
  keyword: string;
  position?: number;
  url?: string;
  country?: string;
  language?: string;
  device?: "desktop" | "mobile";
  checkedAt: string;
}

export interface IndexingSubmissionResult {
  url: string;
  provider: "indexnow" | "google-indexing";
  accepted: boolean;
  submittedAt: string;
  requestId?: string;
  error?: string;
}

export interface SeoProviderAdapters {
  searchConsole?: { getSnapshot(input: { siteUrl: string; startDate: string; endDate: string }): Promise<SearchConsoleSnapshot> };
  analytics?: { getSnapshot(input: { propertyId: string; startDate: string; endDate: string }): Promise<AnalyticsSnapshot> };
  businessProfile?: { getSnapshot(input: { locationId: string; startDate: string; endDate: string }): Promise<BusinessProfileSnapshot> };
  serp?: { check(input: { keyword: string; country?: string; language?: string; device?: "desktop" | "mobile" }): Promise<SerpSnapshot> };
  indexing?: { submit(input: { url: string }): Promise<IndexingSubmissionResult> };
}
