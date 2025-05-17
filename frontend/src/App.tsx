import { useState, useEffect, createContext, useContext } from "react";
import "./styles/app.css";
// import { api } from "./services/api";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import BottomNav from "./components/common/BottomNav";
import SideBar from "./components/sidebar/SideBar";
import FullOverlay from "./components/common/FullOverlay";
import { useTheme as useAppTheme } from "./hooks/useTheme"; // Renamed import to avoid conflict
import { useSearch } from "./hooks/useSearch"; // Import search hook
import { useRetailers } from "./hooks/useRetailers"; // Import retailers hook
import { useAppTab } from "./hooks/useAppTab"; // Import useAppTab
import { fetchProductsByFilter as apiFetchProductsByFilter } from "./services/api"; // Import the new API function
import { Product } from "./types/product"; // Ensure Product type is imported

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

  const { activeTab, setActiveTab } = useAppTab();

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

  const isSearchActive = activeTab === "search";

  const {
    rawRetailers,
    verifiedRetailers,
    selectedRetailerProducts,
    isLoadingApiRetailers,
    isLoadingLogoVerification,
    isLoadingRetailerProducts,
    retailerApiError,
    handleRetailerClick: fetchSingleRetailerProductsLogic, // Renamed for clarity
    clearSelectedRetailer,
    getLogoPath,
  } = useRetailers(isSearchActive);

  // State for multi-filter browse results
  const [filteredBrowseProducts, setFilteredBrowseProducts] = useState<
    Product[]
  >([]);
  const [isLoadingFilteredBrowseProducts, setIsLoadingFilteredBrowseProducts] =
    useState(false);
  const [appIsLoadingSingleRetailer, setAppIsLoadingSingleRetailer] =
    useState(false);

  // State to manage if the detailed browse results view is active vs. filter selection view
  const [isBrowseResultsActive, setIsBrowseResultsActive] = useState(false);

  // Cache for browse results
  const [browseResultsCache, setBrowseResultsCache] = useState<
    Map<string, Product[]>
  >(new Map());

  // Lifted state for Browse Tab filter selections
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<number>>(
    new Set()
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  // Add effect for beforeunload confirmation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Standard for most browsers, but Chrome requires returnValue to be set.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // Helper to generate cache key
  const generateBrowseCacheKey = (
    storeIds: string[],
    categories: string[]
  ): string => {
    const sortedStoreIds = [...storeIds].sort().join(",");
    const sortedCategories = [...categories].sort().join(",");
    return `stores:${sortedStoreIds}_categories:${sortedCategories}`;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isSidebarOpen]);

  const handleNewSearch = async (query: string) => {
    await performSearch(query);
    setActiveTab("search");
  };

  // For single retailer selection (maintains existing logic)
  const handleSingleRetailerLogoClick = async (retailerId: number) => {
    clearSelectedRetailer();
    setFilteredBrowseProducts([]);
    setAppIsLoadingSingleRetailer(true); // Controlled by App for this action
    setIsBrowseResultsActive(true);
    try {
      await fetchSingleRetailerProductsLogic(retailerId); // Hook updates selectedRetailerProducts
    } catch (error) {
      console.error("Error during single retailer fetch logic:", error);
      // Potentially set an error state to display in UI
    } finally {
      setAppIsLoadingSingleRetailer(false);
    }
  };

  // For multi-filter selection from DefaultBrowseView
  const handleFetchProductsByFilter = async (
    storeIds: string[],
    categories: string[]
  ) => {
    clearSelectedRetailer(); // Clear single retailer products/state

    const cacheKey = generateBrowseCacheKey(storeIds, categories);

    if (browseResultsCache.has(cacheKey)) {
      setFilteredBrowseProducts(browseResultsCache.get(cacheKey)!);
      setIsLoadingFilteredBrowseProducts(false);
      setIsBrowseResultsActive(true);
      return;
    }

    setIsBrowseResultsActive(true);
    setIsLoadingFilteredBrowseProducts(true);
    setFilteredBrowseProducts([]);
    try {
      const products = await apiFetchProductsByFilter(storeIds, categories);
      setFilteredBrowseProducts(products);
      setBrowseResultsCache((prevCache) =>
        new Map(prevCache).set(cacheKey, products)
      ); // Update cache
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    } finally {
      setIsLoadingFilteredBrowseProducts(false);
      setIsBrowseResultsActive(true); // Show results view regardless of fetch outcome (empty/error handled by view)
    }
  };

  const toggleBrowseView = () => {
    setIsBrowseResultsActive((prev) => !prev);
  };

  // Handlers for Browse Tab filter selections
  const toggleStoreSelection = (id: number) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleCategorySelection = (categoryName: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const executeBrowseSearch = (
    currentStoreIds: Set<number>,
    currentCategories: Set<string>
  ) => {
    const isSingleStoreOnly =
      currentStoreIds.size === 1 && currentCategories.size === 0;
    const isMultiFilter =
      currentStoreIds.size > 0 || currentCategories.size > 0;

    if (isSingleStoreOnly) {
      const storeId = Array.from(currentStoreIds)[0];
      handleSingleRetailerLogoClick(storeId);
    } else if (isMultiFilter) {
      const storeIdsAsString = Array.from(currentStoreIds).map(String);
      const categoryNames = Array.from(currentCategories);
      handleFetchProductsByFilter(storeIdsAsString, categoryNames);
    } else {
      // No selection, might want to clear results or stay on selection view
      setFilteredBrowseProducts([]);
      // ensure selectedRetailerProducts are also cleared if necessary
      // clearSelectedRetailer(); // This is already in handleFetchProductsByFilter and handleSingleRetailerLogoClick
      setIsBrowseResultsActive(false); // Stay on filter selection view
    }
  };

  const handleStoreModalConfirm = (newStoreIds: Set<number>) => {
    setSelectedStoreIds(newStoreIds);
    // Use newStoreIds and current selectedCategories from state for the search
    executeBrowseSearch(newStoreIds, selectedCategories);
  };

  const handleCategoryModalConfirm = (newCategories: Set<string>) => {
    setSelectedCategories(newCategories);
    // Use current selectedStoreIds from state and newCategories for the search
    executeBrowseSearch(selectedStoreIds, newCategories);
  };

  const clearSearchLocal = () => {
    setSearchQuery("");
    // if (activeTab === "search") { // Original comment, keep if intended
    // }
    setFilteredBrowseProducts([]);
    setIsBrowseResultsActive(false); // Reset to filter selection view
    // Optionally clear cache if desired when going fully "home"
    // setBrowseResultsCache(new Map());
    // Clear lifted filter selections
    setSelectedStoreIds(new Set());
    setSelectedCategories(new Set());
  };

  const goHome = () => {
    setActiveTab("browse");
    resetSearch();
    clearSelectedRetailer();
    setFilteredBrowseProducts([]);
    setIsBrowseResultsActive(false); // Reset to filter selection view
    // Optionally clear cache if desired when going fully "home"
    // setBrowseResultsCache(new Map());
  };

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
          activeTab={activeTab}
        />
        <MainContent
          activeTab={activeTab}
          searchQuery={searchQuery}
          searchResults={searchResults}
          totalResults={totalResults}
          isLoadingSearch={isLoadingSearch}
          searchError={searchError}
          hasMoreResults={hasMoreResults}
          loadMoreResults={loadMoreResults}
          rawRetailers={rawRetailers}
          verifiedRetailers={verifiedRetailers}
          isLoadingApiRetailers={isLoadingApiRetailers}
          isLoadingLogoVerification={isLoadingLogoVerification}
          onSingleRetailerClick={handleSingleRetailerLogoClick}
          retailerApiError={retailerApiError}
          getLogoPath={getLogoPath}
          singleRetailerProducts={selectedRetailerProducts}
          isLoadingSingleRetailer={appIsLoadingSingleRetailer}
          onFetchProductsByFilter={handleFetchProductsByFilter}
          filteredBrowseProducts={filteredBrowseProducts}
          isLoadingFilteredBrowseProducts={isLoadingFilteredBrowseProducts}
          // Browse view state management
          isBrowseResultsActive={isBrowseResultsActive}
          onToggleBrowseView={toggleBrowseView}
          // Pass lifted filter state and handlers
          selectedStoreIds={selectedStoreIds}
          selectedCategories={selectedCategories}
          onToggleStoreSelection={toggleStoreSelection}
          onToggleCategorySelection={toggleCategorySelection}
          onStoreModalConfirm={handleStoreModalConfirm}
          onCategoryModalConfirm={handleCategoryModalConfirm}
          // Pass setters if DefaultBrowseView needs to clear them directly (e.g. a "Clear All" button)
          // For now, goHome handles clearing. Individual toggles and modals manage selections.
          // setSelectedStoreIds={setSelectedStoreIds}
          // setSelectedCategories={setSelectedCategories}
        />
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
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
