/**
 * Geocoding utility to convert ZIP code to coordinates
 * Uses Google Maps Geocoding API
 */

interface GeocodeResult {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Geocode a ZIP code to get coordinates
 * @param zipCode - The ZIP code to geocode
 * @returns Promise with latitude and longitude
 */
export const geocodeZipCode = async (zipCode: string): Promise<GeocodeResult> => {
  try {
    // Use Google Maps Geocoding API
    // The API key is available in app.json, but we'll use a direct API call
    // For production, you might want to proxy this through your backend
    const apiKey = 'AIzaSyBJB8PG5CP2Sn4aIKxvAB8R1P8KVAoyJEo'; // From app.json
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zipCode)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const address = data.results[0].formatted_address;

      return {
        latitude: location.lat,
        longitude: location.lng,
        address,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('ZIP code not found. Please enter a valid ZIP code.');
    } else {
      throw new Error('Unable to find location for this ZIP code. Please try again.');
    }
  } catch (error: any) {
    console.error('[geocoding] Error geocoding ZIP code:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to geocode ZIP code. Please check your internet connection and try again.');
  }
};

/**
 * Validate ZIP code format (US ZIP codes: 5 digits or 5+4 format)
 */
export const isValidZipCode = (zipCode: string): boolean => {
  const trimmed = zipCode.trim();
  // US ZIP code: 5 digits or 5 digits + dash + 4 digits
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(trimmed);
};
