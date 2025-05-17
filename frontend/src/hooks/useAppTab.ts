import { useState, useCallback, useEffect } from "react";
import {
  loadFromLocalStorage,
  LS_LAST_SEARCH_QUERY,
} from "../utils/localStorageUtils";

export type AppTab = "browse" | "search" | "ai";

export interface TabState {
  activeTab: AppTab;
}

const INITIAL_TAB_STATE: TabState = { activeTab: "browse" };

export const useAppTab = () => {
  const [currentTabState, setCurrentTabState] = useState<TabState>(() => {
    const lastSearchQuery = loadFromLocalStorage<string>(
      LS_LAST_SEARCH_QUERY,
      ""
    );
    if (lastSearchQuery) {
      // If there was a last search query, default to search tab
      return { activeTab: "search" };
    }
    return INITIAL_TAB_STATE;
  });

  // Log tab changes
  useEffect(() => {
    console.log("[useAppTab] Tab changed to:", currentTabState.activeTab);
  }, [currentTabState.activeTab]);

  const setActiveTab = useCallback((tab: AppTab) => {
    setCurrentTabState({ activeTab: tab });
  }, []); //TODO understand this, why not use setCurrentTabState directly?

  return { activeTab: currentTabState.activeTab, setActiveTab };
};
