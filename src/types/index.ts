// ==========================================
// Domain types matching the Go backend
// ==========================================

export interface MediaResult {
  adult: boolean;
  backdrop_path: string;
  id: number;
  original_name: string;
  name: string;
  overview: string;
  poster_path: string;
  media_type: string;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  first_air_date: string;
  softcore: boolean;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
}

export interface Item {
  id: number;
  tmdb_id: number;
  adult: boolean;
  backdrop_path: string;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  media_type: string;
  original_language: string;
  popularity: number;
  first_air_date: string;
  softcore: boolean;
  genre_ids: string;
  origin_country: string;
  vote_average: number;
  vote_count: number;
  list_id: number | null;
  status: string;
  comentary_user: string;
  calification_user: number | null;
  watched_at: string | null;
  added_at: string;
}

export interface Lista {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface ListaItem {
  id: number;
  list_id: number;
  item_id: number;
  added_at: string;
}

export interface Filters {
  status?: string;
  media_type?: string;
  order_by?: string;
  order_dir?: string;
}

export interface ChatMessage {
  id?: number;
  session_id: string;
  role: string;
  content: string;
  created_at?: string;
}

export interface MarkAsWatchedPayload {
  rating: number;
  commentary: string;
}
