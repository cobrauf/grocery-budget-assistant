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

  // Props for DefaultBrowseView
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  getLogoPath: (name: string) => string;

  // Props for product display (now unified for browse)
  onFetchProductsByFilter: (storeIds: string[], categories: string[]) => void;
  filteredBrowseProducts: Product[];
  isLoadingFilteredBrowseProducts: boolean;

  // Browse view state management
  isBrowseResultsActive: boolean;
  onToggleBrowseView: () => void;

  // Lifted state and handlers for browse filters from App.tsx
  selectedStoreIds: Set<number>;
  selectedCategories: Set<string>;
  onToggleStoreSelection: (id: number) => void;
  onToggleCategorySelection: (categoryName: string) => void;
  onStoreModalConfirm: (newSelectedIds: Set<number>) => void;
  onCategoryModalConfirm: (newSelectedNames: Set<string>) => void;
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
  getLogoPath,
  // Unified product props for browse
  onFetchProductsByFilter,
  filteredBrowseProducts,
  isLoadingFilteredBrowseProducts,
  // Browse view state
  isBrowseResultsActive,
  onToggleBrowseView,
  // Destructure new browse filter props
  selectedStoreIds,
  selectedCategories,
  onToggleStoreSelection,
  onToggleCategorySelection,
  onStoreModalConfirm,
  onCategoryModalConfirm,
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
        // Product display logic now solely uses filteredBrowseProducts
        const displayProducts = filteredBrowseProducts;
        const isLoadingDisplayProducts = isLoadingFilteredBrowseProducts;

        if (isBrowseResultsActive) {
          return (
            <BrowseResultsView
              items={displayProducts}
              isLoading={isLoadingDisplayProducts}
              error={null}
              // totalResults, hasMore, loadMore would need to be sourced from filteredBrowseProducts state if available
            />
          );
        } else {
          return (
            <DefaultBrowseView
              rawRetailers={rawRetailers}
              verifiedRetailers={verifiedRetailers}
              isLoadingApiRetailers={isLoadingApiRetailers}
              isLoadingLogoVerification={isLoadingLogoVerification}
              retailerApiError={retailerApiError}
              getLogoPath={getLogoPath}
              handleFetchProductsByFilter={onFetchProductsByFilter}
              isBrowseResultsActive={isBrowseResultsActive}
              onToggleBrowseView={onToggleBrowseView}
              selectedStoreIds={selectedStoreIds}
              selectedCategories={selectedCategories}
              onToggleStoreSelection={onToggleStoreSelection}
              onToggleCategorySelection={onToggleCategorySelection}
              onStoreModalConfirm={onStoreModalConfirm}
              onCategoryModalConfirm={onCategoryModalConfirm}
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
            <h2>AI Tab</h2>
            <p>(Coming soon)</p>
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
