import React, { useEffect } from "react";
// import SponsoredAd from "./main/SponsoredAd";
import SearchResultsView from "../views/SearchResultsView";
import RetailerLogosView from "../views/RetailerLogosView";
import { Product } from "../types/product";
import FullOverlay from "./common/FullOverlay";
import LoadingSpinner from "./common/LoadingSpinner";
import { useRetailers } from "../hooks/useRetailers";

// Updated props: Rely on props passed from App (which uses useSearch)
interface MainContentProps {
  children?: React.ReactNode; // Made optional as it's only for the test button now
  searchQuery: string;
  searchResults: Product[];
  totalResults: number;
  isLoadingSearch: boolean;
  searchError: string | null;
  hasMoreResults: boolean;
  loadMoreResults: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  children, // Keep children for potential flexibility or the test button
  searchQuery,
  searchResults,
  totalResults,
  isLoadingSearch,
  searchError,
  hasMoreResults,
  loadMoreResults,
}) => {
  // Determine if a search is active (query exists or results are present)
  const isSearchActive =
    !!searchQuery ||
    searchResults.length > 0 ||
    isLoadingSearch ||
    !!searchError;

  // Use the retailers hook
  const {
    rawRetailers,
    verifiedRetailers,
    selectedRetailerProducts,
    isLoadingApiRetailers,
    isLoadingLogoVerification,
    isLoadingRetailerProducts,
    retailerApiError,
    handleRetailerClick,
    getLogoPath,
    clearSelectedRetailer, // Get the clear function
  } = useRetailers(isSearchActive); // Pass search status to the hook

  // Effect to clear retailer selection when a new search starts
  useEffect(() => {
    if (isSearchActive) {
      clearSelectedRetailer();
    }
  }, [isSearchActive, clearSelectedRetailer]);

  const mainContentStyle: React.CSSProperties = {
    padding: "0", // Remove padding if sub-components handle it
    flexGrow: 1,
    backgroundColor: "var(--theme-background, #fff)", // Main content background
    position: "relative", // For overlay positioning
  };

  const showLoadingState = isLoadingApiRetailers || isLoadingLogoVerification;
  const showSearchResultsView =
    searchQuery || searchResults.length > 0 || isLoadingSearch || !!searchError;

  // Determine if we should show products from a selected retailer
  // Ensure search results view takes precedence
  const showRetailerProductsView =
    selectedRetailerProducts.length > 0 && !showSearchResultsView;

  return (
    <main style={mainContentStyle}>
      {showLoadingState && (
        <FullOverlay isOpen={true} isTransparent={false}>
          <LoadingSpinner />
        </FullOverlay>
      )}

      {isLoadingRetailerProducts && !showLoadingState && (
        <FullOverlay isOpen={true} isTransparent={false}>
          <LoadingSpinner />
        </FullOverlay>
      )}

      {showSearchResultsView ? (
        <SearchResultsView
          searchQuery={searchQuery}
          items={searchResults}
          totalResults={totalResults}
          isLoading={isLoadingSearch}
          error={searchError}
          hasMore={hasMoreResults}
          loadMore={loadMoreResults}
        />
      ) : showRetailerProductsView ? (
        <SearchResultsView
          searchQuery={
            verifiedRetailers.find(
              (r) => r.id === selectedRetailerProducts[0]?.retailer_id
            )?.name || `Products`
          }
          items={selectedRetailerProducts}
          totalResults={selectedRetailerProducts.length}
          isLoading={isLoadingRetailerProducts}
          error={retailerApiError}
          hasMore={false}
          loadMore={() => {}}
        />
      ) : (
        <RetailerLogosView
          rawRetailers={rawRetailers}
          verifiedRetailers={verifiedRetailers}
          isLoadingApiRetailers={isLoadingApiRetailers}
          isLoadingLogoVerification={isLoadingLogoVerification}
          retailerApiError={retailerApiError}
          handleRetailerClick={handleRetailerClick}
          getLogoPath={getLogoPath}
        >
          {children}
        </RetailerLogosView>
      )}
    </main>
  );
};

export default MainContent;
