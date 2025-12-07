/**
 * User Profile Types
 */
export interface UserProfileData {
  authID: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  dob: string; // ISO 8601 date string
  username: string;
  role?: 'admin' | 'user';
}

export interface UserProfileRow extends UserProfileData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  avatarURL?: string | null;
  zipCode?: string | null;
  referalCode?: string | null;
  isBlocked?: boolean;
}

/**
 * Client Types
 */
export interface ClientData {
  $id: string;
  name?: string;
  title?: string;
  location?: [number, number]; // Point type: [longitude, latitude]
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  $createdAt?: string;
  $updatedAt?: string;
  [key: string]: any; // Allow for additional fields
}

export interface FetchClientsFilters {
  radiusMiles?: number;
  dateRange?: {
    start: string; // ISO datetime
    end: string; // ISO datetime
  };
  categoryIds?: string[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Event Types
 */
export interface EventRow {
  $id: string;
  name: string;
  date: string; // ISO datetime
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  city: string;
  address: string;
  state: string;
  zipCode: string;
  products: string;
  client?: any;
  checkInCode: string;
  checkInPoints: number;
  reviewPoints: number;
  eventInfo: string;
  discountImageURL?: string | null;
  isArchived?: boolean;
  isHidder?: boolean;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface EventsByLocationResponse {
  success: boolean;
  error?: string; // Present when success is false
  events?: Array<{
    $id: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    city: string;
    address: string;
    state: string;
    zipCode: string;
    products: string;
    discountImageURL?: string | null;
    distance: number; // in kilometers
    client: {
      $id: string;
      name: string;
      logoURL?: string;
      city: string;
      address: string;
      state: string;
      zip: string;
      location: [number, number]; // [longitude, latitude]
    } | null;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Category Types
 */
export interface CategoryData {
  $id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  $createdAt?: string;
  $updatedAt?: string;
  [key: string]: any; // Allow for additional fields
}

/**
 * User Statistics Types
 */
export interface UserStatistics {
  totalPoints: number;
  eventCheckIns: number;
  samplingReviews: number;
  badgeAchievements: number;
}

