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
  totalEvents?: number;
  totalReviews?: number;
  totalPoints?: number;
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
  radius?: number; // Check-in radius in meters
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
    distance: number; // in meters (from backend calculation)
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

/**
 * Check-In Types
 */
export interface CheckInData {
  userID: string; // authID of the user
  eventID: string;
  checkInCode: string;
  pointsEarned: number;
}

export interface CheckInRow extends CheckInData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

/**
 * Review Types
 */
export interface ReviewData {
  rating: number; // 0-5, required
  review?: string; // Optional review text
  liked?: string; // Enum field for liked status
  hasPurchased?: boolean; // Whether user purchased the product
  user: string; // User ID (relationship)
  event: string; // Event ID (relationship)
  pointsEarned?: number; // Points earned for this review
}

export interface ReviewRow extends ReviewData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

/**
 * Tier Types
 */
export interface TierData {
  name: string; // Tier name (e.g., "NewbieSampler", "SampleFan")
  requiredPoints: number; // Points required to achieve this tier
  order: number; // Order/rank of the tier (1 for first, 2 for second, etc.)
  description?: string | null; // Optional description of the tier
  imageURL?: string | null; // Optional image URL for tier badge
  benefits: string[]; // Array of benefit strings (enum in Appwrite)
}

export interface TierRow extends TierData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

