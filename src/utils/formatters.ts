/**
 * Utility functions for formatting form inputs
 */

/**
 * Formats a phone number as (XXX) XXX-XXXX
 */
export const formatPhoneNumber = (text: string): string => {
  // Remove all non-digits
  const cleaned = text.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length <= 3) {
    return cleaned.length > 0 ? `(${cleaned}` : '';
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

/**
 * Formats a date as MM/DD/YYYY
 */
export const formatDate = (text: string): string => {
  // Remove all non-digits
  const cleaned = text.replace(/\D/g, '');
  
  // Format as MM/DD/YYYY
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  } else {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  }
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (10 digits)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

/**
 * Validates date format (MM/DD/YYYY)
 */
export const isValidDate = (date: string): boolean => {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(date)) return false;
  
  const [month, day, year] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day &&
    month >= 1 && month <= 12 &&
    day >= 1 && day <= 31
  );
};

/**
 * Formats an ISO date string to a readable format (e.g., "April 3, 1979")
 */
export const formatDateForDisplay = (isoDate: string): string => {
  if (!isoDate) return '';
  
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      // If it's not a valid ISO date, try to parse as MM/DD/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(isoDate)) {
        const [month, day, year] = isoDate.split('/').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return isoDate; // Return as-is if can't parse
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('[formatters.formatDateForDisplay] Error formatting date:', error);
    return isoDate;
  }
};

/**
 * Parses event date and time strings into start and end Date objects
 * @param dateString - Date in format "Aug 1, 2025"
 * @param timeString - Time in format "3 - 5 pm" or "10 - 11 am"
 * @returns Object with start and end Date objects
 */
export const parseEventDateTime = (
  dateString: string,
  timeString: string
): { start: Date; end: Date } => {
  // Parse date string (e.g., "Aug 1, 2025")
  const dateParts = dateString.trim().split(' ');
  if (dateParts.length < 3) {
    throw new Error(`Invalid date format: ${dateString}`);
  }

  const monthAbbr = dateParts[0]; // "Aug"
  const day = parseInt(dateParts[1].replace(',', ''), 10); // "1"
  const year = parseInt(dateParts[2], 10); // "2025"

  // Map month abbreviations to month numbers (0-indexed)
  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const month = monthMap[monthAbbr];
  if (month === undefined) {
    throw new Error(`Invalid month abbreviation: ${monthAbbr}`);
  }

  // Parse time string - supports two formats:
  // 1. "3 - 5 pm" or "10 - 11 am" (period at the end)
  // 2. "3 pm - 11 pm" or "10 am - 11 am" (period after each hour)
  let startHour: number;
  let endHour: number;
  let startPeriod: string;
  let endPeriod: string;

  // Try format 1: "3 - 5 pm" (period at the end)
  const timeMatch1 = timeString.trim().match(/^(\d+)\s*-\s*(\d+)\s*(am|pm)$/i);
  if (timeMatch1) {
    startHour = parseInt(timeMatch1[1], 10);
    endHour = parseInt(timeMatch1[2], 10);
    startPeriod = timeMatch1[3].toLowerCase();
    endPeriod = timeMatch1[3].toLowerCase();
  } else {
    // Try format 2: "3 pm - 11 pm" (period after each hour)
    const timeMatch2 = timeString.trim().match(/^(\d+)\s*(am|pm)\s*-\s*(\d+)\s*(am|pm)$/i);
    if (timeMatch2) {
      startHour = parseInt(timeMatch2[1], 10);
      endHour = parseInt(timeMatch2[3], 10);
      startPeriod = timeMatch2[2].toLowerCase();
      endPeriod = timeMatch2[4].toLowerCase();
    } else {
      throw new Error(`Invalid time format: ${timeString}`);
    }
  }

  // Convert to 24-hour format
  if (startPeriod === 'pm') {
    if (startHour !== 12) startHour += 12;
  } else if (startPeriod === 'am') {
    if (startHour === 12) startHour = 0;
  }

  if (endPeriod === 'pm') {
    if (endHour !== 12) endHour += 12;
  } else if (endPeriod === 'am') {
    if (endHour === 12) endHour = 0;
  }

  // Create start and end Date objects
  const start = new Date(year, month, day, startHour, 0, 0, 0);
  const end = new Date(year, month, day, endHour, 0, 0, 0);

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error(`Invalid date/time values: ${dateString} ${timeString}`);
  }

  // Ensure end time is after start time
  if (end <= start) {
    throw new Error(`End time must be after start time: ${timeString}`);
  }

  return { start, end };
};

/**
 * Formats an ISO datetime string to date format "Aug 1, 2025"
 */
export const formatEventDate = (isoDate: string): string => {
  if (!isoDate) return '';
  
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return isoDate; // Return as-is if can't parse
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    console.error('[formatters.formatEventDate] Error formatting date:', error);
    return isoDate;
  }
};

/**
 * Formats ISO datetime strings to time range format "3 - 5 pm"
 */
export const formatEventTime = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '';
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '';
    }
    
    const formatHour = (date: Date) => {
      const hour = date.getHours();
      const period = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const minutes = date.getMinutes();
      return minutes > 0 
        ? `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
        : `${displayHour} ${period}`;
    };
    
    return `${formatHour(start)} - ${formatHour(end)}`;
  } catch (error) {
    console.error('[formatters.formatEventTime] Error formatting time:', error);
    return '';
  }
};

/**
 * Parses products string (comma-separated or single string) into array
 */
export const parseProducts = (products: string): string[] => {
  if (!products) return [];
  
  // Split by comma and trim each product
  const productArray = products
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  
  // If no commas found, return as single item array
  return productArray.length > 0 ? productArray : [products.trim()];
};

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

