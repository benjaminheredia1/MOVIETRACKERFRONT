import type {
  Item,
  Lista,
  MediaResult,
  Filters,
  ChatMessage,
  MarkAsWatchedPayload,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

// ==========================================
// Generic fetch helper
// ==========================================
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Error ${res.status}`);
  }

  return res.json();
}

// ==========================================
// TMDB Search
// ==========================================
export async function searchMedia(query: string): Promise<MediaResult[]> {
  return request<MediaResult[]>(`/search?query=${encodeURIComponent(query)}`);
}

export async function getRecommendations(): Promise<MediaResult[]> {
  return request<MediaResult[]>("/recomendations");
}

// ==========================================
// Items (Watchlist)
// ==========================================
export async function getItems(filters?: Filters): Promise<Item[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.media_type) params.set("media_type", filters.media_type);
  if (filters?.order_by) params.set("order_by", filters.order_by);
  if (filters?.order_dir) params.set("order_dir", filters.order_dir);

  const qs = params.toString();
  return request<Item[]>(`/items${qs ? `?${qs}` : ""}`);
}

export async function getItemById(id: number): Promise<Item> {
  return request<Item>(`/items/${id}`);
}

export async function addItem(item: Partial<Item>): Promise<Item> {
  return request<Item>("/items", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function markAsWatched(
  id: number,
  payload: MarkAsWatchedPayload
): Promise<{ message: string }> {
  return request<{ message: string }>(`/items/${id}/watched`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteItem(
  id: number
): Promise<{ message: string }> {
  return request<{ message: string }>(`/items/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// Lists
// ==========================================
export async function getLists(): Promise<Lista[]> {
  return request<Lista[]>("/lists");
}

export async function getListById(id: number): Promise<Lista> {
  return request<Lista>(`/lists/${id}`);
}

export async function addList(
  list: Partial<Lista>
): Promise<{ message: string; id: number }> {
  return request<{ message: string; id: number }>("/lists", {
    method: "POST",
    body: JSON.stringify(list),
  });
}

export async function updateList(
  id: number,
  list: Partial<Lista>
): Promise<{ message: string }> {
  return request<{ message: string }>(`/lists/${id}`, {
    method: "PUT",
    body: JSON.stringify(list),
  });
}

export async function deleteList(
  id: number
): Promise<{ message: string }> {
  return request<{ message: string }>(`/lists/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// Chat
// ==========================================
export async function sendChatMessage(
  msg: ChatMessage
): Promise<{ reply: string }> {
  return request<{ reply: string }>("/chat", {
    method: "POST",
    body: JSON.stringify(msg),
  });
}
