import { AppTab } from "../hooks/useAppTab";

/**
 * Represents the state of a view in the application for browser history navigation.
 */
export interface BrowserHistoryState {
  appViewKey: string; // A unique key for this view state, e.g., "browse_default", "search_results"
  activeTab: AppTab;
  isBrowseResultsActive?: boolean;
  searchHasContext?: boolean;
  favoritesHaveItems?: boolean;
}
