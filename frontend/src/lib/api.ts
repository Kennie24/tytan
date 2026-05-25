/**
 * Tytan Takuba — API Client
 * Thin fetch wrapper around the Laravel backend.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Song {
  id: number;
  title: string;
  track_number: number | null;
  duration: number | null;
  duration_seconds?: number | null;
  duration_formatted: string | null;
  file_url: string | null;
  preview_url: string | null;
  is_featured: boolean;
}

export interface Album {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_art_url: string | null;
  price: string;
  release_date: string | null;
  release_year: string | null;
  genre: string | null;
  type: 'album' | 'ep' | 'single';
  songs?: Song[];
  songs_count?: number;
}

export interface Video {
  id: number;
  title: string;
  slug?: string;
  description: string | null;
  youtube_url: string | null;
  video_file?: string | null;
  thumbnail: string | null;
  thumbnail_url?: string | null;
  type: 'official' | 'lyric' | 'live' | 'bts' | 'visualizer';
  view_count: number;
  views?: number;
  duration: number | null;
  published_at: string | null;
  is_featured: boolean;
  is_published?: boolean;
}

export interface Event {
  id: number;
  title: string;
  venue: string;
  city: string;
  country: string;
  event_date: string;
  ticket_url: string | null;
  ticket_price: string | null;
  status: 'on-sale' | 'almost-sold' | 'sold-out' | 'coming-soon' | 'cancelled';
  description?: string | null;
  currency?: string;
  capacity?: number | null;
  is_published?: boolean;
}

export interface Merchandise {
  id: number;
  name: string;
  slug?: string;
  description: string | null;
  price: string;
  compare_price?: string | null;
  image: string | null;
  image_url?: string | null;
  category: 'clothing' | 'accessories' | 'vinyl' | 'prints' | 'bundle';
  sizes: string[] | null;
  stock: number;
  stock_quantity?: number;
  is_featured: boolean;
  is_published?: boolean;
  sales_count?: number;
}

export interface FanMembership {
  id: number;
  tier: 'free' | 'gold' | 'vip';
  price: string;
  perks: string[];
}

export interface Order {
  id: number;
  order_number: string;
  total_amount: string;
  status: string;
  payment_method: string | null;
  created_at: string;
}

export interface CartItem {
  type: 'album' | 'song' | 'merchandise';
  id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CartItem[];
  customer_name: string;
  customer_email: string;
  payment_method: 'flutterwave' | 'paypal' | 'mobile_money' | 'airtel' | 'card';
}

// ── Core fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Albums ───────────────────────────────────────────────────────────────────

export const albumsApi = {
  list: () => apiFetch<{ data: Album[] }>('/albums'),
  get: (slug: string) => apiFetch<{ data: Album }>(`/albums/${slug}`),
};

// ── Songs ────────────────────────────────────────────────────────────────────

export const songsApi = {
  list: (params?: { featured?: boolean; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.featured) qs.set('featured', '1');
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiFetch<{ data: Song[] }>(`/songs${query ? `?${query}` : ''}`);
  },
};

// ── Videos ───────────────────────────────────────────────────────────────────

export const videosApi = {
  list: () => apiFetch<{ data: Video[] }>('/videos'),
};

// ── Events ───────────────────────────────────────────────────────────────────

export const eventsApi = {
  list: () => apiFetch<{ data: Event[] }>('/events'),
};

// ── Merchandise ───────────────────────────────────────────────────────────────

export const merchandiseApi = {
  list: (params?: { category?: string }) => {
    const qs = params?.category ? `?category=${params.category}` : '';
    return apiFetch<{ data: Merchandise[] }>(`/merchandise${qs}`);
  },
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    apiFetch<{ data: Order; payment_url?: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getByToken: (token: string) =>
    apiFetch<{ data: Order }>(`/orders/${token}`),

  getMyOrders: (authToken: string) =>
    apiFetch<{ data: Order[] }>('/me/orders', {}, authToken),
};

// ── Downloads ────────────────────────────────────────────────────────────────

export const downloadsApi = {
  getLink: (token: string) =>
    apiFetch<{ url: string; filename: string; expires_at: string }>(
      `/downloads/${token}`,
    ),
};

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => apiFetch<{ token: string; user: { id: number; name: string; email: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; user: { id: number; name: string; email: string; is_admin: boolean } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  logout: (authToken: string) =>
    apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }, authToken),

  me: (authToken: string) =>
    apiFetch<{ data: { id: number; name: string; email: string; is_admin: boolean } }>(
      '/me',
      {},
      authToken,
    ),
};

// ── Fan Club ──────────────────────────────────────────────────────────────────

export const fanClubApi = {
  join: (authToken: string, tier: 'free' | 'gold' | 'vip') =>
    apiFetch<{ message: string; data: FanMembership }>(
      '/fan-club/join',
      { method: 'POST', body: JSON.stringify({ tier }) },
      authToken,
    ),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: (authToken: string) =>
    apiFetch<{ data: Record<string, number> }>('/admin/stats', {}, authToken),

  analytics: (authToken: string) =>
    apiFetch<{ data: { monthly_revenue: { month: string; revenue: number }[]; top_albums: { title: string; sales: number }[] } }>(
      '/admin/analytics',
      {},
      authToken,
    ),

  // Albums
  createAlbum: (authToken: string, data: FormData) =>
    fetch(`${BASE_URL}/api/admin/albums`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
      body: data,
      credentials: 'include',
    }).then((r) => r.json()),

  updateAlbum: (authToken: string, id: number, data: FormData) =>
    fetch(`${BASE_URL}/api/admin/albums/${id}`, {
      method: 'POST', // _method=PUT via FormData
      headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
      body: data,
      credentials: 'include',
    }).then((r) => r.json()),

  deleteAlbum: (authToken: string, id: number) =>
    apiFetch(`/admin/albums/${id}`, { method: 'DELETE' }, authToken),

  // Songs
  createSong: (authToken: string, data: FormData) =>
    fetch(`${BASE_URL}/api/admin/songs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
      body: data,
      credentials: 'include',
    }).then((r) => r.json()),

  deleteSong: (authToken: string, id: number) =>
    apiFetch(`/admin/songs/${id}`, { method: 'DELETE' }, authToken),

  // Videos
  createVideo: (authToken: string, data: Record<string, unknown>) =>
    apiFetch('/admin/videos', { method: 'POST', body: JSON.stringify(data) }, authToken),

  deleteVideo: (authToken: string, id: number) =>
    apiFetch(`/admin/videos/${id}`, { method: 'DELETE' }, authToken),

  // Events
  createEvent: (authToken: string, data: Record<string, unknown>) =>
    apiFetch('/admin/events', { method: 'POST', body: JSON.stringify(data) }, authToken),

  updateEvent: (authToken: string, id: number, data: Record<string, unknown>) =>
    apiFetch(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }, authToken),

  deleteEvent: (authToken: string, id: number) =>
    apiFetch(`/admin/events/${id}`, { method: 'DELETE' }, authToken),

  // Merchandise
  createMerchandise: (authToken: string, data: FormData) =>
    fetch(`${BASE_URL}/api/admin/merchandise`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
      body: data,
      credentials: 'include',
    }).then((r) => r.json()),

  deleteMerchandise: (authToken: string, id: number) =>
    apiFetch(`/admin/merchandise/${id}`, { method: 'DELETE' }, authToken),

  // Orders
  orders: (authToken: string, status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<{ data: Order[] }>(`/admin/orders${qs}`, {}, authToken);
  },

  updateOrderStatus: (authToken: string, id: number, status: string) =>
    apiFetch(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, authToken),

  // Fans
  fans: (authToken: string, search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiFetch<{ data: Array<{ id: number; name: string; email: string; tier: string; joined: string }> }>(
      `/admin/fans${qs}`,
      {},
      authToken,
    );
  },
};

// ── Local storage helpers ─────────────────────────────────────────────────────

export const authStorage = {
  getToken: () =>
    typeof window !== 'undefined' ? localStorage.getItem('tytan_auth_token') : null,

  setToken: (token: string) =>
    typeof window !== 'undefined' && localStorage.setItem('tytan_auth_token', token),

  clearToken: () =>
    typeof window !== 'undefined' && localStorage.removeItem('tytan_auth_token'),
};
