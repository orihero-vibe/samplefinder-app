// Re-export all types
export type {
  UserProfileData,
  UserProfileRow,
  ClientData,
  FetchClientsFilters,
  EventRow,
  EventsByLocationResponse,
  CategoryData,
  UserStatistics,
  CheckInData,
  CheckInRow,
  ReviewData,
  ReviewRow,
  TierData,
  TierRow,
} from './types';

// Re-export user functions
export {
  createUserProfile,
  updateUserProfile,
  getUserProfile,
} from './users';

// Re-export client functions
export {
  fetchClients,
  fetchClientsWithFilters,
} from './clients';

// Re-export event functions
export {
  fetchEventsByClient,
  fetchAllEvents,
  fetchAllUpcomingEvents,
  fetchEventById,
  fetchEventsByLocation,
} from './events';

// Re-export category functions
export {
  fetchCategories,
} from './categories';

// Re-export check-in functions
export {
  createCheckIn,
  getUserCheckIns,
  getUserCheckInForEvent,
  getUserCheckInsCount,
} from './checkIns';

// Re-export review functions
export {
  createReview,
  getUserReviews,
  getUserReviewForEvent,
  getUserReviewsCount,
  getEventReviews,
} from './reviews';

// Re-export statistics functions
export {
  getUserStatistics,
  calculateTierStatus,
} from './statistics';

// Re-export tier functions
export {
  fetchTiers,
  getUserCurrentTier,
  getUserNextTier,
} from './tiers';

// Re-export trivia functions
export {
  getActiveTrivia,
  submitTriviaAnswer,
} from './trivia';

// Re-export trivia types
export type {
  TriviaQuestion,
  SubmitAnswerResult,
  GetActiveTriviaResponse,
} from './trivia';

// Default export for backward compatibility
import { createUserProfile } from './users';
import { getUserProfile } from './users';
import { updateUserProfile } from './users';
import { fetchClients } from './clients';
import { fetchClientsWithFilters } from './clients';
import { fetchEventsByClient } from './events';
import { fetchAllEvents } from './events';
import { fetchAllUpcomingEvents } from './events';
import { fetchEventById } from './events';
import { fetchEventsByLocation } from './events';
import { fetchCategories } from './categories';
import { getUserStatistics } from './statistics';
import { calculateTierStatus } from './statistics';
import { fetchTiers, getUserCurrentTier, getUserNextTier } from './tiers';
import { getActiveTrivia, submitTriviaAnswer } from './trivia';

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  fetchClients,
  fetchClientsWithFilters,
  fetchEventsByClient,
  fetchAllEvents,
  fetchAllUpcomingEvents,
  fetchEventById,
  fetchEventsByLocation,
  fetchCategories,
  getUserStatistics,
  calculateTierStatus,
  fetchTiers,
  getUserCurrentTier,
  getUserNextTier,
  getActiveTrivia,
  submitTriviaAnswer,
};

