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

  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
};

// Competitor API
export const competitorApi = {
  getAll: (userId: string) =>
    api.get<Competitor[]>(`/api/competitors/${userId}`),
  add: (data: { domain: string; name?: string; userId: string }) =>
    api.post<Competitor>("/api/competitors", data),
  remove: (id: string) => api.delete(`/api/competitors/${id}`),
};

// Analysis API
export const analysisApi = {
  getAll: (userId: string) => api.get<Analysis[]>(`/api/analysis/${userId}`),
  create: (data: {
    userId: string;
    title?: string;
    hooks?: string[];
    saturatedAngles?: string[];
    gaps?: string[];
  }) => api.post<Analysis>("/api/analysis", data),
};

// Types
interface Competitor {
  id: string;
  domain: string;
  name?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Analysis {
  id: string;
  userId: string;
  title?: string;
  hooks?: string[];
  saturatedAngles?: string[];
  gaps?: string[];
  createdAt: string;
  updatedAt: string;
}
