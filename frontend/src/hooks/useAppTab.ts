import { useState, useCallback, useEffect } from "react";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  LS_LAST_VIEW_STATE,
} from "../utils/localStorageUtils";

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
  const [currentTabState, setCurrentTabState] = useState<TabState>(() => {
    // Load the last view state from localStorage on initialization
    const savedViewState = loadFromLocalStorage<TabState | null>(
      LS_LAST_VIEW_STATE,
      null
    );
    if (savedViewState) {
      return savedViewState;
    }
    return INITIAL_TAB_STATE;
  });

  // Save to localStorage and scroll to top on tab/view changes
  useEffect(() => {
    saveToLocalStorage(LS_LAST_VIEW_STATE, currentTabState);

    const attemptScroll = (attempt = 1) => {
      // Special case: AI default view (chat) should scroll to bottom
      const isAIChat =
        currentTabState.activeTab === "ai" &&
        currentTabState.viewMode.ai === "default";

      let scrollableElement: HTMLElement | null = null;

      if (
        currentTabState.activeTab === "browse" &&
        currentTabState.viewMode.browse === "results"
      ) {
        scrollableElement = document.getElementById("browseScrollableDiv");
      } else if (
        currentTabState.activeTab === "search" &&
        currentTabState.viewMode.search === "results"
      ) {
        scrollableElement = document.getElementById("searchScrollableDiv");
      } else if (
        currentTabState.activeTab === "ai" &&
        currentTabState.viewMode.ai === "results"
      ) {
        scrollableElement = document.getElementById("aiResultsScrollableDiv");
      } else if (currentTabState.activeTab === "favorites") {
        scrollableElement = document.getElementById("favoritesScrollableDiv");
      }

      if (scrollableElement) {
        if (isAIChat) {
          scrollableElement.scrollTop = scrollableElement.scrollHeight;
        } else {
          scrollableElement.scrollTop = 0;
        }
      }

      // Also scroll window and document body to ensure we capture all scrollable areas
      const windowScrollY = window.scrollY;
      const documentScrollTop = document.documentElement.scrollTop;
      const bodyScrollTop = document.body.scrollTop;

      if (
        !isAIChat &&
        (windowScrollY > 0 || documentScrollTop > 0 || bodyScrollTop > 0)
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } else if (
        isAIChat &&
        windowScrollY <
          document.documentElement.scrollHeight - window.innerHeight
      ) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
        document.documentElement.scrollTop =
          document.documentElement.scrollHeight;
        document.body.scrollTop = document.body.scrollHeight;
      }

      if (!scrollableElement && attempt < 3) {
        setTimeout(() => attemptScroll(attempt + 1), 100 * attempt);
      }
    };

    setTimeout(() => attemptScroll(), 50);
  }, [currentTabState.activeTab, currentTabState.viewMode]);

  const setActiveTab = useCallback((tab: AppTab) => {
    setCurrentTabState((prev) => {
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
