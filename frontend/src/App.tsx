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
  // Add error state if needed: const [filteredBrowseError, setFilteredBrowseError] = useState<string | null>(null);

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
    setFilteredBrowseProducts([]); // Clear multi-filter results when single retailer is clicked
    await fetchSingleRetailerProductsLogic(retailerId);
    // No need to setActiveTab, browse tab is already active
  };

  // For multi-filter selection from DefaultBrowseView
  const handleFetchProductsByFilter = async (
    storeIds: string[],
    categories: string[]
  ) => {
    clearSelectedRetailer(); // Clear single retailer results
    setIsLoadingFilteredBrowseProducts(true);
    setFilteredBrowseProducts([]);
    // setFilteredBrowseError(null); // Reset error
    try {
      const products = await apiFetchProductsByFilter(storeIds, categories);
      setFilteredBrowseProducts(products);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      // setFilteredBrowseError("Failed to fetch products based on your filters.");
    } finally {
      setIsLoadingFilteredBrowseProducts(false);
    }
  };

  const clearSearchLocal = () => {
    setSearchQuery("");
    if (activeTab === "search") {
    }
  };

  const goHome = () => {
    setActiveTab("browse");
    resetSearch();
    clearSelectedRetailer();
    setFilteredBrowseProducts([]); // Clear filtered browse results when going home
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
          onSingleRetailerClick={handleSingleRetailerLogoClick} // Updated prop name
          retailerApiError={retailerApiError}
          getLogoPath={getLogoPath}
          // For single retailer selection results
          singleRetailerProducts={selectedRetailerProducts}
          isLoadingSingleRetailerProducts={isLoadingRetailerProducts}
          // For multi-filter results
          onFetchProductsByFilter={handleFetchProductsByFilter}
          filteredBrowseProducts={filteredBrowseProducts}
          isLoadingFilteredBrowseProducts={isLoadingFilteredBrowseProducts}
          // filteredBrowseError={filteredBrowseError} // Pass error if using
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
