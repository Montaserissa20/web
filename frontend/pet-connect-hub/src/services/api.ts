/**
 * API Service Layer
 *
 * This module provides abstracted API functions for the Animal Marketplace.
 *
 * CSRF Token Support:
 * The apiClient includes CSRF tokens from cookies set by the server.
 * Call initializeCSRF() on app startup to fetch the initial token.
 */

import { AxiosRequestHeaders } from 'axios';
import apiClient, { getImageUrl, fetchCSRFToken } from './httpClient';


import {
  User,
  UserProfile,
  Listing,
  Announcement,
  FAQItem,
  ListingFilters,
  SortOption,
  Species,
  Gender,
  ListingStatus,
  AvailabilityStatus,
  ApiResponse,
  PaginationInfo,
  DashboardStats,
  AdminStats,
  Report,
  UserRole,
  SiteStats,
  AdminUser,
  Notification,
} from '@/types';

import {
  mockUsers,
  mockListings,
  mockAnnouncements,
  mockFAQItems,
  mockReports,
  siteStats,
} from '@/data/mockData';

// CSRF Token helper - reads token from cookie set by server
const getCSRFToken = (): string | null => {
  // Try to get from cookie (set by server via Set-Cookie header)
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }

  // Fallback: try meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }

  return null;
};

/**
 * Initialize CSRF protection by fetching a token from the server.
 * This sets the XSRF-TOKEN cookie that will be included in subsequent requests.
 * Should be called once on app startup.
 */
export const initializeCSRF = async (): Promise<void> => {
  try {
    await fetchCSRFToken();
    console.log('CSRF protection initialized');
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
  }
};

// Attach CSRF + Auth token if available
apiClient.interceptors.request.use((config: any) => {
  const headers = (config.headers || {}) as AxiosRequestHeaders;

  const csrfToken = getCSRFToken();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  config.headers = headers;
  return config;
});

const isSpecies = (value: unknown): value is Species =>
  ['dogs', 'cats', 'birds', 'fish', 'rabbits', 'other'].includes(String(value));

const isGender = (value: unknown): value is Gender =>
  ['male', 'female', 'unknown'].includes(String(value));

const isListingStatus = (value: unknown): value is ListingStatus =>
  ['pending', 'approved', 'rejected'].includes(String(value));

const isAvailabilityStatus = (value: unknown): value is AvailabilityStatus =>
  ['available', 'reserved', 'sold', 'adopted'].includes(String(value));

const normalizeListing = (item: any): Listing => {
  const species = isSpecies(item?.species) ? (item.species as Species) : 'other';
  const gender = isGender(item?.gender) ? (item.gender as Gender) : 'unknown';
  const status = isListingStatus(item?.status)
    ? (item.status as ListingStatus)
    : 'pending';
  const availability = isAvailabilityStatus(item?.availability)
    ? (item.availability as AvailabilityStatus)
    : 'available';

  // Normalize images - convert relative paths to full URLs
  const rawImages =
    Array.isArray(item?.images) && item.images.length
      ? item.images
      : item?.coverImage
        ? [item.coverImage]
        : [];
  const images = rawImages.map((img: string) => getImageUrl(img));

  return {
    id: String(item?.id ?? ''),
    title: item?.title || 'Untitled',
    slug: item?.slug || String(item?.id ?? ''),
    description: item?.description || '',
    species,
    breed: item?.breed || '',
    age: Number(item?.age ?? 0),
    gender,
    price: Number(item?.price ?? 0),
    country: item?.country || '',
    city: item?.city || '',
    images,
    sellerId: String(item?.sellerId ?? item?.userId ?? item?.user_id ?? '0'),
    sellerName: item?.sellerName || item?.user?.name || 'Seller',
    sellerRating: Number(item?.sellerRating ?? 0),
    status,
    rejectionReason: item?.rejectionReason || item?.rejection_reason || null,
    availability,
    views: Number(item?.views ?? 0),
    favorites: Number(item?.favorites ?? 0),
    createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
    updatedAt:
      item?.updatedAt ||
      item?.updated_at ||
      item?.createdAt ||
      item?.created_at ||
      new Date().toISOString(),
  };
};

const normalizeListings = (items: any[] = []): Listing[] =>
  items.map((item) => normalizeListing(item));


// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ============ AUTH API ============

type AuthResponse = {
  user: User;
  token: string;
};

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { user, token } = res.data;

      // store token + user for later use
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));

      return { data: user, success: true, message: 'Login successful' };
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Invalid email or password';

      return {
        data: null as any,
        success: false,
        message,
      };
    }
  },

  async register(data: {
    email: string;
    password: string;
    displayName: string;
    country: string;
    city: string;
  }): Promise<ApiResponse<User>> {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/register', data);

      const { user, token } = res.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));

      return { data: user, success: true, message: 'Registration successful' };
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Registration failed';

      return {
        data: null as any,
        success: false,
        message,
      };
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    // later you can also call a backend endpoint if you want
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    await delay(200);
    return { data: null, success: true, message: 'Logged out successfully' };
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    // still mock for now
    await delay();
    return { data: null, success: true, message: 'Password reset email sent' };
  },
    async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    try {
      const res = await apiClient.patch<{
        success: boolean;
        message?: string;
      }>('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        return {
          data: null as any,
          success: true,
          message: res.data.message || 'Password changed successfully',
        };
      }

      return {
        data: null as any,
        success: false,
        message: res.data.message || 'Failed to change password',
      };
    } catch (error) {
      console.error('authApi.changePassword error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to change password',
      };
    }
  },
};

// ============ LISTINGS API ============

export const listingsApi = {
  // Public listings (approved only) with filters, sort & pagination
  async getAll(
    filters?: ListingFilters,
    sort: SortOption = 'newest',
    page: number = 1,
    limit: number = 12,
    options: { useAdminApi?: boolean } = {}
  ): Promise<ApiResponse<Listing[]>> {
    try {
      const endpoint = options.useAdminApi ? '/admin/animals' : '/animals';
      const res = await apiClient.get<{
        success: boolean;
        data: any[];
        message?: string;
      }>(endpoint);

      if (!res.data?.success || !res.data.data) {
        return {
          data: [],
          success: false,
          message: res.data?.message || 'Failed to load listings',
        };
      }

      const rawListings = Array.isArray(res.data.data) ? res.data.data : [];
      const mapped = normalizeListings(rawListings);
      let filtered = options.useAdminApi
        ? [...mapped]
        : mapped.filter((l) => l.status === 'approved');

      // ---------- filters (same logic as before) ----------
      if (filters) {
        if (filters.keyword) {
          const keyword = filters.keyword.toLowerCase();
          filtered = filtered.filter(l =>
            l.title.toLowerCase().includes(keyword) ||
            l.description.toLowerCase().includes(keyword) ||
            l.breed.toLowerCase().includes(keyword)
          );
        }
        if (filters.species?.length) {
          filtered = filtered.filter(l => filters.species!.includes(l.species));
        }
        if (filters.breed) {
          filtered = filtered.filter(l =>
            l.breed.toLowerCase().includes(filters.breed!.toLowerCase())
          );
        }
        if (filters.country) {
          filtered = filtered.filter(l => l.country === filters.country);
        }
        if (filters.city) {
          filtered = filtered.filter(l => l.city === filters.city);
        }
        if (filters.priceMin !== undefined) {
          filtered = filtered.filter(l => l.price >= filters.priceMin!);
        }
        if (filters.priceMax !== undefined) {
          filtered = filtered.filter(l => l.price <= filters.priceMax!);
        }
        if (filters.ageMin !== undefined) {
          filtered = filtered.filter(l => l.age >= filters.ageMin!);
        }
        if (filters.ageMax !== undefined) {
          filtered = filtered.filter(l => l.age <= filters.ageMax!);
        }
        if (filters.gender) {
          filtered = filtered.filter(l => l.gender === filters.gender);
        }
        if (filters.availability) {
          filtered = filtered.filter(l => l.availability === filters.availability);
        }
      }

      // ---------- sorting ----------
      switch (sort) {
        case 'newest':
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'oldest':
          filtered.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
      }

      // ---------- pagination ----------
      const total = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      const pagination: PaginationInfo = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      };

      return { data: paginated, success: true, pagination };
    } catch (error) {
      console.error('listingsApi.getAll error:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to load listings',
      };
    }
  },

  // Convenience: find by slug using the list we already fetched
   async getBySlug(slug: string): Promise<ApiResponse<Listing>> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: any;
        message?: string;
      }>(`/animals/slug/${slug}`);  // 🔹 using animals.routes

      if (res.data?.success && res.data.data) {
        return { data: normalizeListing(res.data.data), success: true };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Listing not found',
      };
    } catch (error) {
      console.error('listingsApi.getBySlug error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Listing not found',
      };
    }
  },

  // Record a view for a listing
  async recordView(id: string): Promise<void> {
    try {
      await apiClient.post(`/animals/${id}/view`);
    } catch (error) {
      // View recording is non-critical, just log and ignore
      console.warn('listingsApi.recordView error (ignored):', error);
    }
  },

  // Same idea, but by id
  async getById(id: string): Promise<ApiResponse<Listing>> {
    const adminRes = await listingsApi.getAll(undefined, 'newest', 1, 9999, {
      useAdminApi: true,
    });
    const res = adminRes.success
      ? adminRes
      : await listingsApi.getAll(undefined, 'newest', 1, 9999);

    if (!res.success) {
      return {
        data: null as any,
        success: false,
        message: res.message || 'Failed to load listings',
      };
    }
    const listing = res.data.find(l => l.id === id);
    if (listing) return { data: listing, success: true };
    return { data: null as any, success: false, message: 'Listing not found' };
  },

  // Logged-in user listings (uses /animals/me and ignores userId param)
  async getByUser(_userId: string): Promise<ApiResponse<Listing[]>> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: any[];
        message?: string;
      }>('/animals/me');

      if (res.data?.success && res.data.data) {
        const rawListings = Array.isArray(res.data.data) ? res.data.data : [];
        return { data: normalizeListings(rawListings), success: true };
      }

      return {
        data: [],
        success: false,
        message: res.data?.message || 'Failed to load your listings',
      };
    } catch (error) {
      console.error('listingsApi.getByUser error:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to load your listings',
      };
    }
  },

  // Latest = getAll sorted by newest and slice
  async getLatest(limit: number = 6): Promise<ApiResponse<Listing[]>> {
    const res = await listingsApi.getAll(undefined, 'newest', 1, limit);
    if (!res.success) {
      return {
        data: [],
        success: false,
        message: res.message || 'Failed to load latest listings',
      };
    }
    return { data: res.data, success: true };
  },

  // Admin: fetch pending listings (from /admin/animals and filter)
  async getPending(): Promise<ApiResponse<Listing[]>> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: any[];
        message?: string;
      }>('/admin/animals');

      if (res.data?.success && res.data.data) {
        const rawListings = Array.isArray(res.data.data) ? res.data.data : [];
        const normalized = normalizeListings(rawListings);
        const pending = normalized.filter(l => l.status === 'pending');
        return { data: pending, success: true };
      }

      return {
        data: [],
        success: false,
        message: res.data?.message || 'Failed to load pending listings',
      };
    } catch (error) {
      console.error('listingsApi.getPending error:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to load pending listings',
      };
    }
  },

  // User create listing -> POST /animals (backend sets status=pending)
  async create(data: Partial<Listing>): Promise<ApiResponse<Listing>> {
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        species: data.species,
        breed: data.breed,
        age: data.age,
        gender: data.gender,
        price: data.price,
        country: data.country,
        city: data.city,
      };

      const res = await apiClient.post<{
        success: boolean;
        data: any;
        message?: string;
      }>('/animals', payload);

      if (res.data?.success && res.data.data) {
        return {
          data: normalizeListing(res.data.data),
          success: true,
          message:
            res.data.message || 'Listing created and pending approval',
        };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Failed to create listing',
      };
    } catch (error) {
      console.error('listingsApi.create error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to create listing',
      };
    }
  },

  // (Optional) editing by owner – expects you to add PATCH /animals/:id in backend
  async update(id: string, data: Partial<Listing>): Promise<ApiResponse<Listing>> {
    try {
      const res = await apiClient.patch<{
        success: boolean;
        data: any;
        message?: string;
      }>(`/animals/${id}`, data);

      if (res.data?.success && res.data.data) {
        return {
          data: normalizeListing(res.data.data),
          success: true,
          message: res.data.message || 'Listing updated successfully',
        };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Failed to update listing',
      };
    } catch (error) {
      console.error('listingsApi.update error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to update listing',
      };
    }
  },

  // Delete listing (owner endpoint with admin fallback)
  async delete(id: string): Promise<ApiResponse<null>> {
    const formatResponse = (success: boolean, message?: string): ApiResponse<null> => ({
      data: null,
      success,
      message: message || (success ? 'Listing deleted successfully' : 'Failed to delete listing'),
    });

    try {
      const res = await apiClient.delete<{
        success: boolean;
        message?: string;
      }>(`/animals/${id}`);

      if (res.data?.success) {
        return formatResponse(true, res.data.message);
      }

      if (res.data) {
        return formatResponse(false, res.data.message);
      }
    } catch (error: any) {
      // If owner delete is forbidden, try admin endpoint (for admin dashboard flows)
      if (error?.response?.status === 403) {
        try {
          const res = await apiClient.delete<{
            success: boolean;
            message?: string;
          }>(`/admin/animals/${id}`);

          if (res.data?.success) {
            return formatResponse(true, res.data.message);
          }

          if (res.data) {
            return formatResponse(false, res.data.message);
          }
        } catch (adminError: any) {
          console.error('listingsApi.delete admin fallback error:', adminError);
          return formatResponse(false, adminError?.response?.data?.message);
        }
      }

      console.error('listingsApi.delete error:', error);
      return formatResponse(false, error?.response?.data?.message);
    }

    return formatResponse(false);
  },

  // Upload images for a listing
  async uploadImages(listingId: string, files: File[]): Promise<ApiResponse<string[]>> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await apiClient.post<{
        success: boolean;
        data: { images: string[] };
        message?: string;
      }>(`/animals/${listingId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success && res.data.data?.images) {
        return {
          data: res.data.data.images,
          success: true,
          message: res.data.message || 'Images uploaded successfully',
        };
      }

      return {
        data: [],
        success: false,
        message: res.data?.message || 'Failed to upload images',
      };
    } catch (error) {
      console.error('listingsApi.uploadImages error:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to upload images',
      };
    }
  },

  // Admin approve listing
  async approve(id: string): Promise<ApiResponse<Listing>> {
    try {
      const res = await apiClient.patch<{
        success: boolean;
        data: any;
        message?: string;
      }>(`/admin/animals/${id}/approve`, {});

      if (res.data?.success && res.data.data) {
        return {
          data: normalizeListing(res.data.data),
          success: true,
          message: res.data.message || 'Listing approved',
        };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Failed to approve listing',
      };
    } catch (error) {
      console.error('listingsApi.approve error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to approve listing',
      };
    }
  },

  // Admin reject listing
  async reject(id: string, reason: string): Promise<ApiResponse<Listing>> {
    try {
      const res = await apiClient.patch<{
        success: boolean;
        data: any;
        message?: string;
      }>(`/admin/animals/${id}/reject`, { reason });

      if (res.data?.success && res.data.data) {
        return {
          data: normalizeListing(res.data.data),
          success: true,
          message: res.data.message || 'Listing rejected',
        };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Failed to reject listing',
      };
    } catch (error) {
      console.error('listingsApi.reject error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to reject listing',
      };
    }
  },
};


// ============ USERS API ============

export const usersApi = {
  // 1) Get all users for the Admin Users page
  async getAll(): Promise<ApiResponse<User[]>> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: User[];
        message?: string;
      }>('/admin/users'); // 👈 must match your backend route

      if (res.data?.success && res.data.data) {
        return {
          data: res.data.data,
          success: true,
          message: res.data.message,
        };
      }

      // Backend responded but not in the expected format → fall back to mocks
      return {
        data: mockUsers,
        success: true,
        message: 'Using mock users (backend returned invalid data)',
      };
    } catch (error) {
      console.error('usersApi.getAll error, using mock:', error);
      // Network/server error → fall back to mocks
      return {
        data: mockUsers,
        success: true,
        message: 'Using mock users (backend unavailable)',
      };
    }
  },

  // 2) Get a single user (if you need it)
  async getById(id: number | string): Promise<ApiResponse<User>> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: User;
        message?: string;
      }>(`/admin/users/${id}`);

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true, message: res.data.message };
      }

      return {
        data: null as any,
        success: false,
        message: res.data.message || 'User not found',
      };
    } catch (error) {
      console.error('usersApi.getById error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to fetch user',
      };
    }
  },

  // Get public profile for any user
  async getPublicProfile(id: number | string): Promise<ApiResponse<UserProfile>> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: UserProfile;
        message?: string;
      }>(`/users/${id}/profile`);

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true, message: res.data.message };
      }

      return {
        data: null as any,
        success: false,
        message: res.data.message || 'User not found',
      };
    } catch (error) {
      console.error('usersApi.getPublicProfile error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to fetch profile',
      };
    }
  },

  // Rate a user
  async rateUser(userId: number | string, rating: number, review?: string): Promise<ApiResponse<{ rating: number; review?: string }>> {
    try {
      const res = await apiClient.post<{
        success: boolean;
        data: { rating: number; review?: string };
        message?: string;
      }>(`/users/${userId}/rate`, { rating, review });

      if (res.data?.success) {
        return { data: res.data.data, success: true, message: res.data.message };
      }

      return {
        data: null as any,
        success: false,
        message: res.data.message || 'Failed to submit rating',
      };
    } catch (error) {
      console.error('usersApi.rateUser error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to submit rating',
      };
    }
  },

  // Get my rating for a user
  async getMyRating(userId: number | string): Promise<ApiResponse<{ rating: number; review?: string } | null>> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: { rating: number; review?: string } | null;
        message?: string;
      }>(`/users/${userId}/rating/mine`);

      if (res.data?.success) {
        return { data: res.data.data, success: true, message: res.data.message };
      }

      return {
        data: null,
        success: false,
        message: res.data.message || 'Failed to fetch rating',
      };
    } catch (error) {
      console.error('usersApi.getMyRating error:', error);
      return {
        data: null,
        success: false,
        message: 'Failed to fetch rating',
      };
    }
  },

  // Delete my rating for a user
  async deleteMyRating(userId: number | string): Promise<ApiResponse<null>> {
    try {
      const res = await apiClient.delete<{
        success: boolean;
        message?: string;
      }>(`/users/${userId}/rating`);

      if (res.data?.success) {
        return { data: null, success: true, message: res.data.message };
      }

      return {
        data: null,
        success: false,
        message: res.data.message || 'Failed to delete rating',
      };
    } catch (error) {
      console.error('usersApi.deleteMyRating error:', error);
      return {
        data: null,
        success: false,
        message: 'Failed to delete rating',
      };
    }
  },

  // 3) Change role (Admin ↔ Moderator ↔ User)
  async updateRole(userId: number | string, role: UserRole): Promise<ApiResponse<User>> {
    try {
      const res = await apiClient.patch<{
        success: boolean;
        data: User;
        message?: string;
      }>(`/admin/users/${userId}/role`, { role }); // 👈 backend endpoint

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true, message: res.data.message };
      }

      return {
        data: null as any,
        success: false,
        message: res.data.message || 'Failed to update role',
      };
    } catch (error) {
      console.error('usersApi.updateRole error:', error);
      return {
        data: null as any,
        success: false,
        message: 'Failed to update role',
      };
    }
  },

  // 4) Ban / unban user
  // src/services/api.ts  – inside usersApi

async toggleBan(
  userId: number | string,
  isBanned: boolean
): Promise<ApiResponse<User>> {
  try {
    const res = await apiClient.patch<{
      success: boolean;
      data: User;
      message?: string;
    }>(`/admin/users/${userId}/ban`, {
      isBanned, // 👈 send desired state
    });

    if (res.data?.success && res.data.data) {
      return { data: res.data.data, success: true, message: res.data.message };
    }

    return {
      data: null as any,
      success: false,
      message: res.data.message || 'Failed to update ban status',
    };
  } catch (error) {
    console.error('usersApi.toggleBan error:', error);
    return {
      data: null as any,
      success: false,
      message: 'Failed to update ban status',
    };
  }
},


  // 5) Profile update (user editing their own profile, if you use it)
  async updateProfile(userId: number | string, data: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const res = await apiClient.patch<{
      success: boolean;
      data: User;
      message?: string;
    }>(`/users/${userId}`, data);

    if (res.data?.success && res.data.data) {
      return { data: res.data.data, success: true, message: res.data.message };
    }

    return {
      data: null as any,
      success: false,
      message: res.data.message || 'Failed to update profile',
    };
  } catch (error) {
    console.error('usersApi.updateProfile error:', error);
    return {
      data: null as any,
      success: false,
      message: 'Failed to update profile',
    };
    }
  },

};


// ============ ANNOUNCEMENTS API ============

export const announcementsApi = {
  async getAll(): Promise<ApiResponse<Announcement[]>> {
    try {
      const res = await apiClient.get<ApiResponse<Announcement[]>>('/announcements');
      return res.data;
    } catch (err) {
      console.error('Announcements getAll failed, using mock data', err);
      await delay();
      return { data: mockAnnouncements, success: true, message: 'Using mock announcements' };
    }
  },

  async getPublic(): Promise<ApiResponse<Announcement[]>> {
    try {
      const res = await apiClient.get<ApiResponse<Announcement[]>>('/announcements/public');
      return res.data;
    } catch (err) {
      console.error('Announcements getPublic failed, using mock data', err);
      await delay();
      const visible = mockAnnouncements.filter(a => a.isVisible);
      return { data: visible, success: true, message: 'Using mock announcements' };
    }
  },

  async getById(id: string): Promise<ApiResponse<Announcement>> {
    try {
      const res = await apiClient.get<ApiResponse<Announcement>>(`/announcements/${id}`);
      return res.data;
    } catch (err) {
      console.error('Announcement getById failed, using mock data', err);
      await delay();
      const announcement = mockAnnouncements.find(a => a.id === id) || (null as any);
      return announcement
        ? { data: announcement, success: true }
        : { data: null as any, success: false, message: 'Announcement not found' };
    }
  },

  async create(data: Partial<Announcement>): Promise<ApiResponse<Announcement>> {
    try {
      const res = await apiClient.post<ApiResponse<Announcement>>('/announcements', data);
      return res.data;
    } catch (err) {
      console.error('Announcement create failed', err);
      // still succeed in UI but only locally if you want – here we just return error
      return { data: null as any, success: false, message: 'Failed to create announcement' };
    }
  },

  async update(id: string, data: Partial<Announcement>): Promise<ApiResponse<Announcement>> {
    try {
      const res = await apiClient.put<ApiResponse<Announcement>>(`/announcements/${id}`, data);
      return res.data;
    } catch (err) {
      console.error('Announcement update failed', err);
      return { data: null as any, success: false, message: 'Failed to update announcement' };
    }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const res = await apiClient.delete<ApiResponse<null>>(`/announcements/${id}`);
      return res.data;
    } catch (err) {
      console.error('Announcement delete failed', err);
      return { data: null as any, success: false, message: 'Failed to delete announcement' };
    }
  },

  async uploadImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiClient.post<ApiResponse<{ imageUrl: string }>>(
        '/announcements/upload-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data;
    } catch (err) {
      console.error('Announcement image upload failed', err);
      return { data: null as any, success: false, message: 'Failed to upload image' };
    }
  },
};


// ============ FAQ API ============

export const faqApi = {
  async getAll(): Promise<ApiResponse<FAQItem[]>> {
    try {
      const res = await apiClient.get<ApiResponse<FAQItem[]>>('/faq');
      return res.data;
    } catch (err) {
      console.error('FAQ getAll failed, using mock data', err);
      await delay();
      return { data: mockFAQItems, success: true, message: 'Using mock FAQ items' };
    }
  },

  async getPublic(): Promise<ApiResponse<FAQItem[]>> {
    try {
      const res = await apiClient.get<ApiResponse<FAQItem[]>>('/faq/public');
      return res.data;
    } catch (err) {
      console.error('FAQ getPublic failed, using mock data', err);
      await delay();
      const visible = mockFAQItems.filter(f => f.isVisible).sort((a, b) => a.order - b.order);
      return { data: visible, success: true, message: 'Using mock FAQ items' };
    }
  },

  async getById(id: string): Promise<ApiResponse<FAQItem>> {
    try {
      const res = await apiClient.get<ApiResponse<FAQItem>>(`/faq/${id}`);
      return res.data;
    } catch (err) {
      console.error('FAQ getById failed, using mock data', err);
      await delay();
      const faq = mockFAQItems.find(f => f.id === id) || (null as any);
      return faq
        ? { data: faq, success: true }
        : { data: null as any, success: false, message: 'FAQ not found' };
    }
  },

  async create(data: Partial<FAQItem>): Promise<ApiResponse<FAQItem>> {
    try {
      const res = await apiClient.post<ApiResponse<FAQItem>>('/faq', data);
      return res.data;
    } catch (err) {
      console.error('FAQ create failed', err);
      return { data: null as any, success: false, message: 'Failed to create FAQ' };
    }
  },

  async update(id: string, data: Partial<FAQItem>): Promise<ApiResponse<FAQItem>> {
    try {
      const res = await apiClient.put<ApiResponse<FAQItem>>(`/faq/${id}`, data);
      return res.data;
    } catch (err) {
      console.error('FAQ update failed', err);
      return { data: null as any, success: false, message: 'Failed to update FAQ' };
    }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const res = await apiClient.delete<ApiResponse<null>>(`/faq/${id}`);
      return res.data;
    } catch (err) {
      console.error('FAQ delete failed', err);
      return { data: null as any, success: false, message: 'Failed to delete FAQ' };
    }
  },
};


// ============ REPORTS API ============

export const reportsApi = {
  // Create a new report
  async create(animalId: string, reason: string): Promise<ApiResponse<Report>> {
    try {
      const res = await apiClient.post<{ success: boolean; data: any; message?: string }>(
        '/reports',
        { animalId, reason }
      );

      if (res.data?.success && res.data.data) {
        return {
          data: res.data.data,
          success: true,
          message: res.data.message || 'Report submitted successfully',
        };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Failed to submit report',
      };
    } catch (error) {
      console.error('reportsApi.create error:', error);
      return { data: null as any, success: false, message: 'Failed to submit report' };
    }
  },

  async getAll(): Promise<ApiResponse<Report[]>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[]; message?: string }>('/reports');

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      return { data: [], success: false, message: res.data?.message || 'Failed to load reports' };
    } catch (error) {
      console.error('reportsApi.getAll error:', error);
      return { data: [], success: false, message: 'Failed to load reports' };
    }
  },

  async getPending(): Promise<ApiResponse<Report[]>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[]; message?: string }>('/reports');

      if (res.data?.success && res.data.data) {
        const pending = res.data.data.filter((r: any) => r.status === 'open');
        return { data: pending, success: true };
      }

      return { data: [], success: false, message: res.data?.message || 'Failed to load reports' };
    } catch (error) {
      console.error('reportsApi.getPending error:', error);
      return { data: [], success: false, message: 'Failed to load reports' };
    }
  },

  async resolve(id: string): Promise<ApiResponse<Report>> {
    try {
      const res = await apiClient.patch<{ success: boolean; data: any; message?: string }>(
        `/reports/${id}/status`,
        { status: 'closed' }
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true, message: 'Report resolved' };
      }

      return { data: null as any, success: false, message: res.data?.message || 'Failed to resolve report' };
    } catch (error) {
      console.error('reportsApi.resolve error:', error);
      return { data: null as any, success: false, message: 'Failed to resolve report' };
    }
  },

  async dismiss(id: string): Promise<ApiResponse<Report>> {
    try {
      const res = await apiClient.patch<{ success: boolean; data: any; message?: string }>(
        `/reports/${id}/status`,
        { status: 'closed' }
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true, message: 'Report dismissed' };
      }

      return { data: null as any, success: false, message: res.data?.message || 'Failed to dismiss report' };
    } catch (error) {
      console.error('reportsApi.dismiss error:', error);
      return { data: null as any, success: false, message: 'Failed to dismiss report' };
    }
  },
};

// ============ FAVORITES API ============

export const favoritesApi = {
  async getByUser(_userId: string): Promise<ApiResponse<Listing[]>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[]; message?: string }>(
        '/favorites'
      );

      if (res.data?.success && res.data.data) {
        const listings = res.data.data.map(normalizeListing);
        return { data: listings, success: true };
      }

      return { data: [], success: false, message: res.data?.message || 'Failed to get favorites' };
    } catch (error) {
      console.error('favoritesApi.getByUser error:', error);
      return { data: [], success: false, message: 'Failed to get favorites' };
    }
  },

  async getFavoriteIds(): Promise<ApiResponse<number[]>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: number[] }>('/favorites/ids');
      if (res.data?.success) {
        return { data: res.data.data || [], success: true };
      }
      return { data: [], success: false };
    } catch (error) {
      console.error('favoritesApi.getFavoriteIds error:', error);
      return { data: [], success: false };
    }
  },

  async add(_userId: string, listingId: string): Promise<ApiResponse<{ favorited: boolean }>> {
    try {
      const res = await apiClient.post<{ success: boolean; data: { favorited: boolean }; message?: string }>(
        `/favorites/${listingId}`
      );
      return { data: res.data?.data || { favorited: true }, success: res.data?.success || false, message: res.data?.message };
    } catch (error) {
      console.error('favoritesApi.add error:', error);
      return { data: { favorited: false }, success: false, message: 'Failed to add favorite' };
    }
  },

  async remove(_userId: string, listingId: string): Promise<ApiResponse<{ favorited: boolean }>> {
    try {
      const res = await apiClient.delete<{ success: boolean; data: { favorited: boolean }; message?: string }>(
        `/favorites/${listingId}`
      );
      return { data: res.data?.data || { favorited: false }, success: res.data?.success || false, message: res.data?.message };
    } catch (error) {
      console.error('favoritesApi.remove error:', error);
      return { data: { favorited: false }, success: false, message: 'Failed to remove favorite' };
    }
  },

  async toggle(listingId: string): Promise<ApiResponse<{ favorited: boolean }>> {
    try {
      const res = await apiClient.post<{ success: boolean; data: { favorited: boolean }; message?: string }>(
        `/favorites/${listingId}/toggle`
      );
      return { data: res.data?.data || { favorited: false }, success: res.data?.success || false, message: res.data?.message };
    } catch (error) {
      console.error('favoritesApi.toggle error:', error);
      return { data: { favorited: false }, success: false, message: 'Failed to toggle favorite' };
    }
  },

  async checkFavorite(listingId: string): Promise<ApiResponse<{ favorited: boolean }>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: { favorited: boolean } }>(
        `/favorites/check/${listingId}`
      );
      return { data: res.data?.data || { favorited: false }, success: res.data?.success || false };
    } catch (error) {
      console.error('favoritesApi.checkFavorite error:', error);
      return { data: { favorited: false }, success: false };
    }
  },
};

// ============ STATS API ============

export const statsApi = {
  // --- NEW IMPLEMENTATION (backend + fallback) ---
   async getSiteStats(): Promise<ApiResponse<SiteStats>> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: SiteStats;
        message?: string;
      }>('/stats/site-traffic'); // 👈 must match backend route

      if (res.data?.success && res.data.data) {
        return {
          data: res.data.data,
          success: true,
          message: res.data.message,
        };
      }

      return {
        data: siteStats,
        success: true,
        message: 'Using mock stats (backend returned invalid data)',
      };
    } catch (error) {
      console.error('getSiteStats error, using mock:', error);
      return {
        data: siteStats,
        success: true,
        message: 'Using mock stats (backend unavailable)',
      };
    }
  },

  // --- NEW helper: record a visit in DB (non-blocking) ---
  async trackVisit(): Promise<void> {
    try {
      await apiClient.post('/stats/visit', {
        path: window.location.pathname,
      });
    } catch (error) {
      // stats are not critical → just log and ignore
      console.warn('trackVisit failed (ignored):', error);
    }
  },

  // Get user dashboard stats (real backend)
  async getUserDashboardStats(
    _userId: string
  ): Promise<ApiResponse<DashboardStats>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: DashboardStats; message?: string }>(
        '/stats/dashboard'
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      // Fallback to mock
      return {
        data: { totalListings: 0, activeListings: 0, totalViews: 0, totalFavorites: 0 },
        success: true,
        message: 'Using default stats',
      };
    } catch (error) {
      console.error('getUserDashboardStats error:', error);
      return {
        data: { totalListings: 0, activeListings: 0, totalViews: 0, totalFavorites: 0 },
        success: false,
        message: 'Failed to fetch stats',
      };
    }
  },

  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: AdminStats; message?: string }>(
        '/stats/admin'
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      // Fallback to mock
      const stats: AdminStats = {
        totalUsers: mockUsers.length,
        totalListings: mockListings.length,
        pendingListings: mockListings.filter((l) => l.status === 'pending').length,
        totalCountries: new Set(mockListings.map((l) => l.country)).size,
        totalCities: new Set(mockListings.map((l) => l.city)).size,
        newUsersThisMonth: 0,
        newListingsThisMonth: 0,
      };
      return { data: stats, success: true };
    } catch (error) {
      console.error('getAdminStats error:', error);
      const stats: AdminStats = {
        totalUsers: 0,
        totalListings: 0,
        pendingListings: 0,
        totalCountries: 0,
        totalCities: 0,
        newUsersThisMonth: 0,
        newListingsThisMonth: 0,
      };
      return { data: stats, success: false, message: 'Failed to fetch admin stats' };
    }
  },
   async getHomeStats(): Promise<ApiResponse<{ totalListings: number; totalUsers: number; categoryCounts: Record<string, number> }>> {
    try {
      const res = await apiClient.get<
        ApiResponse<{ totalListings: number; totalUsers: number; categoryCounts: Record<string, number> }>
      >('/stats/home');
      return res.data;
    } catch (err) {
      console.error('stats getHomeStats failed', err);
      return {
        success: false,
        data: { totalListings: 0, totalUsers: 0, categoryCounts: {} },
        message: 'Failed to load stats',
      };
    }
  },
};

// ============ MESSAGES API ============
import type { ChatMessage, Conversation } from '@/types';

export const messagesApi = {
  // Start or get a conversation with another user
  async startConversation(otherUserId: string, animalId?: string): Promise<ApiResponse<Conversation>> {
    try {
      const res = await apiClient.post<{ success: boolean; data: any; message?: string }>(
        '/messages/conversations',
        { otherUserId, animalId }
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Failed to start conversation',
      };
    } catch (error) {
      console.error('messagesApi.startConversation error:', error);
      return { data: null as any, success: false, message: 'Failed to start conversation' };
    }
  },

  // Get all conversations for current user
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[]; message?: string }>(
        '/messages/conversations'
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      return { data: [], success: false, message: res.data?.message || 'Failed to load conversations' };
    } catch (error) {
      console.error('messagesApi.getConversations error:', error);
      return { data: [], success: false, message: 'Failed to load conversations' };
    }
  },

  // Get a conversation with messages
  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any; message?: string }>(
        `/messages/conversations/${id}`
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Conversation not found',
      };
    } catch (error) {
      console.error('messagesApi.getConversation error:', error);
      return { data: null as any, success: false, message: 'Failed to load conversation' };
    }
  },

  // Send a message
  async sendMessage(conversationId: string, content: string): Promise<ApiResponse<ChatMessage>> {
    try {
      const res = await apiClient.post<{ success: boolean; data: any; message?: string }>(
        `/messages/conversations/${conversationId}/messages`,
        { content }
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      return {
        data: null as any,
        success: false,
        message: res.data?.message || 'Failed to send message',
      };
    } catch (error) {
      console.error('messagesApi.sendMessage error:', error);
      return { data: null as any, success: false, message: 'Failed to send message' };
    }
  },

  // Get more messages (pagination)
  async getMessages(conversationId: string, limit = 50, beforeId?: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      if (beforeId) params.append('beforeId', beforeId);

      const res = await apiClient.get<{ success: boolean; data: any[]; message?: string }>(
        `/messages/conversations/${conversationId}/messages?${params.toString()}`
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      return { data: [], success: false, message: res.data?.message || 'Failed to load messages' };
    } catch (error) {
      console.error('messagesApi.getMessages error:', error);
      return { data: [], success: false, message: 'Failed to load messages' };
    }
  },

  // Get unread message count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      const res = await apiClient.get<{ success: boolean; data: { count: number }; message?: string }>(
        '/messages/unread'
      );

      if (res.data?.success && res.data.data) {
        return { data: res.data.data, success: true };
      }

      return { data: { count: 0 }, success: false, message: res.data?.message || 'Failed to get unread count' };
    } catch (error) {
      console.error('messagesApi.getUnreadCount error:', error);
      return { data: { count: 0 }, success: false, message: 'Failed to get unread count' };
    }
  },
};

// ============= NOTIFICATIONS API =============
export const notificationsApi = {
  // Get notifications for the current user
  async getNotifications(
    includeRead: boolean = false,
    limit: number = 20
  ): Promise<{ data: Notification[]; success: boolean; message?: string }> {
    try {
      const res = await apiClient.get<{ success: boolean; data: Notification[]; message?: string }>(
        `/notifications?includeRead=${includeRead}&limit=${limit}`
      );

      if (res.data?.success) {
        return { data: res.data.data || [], success: true };
      }

      return { data: [], success: false, message: res.data?.message || 'Failed to get notifications' };
    } catch (error) {
      console.error('notificationsApi.getNotifications error:', error);
      return { data: [], success: false, message: 'Failed to get notifications' };
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<{ data: { count: number }; success: boolean }> {
    try {
      const res = await apiClient.get<{ success: boolean; data: { count: number } }>(
        '/notifications/unread-count'
      );

      if (res.data?.success) {
        return { data: res.data.data, success: true };
      }

      return { data: { count: 0 }, success: false };
    } catch (error) {
      console.error('notificationsApi.getUnreadCount error:', error);
      return { data: { count: 0 }, success: false };
    }
  },

  // Mark notification as read
  async markAsRead(id: number): Promise<{ success: boolean }> {
    try {
      const res = await apiClient.post<{ success: boolean }>(`/notifications/${id}/read`);
      return { success: res.data?.success || false };
    } catch (error) {
      console.error('notificationsApi.markAsRead error:', error);
      return { success: false };
    }
  },

  // Mark all as read
  async markAllAsRead(): Promise<{ success: boolean; count?: number }> {
    try {
      const res = await apiClient.post<{ success: boolean; data: { count: number } }>(
        '/notifications/mark-all-read'
      );
      return { success: res.data?.success || false, count: res.data?.data?.count };
    } catch (error) {
      console.error('notificationsApi.markAllAsRead error:', error);
      return { success: false };
    }
  },

  // Delete notification
  async delete(id: number): Promise<{ success: boolean }> {
    try {
      const res = await apiClient.delete<{ success: boolean }>(`/notifications/${id}`);
      return { success: res.data?.success || false };
    } catch (error) {
      console.error('notificationsApi.delete error:', error);
      return { success: false };
    }
  },
};
