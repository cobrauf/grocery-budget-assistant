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
import { useSort } from "./hooks/useSort"; // Import useSort hook
import { fetchProductsByFilter as apiFetchProductsByFilter } from "./services/api"; // Import the new API function
import { Product } from "./types/product"; // Ensure Product type is imported
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  LS_SELECTED_STORE_IDS,
  LS_SELECTED_CATEGORIES,
  LS_LAST_BROWSE_FILTER_KEY,
  LS_LAST_BROWSE_PRODUCTS,
} from "./utils/localStorageUtils"; // Import localStorage utilities

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
    searchResults,
    totalResults,
    isLoadingSearch,
    searchError,
    hasMoreResults,
    performSearch,
    loadMoreResults,
    resetSearch,
  } = useSearch();

  // Initialize sort state and actions
  const sortProps = useSort(); // This includes all sort state and setters

  const isSearchActive = activeTab === "search";

  const {
    rawRetailers,
    verifiedRetailers,
    isLoadingApiRetailers,
    isLoadingLogoVerification,
    retailerApiError,
    getLogoPath,
  } = useRetailers(isSearchActive);

  // State for multi-filter browse results
  const [filteredBrowseProducts, setFilteredBrowseProducts] = useState<
    Product[]
  >([]);
  const [isLoadingFilteredBrowseProducts, setIsLoadingFilteredBrowseProducts] =
    useState(false);

  // State to manage if the detailed browse results view is active vs. filter selection view
  const [isBrowseResultsActive, setIsBrowseResultsActive] = useState(false);

  // Cache for browse results
  const [browseResultsCache, setBrowseResultsCache] = useState<
    Map<string, Product[]>
  >(new Map());

  // Lifted state for Browse Tab filter selections
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<number>>(() => {
    const storedIds = loadFromLocalStorage<number[]>(LS_SELECTED_STORE_IDS, []);
    return new Set(storedIds);
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => {
      const storedCategories = loadFromLocalStorage<string[]>(
        LS_SELECTED_CATEGORIES,
        []
      );
      return new Set(storedCategories);
    }
  );

  // Save selectedStoreIds to local storage
  useEffect(() => {
    saveToLocalStorage(LS_SELECTED_STORE_IDS, Array.from(selectedStoreIds));
  }, [selectedStoreIds]);

  // Save selectedCategories to local storage
  useEffect(() => {
    saveToLocalStorage(LS_SELECTED_CATEGORIES, Array.from(selectedCategories));
  }, [selectedCategories]);

  // Effect to load cached browse results on app init
  useEffect(() => {
    // Ensure this runs after selectedStoreIds and selectedCategories are initialized from LS
    // This check is a proxy for that, assuming non-empty sets if filters were saved.
    // A more robust way might involve a separate state variable indicating hydration completion.
    const currentFilterKey = generateBrowseCacheKey(
      Array.from(selectedStoreIds).map(String),
      Array.from(selectedCategories)
    );
    const lastFilterKey = loadFromLocalStorage<string | null>(
      LS_LAST_BROWSE_FILTER_KEY,
      null
    );
    const lastProducts = loadFromLocalStorage<Product[]>(
      LS_LAST_BROWSE_PRODUCTS,
      []
    );

    if (
      lastFilterKey &&
      lastProducts &&
      lastProducts.length > 0 &&
      lastFilterKey === currentFilterKey
    ) {
      console.log("Loading browse results from local storage cache");
      setFilteredBrowseProducts(lastProducts);
      if (!browseResultsCache.has(currentFilterKey)) {
        setBrowseResultsCache((prevCache) =>
          new Map(prevCache).set(currentFilterKey, lastProducts)
        );
      }
    }
  }, [selectedStoreIds, selectedCategories]); // Dependencies to ensure it runs after LS hydration of filters

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

  const handleFetchProductsByFilter = async (
    storeIds: string[],
    categories: string[]
  ) => {
    const cacheKey = generateBrowseCacheKey(storeIds, categories);

    if (browseResultsCache.has(cacheKey)) {
      const cachedProducts = browseResultsCache.get(cacheKey)!;
      setFilteredBrowseProducts(cachedProducts);
      setIsLoadingFilteredBrowseProducts(false);
      setIsBrowseResultsActive(true);
      // Save to local storage as well, as this might be a cache hit from memory cache
      saveToLocalStorage(LS_LAST_BROWSE_FILTER_KEY, cacheKey);
      saveToLocalStorage(LS_LAST_BROWSE_PRODUCTS, cachedProducts);
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
      ); // Update memory cache
      // Save to local storage
      saveToLocalStorage(LS_LAST_BROWSE_FILTER_KEY, cacheKey);
      saveToLocalStorage(LS_LAST_BROWSE_PRODUCTS, products);
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
    const storeIdsAsString = Array.from(currentStoreIds).map(String);
    const categoryNames = Array.from(currentCategories);

    if (storeIdsAsString.length > 0 || categoryNames.length > 0) {
      handleFetchProductsByFilter(storeIdsAsString, categoryNames);
    } else {
      setFilteredBrowseProducts([]);
      setIsBrowseResultsActive(false);
    }
  };

  const handleStoreModalConfirm = (newStoreIds: Set<number>) => {
    setSelectedStoreIds(newStoreIds);
    // executeBrowseSearch(newStoreIds, selectedCategories);
  };

  const handleCategoryModalConfirm = (newCategories: Set<string>) => {
    setSelectedCategories(newCategories);
    // executeBrowseSearch(selectedStoreIds, newCategories);
  };

  const goHome = () => {
    setActiveTab("browse");
    setIsBrowseResultsActive(false);
  };

  return (
    <ThemeContext.Provider
      value={{ themeName: currentThemeName, setThemeName: setCurrentThemeName }}
    >
      <div
        className="app-container"
        data-theme={currentThemeName}
        style={{ fontFamily: currentFont.family }}
      >
        <Header
          onMenuClick={toggleSidebar}
          activeTab={activeTab}
          onSearch={handleNewSearch}
          isLoadingSearch={isLoadingSearch}
          onClearSearch={resetSearch}
          initialSearchQuery={searchQuery}
          isInBrowseResultsView={isBrowseResultsActive}
          onGoHome={goHome}
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
          retailerApiError={retailerApiError}
          getLogoPath={getLogoPath}
          onFetchProductsByFilter={handleFetchProductsByFilter}
          filteredBrowseProducts={filteredBrowseProducts}
          isLoadingFilteredBrowseProducts={isLoadingFilteredBrowseProducts}
          isBrowseResultsActive={isBrowseResultsActive}
          onToggleBrowseView={toggleBrowseView}
          selectedStoreIds={selectedStoreIds}
          selectedCategories={selectedCategories}
          onToggleStoreSelection={toggleStoreSelection}
          onToggleCategorySelection={toggleCategorySelection}
          onStoreModalConfirm={handleStoreModalConfirm}
          onCategoryModalConfirm={handleCategoryModalConfirm}
          sortProps={sortProps}
        />
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <SideBar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          currentThemeName={currentThemeName}
          onSelectTheme={setCurrentThemeName}
          currentFont={currentFont}
          onSelectFont={setCurrentFont}
          onGoHome={goHome}
        />
        <FullOverlay isOpen={isSidebarOpen} onClick={toggleSidebar} />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
