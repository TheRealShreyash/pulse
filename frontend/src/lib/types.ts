export type PollStatus = "DRAFT" | "LIVE" | "ENDED" | "PUBLISHED";

export interface PollOption {
  id: string;
  text: string;
  displayOrder: number;
  count: number;
}

export interface Poll {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  status: PollStatus;
  isAnonymous: boolean;
  showLiveResults: boolean;
  expiresAt: string | null;
  createdAt: string;
  totalResponses?: number;
  slug: string | null;
}

export interface AuthBreakdown {
  authenticated: number;
  anonymous: number;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
  totalResponses: number;
  authBreakdown: AuthBreakdown;
}

export interface VelocityPoint {
  hour: string;
  count: number;
}

export interface AnalyticsPoll extends PollWithOptions {
  velocity: VelocityPoint[];
}
