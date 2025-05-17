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
  isLoadingSingleRetailer: boolean;
  // retailerProductsError: string | null; // If there's a specific error for single product fetching

  // Props for multi-filter product display
  onFetchProductsByFilter: (storeIds: string[], categories: string[]) => void;
  filteredBrowseProducts: Product[];
  isLoadingFilteredBrowseProducts: boolean;
  // filteredBrowseError: string | null; // If there's a specific error for multi-filter fetching

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
  // setSelectedStoreIds: (ids: Set<number>) => void; // Only if direct clearing from DBV is needed
  // setSelectedCategories: (categories: Set<string>) => void; // Only if direct clearing from DBV is needed
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
  isLoadingSingleRetailer,
  // Multi-filter products
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
  // setSelectedStoreIds, // Only if direct clearing from DBV is needed
  // setSelectedCategories, // Only if direct clearing from DBV is needed
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
        const showFilteredResults =
          filteredBrowseProducts.length > 0 || isLoadingFilteredBrowseProducts;

        const displayProducts = showFilteredResults
          ? filteredBrowseProducts
          : singleRetailerProducts;

        const isLoadingDisplayProducts = showFilteredResults
          ? isLoadingFilteredBrowseProducts
          : isLoadingSingleRetailer;

        if (isBrowseResultsActive) {
          return (
            <BrowseResultsView
              items={displayProducts}
              isLoading={isLoadingDisplayProducts}
              error={null} // Specific product fetching errors not currently passed to MainContent for browse
              // Props like totalResults, hasMore, loadMore will use defaults in BrowseResultsView/ResultsView or need to be plumbed if desired
              // totalResults={undefined} // Example: if we had this data
              // hasMore={false}
              // loadMore={() => {}}
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
              handleSingleRetailerClick={onSingleRetailerClick}
              getLogoPath={getLogoPath}
              singleRetailerProducts={singleRetailerProducts}
              isLoadingSingleRetailerProducts={isLoadingSingleRetailer}
              handleFetchProductsByFilter={onFetchProductsByFilter}
              filteredBrowseProducts={filteredBrowseProducts}
              isLoadingFilteredBrowseProducts={isLoadingFilteredBrowseProducts}
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
