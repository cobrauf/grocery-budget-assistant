import React, { useState } from "react";
import SearchResultsView from "../views/SearchResultsView";
import DefaultSearchView from "../views/DefaultSearchView";
import DefaultBrowseView from "../views/DefaultBrowseView";
import BrowseResultsView from "../views/BrowseResultsView";
import SortPillsBar from "./common/SortPillsBar";
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";
import { AppTab } from "../hooks/useAppTab";
import { SortStateAndActions } from "../types/sort";
import StoreFilterModal from "./modals/StoreFilterModal";
import CategoryFilterModal from "./modals/CategoryFilterModal";
import "../styles/DefaultBrowseView.css";

// This should ideally be in a shared constants file
const PRODUCT_CATEGORIES_WITH_ICONS: { name: string; icon: string }[] = [
  { name: "Fresh Produce", icon: "🥦" },
  { name: "Fruits", icon: "🍓" },
  { name: "Dairy", icon: "🥛" },
  { name: "Meats", icon: "🥩" },
  { name: "Seafood", icon: "🐟" },
  { name: "Baked Goods", icon: "🍞" },
  { name: "Snacks", icon: "🥨" },
  { name: "Beverages", icon: "🥤" },
  { name: "Frozen Foods", icon: "🧊" },
  { name: "Dry Goods", icon: "🥫" },
  { name: "Deli", icon: "🥪" },
  { name: "Alcoholic Bev", icon: "🍹" },
  { name: "Breakfast", icon: "🥞" },
  { name: "Canned Goods", icon: "🥫" },
  { name: "Condiments", icon: "🧂" },
  { name: "Baking", icon: "🍰" },
  { name: "Household Prod", icon: "🧼" },
  { name: "Personal Care", icon: "🧴" },
  { name: "Pet Products", icon: "🐾" },
  { name: "Candy", icon: "🍬" },
  { name: "Gifts", icon: "🎁" },
  { name: "Flowers-Plants", icon: "💐" },
  { name: "Garden", icon: "🪴" },
  { name: "Outdoors", icon: "🏕️" },
  { name: "Kitchen", icon: "🍳" },
  { name: "Kids", icon: "🧸" },
  { name: "Furniture", icon: "🛋️" },
  { name: "Other", icon: "❓" },
];

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

  // Props for Browse Tab (some used by header, some by DefaultBrowseView/BrowseResultsView)
  rawRetailers: Retailer[]; // For StoreFilterModal
  verifiedRetailers: Retailer[]; // For StoreFilterModal & DefaultBrowseView
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  getLogoPath: (name: string) => string;

  onFetchProductsByFilter: (storeIds: string[], categories: string[]) => void;
  filteredBrowseProducts: Product[];
  isLoadingFilteredBrowseProducts: boolean;

  isBrowseResultsActive: boolean;
  onToggleBrowseView: () => void;

  selectedStoreIds: Set<number>;
  selectedCategories: Set<string>;
  onToggleStoreSelection: (id: number) => void; // For DefaultBrowseView
  onToggleCategorySelection: (categoryName: string) => void; // For DefaultBrowseView
  onStoreModalConfirm: (newSelectedIds: Set<number>) => void; // For StoreFilterModal
  onCategoryModalConfirm: (newSelectedNames: Set<string>) => void; // For CategoryFilterModal

  // Sort Props
  sortProps: SortStateAndActions;
}

const MainContent: React.FC<MainContentProps> = ({
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
  getLogoPath,
  onFetchProductsByFilter,
  filteredBrowseProducts,
  isLoadingFilteredBrowseProducts,
  isBrowseResultsActive,
  onToggleBrowseView,
  selectedStoreIds,
  selectedCategories,
  onToggleStoreSelection,
  onToggleCategorySelection,
  onStoreModalConfirm,
  onCategoryModalConfirm,
  sortProps,
}) => {
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const mainContentStyle: React.CSSProperties = {
    padding: "0",
    paddingBottom: "60px",
    flexGrow: 1,
    backgroundColor: "var(--theme-background, #fff)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  };

  const browseContentContainerStyle: React.CSSProperties = {
    flexGrow: 1,
    overflowY: "auto",
    position: "relative",
  };

  const canShowItems = selectedStoreIds.size > 0 || selectedCategories.size > 0;

  const handleShowItemsClick = () => {
    if (canShowItems) {
      const storeIdsAsString = Array.from(selectedStoreIds).map(String);
      const categoryNames = Array.from(selectedCategories);
      onFetchProductsByFilter(storeIdsAsString, categoryNames);
    } else {
      console.log("Show Items clicked with no selection.");
    }
  };

  const storeButtonText =
    selectedStoreIds.size > 0 ? `Stores (${selectedStoreIds.size})` : "+ Store";
  const categoryButtonText =
    selectedCategories.size > 0
      ? `Categ. (${selectedCategories.size})`
      : "+ Categ.";

  const showHeaderBackArrow = isBrowseResultsActive;
  const showHeaderForwardArrow = !isBrowseResultsActive && canShowItems;

  const handleLocalStoreModalConfirm = (newSelectedIds: Set<number>) => {
    setIsStoreModalOpen(false);
    onStoreModalConfirm(newSelectedIds);
  };

  const handleLocalCategoryModalConfirm = (newSelectedNames: Set<string>) => {
    setIsCategoryModalOpen(false);
    onCategoryModalConfirm(newSelectedNames);
  };

  const renderBrowseFilterHeader = () => {
    return (
      <div className="filters-header">
        {showHeaderBackArrow && (
          <button
            onClick={onToggleBrowseView}
            className="browse-nav-arrow back-arrow"
          >
            {"<<"}
          </button>
        )}
        <span className={isBrowseResultsActive ? "filters-title-indented" : ""}>
          Filters:
        </span>
        <button
          className={`filter-button ${
            selectedStoreIds.size > 0 ? "active-filter" : ""
          }`}
          onClick={() => setIsStoreModalOpen(true)}
        >
          {storeButtonText}
        </button>
        <button
          className={`filter-button ${
            selectedCategories.size > 0 ? "active-filter" : ""
          }`}
          onClick={() => setIsCategoryModalOpen(true)}
        >
          {categoryButtonText}
        </button>
        {showHeaderForwardArrow && (
          <button
            onClick={handleShowItemsClick}
            className="browse-nav-arrow forward-arrow"
          >
            {">>"}
          </button>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "browse":
        return (
          <>
            {renderBrowseFilterHeader()}
            {isBrowseResultsActive && <SortPillsBar {...sortProps} />}
            <div style={browseContentContainerStyle}>
              {isBrowseResultsActive ? (
                <BrowseResultsView
                  items={filteredBrowseProducts}
                  isLoading={isLoadingFilteredBrowseProducts}
                  error={null}
                />
              ) : (
                <DefaultBrowseView
                  rawRetailers={rawRetailers}
                  verifiedRetailers={verifiedRetailers}
                  isLoadingApiRetailers={isLoadingApiRetailers}
                  isLoadingLogoVerification={isLoadingLogoVerification}
                  retailerApiError={retailerApiError}
                  getLogoPath={getLogoPath}
                  onShowItemsRequest={handleShowItemsClick}
                  selectedStoreIds={selectedStoreIds}
                  selectedCategories={selectedCategories}
                  onToggleStoreSelection={onToggleStoreSelection}
                  onToggleCategorySelection={onToggleCategorySelection}
                />
              )}
            </div>
            <StoreFilterModal
              isOpen={isStoreModalOpen}
              onClose={() => setIsStoreModalOpen(false)}
              retailers={verifiedRetailers}
              initialSelectedStoreIds={selectedStoreIds}
              onConfirmSelections={handleLocalStoreModalConfirm}
              getLogoPath={getLogoPath}
            />
            <CategoryFilterModal
              isOpen={isCategoryModalOpen}
              onClose={() => setIsCategoryModalOpen(false)}
              categories={PRODUCT_CATEGORIES_WITH_ICONS}
              initialSelectedCategories={selectedCategories}
              onConfirmSelections={handleLocalCategoryModalConfirm}
            />
          </>
        );
      case "search":
        const showSortPillsForSearch =
          activeTab === "search" && searchResults.length > 0;

        if (searchQuery || searchResults.length > 0 || isLoadingSearch) {
          return (
            <>
              {showSortPillsForSearch && <SortPillsBar {...sortProps} />}
              <SearchResultsView
                searchQuery={searchQuery}
                items={searchResults}
                totalResults={totalResults}
                isLoading={isLoadingSearch}
                error={searchError}
                hasMore={hasMoreResults}
                loadMore={loadMoreResults}
              />
            </>
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
