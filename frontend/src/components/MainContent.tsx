import React from "react";
import SearchResultsView from "../views/SearchResultsView";
import DefaultSearchView from "../views/DefaultSearchView";
import DefaultBrowseView from "../views/DefaultBrowseView";
import BrowseResultsView from "../views/BrowseResultsView";
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

  // Browse Tab Props (some from useRetailers, will be adapted/moved to useBrowse later)
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  onRetailerClick: (retailerId: number) => void; // For DefaultBrowseView to trigger single retailer product load
  getLogoPath: (name: string) => string;

  // Props for BrowseResultsView (when single retailer is clicked, or filters applied)
  retailerProducts: Product[]; // Products for the selected retailer / browse filters
  isLoadingRetailerProducts: boolean; // Loading state for the above
  // We might need a way to get the name of the retailer for filterDescription
  // For now, App.tsx will need to manage this or pass it if retailerProducts are specific to one retailer
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
  // Browse props (for DefaultBrowseView)
  rawRetailers,
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  onRetailerClick,
  getLogoPath,
  // Browse props (for BrowseResultsView)
  retailerProducts,
  isLoadingRetailerProducts,
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
        // If retailerProducts are loaded (e.g., after clicking a retailer in DefaultBrowseView)
        // or if we are currently loading them, show BrowseResultsView.
        if (isLoadingRetailerProducts || retailerProducts.length > 0) {
          let description = "Filtered Results";
          if (retailerProducts.length > 0 && retailerProducts[0]?.retailer_id) {
            const retailer = verifiedRetailers.find(
              (r) => r.id === retailerProducts[0].retailer_id
            );
            if (retailer) description = retailer.name;
          }
          return (
            <BrowseResultsView
              items={retailerProducts}
              isLoading={isLoadingRetailerProducts}
              error={null} // Assuming retailerApiError from useRetailers is for logo/list fetching, not product fetching error here
              filterDescription={description}
              // totalResults and pagination can be added later if needed for browse results
            />
          );
        } else {
          // Otherwise, show the default view for browsing (filters, retailer logos, categories)
          return (
            <DefaultBrowseView
              rawRetailers={rawRetailers}
              verifiedRetailers={verifiedRetailers}
              isLoadingApiRetailers={isLoadingApiRetailers}
              isLoadingLogoVerification={isLoadingLogoVerification}
              retailerApiError={retailerApiError}
              handleRetailerClick={onRetailerClick} // This will trigger loading retailerProducts
              getLogoPath={getLogoPath}
            />
          );
        }
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
