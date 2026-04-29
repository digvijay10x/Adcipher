export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  id: string;
  domain: string;
  name?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  ads?: Ad[];
}

export interface Ad {
  id: string;
  competitorId: string;
  platform: "meta" | "google";
  headline?: string;
  primaryText?: string;
  description?: string;
  ctaText?: string;
  imageUrl?: string;
  videoUrl?: string;
  adUrl?: string;
  format?: "image" | "video" | "carousel";
  status: "active" | "paused";
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  userId: string;
  title?: string;
  hooks?: string[];
  saturatedAngles?: string[];
  gaps?: string[];
  counterStrategy?: object;
  generatedCopy?: object;
  createdAt: string;
  updatedAt: string;
}
