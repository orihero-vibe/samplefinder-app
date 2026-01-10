import { Query, ExecutionMethod } from 'react-native-appwrite';
import { tablesDB, functions, DATABASE_ID, EVENTS_TABLE_ID } from './config';
import { APPWRITE_EVENTS_FUNCTION_ID } from '@env';
import type { EventRow, EventsByLocationResponse } from './types';

/**
 * Fetch events by client ID
 */
export const fetchEventsByClient = async (clientId: string): Promise<EventRow[]> => {
  console.log('[database.fetchEventsByClient] Fetching events for client:', clientId);

  console.log('[database.fetchEventsByClient] DATABASE_ID:', DATABASE_ID);
  console.log('[database.fetchEventsByClient] EVENTS_TABLE_ID:', EVENTS_TABLE_ID);
  // Validate environment variables
  if (!DATABASE_ID || !EVENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Events Table ID not configured. Please check your .env file.';
    console.error('[database.fetchEventsByClient]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Fetch all events and filter in JavaScript
    // This avoids query syntax issues with relationship columns
    // TODO: Optimize with proper query syntax once relationship query format is confirmed
    // Use a high limit to ensure we get all events (Appwrite default is 25)
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: EVENTS_TABLE_ID,
      queries: [Query.limit(1000)], // Fetch up to 1000 events to ensure we get all
    });

    console.log('[database.fetchEventsByClient] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.fetchEventsByClient] No events found for client:', clientId);
      return [];
    }

    // Map the rows to EventRow format and filter by client ID and exclude archived/hidden events
    const events: EventRow[] = result.rows
      .filter((row: any) => {
        // Filter by client ID - check if client matches (could be a relationship object or string ID)
        const rowClientId = row.client?.$id || row.client || '';
        const clientMatches = rowClientId === clientId || String(rowClientId) === String(clientId);
        
        // Filter out archived and hidden events
        const isArchived = row.isArchived === true || row.isArchived === 'true';
        const isHidden = row.isHidder === true || row.isHidder === 'true';
        
        return clientMatches && !isArchived && !isHidden;
      })
      .map((row: any) => ({
        $id: row.$id,
        name: row.name || '',
        date: row.date || '',
        startTime: row.startTime || '',
        endTime: row.endTime || '',
        city: row.city || '',
        address: row.address || '',
        state: row.state || '',
        zipCode: row.zipCode || '',
        products: row.products || '',
        client: row.client,
        checkInCode: row.checkInCode || '',
        checkInPoints: row.checkInPoints || 0,
        reviewPoints: row.reviewPoints || 0,
        eventInfo: row.eventInfo || '',
        discountImageURL: row.discountImageURL || null,
        radius: row.radius || undefined,
        isArchived: row.isArchived || false,
        isHidder: row.isHidder || false,
        $createdAt: row.$createdAt,
        $updatedAt: row.$updatedAt,
      }));

    console.log('[database.fetchEventsByClient] Events fetched successfully:', events.length);
    return events;
  } catch (error: any) {
    console.error('[database.fetchEventsByClient] Error fetching events:', error);
    console.error('[database.fetchEventsByClient] Error message:', error?.message);
    console.error('[database.fetchEventsByClient] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch events');
  }
};

/**
 * Fetch all events (not filtered by date or client)
 * Returns events that are not archived and not hidden
 * Useful for calendar views where we want to show all events
 */
export const fetchAllEvents = async (): Promise<EventRow[]> => {
  console.log('[database.fetchAllEvents] Fetching all events');

  // Validate environment variables
  if (!DATABASE_ID || !EVENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Events Table ID not configured. Please check your .env file.';
    console.error('[database.fetchAllEvents]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Build queries to filter events (exclude archived and hidden)
    const queries: any[] = [
      Query.equal('isArchived', false),
      Query.equal('isHidden', false),
      Query.limit(1000), // Fetch up to 1000 events
    ];

    console.log('[database.fetchAllEvents] Querying events with filters:', {
      isArchived: false,
      isHidden: false,
    });

    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: EVENTS_TABLE_ID,
      queries,
      // Order by date ascending
      orders: [Query.orderAsc('date')],
    });

    console.log('[database.fetchAllEvents] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.fetchAllEvents] No events found');
      return [];
    }

    // Map the rows to EventRow format
    const events: EventRow[] = result.rows.map((row: any) => ({
      $id: row.$id,
      name: row.name || '',
      date: row.date || '',
      startTime: row.startTime || '',
      endTime: row.endTime || '',
      city: row.city || '',
      address: row.address || '',
      state: row.state || '',
      zipCode: row.zipCode || '',
      products: row.products || '',
      client: row.client,
      checkInCode: row.checkInCode || '',
      checkInPoints: row.checkInPoints || 0,
      reviewPoints: row.reviewPoints || 0,
      eventInfo: row.eventInfo || '',
      radius: row.radius || undefined,
      isArchived: row.isArchived || false,
      isHidder: row.isHidder || false,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
    }));

    console.log('[database.fetchAllEvents] Events fetched successfully:', events.length);
    return events;
  } catch (error: any) {
    console.error('[database.fetchAllEvents] Error fetching events:', error);
    console.error('[database.fetchAllEvents] Error message:', error?.message);
    console.error('[database.fetchAllEvents] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch events');
  }
};

/**
 * Fetch all upcoming events (not filtered by client)
 * Returns events that are not archived, not hidden, and have a date in the future
 */
export const fetchAllUpcomingEvents = async (): Promise<EventRow[]> => {
  console.log('[database.fetchAllUpcomingEvents] Fetching all upcoming events');

  // Validate environment variables
  if (!DATABASE_ID || !EVENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Events Table ID not configured. Please check your .env file.';
    console.error('[database.fetchAllUpcomingEvents]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Build queries to filter events
    const queries: any[] = [
      Query.equal('isArchived', false),
      Query.equal('isHidden', false),
      Query.greaterThanEqual('date', todayISO),
    ];

    console.log('[database.fetchAllUpcomingEvents] Querying events with filters:', {
      isArchived: false,
      isHidden: false,
      dateMin: todayISO,
    });

    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: EVENTS_TABLE_ID,
      queries,
      // Order by date ascending
      orders: [Query.orderAsc('date')],
    });

    console.log('[database.fetchAllUpcomingEvents] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.fetchAllUpcomingEvents] No upcoming events found');
      return [];
    }

    // Map the rows to EventRow format
    const events: EventRow[] = result.rows.map((row: any) => ({
      $id: row.$id,
      name: row.name || '',
      date: row.date || '',
      startTime: row.startTime || '',
      endTime: row.endTime || '',
      city: row.city || '',
      address: row.address || '',
      state: row.state || '',
      zipCode: row.zipCode || '',
      products: row.products || '',
      client: row.client,
      checkInCode: row.checkInCode || '',
      checkInPoints: row.checkInPoints || 0,
      reviewPoints: row.reviewPoints || 0,
      eventInfo: row.eventInfo || '',
      radius: row.radius || undefined,
      isArchived: row.isArchived || false,
      isHidder: row.isHidder || false,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
    }));

    console.log('[database.fetchAllUpcomingEvents] Events fetched successfully:', events.length);
    return events;
  } catch (error: any) {
    console.error('[database.fetchAllUpcomingEvents] Error fetching events:', error);
    console.error('[database.fetchAllUpcomingEvents] Error message:', error?.message);
    console.error('[database.fetchAllUpcomingEvents] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch upcoming events');
  }
};

/**
 * Fetch a single event by ID with client relationship
 */
export const fetchEventById = async (eventId: string): Promise<EventRow | null> => {
  console.log('[database.fetchEventById] Fetching event:', eventId);

  // Validate environment variables
  if (!DATABASE_ID || !EVENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Events Table ID not configured. Please check your .env file.';
    console.error('[database.fetchEventById]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const result = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: EVENTS_TABLE_ID,
      rowId: eventId,
    });

    if (!result) {
      console.log('[database.fetchEventById] Event not found:', eventId);
      return null;
    }

    // Check if event is archived or hidden
    const isArchived = result.isArchived === true || result.isArchived === 'true';
    const isHidden = result.isHidder === true || result.isHidder === 'true';

    if (isArchived || isHidden) {
      console.log('[database.fetchEventById] Event is archived or hidden:', eventId);
      return null;
    }

    const event: EventRow = {
      $id: result.$id,
      name: result.name || '',
      date: result.date || '',
      startTime: result.startTime || '',
      endTime: result.endTime || '',
      city: result.city || '',
      address: result.address || '',
      state: result.state || '',
      zipCode: result.zipCode || '',
      products: result.products || '',
      client: result.client,
      checkInCode: result.checkInCode || '',
      checkInPoints: result.checkInPoints || 0,
      reviewPoints: result.reviewPoints || 0,
      eventInfo: result.eventInfo || '',
      discountImageURL: result.discountImageURL || null,
      radius: result.radius || undefined,
      isArchived: result.isArchived || false,
      isHidder: result.isHidder || false,
      $createdAt: result.$createdAt,
      $updatedAt: result.$updatedAt,
    };

    console.log('[database.fetchEventById] Event fetched successfully:', event.$id);
    return event;
  } catch (error: any) {
    console.error('[database.fetchEventById] Error fetching event:', error);
    console.error('[database.fetchEventById] Error message:', error?.message);
    console.error('[database.fetchEventById] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch event');
  }
};

/**
 * Fetch events by location using the Appwrite Cloud Function
 * Uses the Appwrite Functions service to execute the get-events-by-location function
 */
export const fetchEventsByLocation = async (
  latitude: number,
  longitude: number,
  page: number = 1,
  pageSize: number = 10
): Promise<EventsByLocationResponse> => {
  console.log('[database.fetchEventsByLocation] Fetching events by location:', {
    latitude,
    longitude,
    page,
    pageSize,
  });

  // Validate required parameters
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    throw new Error('latitude must be a valid number between -90 and 90');
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    throw new Error('longitude must be a valid number between -180 and 180');
  }
  if (typeof page !== 'number' || page < 1) {
    throw new Error('page must be a number greater than or equal to 1');
  }
  if (typeof pageSize !== 'number' || pageSize < 1 || pageSize > 100) {
    throw new Error('pageSize must be a number between 1 and 100');
  }

  const functionId = APPWRITE_EVENTS_FUNCTION_ID || '';


  if (!functionId) {
    throw new Error('APPWRITE_EVENTS_FUNCTION_ID must be configured. Please check your .env file.');
  }

  try {
    // Prepare request body
    const requestBody = {
      latitude,
      longitude,
      page,
      pageSize,
    };

    console.log('[database.fetchEventsByLocation] Executing function:', functionId);

    // Execute the function using Appwrite Functions service
    // async: false means we wait for the response synchronously
    const execution = await functions.createExecution({
      functionId,
      body: JSON.stringify(requestBody),
      method: ExecutionMethod.POST,
      xpath: '/get-events-by-location',
      headers: {
        'Content-Type': 'application/json',
      },
      async: false, // Synchronous execution to get response immediately

    });

    console.log('[database.fetchEventsByLocation] Execution status:', execution.status);
    console.log('[database.fetchEventsByLocation] Response status code:', execution.responseStatusCode);

    // Check if execution was successful
    if (execution.status === 'failed') {
      let errorMessage = 'Function execution failed';
      // Try to parse error message from response body if available
      if (execution.responseBody) {
        try {
          const errorResponse = JSON.parse(execution.responseBody);
          errorMessage = errorResponse.error || errorResponse.message || execution.responseBody;
        } catch {
          errorMessage = execution.responseBody;
        }
      }
      console.error('[database.fetchEventsByLocation] Function execution failed:', errorMessage);
      throw new Error(`Function execution failed: ${errorMessage}`);
    }

    // Parse the response body
    if (!execution.responseBody) {
      throw new Error('Function execution returned empty response body');
    }

    let result: EventsByLocationResponse;
    try {
      result = JSON.parse(execution.responseBody);
    } catch (parseError) {
      console.error('[database.fetchEventsByLocation] Failed to parse response body:', execution.responseBody);
      throw new Error('Invalid JSON response from function');
    }

    // Check HTTP status code after parsing (in case response body contains error details)
    if (execution.responseStatusCode && execution.responseStatusCode >= 400) {
      const errorMessage = result.error || execution.responseBody || `HTTP ${execution.responseStatusCode}`;
      console.error('[database.fetchEventsByLocation] Function returned error status:', {
        statusCode: execution.responseStatusCode,
        body: errorMessage,
      });
      throw new Error(`Function returned error: ${errorMessage}`);
    }

    // Validate response structure
    if (!result.success) {
      console.error('[database.fetchEventsByLocation] API returned error:', result);
      throw new Error(result.error || 'Failed to fetch events');
    }

    if (!result.events || !result.pagination) {
      throw new Error('Invalid API response: missing events or pagination data');
    }

    console.log('[database.fetchEventsByLocation] Events fetched successfully:', {
      count: result.events.length,
      total: result.pagination.total,
      page: result.pagination.page,
      totalPages: result.pagination.totalPages,
    });

    return result;
  } catch (error: any) {
    console.error('[database.fetchEventsByLocation] Error fetching events:', error);
    console.error('[database.fetchEventsByLocation] Error message:', error?.message);
    console.error('[database.fetchEventsByLocation] Error code:', error?.code);
    
    // Re-throw validation errors as-is
    if (error.message?.includes('must be') || error.message?.includes('must be configured')) {
      throw error;
    }
    
    throw new Error(error.message || 'Failed to fetch events by location');
  }
};

