import { useCallback, useEffect, useRef } from "react";
import { AppTab } from "./useAppTab";
import { BrowserHistoryState } from "../types/viewHistory";
import { Product } from "../types/product";

interface UseViewHistoryParams {
  activeTab: AppTab;
  isBrowseResultsActive: boolean;
  searchQuery: string;
  searchResults: any[];
  favoriteItems: Product[];
  setActiveTab: (tab: AppTab) => void;
  setIsBrowseResultsActive: (active: boolean) => void;
  resetSearch: () => void;
}

/**
 * Hook to manage browser history for SPA navigation
 */
export const useViewHistory = ({
  activeTab,
  isBrowseResultsActive,
  searchQuery,
  searchResults,
  favoriteItems,
  setActiveTab,
  setIsBrowseResultsActive,
  resetSearch,
}: UseViewHistoryParams) => {
  // Ref to track if this is the first load
  const initialLoadRef = useRef(true);

  // Function to determine the current browser history state
  const determineCurrentBrowserState = useCallback((): BrowserHistoryState => {
    // For search tab, check if we're in results or default view
    const searchHasContext =
      searchQuery.trim() !== "" || searchResults.length > 0;

    // For favorites tab, check if we have any favorite items
    const favoritesHaveItems = favoriteItems.length > 0;

    // Generate a unique key for this view state
    let appViewKey = activeTab;
    if (activeTab === "browse") {
      appViewKey += isBrowseResultsActive ? "_results" : "_default";
    } else if (activeTab === "search") {
      appViewKey += searchHasContext ? "_results" : "_default";
    } else if (activeTab === "favorites") {
      appViewKey += favoritesHaveItems ? "_results" : "_default";
    }

    return {
      appViewKey,
      activeTab,
      isBrowseResultsActive:
        activeTab === "browse" ? isBrowseResultsActive : undefined,
      searchHasContext: activeTab === "search" ? searchHasContext : undefined,
      favoritesHaveItems:
        activeTab === "favorites" ? favoritesHaveItems : undefined,
    };
  }, [
    activeTab,
    isBrowseResultsActive,
    searchQuery,
    searchResults.length,
    favoriteItems.length,
  ]);

  // Function to push state to browser history
  const pushToBrowserHistory = useCallback((newState: BrowserHistoryState) => {
    // Get the current state from history
    const currentState = window.history.state?.appState;

    // Only push if the new state is different from the current state
    if (!currentState || currentState.appViewKey !== newState.appViewKey) {
      // Generate URL hash based on the view state
      const urlHash = `#/${newState.activeTab}${
        newState.activeTab === "browse" && newState.isBrowseResultsActive
          ? "/results"
          : newState.activeTab === "search" && newState.searchHasContext
          ? "/results"
          : newState.activeTab === "favorites" && newState.favoritesHaveItems
          ? "/results"
          : ""
      }`;

      window.history.pushState({ appState: newState }, "", urlHash);
      console.log("Pushed to browser history:", newState);
    }
  }, []);

  // Handle popstate event (browser back/forward button)
  const handlePopState = useCallback(
    (event: PopStateEvent) => {
      console.log("Popstate event:", event.state);

      if (event.state && event.state.appState) {
        const poppedState = event.state.appState as BrowserHistoryState;

        // Restore the active tab
        setActiveTab(poppedState.activeTab);

        // Restore browse view state if this is a browse tab
        if (poppedState.activeTab === "browse") {
          setIsBrowseResultsActive(poppedState.isBrowseResultsActive ?? false);
        }

        // Handle search state restoration
        if (
          poppedState.activeTab === "search" &&
          !poppedState.searchHasContext
        ) {
          resetSearch();
        }

        // Note: For favorites tab, MainContent already renders based on favoriteItems.length,
        // so we don't need special handling here
      } else {
        // If we don't have a valid state, go to the home view
        setActiveTab("browse");
        setIsBrowseResultsActive(false);
      }
    },
    [resetSearch, setActiveTab, setIsBrowseResultsActive]
  );

  // Effect to add popstate event listener
  useEffect(() => {
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [handlePopState]);

  // Effect to update browser history when view state changes
  useEffect(() => {
    const currentBrowserState = determineCurrentBrowserState();

    if (initialLoadRef.current) {
      // For the initial load, replace state instead of pushing
      window.history.replaceState(
        { appState: currentBrowserState },
        "",
        `#/${activeTab}`
      );
      initialLoadRef.current = false;
    } else {
      // For subsequent state changes, push new state
      pushToBrowserHistory(currentBrowserState);
    }
  }, [
    activeTab,
    isBrowseResultsActive,
    searchQuery,
    searchResults.length,
    favoriteItems.length,
    determineCurrentBrowserState,
    pushToBrowserHistory,
  ]);

  return {
    // We don't need to expose any methods or properties as the hook handles
    // the browser history management internally, but we could return helper
    // functions if needed in the future.
  };
};
