/**
 * Geocoding utility to convert address, city, or ZIP code to coordinates
 * Uses Google Maps Geocoding API
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Geocode a location query (address, city name, or ZIP code) to coordinates
 * @param query - Address, city (e.g. "Austin, TX"), or ZIP code (e.g. "78701")
 * @returns Promise with latitude, longitude, and formatted address
 */
export const geocodeLocation = async (query: string): Promise<GeocodeResult> => {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    throw new Error('Please enter a city, address, or ZIP code.');
  }

  try {
    const apiKey = 'AIzaSyBJB8PG5CP2Sn4aIKxvAB8R1P8KVAoyJEo';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&key=${apiKey}`;

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
    }
    if (data.status === 'ZERO_RESULTS') {
      throw new Error('Location not found. Try a city, address, or ZIP code.');
    }
    throw new Error('Unable to find that location. Please try again.');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[geocoding] Error geocoding location:', error);
      throw error;
    }
    throw new Error('Failed to find location. Check your connection and try again.');
  }
};

/**
 * Geocode a ZIP code (convenience wrapper; same API supports any address)
 * @deprecated Prefer geocodeLocation for city/address support
 */
export const geocodeZipCode = async (zipCode: string): Promise<GeocodeResult> =>
  geocodeLocation(zipCode);

/**
 * Validate ZIP code format (US: 5 digits or 5+4)
 */
export const isValidZipCode = (zipCode: string): boolean => {
  const trimmed = zipCode.trim();
  return /^\d{5}(-\d{4})?$/.test(trimmed);
};

/**
 * Minimum valid length for a location search (city, address, or ZIP)
 */
export const isValidLocationInput = (query: string): boolean =>
  query.trim().length >= 2;
