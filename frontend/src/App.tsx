import { useState, useEffect, createContext, useContext } from "react";
import "./styles/app.css";
// import { api } from "./services/api";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
// import BottomNav from "./components/BottomNav";
import SideBar from "./components/sidebar/SideBar";
import FullOverlay from "./components/common/FullOverlay";
import { useTheme as useAppTheme } from "./hooks/useTheme"; // Renamed import to avoid conflict
import { useSearch } from "./hooks/useSearch"; // Import search hook
import { useRetailers } from "./hooks/useRetailers"; // Import retailers hook
import { useAppView } from "./hooks/useAppView"; // Updated import

// --- Theme Context ---
interface ThemeContextType {
  themeName: string;
  setThemeName: (themeName: string) => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { currentThemeName, setCurrentThemeName, currentFont, setCurrentFont } =
    useAppTheme();

  const { currentViewState, navigateToView, goHome } = useAppView();

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    totalResults,
    isLoadingSearch,
    searchError,
    hasMoreResults,
    performSearch,
    loadMoreResults,
    resetSearch,
  } = useSearch();

  // Determine if search is active based on view state
  const isSearchActive = currentViewState.type === "searchResults";

  const {
    rawRetailers,
    verifiedRetailers,
    selectedRetailerProducts,
    isLoadingApiRetailers,
    isLoadingLogoVerification,
    isLoadingRetailerProducts,
    retailerApiError,
    handleRetailerClick: fetchRetailerProductsLogic,
    clearSelectedRetailer,
    getLogoPath,
  } = useRetailers(isSearchActive);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add/remove class to body to prevent scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll"); // Cleanup on unmount
    };
  }, [isSidebarOpen]);

  const handleNewSearch = async (query: string) => {
    await performSearch(query); // performSearch should set its own searchQuery state in useSearch
    navigateToView({ type: "searchResults", searchQuery: query });
  };

  const handleRetailerLogoClick = async (retailerId: number) => {
    await fetchRetailerProductsLogic(retailerId);
    navigateToView({ type: "retailerProducts", retailerId: retailerId });
  };

  const clearSearchLocal = () => {
    setSearchQuery("");
    // If clearing search results in a dedicated search view, navigate back to home
    if (currentViewState.type === "searchResults") {
      goHome();
    }
  };

  // Log view changes
  useEffect(() => {
    console.log("[useAppView] View changed to:", currentViewState);

    // --- Handle Browser History (Pushing State) ---
    // Only push state if it's a new navigation, not on initial load or popstate
    // (popstate is handled separately to decide if we goHome or allow natural back)
    // Avoid pushing if already on the target state to prevent duplicate history entries.
    if (
      (currentViewState.type === "searchResults" &&
        window.history.state?.searchQuery !== currentViewState.searchQuery) ||
      (currentViewState.type === "retailerProducts" &&
        window.history.state?.retailerId !== currentViewState.retailerId) ||
      (currentViewState.type === "defaultBrowse" &&
        window.history.state?.type !== "defaultBrowse")
    ) {
      if (currentViewState.type === "searchResults") {
        window.history.pushState(
          {
            type: "searchResults",
            searchQuery: currentViewState.searchQuery,
          },
          "" /* #searchResults/${currentViewState.searchQuery} */
        );
      } else if (currentViewState.type === "retailerProducts") {
        window.history.pushState(
          {
            type: "retailerProducts",
            retailerId: currentViewState.retailerId,
          },
          "" /* #retailerProducts/${currentViewState.retailerId} */
        );
      } else if (currentViewState.type === "defaultBrowse") {
        window.history.pushState(
          { type: "defaultBrowse" },
          "" /* #defaultBrowse */
        );
      }
    }
  }, [currentViewState]);

  // --- Popstate Listener (Browser Back/Forward) ---
  useEffect(() => {
    const handlePopstate = (event: PopStateEvent) => {
      console.log(
        "Popstate event. Current app view type:",
        currentViewState.type,
        "History state:",
        event.state
      );
      // If the current view in the app is NOT the home view (defaultBrowse),
      // then any 'popstate' (usually from browser back) should take us home.
      if (currentViewState.type !== "defaultBrowse") {
        goHome(); // Navigate app to home view

        // We need to push the 'defaultBrowse' state again because the browser
        // already popped to the *previous* state. We want the *next* back
        // press from 'defaultBrowse' to trigger beforeunload or exit.
        window.history.pushState(
          { type: "defaultBrowse" },
          "" /* #defaultBrowse */
        );
      }
      // If currentViewState.type IS 'defaultBrowse', popstate means the user is trying
      // to go back *from* the home view. `beforeunload` will handle the exit confirmation.
    };
    window.addEventListener("popstate", handlePopstate);

    // --- Beforeunload Listener (Refresh, Close Tab, True Exit) ---
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const confirmationMessage = "Are you sure you want to leave or refresh?";
      event.preventDefault();
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentViewState.type, goHome]); // Depend on currentViewState.type for popstate logic

  // Effect to reset states when navigating to home
  useEffect(() => {
    if (currentViewState.type === "defaultBrowse") {
      resetSearch();
      clearSelectedRetailer();
    }
  }, [currentViewState, resetSearch, clearSelectedRetailer]);

  return (
    <ThemeContext.Provider
      value={{ themeName: currentThemeName, setThemeName: setCurrentThemeName }}
    >
      <div className="app-container">
        <Header
          onMenuClick={toggleSidebar}
          onSearch={handleNewSearch}
          isLoadingSearch={isLoadingSearch}
          onClearSearch={clearSearchLocal}
          initialSearchQuery={searchQuery}
        />
        <MainContent
          currentViewType={currentViewState.type}
          searchQuery={searchQuery}
          searchResults={searchResults}
          totalResults={totalResults}
          isLoadingSearch={isLoadingSearch}
          searchError={searchError}
          hasMoreResults={hasMoreResults}
          loadMoreResults={loadMoreResults}
          // Props for RetailerLogosView
          rawRetailers={rawRetailers}
          verifiedRetailers={verifiedRetailers}
          isLoadingApiRetailers={isLoadingApiRetailers}
          isLoadingLogoVerification={isLoadingLogoVerification}
          onRetailerClick={handleRetailerLogoClick}
          retailerApiError={retailerApiError}
          getLogoPath={getLogoPath}
          // Props for RetailerProductsView
          retailerProducts={selectedRetailerProducts}
          isLoadingRetailerProducts={isLoadingRetailerProducts}
        />
        {/* <BottomNav /> */}
        <SideBar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          currentThemeName={currentThemeName}
          onSelectTheme={setCurrentThemeName}
          currentFont={currentFont}
          onSelectFont={setCurrentFont}
          onGoHome={() => goHome()}
        />
        <FullOverlay isOpen={isSidebarOpen} onClick={toggleSidebar} />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
