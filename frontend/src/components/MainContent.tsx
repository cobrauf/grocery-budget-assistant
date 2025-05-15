import React from "react";
// import SearchResultsView from "../views/SearchResultsView";
// import DefaultBrowseView from "../views/DefaultBrowseView";
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";
// import { AppView } from "../hooks/useAppView";
import { AppTab } from "../hooks/useAppTab"; // Import AppTab

interface MainContentProps {
  children?: React.ReactNode;
  // currentViewType: AppView; // Remove old prop
  activeTab: AppTab; // Add new prop

  // Props that will be used by specific tab views later
  searchQuery: string;
  searchResults: Product[];
  totalResults: number;
  isLoadingSearch: boolean;
  searchError: string | null;
  hasMoreResults: boolean;
  loadMoreResults: () => void;
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  onRetailerClick: (retailerId: number) => void;
  getLogoPath: (name: string) => string;
  retailerProducts: Product[];
  isLoadingRetailerProducts: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  children,
  // currentViewType,
  activeTab,
  searchQuery,
  searchResults,
  totalResults,
  isLoadingSearch,
  searchError,
  hasMoreResults,
  loadMoreResults,
  rawRetailers,
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  onRetailerClick,
  getLogoPath,
  retailerProducts,
  isLoadingRetailerProducts,
}) => {
  const mainContentStyle: React.CSSProperties = {
    padding: "1rem", // Added some padding for visibility of messages
    paddingBottom: "70px", // Ensure content doesn't hide behind fixed bottom nav
    flexGrow: 1,
    backgroundColor: "var(--theme-background, #fff)",
    position: "relative",
    textAlign: "center", // Center placeholder text
  };

  const renderContent = () => {
    switch (activeTab) {
      case "browse":
        // Placeholder for Browse content
        // Later, this will render DefaultBrowseView or BrowseResultsView
        return (
          <div>
            <h2>Browse Tab Content</h2>
            <p>Displaying content for the Browse tab.</p>
            {/* Example of how DefaultBrowseView might be integrated later
            <DefaultBrowseView
              rawRetailers={rawRetailers}
              verifiedRetailers={verifiedRetailers}
              isLoadingApiRetailers={isLoadingApiRetailers}
              isLoadingLogoVerification={isLoadingLogoVerification}
              retailerApiError={retailerApiError}
              handleRetailerClick={onRetailerClick}
              getLogoPath={getLogoPath}
            >
              {children}
            </DefaultBrowseView>
            */}
          </div>
        );
      case "search":
        // Placeholder for Search content
        // Later, this will render DefaultSearchView or SearchResultsView
        return (
          <div>
            <h2>Search Tab Content</h2>
            <p>Displaying content for the Search tab.</p>
            {/* Example of how SearchResultsView might be integrated later
            {searchQuery && (
              <SearchResultsView
                searchQuery={searchQuery}
                items={searchResults}
                totalResults={totalResults}
                isLoading={isLoadingSearch}
                error={searchError}
                hasMore={hasMoreResults}
                loadMore={loadMoreResults}
              />
            )}
            */}
          </div>
        );
      case "ai":
        // Placeholder for AI content
        return (
          <div>
            <h2>AI (WIP) Tab Content</h2>
            <p>Displaying content for the AI tab (Work In Progress).</p>
          </div>
        );
      default:
        return <div>Unknown Tab</div>;
    }
  };

  return <main style={mainContentStyle}>{renderContent()}</main>;
};

export default MainContent;
