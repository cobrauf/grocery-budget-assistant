import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import "./styles/App.css";
// import { api } from "./services/api";
import Header from "./components/header/Header";
import MainContent from "./components/MainContent";
import BottomNav from "./components/common/BottomNav";
import SideBar from "./components/sidebar/SideBar";
import FullOverlay from "./components/common/FullOverlay";
import { useTheme as useAppTheme } from "./hooks/useTheme"; // Renamed import to avoid conflict
import { useSearch } from "./hooks/useSearch"; // Import search hook
import { useRetailers } from "./hooks/useRetailers"; // Import retailers hook
import { useAppTab } from "./hooks/useAppTab"; // Import useAppTab
import { useSort } from "./hooks/useSort"; // Import useSort hook
import { useViewHistory } from "./hooks/useViewHistory"; // Import view history hook
import { fetchProductsByFilter as apiFetchProductsByFilter } from "./services/api"; // Import the new API function
import { Product } from "./types/product"; // Ensure Product type is imported
import { SortField, SortDirection } from "./types/sort"; // Import sort types
import { sortProducts } from "./utils/sortingUtils"; // Import sortProducts utility
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  LS_SELECTED_STORE_IDS,
  LS_SELECTED_CATEGORIES,
  LS_APP_THEME,
  LS_FRONT_PAGE_ONLY_TOGGLE,
  LS_LAST_BROWSE_FILTER_KEY,
  LS_LAST_BROWSE_PRODUCTS,
  LS_FAVORITE_ITEMS,
  LS_IS_BROWSE_RESULTS_ACTIVE,
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
  // Scroll-based navigation state
  const [areNavBarsVisible, setAreNavBarsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { currentThemeName, setCurrentThemeName, currentFont, setCurrentFont } =
    useAppTheme();

  const { activeTab, setActiveTab, viewMode, setViewMode } = useAppTab();

  const {
    searchQuery,
    searchResults,
    searchHistory,
    totalResults,
    isLoadingSearch,
    searchError,
    hasMoreResults,
    performSearch,
    loadMoreResults,
    resetSearch,
    removeFromSearchHistory,
  } = useSearch();

  // Initialize sort state and actions
  const sortProps = useSort(); // This includes all sort state and setters
  const {
    activeSortField,
    priceSortDirection,
    storeSortDirection,
    categorySortDirection,
    dateSortDirection,
  } = sortProps;

  // Favorites state
  const [favoriteItems, setFavoriteItems] = useState<Product[]>(() => {
    return loadFromLocalStorage<Product[]>(LS_FAVORITE_ITEMS, []);
  });

  // State to track if favorites list needs an update
  const [needsFavoriteListUpdate, setNeedsFavoriteListUpdate] = useState(false);

  // Save favorites to local storage whenever they change
  useEffect(() => {
    saveToLocalStorage(LS_FAVORITE_ITEMS, favoriteItems);
  }, [favoriteItems]);

  // Favorites functions
  const addFavorite = useCallback((product: Product) => {
    setFavoriteItems((prevFavorites) => {
      // Check if product is already in favorites using a composite key
      const isAlreadyFavorite = prevFavorites.some(
        (p) => p.id === product.id && p.retailer_id === product.retailer_id
      );

      if (isAlreadyFavorite) {
        return prevFavorites;
      }

      return [...prevFavorites, product];
    });
  }, []);

  const removeFavorite = useCallback(
    (productId: string, retailerId: number) => {
      setFavoriteItems((prevFavorites) => {
        const updatedFavorites = prevFavorites.filter(
          (p) => !(p.id === productId && p.retailer_id === retailerId)
        );

        // If we're removing a favorite while on the favorites tab, set needsFavoriteListUpdate to true
        if (activeTab === "favorites") {
          setNeedsFavoriteListUpdate(true);
        }

        return updatedFavorites;
      });
    },
    [activeTab]
  );

  const isFavorite = useCallback(
    (productId: string, retailerId: number) => {
      return favoriteItems.some(
        (p) => p.id === productId && p.retailer_id === retailerId
      );
    },
    [favoriteItems]
  );

  // Apply the current sort to favorites
  const displayedFavoriteProducts = useMemo(() => {
    let direction: SortDirection;
    if (activeSortField === "price") direction = priceSortDirection;
    else if (activeSortField === "store") direction = storeSortDirection;
    else if (activeSortField === "date") direction = dateSortDirection;
    else direction = categorySortDirection;

    return sortProducts(favoriteItems, activeSortField, direction);
  }, [
    favoriteItems,
    activeSortField,
    priceSortDirection,
    storeSortDirection,
    categorySortDirection,
    dateSortDirection,
  ]);

  // Apply the current sort to search results
  const displayedSearchResults = useMemo(() => {
    let direction: SortDirection;
    if (activeSortField === "price") direction = priceSortDirection;
    else if (activeSortField === "store") direction = storeSortDirection;
    else if (activeSortField === "date") direction = dateSortDirection;
    else direction = categorySortDirection; // Fallback or ensure 'category' is a valid SortField

    // Ensure searchResults is always an array, even if undefined initially from useSearch
    return sortProducts(searchResults || [], activeSortField, direction);
  }, [
    searchResults,
    activeSortField,
    priceSortDirection,
    storeSortDirection,
    categorySortDirection,
    dateSortDirection,
  ]);

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
  const [isBrowseResultsActive, setIsBrowseResultsActive] = useState<boolean>(
    () => {
      return loadFromLocalStorage<boolean>(LS_IS_BROWSE_RESULTS_ACTIVE, false);
    }
  );

  // Keep isBrowseResultsActive in sync with viewMode.browse
  useEffect(() => {
    setIsBrowseResultsActive(viewMode.browse === "results");
  }, [viewMode.browse]);

  // Save isBrowseResultsActive to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(LS_IS_BROWSE_RESULTS_ACTIVE, isBrowseResultsActive);
  }, [isBrowseResultsActive]);

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

  // // Add effect for beforeunload confirmation
  // useEffect(() => {
  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     event.preventDefault();
  //     // Standard for most browsers, but Chrome requires returnValue to be set.
  //     event.returnValue = "";
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // State for last fetched browse criteria (including front page only mode)
  const [lastFetchedBrowseCriteria, setLastFetchedBrowseCriteria] = useState<{
    storeIds: string[];
    categories: string[];
    isFrontPageOnlyMode: boolean;
  } | null>(null);

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
    performSearch(query);
    // Set search view mode to results when performing a search
    setViewMode("search", "results");
  };

  const handleFetchProductsByFilter = async (
    storeIds: string[],
    categories: string[],
    isFrontPageOnlyMode: boolean
  ) => {
    const cacheKey = generateBrowseCacheKey(
      storeIds,
      categories,
      isFrontPageOnlyMode
    );

    if (browseResultsCache.has(cacheKey)) {
      const cachedProducts = browseResultsCache.get(cacheKey)!;
      setFilteredBrowseProducts(cachedProducts);
      setViewMode("browse", "results");
      // Also update localStorage so the *next* reload is fast
      saveToLocalStorage(LS_LAST_BROWSE_FILTER_KEY, cacheKey);
      saveToLocalStorage(LS_LAST_BROWSE_PRODUCTS, cachedProducts);
      return;
    }

    setViewMode("browse", "results");
    setIsLoadingFilteredBrowseProducts(true);
    setFilteredBrowseProducts([]);
    try {
      const products = await apiFetchProductsByFilter(
        storeIds,
        categories,
        "current",
        isFrontPageOnlyMode
      );
      setFilteredBrowseProducts(products);
      browseResultsCache.set(cacheKey, products);
      // Also save to localStorage for persistence across reloads
      saveToLocalStorage(LS_LAST_BROWSE_FILTER_KEY, cacheKey);
      saveToLocalStorage(LS_LAST_BROWSE_PRODUCTS, products);

      setLastFetchedBrowseCriteria({
        storeIds,
        categories,
        isFrontPageOnlyMode,
      });
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      setViewMode("browse", "default");
    }
    setIsLoadingFilteredBrowseProducts(false);
  };

  const toggleBrowseView = () => {
    // Just toggle the viewMode, and let the useEffect update isBrowseResultsActive
    setViewMode(
      "browse",
      viewMode.browse === "default" ? "results" : "default"
    );
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

    if (
      storeIdsAsString.length > 0 ||
      categoryNames.length > 0 ||
      isFrontPageOnly
    ) {
      handleFetchProductsByFilter(
        storeIdsAsString,
        categoryNames,
        isFrontPageOnly
      );
    } else {
      setFilteredBrowseProducts([]);
      setViewMode("browse", "default");
    }
  };

  const handleStoreModalConfirm = (newStoreIds: Set<number>) => {
    setSelectedStoreIds(newStoreIds);
    if (isBrowseResultsActive) {
      executeBrowseSearch(newStoreIds, selectedCategories);
    }
  };

  const handleCategoryModalConfirm = (newCategories: Set<string>) => {
    setSelectedCategories(newCategories);
    if (isBrowseResultsActive) {
      executeBrowseSearch(selectedStoreIds, newCategories);
    }
  };

  const goHome = () => {
    setActiveTab("browse");
    setViewMode("browse", "default");
  };

  // --- Derived sorted product lists ---
  const displayedBrowseProducts = useMemo(() => {
    let direction: SortDirection;
    if (activeSortField === "price") direction = priceSortDirection;
    else if (activeSortField === "store") direction = storeSortDirection;
    else if (activeSortField === "date") direction = dateSortDirection;
    else direction = categorySortDirection;

    return sortProducts(filteredBrowseProducts, activeSortField, direction);
  }, [
    filteredBrowseProducts,
    activeSortField,
    priceSortDirection,
    storeSortDirection,
    categorySortDirection,
    dateSortDirection,
  ]);

  const handleMainContentScroll = useCallback(
    (currentScrollY: number) => {
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = window.innerHeight / 3;
      const delta = Math.abs(currentScrollY - lastScrollY);

      // Ignore tiny scroll amounts
      if (delta < 10) return;

      // Show navbars if near top
      if (currentScrollY <= 50) {
        setAreNavBarsVisible(true);
      }
      // Hide when scrolling down past threshold
      else if (scrollingDown && currentScrollY > scrollThreshold) {
        setAreNavBarsVisible(false);
      }
      // Show when scrolling up
      else if (!scrollingDown) {
        setAreNavBarsVisible(true);
      }

      setLastScrollY(currentScrollY);
    },
    [lastScrollY]
  );

  // Initialize browser history management
  useViewHistory({
    activeTab,
    isBrowseResultsActive,
    searchQuery,
    searchResults,
    favoriteItems,
    setActiveTab,
    setIsBrowseResultsActive,
    resetSearch,
  });

  // Near other state variables
  const [isFrontPageOnly, setIsFrontPageOnly] = useState<boolean>(() => {
    return loadFromLocalStorage<boolean>(LS_FRONT_PAGE_ONLY_TOGGLE, false);
  });
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Near other useEffects
  useEffect(() => {
    saveToLocalStorage(LS_FRONT_PAGE_ONLY_TOGGLE, isFrontPageOnly);
  }, [isFrontPageOnly]);

  // Effect to load cached browse results on app init ONLY
  useEffect(() => {
    if (!isInitialLoad) return; // Only run on initial load

    const currentFilterKey = generateBrowseCacheKey(
      Array.from(selectedStoreIds).map(String),
      Array.from(selectedCategories),
      isFrontPageOnly
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
      // Also set the view mode to results so the products are displayed
      setViewMode("browse", "results");
      if (!browseResultsCache.has(currentFilterKey)) {
        setBrowseResultsCache((prevCache) =>
          new Map(prevCache).set(currentFilterKey, lastProducts)
        );
      }
    }

    setIsInitialLoad(false); // Mark initial load as complete
  }, [selectedStoreIds, selectedCategories, isFrontPageOnly, isInitialLoad]); // Dependencies to ensure it runs after LS hydration of filters

  const generateBrowseCacheKey = (
    storeIds: string[],
    categories: string[],
    isFrontPageOnlyMode: boolean
  ): string => {
    const sortedStoreIds = [...storeIds].sort().join(",");
    const sortedCategories = isFrontPageOnlyMode
      ? ""
      : [...categories].sort().join(",");
    return `stores:${sortedStoreIds}_categories:${sortedCategories}_fp:${isFrontPageOnlyMode}`;
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
          onClearSearch={() => {
            resetSearch();
            // Set search view mode to default when clearing search
            setViewMode("search", "default");
          }}
          initialSearchQuery={searchQuery}
          isInBrowseResultsView={isBrowseResultsActive}
          onGoHome={goHome}
          areNavBarsVisible={areNavBarsVisible}
        />
        <MainContent
          onResultsViewScroll={handleMainContentScroll}
          activeTab={activeTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          areNavBarsVisible={areNavBarsVisible}
          // Search Tab Props
          searchQuery={searchQuery}
          searchResults={displayedSearchResults}
          searchHistory={searchHistory}
          performSearch={handleNewSearch}
          totalResults={totalResults}
          isLoadingSearch={isLoadingSearch}
          searchError={searchError}
          hasMoreResults={hasMoreResults}
          loadMoreResults={loadMoreResults}
          removeFromSearchHistory={removeFromSearchHistory}
          // Browse Tab Props
          rawRetailers={rawRetailers}
          verifiedRetailers={verifiedRetailers}
          isLoadingApiRetailers={isLoadingApiRetailers}
          isLoadingLogoVerification={isLoadingLogoVerification}
          retailerApiError={retailerApiError}
          getLogoPath={getLogoPath}
          onFetchProductsByFilter={handleFetchProductsByFilter}
          filteredBrowseProducts={displayedBrowseProducts}
          isLoadingFilteredBrowseProducts={isLoadingFilteredBrowseProducts}
          isBrowseResultsActive={isBrowseResultsActive}
          onToggleBrowseView={toggleBrowseView}
          selectedStoreIds={selectedStoreIds}
          selectedCategories={selectedCategories}
          onToggleStoreSelection={toggleStoreSelection}
          onToggleCategorySelection={toggleCategorySelection}
          onStoreModalConfirm={handleStoreModalConfirm}
          onCategoryModalConfirm={handleCategoryModalConfirm}
          // Sort Props
          sortProps={sortProps}
          // Favorites Props
          favoriteItems={favoriteItems}
          displayedFavoriteProducts={displayedFavoriteProducts}
          addFavorite={addFavorite}
          removeFavorite={removeFavorite}
          isFavorite={isFavorite}
          needsFavoriteListUpdate={needsFavoriteListUpdate}
          onFavoriteListUpdate={() => setNeedsFavoriteListUpdate(false)}
          // New props
          isFrontPageOnly={isFrontPageOnly}
          setIsFrontPageOnly={setIsFrontPageOnly}
        />
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          areNavBarsVisible={areNavBarsVisible}
          favoriteItems={favoriteItems}
          viewMode={viewMode}
        />
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
