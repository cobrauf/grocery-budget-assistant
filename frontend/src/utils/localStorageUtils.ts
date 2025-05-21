export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    console.log(`Saved to local storage (key: ${key}):`, serializedValue);
  } catch (error) {
    console.error(`Error saving to local storage (key: ${key}):`, error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    console.log(`Loaded from local storage (key: ${key}):`, serializedValue);
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error(`Error loading from local storage (key: ${key}):`, error);
    return defaultValue;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
    console.log(`Removed from local storage (key: ${key})`);
  } catch (error) {
    console.error(`Error removing from local storage (key: ${key}):`, error);
  }
}

// Define and export constants for local storage keys
export const LS_SELECTED_STORE_IDS = "appState.browse.selectedStoreIds";
export const LS_SELECTED_CATEGORIES = "appState.browse.selectedCategories";
export const LS_LAST_BROWSE_FILTER_KEY = "appState.browse.lastFilterKey";
export const LS_LAST_BROWSE_PRODUCTS = "appState.browse.lastBrowseProducts";
export const LS_SEARCH_HISTORY = "appState.search.history";
export const LS_LAST_SEARCH_QUERY = "appState.search.lastQuery";
export const LS_LAST_SEARCH_RESULTS = "appState.search.lastResults";
export const LS_RETAILERS_CACHE = "appState.retailers.cache";
export const LS_FAVORITE_ITEMS = "appState.favorites.items";

// Constants for Sort State
export const LS_ACTIVE_SORT_FIELD = "appState.sort.activeSortField";
export const LS_PRICE_SORT_DIRECTION = "appState.sort.priceSortDirection";
export const LS_STORE_SORT_DIRECTION = "appState.sort.storeSortDirection";
export const LS_CATEGORY_SORT_DIRECTION = "appState.sort.categorySortDirection";
