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
  pointsAwarded?: number;
  message?: string;
  error?: string;
}

/**
 * Get active trivia questions that the user has not yet answered
 * @param userId - The user's profile document ID from user_profiles table
 */
export const getActiveTrivia = async (userId: string): Promise<TriviaQuestion[]> => {
  console.log('[trivia.getActiveTrivia] Fetching active trivia for userId:', userId);

  const functionId = APPWRITE_EVENTS_FUNCTION_ID || '';

  // #region agent log
  console.log('[DEBUG-H1-H2] trivia.ts:entry', JSON.stringify({userId,functionId,hasFunctionId:!!functionId}));
  // #endregion

  if (!functionId) {
    throw new Error('APPWRITE_EVENTS_FUNCTION_ID must be configured. Please check your .env file.');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  try {
    const requestBody = { userId };

    // #region agent log
    console.log('[DEBUG-H1] trivia.ts:beforeExec', JSON.stringify({functionId,requestBody,xpath:'/get-active-trivia'}));
    // #endregion

    console.log('[trivia.getActiveTrivia] Executing function:', functionId);

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

    // #region agent log
    console.log('[DEBUG-H1-H3] trivia.ts:afterExec', JSON.stringify({status:execution.status,statusCode:execution.responseStatusCode,responseBodyPreview:execution.responseBody?.substring(0,500)}));
    // #endregion

    console.log('[trivia.getActiveTrivia] Execution status:', execution.status);
    console.log('[trivia.getActiveTrivia] Response status code:', execution.responseStatusCode);

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
      // #region agent log
      console.log('[DEBUG-H3] trivia.ts:parsed', JSON.stringify({hasSuccess:'success' in result,success:result.success,hasTrivia:'trivia' in result,triviaCount:result.trivia?.length,resultKeys:Object.keys(result)}));
      // #endregion
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
    console.log('[trivia.getActiveTrivia] Trivia fetched successfully:', {
      count: trivia.length,
    });

    return trivia;
  } catch (error: any) {
    console.error('[trivia.getActiveTrivia] Error fetching trivia:', error);
    console.error('[trivia.getActiveTrivia] Error message:', error?.message);
    console.error('[trivia.getActiveTrivia] Error code:', error?.code);

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
  console.log('[trivia.submitTriviaAnswer] Submitting answer:', {
    userId,
    triviaId,
    answerIndex,
  });

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

    console.log('[trivia.submitTriviaAnswer] Executing function:', functionId);

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

    console.log('[trivia.submitTriviaAnswer] Execution status:', execution.status);
    console.log('[trivia.submitTriviaAnswer] Response status code:', execution.responseStatusCode);

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

    console.log('[trivia.submitTriviaAnswer] Answer submitted successfully:', {
      isCorrect: result.isCorrect,
      pointsAwarded: result.pointsAwarded,
    });

    return result;
  } catch (error: any) {
    console.error('[trivia.submitTriviaAnswer] Error submitting answer:', error);
    console.error('[trivia.submitTriviaAnswer] Error message:', error?.message);
    console.error('[trivia.submitTriviaAnswer] Error code:', error?.code);

    // Re-throw validation errors as-is
    if (error.message?.includes('must be') || error.message?.includes('is required')) {
      throw error;
    }

    throw new Error(error.message || 'Failed to submit trivia answer');
  }
};
