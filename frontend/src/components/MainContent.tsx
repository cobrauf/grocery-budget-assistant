import React, { useState, useCallback, useRef, RefObject } from "react";
import SearchResultsView from "../views/SearchResultsView";
import DefaultSearchView from "../views/DefaultSearchView";
import DefaultBrowseView from "../views/DefaultBrowseView";
import BrowseResultsView from "../views/BrowseResultsView";
import DefaultFavItemsView from "../views/DefaultFavItemsView";
import FavItemsResultsView from "../views/FavItemsResultsView";
import SortPillsBar from "./common/SortPillsBar";
import FavItemBar from "./common/FavItemBar";
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";
import { AppTab, ViewMode } from "../hooks/useAppTab";
import { SortStateAndActions } from "../types/sort";
import StoreFilterModal from "./modals/StoreFilterModal";
import CategoryFilterModal from "./modals/CategoryFilterModal";
import { PRODUCT_CATEGORIES_WITH_ICONS } from "../views/DefaultBrowseView";
import "../styles/DefaultBrowseView.css";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";

interface MainContentProps {
  onResultsViewScroll?: (scrollY: number) => void;
  children?: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  viewMode: Record<"browse" | "search", ViewMode>;
  setViewMode: (tab: "browse" | "search", mode: ViewMode) => void;
  areNavBarsVisible: boolean;

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

  // Favorites Props
  favoriteItems: Product[];
  displayedFavoriteProducts: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string, retailerId: number) => void;
  isFavorite: (productId: string, retailerId: number) => boolean;
  needsFavoriteListUpdate: boolean;
  onFavoriteListUpdate: () => void;

  // New props
  searchHistory: string[];
  performSearch: (query: string) => void;
  removeFromSearchHistory?: (query: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  areNavBarsVisible,
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
  onResultsViewScroll,
  favoriteItems,
  displayedFavoriteProducts,
  addFavorite,
  removeFavorite,
  isFavorite,
  needsFavoriteListUpdate,
  onFavoriteListUpdate,
  searchHistory,
  performSearch,
  removeFromSearchHistory,
}) => {
  const mainContentRef = useRef<HTMLDivElement>(null);

  useSwipeNavigation({
    targetRef: mainContentRef as RefObject<HTMLElement>,
    activeTab: activeTab,
    setActiveTab: setActiveTab,
  });

  const handleResultsViewScroll = useCallback(
    (scrollY: number) => {
      if (onResultsViewScroll) {
        onResultsViewScroll(scrollY);
      }
    },
    [onResultsViewScroll]
  );
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
    position: "relative",
    display: "flex",
    flexDirection: "column",
  };

  const canShowItems = selectedStoreIds.size > 0 || selectedCategories.size > 0;

  const handleShowItemsClick = () => {
    if (canShowItems) {
      const storeIdsAsString = Array.from(selectedStoreIds).map(String);
      const categoryNames = Array.from(selectedCategories);
      onFetchProductsByFilter(storeIdsAsString, categoryNames);

      setViewMode("browse", "results");
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

  const showHeaderBackArrow = viewMode.browse === "results";
  const showHeaderForwardArrow = viewMode.browse === "default" && canShowItems;

  const handleLocalStoreModalConfirm = (newSelectedIds: Set<number>) => {
    setIsStoreModalOpen(false);
    onStoreModalConfirm(newSelectedIds);
  };

  const handleLocalCategoryModalConfirm = (newSelectedNames: Set<string>) => {
    setIsCategoryModalOpen(false);
    onCategoryModalConfirm(newSelectedNames);
  };

  const handleEmailFavorites = () => {
    // Placeholder for future email functionality
    console.log("Email favorites button clicked");
  };

  const handleToggleBrowseView = () => {
    setViewMode(
      "browse",
      viewMode.browse === "default" ? "results" : "default"
    );

    onToggleBrowseView();
  };

  const handlePerformSearchFromDefaultView = (query: string) => {
    performSearch(query);
    setViewMode("search", "results");
  };

  const renderBrowseFilterHeader = () => {
    return (
      <div className="filters-header">
        {showHeaderBackArrow && (
          <button
            onClick={handleToggleBrowseView}
            className="browse-nav-arrow back-arrow"
          >
            {"<<"}
          </button>
        )}
        <span
          className={
            viewMode.browse === "results" ? "filters-title-indented" : ""
          }
        >
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
            <div
              className={`filters-header-wrapper ${
                !areNavBarsVisible ? "filters-header-wrapper-hidden" : ""
              }`}
            >
              {renderBrowseFilterHeader()}
            </div>
            {viewMode.browse === "results" && (
              <div
                className={`sort-pills-bar-container ${
                  !areNavBarsVisible ? "sort-pills-bar-container-hidden" : ""
                }`}
              >
                <SortPillsBar {...sortProps} />
              </div>
            )}
            <div style={browseContentContainerStyle}>
              {viewMode.browse === "default" && (
                <DefaultBrowseView
                  rawRetailers={rawRetailers}
                  verifiedRetailers={verifiedRetailers}
                  isLoadingApiRetailers={isLoadingApiRetailers}
                  isLoadingLogoVerification={isLoadingLogoVerification}
                  retailerApiError={retailerApiError}
                  getLogoPath={getLogoPath}
                  selectedStoreIds={selectedStoreIds}
                  selectedCategories={selectedCategories}
                  onToggleStoreSelection={onToggleStoreSelection}
                  onToggleCategorySelection={onToggleCategorySelection}
                  onShowItemsRequest={handleShowItemsClick}
                />
              )}
              {viewMode.browse === "results" && (
                <BrowseResultsView
                  items={filteredBrowseProducts}
                  isLoading={isLoadingFilteredBrowseProducts}
                  sortField={sortProps.activeSortField}
                  sortDirection={
                    sortProps.activeSortField === "price"
                      ? sortProps.priceSortDirection
                      : sortProps.activeSortField === "store"
                      ? sortProps.storeSortDirection
                      : sortProps.categorySortDirection
                  }
                  onScrollUpdate={handleResultsViewScroll}
                  addFavorite={addFavorite}
                  removeFavorite={removeFavorite}
                  isFavorite={isFavorite}
                  error={null}
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
              isDefaultBrowseView={viewMode.browse === "default"}
            />
            <CategoryFilterModal
              isOpen={isCategoryModalOpen}
              onClose={() => setIsCategoryModalOpen(false)}
              initialSelectedCategories={selectedCategories}
              onConfirmSelections={handleLocalCategoryModalConfirm}
              isDefaultBrowseView={viewMode.browse === "default"}
            />
          </>
        );
      case "search":
        const showSortPillsForSearch =
          activeTab === "search" &&
          viewMode.search === "results" &&
          searchResults.length > 0;

        if (viewMode.search === "results") {
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
                sortField={sortProps.activeSortField}
                sortDirection={
                  sortProps.activeSortField === "price"
                    ? sortProps.priceSortDirection
                    : sortProps.activeSortField === "store"
                    ? sortProps.storeSortDirection
                    : sortProps.categorySortDirection
                }
                onScrollUpdate={handleResultsViewScroll}
                addFavorite={addFavorite}
                removeFavorite={removeFavorite}
                isFavorite={isFavorite}
              />
            </>
          );
        } else {
          return (
            <DefaultSearchView
              searchHistory={searchHistory}
              onSearch={handlePerformSearchFromDefaultView}
              onRemoveSearchItem={removeFromSearchHistory}
            />
          );
        }
      case "favorites":
        if (favoriteItems.length === 0) {
          return <DefaultFavItemsView />;
        }

        return (
          <>
            <div className="sort-pills-bar-container">
              <SortPillsBar {...sortProps} />
            </div>
            <FavItemsResultsView
              items={displayedFavoriteProducts}
              sortField={sortProps.activeSortField}
              sortDirection={
                sortProps.activeSortField === "price"
                  ? sortProps.priceSortDirection
                  : sortProps.activeSortField === "store"
                  ? sortProps.storeSortDirection
                  : sortProps.categorySortDirection
              }
              addFavorite={addFavorite}
              removeFavorite={removeFavorite}
              isFavorite={isFavorite}
              isLoading={false}
            />
          </>
        );
      case "ai":
        return (
          <div style={{ textAlign: "center", paddingTop: "20px" }}>
            <div className="default-fav-items-icon">✨</div>
            <h2>AI</h2>
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

  return (
    <main
      ref={mainContentRef}
      style={mainContentStyle}
      className="main-content"
    >
      {renderContent()}
    </main>
  );
};

export default MainContent;
