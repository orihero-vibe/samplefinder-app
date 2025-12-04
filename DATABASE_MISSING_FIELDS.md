# Missing Database Fields for BrandDetailsScreen

This document lists the fields that are currently missing or need to be added to your Appwrite database to fully support the BrandDetailsScreen without mock data.

## Events Table

The following fields are already present in the Events table:
- ✅ `$id` (string) - Event ID
- ✅ `name` (string) - Event/Brand name
- ✅ `date` (ISO datetime) - Event date
- ✅ `startTime` (ISO datetime) - Event start time
- ✅ `endTime` (ISO datetime) - Event end time
- ✅ `city` (string) - City
- ✅ `address` (string) - Street address
- ✅ `state` (string) - State
- ✅ `zipCode` (string) - Zip code
- ✅ `products` (string) - Products (comma-separated or single string)
- ✅ `client` (relationship) - Relationship to Clients table
- ✅ `checkInCode` (string) - Check-in code for the event
- ✅ `checkInPoints` (integer) - Points awarded for check-in
- ✅ `reviewPoints` (integer) - Points awarded for review
- ✅ `eventInfo` (string) - Event description/information
- ✅ `isArchived` (boolean) - Whether event is archived
- ✅ `isHidder` (boolean) - Whether event is hidden (NOTE: typo in field name - should be `isHidden`)

### Missing/Recommended Fields:

1. **`discountMessage`** (string, optional)
   - Description: Discount message that appears after check-in
   - Type: String
   - Required: No
   - Example: "Get 20% off on your next purchase!"
   - Usage: Displayed in BrandDetailsScreen after successful check-in

## Clients Table

The following fields should be present:
- ✅ `$id` (string) - Client ID
- ✅ `name` (string) - Store/Client name
- ✅ `title` (string) - Alternative name field
- ✅ `location` (Point) - Geographic location [longitude, latitude]
- ✅ `address` (string) - Street address (if stored directly)
- ✅ `street` (string) - Street address
- ✅ `city` (string) - City
- ✅ `state` (string) - State
- ✅ `zip` (string) - Zip code
- ✅ `zipCode` (string) - Alternative zip code field

## Data Quality Improvements

### Recommendations:

1. **Fix typo**: Consider renaming `isHidder` to `isHidden` in Events table for consistency
2. **Products field**: Consider changing `products` from string to array type if Appwrite supports it, or ensure it's consistently formatted (comma-separated)
3. **Address normalization**: Ensure address fields are consistently populated either in Events table or through Client relationship
4. **Discount Message**: Add `discountMessage` field to Events table for post-check-in messaging

## Implementation Status

✅ **Completed:**
- Database helper function `fetchEventById()` created
- Utility functions for converting EventRow to BrandDetailsData
- BrandDetailsScreen updated to fetch from database
- All navigation points updated to use eventId
- Check-in code validation implemented using database field

⏳ **Pending (Database Changes):**
1. Add `discountMessage` field to Events table
2. Consider fixing `isHidder` typo to `isHidden`
3. Ensure all events have proper client relationships populated
4. Ensure products field is consistently formatted

## Notes

- The BrandDetailsScreen now fetches event data from the database using the event ID
- All mock data has been removed from navigation components
- The screen supports both eventId-based navigation (new) and direct brand data (backward compatibility)
- Check-in code validation now uses the actual `checkInCode` field from the database
