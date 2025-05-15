import React from "react";
import SearchResultsView from "../views/SearchResultsView";
import DefaultSearchView from "../views/DefaultSearchView";
import DefaultBrowseView from "../views/DefaultBrowseView";
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
  rawRetailers: React.ComponentProps<typeof DefaultBrowseView>["rawRetailers"]; // Assuming DefaultBrowseView will be used
  verifiedRetailers: React.ComponentProps<
    typeof DefaultBrowseView
  >["verifiedRetailers"];
  isLoadingApiRetailers: React.ComponentProps<
    typeof DefaultBrowseView
  >["isLoadingApiRetailers"];
  isLoadingLogoVerification: React.ComponentProps<
    typeof DefaultBrowseView
  >["isLoadingLogoVerification"];
  retailerApiError: React.ComponentProps<
    typeof DefaultBrowseView
  >["retailerApiError"];
  onRetailerClick: React.ComponentProps<
    typeof DefaultBrowseView
  >["handleRetailerClick"];
  getLogoPath: React.ComponentProps<typeof DefaultBrowseView>["getLogoPath"];
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
    padding: "0", // Remove padding, let views manage their own
    paddingBottom: "60px", // Ensure content doesn't hide behind fixed bottom nav (height of nav)
    flexGrow: 1,
    backgroundColor: "var(--theme-background, #fff)",
    position: "relative",
    // textAlign: "center", // Remove global text align, let views manage
  };

  const renderContent = () => {
    switch (activeTab) {
      case "browse":
        // Placeholder for Browse content. Will later use DefaultBrowseView and BrowseResultsView.
        return (
          <div style={{ textAlign: "center", paddingTop: "20px" }}>
            <h2>Browse Tab</h2>
            <p>
              This is where browsing content will go (e.g., DefaultBrowseView).
            </p>
            {/* <DefaultBrowseView 
              rawRetailers={rawRetailers}
              verifiedRetailers={verifiedRetailers}
              isLoadingApiRetailers={isLoadingApiRetailers}
              isLoadingLogoVerification={isLoadingLogoVerification}
              retailerApiError={retailerApiError}
              handleRetailerClick={onRetailerClick}
              getLogoPath={getLogoPath}
            /> */}
          </div>
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
        // Should not happen with AppTab type safety
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
