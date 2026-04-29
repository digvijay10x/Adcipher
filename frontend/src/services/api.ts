const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

export interface Competitor {
  id: string;
  brand: string;
  name: string;
  userId: string;
  ads: Ad[];
  createdAt: string;
  updatedAt: string;
}

export interface Ad {
  id: string;
  competitorId: string;
  platform: string;
  headline?: string;
  primaryText?: string;
  description?: string;
  ctaText?: string;
  source?: string;
  status: string;
}

export interface Analysis {
  id: string;
  userId: string;
  title?: string;
  researchData?: any;
  hooks?: any;
  saturatedAngles?: any;
  gaps?: any;
  counterStrategy?: any;
  generatedCopy?: any;
  createdAt: string;
  updatedAt: string;
}

export const competitorApi = {
  getAll: (userId: string) =>
    api.get<Competitor[]>(`/api/competitors/${userId}`),
  add: (data: { brand: string; name: string; userId: string }) =>
    api.post<Competitor>("/api/competitors", data),
  delete: (id: string) => api.delete(`/api/competitors/${id}`),
};

export const analysisApi = {
  getAll: (userId: string) => api.get<Analysis[]>(`/api/analysis/${userId}`),
  getOne: (id: string) => api.get<Analysis>(`/api/analysis/detail/${id}`),
  create: (data: any) => api.post<Analysis>("/api/analysis", data),
  delete: (id: string) => api.delete(`/api/analysis/${id}`),
};

export const userApi = {
  sync: (data: { id: string; email: string; name?: string }) =>
    api.post("/api/users/sync", data),
};
