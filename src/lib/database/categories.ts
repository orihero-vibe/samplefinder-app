import { tablesDB, DATABASE_ID, CATEGORIES_TABLE_ID } from './config';
import type { CategoryData } from './types';

/**
 * Fetch all categories from the database
 * @param userIsAdult - If true, includes all categories (including adult ones). If false, filters out categories with isAdult=true.
 */
export const fetchCategories = async (userIsAdult?: boolean): Promise<CategoryData[]> => {
  console.log('[database.fetchCategories] Fetching categories from database', {
    userIsAdult,
  });

  console.log('[database.fetchCategories] DATABASE_ID:', DATABASE_ID);
  console.log('[database.fetchCategories] CATEGORIES_TABLE_ID:', CATEGORIES_TABLE_ID);

  // Validate environment variables
  if (!DATABASE_ID || !CATEGORIES_TABLE_ID) {
    const errorMsg = 'Database ID or Categories Table ID not configured. Please check your .env file.';
    console.error('[database.fetchCategories]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Fetch all categories
    // Note: If you want to filter by isActive, you can add queries here
    // Example: queries: [Query.equal('isActive', true)]
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: CATEGORIES_TABLE_ID,
    });

    console.log('[database.fetchCategories] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.fetchCategories] No categories found');
      return [];
    }

    // Log raw data to see what we're getting from the database
    console.log('[database.fetchCategories] Raw rows sample:', 
      result.rows.slice(0, 3).map((r: any) => ({ 
        title: r.title, 
        isAdult: r.isAdult, 
        isAdultType: typeof r.isAdult 
      }))
    );

    // Map the rows to CategoryData format
    let categories: CategoryData[] = result.rows
      .map((row: any) => ({
        $id: row.$id,
        name: row.title,
        slug: row.slug || row.title?.toLowerCase().replace(/\s+/g, '-') || '',
        description: row.description || '',
        icon: row.icon || '',
        isActive: row.isActive !== false, // Default to true if not specified
        isAdult: row.isAdult === true || row.isAdult === 'true', // Handle both boolean and string
        $createdAt: row.$createdAt,
        $updatedAt: row.$updatedAt,
        ...row, // Include all other fields
      }))
      .filter((cat: CategoryData) => cat.isActive !== false); // Filter out inactive categories

    // Filter out adult categories if user is not an adult
    if (!userIsAdult) {
      const beforeFilter = categories.length;
      categories = categories.filter((cat: CategoryData) => !cat.isAdult);
      console.log('[database.fetchCategories] Filtered out adult categories:', {
        before: beforeFilter,
        after: categories.length,
      });
    }

    console.log('[database.fetchCategories] Categories fetched successfully:', categories.length);
    return categories;
  } catch (error: any) {
    console.error('[database.fetchCategories] Error fetching categories:', error);
    console.error('[database.fetchCategories] Error message:', error?.message);
    console.error('[database.fetchCategories] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch categories');
  }
};

