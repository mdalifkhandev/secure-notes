const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  interests?: string[];
  createdAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InterestGroup {
  interest: string;
  count: number;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

export interface UserPostsLookupResult {
  _id: string;
  name: string;
  email: string;
  role: string;
  interests: string[];
  createdAt: string;
  posts: Post[];
}

export class ApiService {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  public static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public static clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  public static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem('auth_user');
    return str ? JSON.parse(str) : null;
  }

  public static setStoredUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const message = Array.isArray(errData.message)
        ? errData.message.join(', ')
        : errData.message || `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return res.json();
  }

  // --- Auth Endpoints ---
  public static async register(data: { name: string; email: string; password: string; interests?: string[] }) {
    return this.request<{ accessToken: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async login(data: { email: string; password: string }) {
    return this.request<{ accessToken: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async getProfile() {
    return this.request<User>('/api/auth/profile');
  }

  // --- Notes Endpoints ---
  public static async getNotes(page: number = 1, limit: number = 10, all: boolean = false) {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (all) query.append('all', 'true');
    return this.request<PaginatedResponse<Note>>(`/api/notes?${query.toString()}`);
  }

  public static async createNote(title: string, content: string) {
    return this.request<Note>('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  public static async updateNote(id: string, data: { title?: string; content?: string }) {
    return this.request<Note>(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static async deleteNote(id: string) {
    return this.request<{ message: string; id: string }>(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Users Endpoints (Admin) ---
  public static async getUsers(page: number = 1, limit: number = 10) {
    return this.request<PaginatedResponse<User>>(`/api/users?page=${page}&limit=${limit}`);
  }

  public static async createUser(data: Partial<User> & { password: string }) {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async updateUser(id: string, data: Partial<User> & { password?: string }) {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static async deleteUser(id: string) {
    return this.request<{ message: string; id: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Aggregations Endpoints ---
  public static async getGroupedByInterests() {
    return this.request<InterestGroup[]>('/api/aggregations/interests');
  }

  public static async getUserPostsLookup(userId: string) {
    return this.request<UserPostsLookupResult>(`/api/aggregations/user-posts/${userId}`);
  }

  // --- Posts Endpoints ---
  public static async getPosts(page: number = 1, limit: number = 10) {
    return this.request<PaginatedResponse<Post>>(`/api/posts?page=${page}&limit=${limit}`);
  }

  public static async createPost(title: string, content: string) {
    return this.request<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }
}
