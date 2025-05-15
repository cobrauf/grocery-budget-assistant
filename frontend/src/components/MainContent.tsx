import React from "react";
import SearchResultsView from "../views/SearchResultsView";
import DefaultSearchView from "../views/DefaultSearchView";
import DefaultBrowseView from "../views/DefaultBrowseView";
// BrowseResultsView will now be used by DefaultBrowseView, so not directly here
// import BrowseResultsView from "../views/BrowseResultsView";
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";
import { AppTab } from "../hooks/useAppTab";

interface MainContentProps {
  children?: React.ReactNode;
  activeTab: AppTab;

  // Search Tab Props
  searchQuery: string;
  searchResults: Product[];
  totalResults: number;
  isLoadingSearch: boolean;
  searchError: string | null;
  hasMoreResults: boolean;
  loadMoreResults: () => void;

  // Props for DefaultBrowseView (which will now also handle results display)
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  onSingleRetailerClick: (retailerId: number) => void;
  getLogoPath: (name: string) => string;
  // Props for single retailer product display
  singleRetailerProducts: Product[];
  isLoadingSingleRetailerProducts: boolean;
  // retailerProductsError: string | null; // If there's a specific error for single product fetching

  // Props for multi-filter product display
  onFetchProductsByFilter: (storeIds: string[], categories: string[]) => void;
  filteredBrowseProducts: Product[];
  isLoadingFilteredBrowseProducts: boolean;
  // filteredBrowseError: string | null; // If there's a specific error for multi-filter fetching
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  // Search props
  searchQuery,
  searchResults,
  totalResults,
  isLoadingSearch,
  searchError,
  hasMoreResults,
  loadMoreResults,
  // Browse props for DefaultBrowseView
  rawRetailers,
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  onSingleRetailerClick,
  getLogoPath,
  // Single retailer products
  singleRetailerProducts,
  isLoadingSingleRetailerProducts,
  // Multi-filter products
  onFetchProductsByFilter,
  filteredBrowseProducts,
  isLoadingFilteredBrowseProducts,
}) => {
  const mainContentStyle: React.CSSProperties = {
    padding: "0",
    paddingBottom: "60px",
    flexGrow: 1,
    backgroundColor: "var(--theme-background, #fff)",
    position: "relative",
  };

  const renderContent = () => {
    switch (activeTab) {
      case "browse":
        // DefaultBrowseView now handles its own content including results
        return (
          <DefaultBrowseView
            rawRetailers={rawRetailers}
            verifiedRetailers={verifiedRetailers}
            isLoadingApiRetailers={isLoadingApiRetailers}
            isLoadingLogoVerification={isLoadingLogoVerification}
            retailerApiError={retailerApiError}
            handleSingleRetailerClick={onSingleRetailerClick}
            getLogoPath={getLogoPath}
            // Single retailer products
            singleRetailerProducts={singleRetailerProducts}
            isLoadingSingleRetailerProducts={isLoadingSingleRetailerProducts}
            // Multi-filter products & handler
            handleFetchProductsByFilter={onFetchProductsByFilter}
            filteredBrowseProducts={filteredBrowseProducts}
            isLoadingFilteredBrowseProducts={isLoadingFilteredBrowseProducts}
            // retailerProductsError={retailerProductsError} // if available
            // filteredBrowseError={filteredBrowseError} // if available
          />
        );
      case "search":
        if (searchQuery || searchResults.length > 0 || isLoadingSearch) {
          return (
            <SearchResultsView
              searchQuery={searchQuery}
              items={searchResults}
              totalResults={totalResults}
              isLoading={isLoadingSearch}
              error={searchError}
              hasMore={hasMoreResults}
              loadMore={loadMoreResults}
            />
          );
        } else {
          return <DefaultSearchView />;
        }
      case "ai":
        return (
          <div style={{ textAlign: "center", paddingTop: "20px" }}>
            <h2>AI (WIP) Tab</h2>
            <p>AI features are a work in progress.</p>
          </div>
        );
      default:
        return (
          <div style={{ textAlign: "center", paddingTop: "20px" }}>
            Unknown Tab
          </div>
        );
    }
  };

  return <main style={mainContentStyle}>{renderContent()}</main>;
};

export default MainContent;
