import { ExecutionMethod } from 'react-native-appwrite';
import { functions } from './config';
import { APPWRITE_EVENTS_FUNCTION_ID } from '@env';

/**
 * Trivia Question from API
 * Note: correctOptionIndex is intentionally excluded for security
 */
export interface TriviaQuestion {
  $id: string;
  question: string;
  answers: string[];
  startDate: string;
  endDate: string;
  points: number;
  client?: {
    $id: string;
    name: string;
    logoURL?: string;
  } | null;
}

/**
 * Response from get-active-trivia endpoint
 */
export interface GetActiveTriviaResponse {
  success: boolean;
  trivia?: TriviaQuestion[];
  count?: number;
  error?: string;
}

/**
 * Result from submit-answer endpoint
 */
export interface SubmitAnswerResult {
  success: boolean;
  isCorrect?: boolean;
  correctAnswerIndex?: number;
  pointsAwarded?: number;
  message?: string;
  error?: string;
}

/**
 * Get active trivia questions that the user has not yet answered
 * @param userId - The user's profile document ID from user_profiles table
 */
export const getActiveTrivia = async (userId: string): Promise<TriviaQuestion[]> => {
  const functionId = APPWRITE_EVENTS_FUNCTION_ID || '';

  if (!functionId) {
    throw new Error('APPWRITE_EVENTS_FUNCTION_ID must be configured. Please check your .env file.');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  try {
    const requestBody = { userId };

    const execution = await functions.createExecution({
      functionId,
      body: JSON.stringify(requestBody),
      method: ExecutionMethod.POST,
      xpath: '/get-active-trivia',
      headers: {
        'Content-Type': 'application/json',
      },
      async: false,
    });

    // Check if execution was successful
    if (execution.status === 'failed') {
      let errorMessage = 'Function execution failed';
      if (execution.responseBody) {
        try {
          const errorResponse = JSON.parse(execution.responseBody);
          errorMessage = errorResponse.error || errorResponse.message || execution.responseBody;
        } catch {
          errorMessage = execution.responseBody;
        }
      }
      console.error('[trivia.getActiveTrivia] Function execution failed:', errorMessage);
      throw new Error(`Function execution failed: ${errorMessage}`);
    }

    // Parse the response body
    if (!execution.responseBody) {
      throw new Error('Function execution returned empty response body');
    }

    let result: GetActiveTriviaResponse;
    try {
      result = JSON.parse(execution.responseBody);
    } catch (parseError) {
      console.error('[trivia.getActiveTrivia] Failed to parse response body:', execution.responseBody);
      throw new Error('Invalid JSON response from function');
    }

    // Check HTTP status code
    if (execution.responseStatusCode && execution.responseStatusCode >= 400) {
      const errorMessage = result.error || execution.responseBody || `HTTP ${execution.responseStatusCode}`;
      console.error('[trivia.getActiveTrivia] Function returned error status:', {
        statusCode: execution.responseStatusCode,
        body: errorMessage,
      });
      throw new Error(`Function returned error: ${errorMessage}`);
    }

    // Validate response structure
    if (!result.success) {
      console.error('[trivia.getActiveTrivia] API returned error:', result);
      throw new Error(result.error || 'Failed to fetch trivia');
    }

    const trivia = result.trivia || [];
    return trivia;
  } catch (error: any) {
    console.error('[trivia.getActiveTrivia] Error fetching trivia:', error);

    // Re-throw validation errors as-is
    if (error.message?.includes('must be') || error.message?.includes('is required')) {
      throw error;
    }

    throw new Error(error.message || 'Failed to fetch active trivia');
  }
};

/**
 * Submit an answer for a trivia question
 * @param userId - The user's profile document ID
 * @param triviaId - The trivia document ID to answer
 * @param answerIndex - Zero-based index of the selected answer
 */
export const submitTriviaAnswer = async (
  userId: string,
  triviaId: string,
  answerIndex: number
): Promise<SubmitAnswerResult> => {
  const functionId = APPWRITE_EVENTS_FUNCTION_ID || '';

  if (!functionId) {
    throw new Error('APPWRITE_EVENTS_FUNCTION_ID must be configured. Please check your .env file.');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  if (!triviaId) {
    throw new Error('triviaId is required');
  }

  if (typeof answerIndex !== 'number' || answerIndex < 0) {
    throw new Error('answerIndex must be a non-negative number');
  }

  try {
    const requestBody = { userId, triviaId, answerIndex };

    const execution = await functions.createExecution({
      functionId,
      body: JSON.stringify(requestBody),
      method: ExecutionMethod.POST,
      xpath: '/submit-answer',
      headers: {
        'Content-Type': 'application/json',
      },
      async: false,
    });

    // Check if execution was successful
    if (execution.status === 'failed') {
      let errorMessage = 'Function execution failed';
      if (execution.responseBody) {
        try {
          const errorResponse = JSON.parse(execution.responseBody);
          errorMessage = errorResponse.error || errorResponse.message || execution.responseBody;
        } catch {
          errorMessage = execution.responseBody;
        }
      }
      console.error('[trivia.submitTriviaAnswer] Function execution failed:', errorMessage);
      throw new Error(`Function execution failed: ${errorMessage}`);
    }

    // Parse the response body
    if (!execution.responseBody) {
      throw new Error('Function execution returned empty response body');
    }

    let result: SubmitAnswerResult;
    try {
      result = JSON.parse(execution.responseBody);
    } catch (parseError) {
      console.error('[trivia.submitTriviaAnswer] Failed to parse response body:', execution.responseBody);
      throw new Error('Invalid JSON response from function');
    }

    // Check HTTP status code for errors
    if (execution.responseStatusCode && execution.responseStatusCode >= 400) {
      const errorMessage = result.error || execution.responseBody || `HTTP ${execution.responseStatusCode}`;
      console.error('[trivia.submitTriviaAnswer] Function returned error status:', {
        statusCode: execution.responseStatusCode,
        body: errorMessage,
      });
      // Return the result with error info rather than throwing, so UI can handle it
      return {
        success: false,
        error: errorMessage,
      };
    }

    return result;
  } catch (error: any) {
    console.error('[trivia.submitTriviaAnswer] Error submitting answer:', error);

    // Re-throw validation errors as-is
    if (error.message?.includes('must be') || error.message?.includes('is required')) {
      throw error;
    }

    throw new Error(error.message || 'Failed to submit trivia answer');
  }
};
