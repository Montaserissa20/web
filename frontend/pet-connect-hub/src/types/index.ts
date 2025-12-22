// User roles
export type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

// User interface
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  country: string;
  city: string;
  avatar?: string;
  rating: number;
  totalListings: number;
  createdAt: string;
  isBanned: boolean;
}

// Public user profile (for viewing other users)
export interface UserProfile {
  id: string;
  displayName: string;
  country: string;
  city: string;
  avatar?: string;
  createdAt: string;
  rating: number;
  ratingCount: number;
  listingsCount: number;
  ratings: UserRating[];
}

// User rating/review
export interface UserRating {
  id: number;
  rating: number;
  review?: string;
  createdAt: string;
  rater: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Species types
export type Species = 'dogs' | 'cats' | 'birds' | 'fish' | 'rabbits' | 'other';

// Listing status
export type ListingStatus = 'pending' | 'approved' | 'rejected';

// Listing availability
export type AvailabilityStatus = 'available' | 'reserved' | 'sold' | 'adopted';

// Gender
export type Gender = 'male' | 'female' | 'unknown';

// Listing interface
export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  species: Species;
  breed: string;
  age: number; // in months
  gender: Gender;
  price: number;
  country: string;
  city: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  status: ListingStatus;
  rejectionReason?: string | null;
  availability: AvailabilityStatus;
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
}

// Announcement interface
export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishDate: string;
  isVisible: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// FAQ Item interface
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Filter options
export interface ListingFilters {
  keyword?: string;
  species?: Species[];
  breed?: string;
  country?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender?: Gender;
  availability?: AvailabilityStatus;
}

// Sort options
export type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high';

// Pagination
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: PaginationInfo;
}

// Statistics
export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalFavorites: number;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  totalCountries: number;
  totalCities: number;
  newUsersThisMonth: number;
  newListingsThisMonth: number;
}
// User shape used on the Admin Users page
export interface AdminUser {
  id: number;        // Prisma Int => number in TS
  name: string;
  email: string;
  role: UserRole;
  isBanned: boolean; // maps to `is_banned` field in the DB
}

// types.ts (or wherever your shared types are)
export interface SiteStats {
  totalVisitors: number;
  onlineUsers: number;
}


// Report interface for moderators
export interface Report {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

// Category info
export interface Category {
  id: Species;
  name: string;
  icon: string;
  count: number;
  description: string;
}

// Country/City data
export interface Location {
  country: string;
  cities: string[];
}

// Chat/Messaging types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface ChatAnimal {
  id: string;
  title: string;
  slug: string;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  animalId?: string | null;
  otherUserId: string;
  otherUser?: ChatUser | null;
  animal?: ChatAnimal | null;
  messages: ChatMessage[];
  lastMessage?: ChatMessage | null;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export type NotificationType = 'message' | 'listing_approved' | 'listing_rejected' | 'announcement';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}
