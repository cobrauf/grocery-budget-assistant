import { useState, useCallback, useEffect } from "react";
// import {
//   loadFromLocalStorage,
//   LS_LAST_SEARCH_QUERY,
// } from "../utils/localStorageUtils";

export type AppTab = "browse" | "search" | "ai" | "favorites";
export type ViewMode = "default" | "results";

export interface TabState {
  activeTab: AppTab;
  viewMode: Record<"browse" | "search" | "ai", ViewMode>;
}

const INITIAL_TAB_STATE: TabState = {
  activeTab: "browse",
  viewMode: {
    browse: "default",
    search: "default",
    ai: "default",
  },
};

export const useAppTab = () => {
  const [currentTabState, setCurrentTabState] =
    useState<TabState>(INITIAL_TAB_STATE);

  // Log tab changes
  useEffect(() => {
    console.log("[useAppTab] Tab changed to:", currentTabState.activeTab);
    console.log("[useAppTab] View mode:", currentTabState.viewMode);
  }, [currentTabState.activeTab, currentTabState.viewMode]);

  const setActiveTab = useCallback((tab: AppTab) => {
    setCurrentTabState((prev) => {
      // If clicking the same tab (browse, search, or ai) that's already active, toggle the view mode
      if (
        tab === prev.activeTab &&
        (tab === "browse" || tab === "search" || tab === "ai")
      ) {
        return {
          ...prev,
          viewMode: {
            ...prev.viewMode,
            [tab]: prev.viewMode[tab] === "default" ? "results" : "default",
          },
        };
      }
      // Otherwise, just change the active tab
      return {
        ...prev,
        activeTab: tab,
      };
    });
  }, []);

  // Helper function to directly set the view mode
  const setViewMode = useCallback(
    (tab: "browse" | "search" | "ai", mode: ViewMode) => {
      setCurrentTabState((prev) => ({
        ...prev,
        viewMode: {
          ...prev.viewMode,
          [tab]: mode,
        },
      }));
    },
    []
  );

  return {
    activeTab: currentTabState.activeTab,
    viewMode: currentTabState.viewMode,
    setActiveTab,
    setViewMode,
  };
};
