import React, { useState, useCallback } from "react";
import SearchResultsView from "../views/SearchResultsView";
import DefaultSearchView from "../views/DefaultSearchView";
import DefaultBrowseView from "../views/DefaultBrowseView";
import BrowseResultsView from "../views/BrowseResultsView";
import DefaultFavItemsView from "../views/DefaultFavItemsView";
import FavItemsResultsView from "../views/FavItemsResultsView";
import DefaultAIView from "../views/DefaultAIView";
import AIResultsView from "../views/AIResultsView";
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

interface MainContentProps {
  onResultsViewScroll?: (scrollY: number) => void;
  children?: React.ReactNode;
  activeTab: AppTab;
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

  onFetchProductsByFilter: (
    storeIds: string[],
    categories: string[],
    isFrontPageOnly: boolean
  ) => void;
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

  isFrontPageOnly: boolean;
  setIsFrontPageOnly: (value: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
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
  isFrontPageOnly,
  setIsFrontPageOnly,
}) => {
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
  const [aiViewMode, setAiViewMode] = useState<"default" | "results">(
    "default"
  );
  const [aiProducts, setAiProducts] = useState<Product[]>([]);
  const [aiQuery, setAiQuery] = useState<string>("");

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
    if (canShowItems || isFrontPageOnly) {
      const storeIdsAsString = Array.from(selectedStoreIds).map(String);
      const categoryNames = Array.from(selectedCategories);
      onFetchProductsByFilter(storeIdsAsString, categoryNames, isFrontPageOnly);
      setViewMode("browse", "results");
    } else {
      console.log(
        "Show Items clicked with no selection and Front Page Only is off."
      );
    }
  };

  const storeButtonText =
    selectedStoreIds.size > 0 ? `Stores (${selectedStoreIds.size})` : "+ Store";
  const categoryButtonText = isFrontPageOnly
    ? "FP Only"
    : selectedCategories.size > 0
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

  const handleShowAiResults = (
    products: Product[],
    query: string | undefined
  ) => {
    setAiProducts(products);
    setAiQuery(query || "your recent query");
    setAiViewMode("results");
  };

  const handleBackToAiChat = () => {
    setAiViewMode("default");
    setAiProducts([]);
    setAiQuery("");
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
            selectedCategories.size > 0 && !isFrontPageOnly
              ? "active-filter"
              : ""
          } ${isFrontPageOnly ? "filter-button--disabled" : ""}`}
          onClick={() => !isFrontPageOnly && setIsCategoryModalOpen(true)}
          disabled={isFrontPageOnly}
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
              {viewMode.browse === "results" ? (
                <BrowseResultsView
                  items={filteredBrowseProducts}
                  isLoading={isLoadingFilteredBrowseProducts}
                  error={null}
                  onScrollUpdate={handleResultsViewScroll}
                  addFavorite={addFavorite}
                  removeFavorite={removeFavorite}
                  isFavorite={isFavorite}
                  sortField={sortProps.activeSortField}
                  sortDirection={
                    sortProps.activeSortField === "price"
                      ? sortProps.priceSortDirection
                      : sortProps.activeSortField === "store"
                      ? sortProps.storeSortDirection
                      : sortProps.activeSortField === "date"
                      ? sortProps.dateSortDirection
                      : sortProps.categorySortDirection
                  }
                  displayLimit={200}
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
                  isFrontPageOnly={isFrontPageOnly}
                  setIsFrontPageOnly={setIsFrontPageOnly}
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
                onScrollUpdate={handleResultsViewScroll}
                addFavorite={addFavorite}
                removeFavorite={removeFavorite}
                isFavorite={isFavorite}
                sortField={sortProps.activeSortField}
                sortDirection={
                  sortProps.activeSortField === "price"
                    ? sortProps.priceSortDirection
                    : sortProps.activeSortField === "store"
                    ? sortProps.storeSortDirection
                    : sortProps.activeSortField === "date"
                    ? sortProps.dateSortDirection
                    : sortProps.categorySortDirection
                }
                displayLimit={200}
              />
            </>
          );
        } else {
          return (
            <DefaultSearchView
              searchHistory={searchHistory}
              onSearch={(query) => {
                performSearch(query);
                setViewMode("search", "results");
              }}
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
            {/* <FavItemBar
              onUpdate={onFavoriteListUpdate}
              onEmail={handleEmailFavorites}
              isUpdateEnabled={needsFavoriteListUpdate}
            /> */}
            <div className="sort-pills-bar-container">
              <SortPillsBar {...sortProps} />
            </div>
            <FavItemsResultsView
              items={displayedFavoriteProducts}
              isLoading={false}
              onScrollUpdate={handleResultsViewScroll}
              addFavorite={addFavorite}
              removeFavorite={removeFavorite}
              isFavorite={isFavorite}
              sortField={sortProps.activeSortField}
              sortDirection={
                sortProps.activeSortField === "price"
                  ? sortProps.priceSortDirection
                  : sortProps.activeSortField === "store"
                  ? sortProps.storeSortDirection
                  : sortProps.activeSortField === "date"
                  ? sortProps.dateSortDirection
                  : sortProps.categorySortDirection
              }
            />
          </>
        );
      case "ai":
        if (aiViewMode === "results") {
          return (
            <>
              <div className="filters-header">
                <button
                  onClick={handleBackToAiChat}
                  className="browse-nav-arrow back-arrow"
                  style={{ fontSize: "1.5rem" }}
                >
                  {" << "}
                </button>
                <span style={{ margin: "0 1rem" }}>
                  Results for: "
                  {aiQuery.length > 20
                    ? `${aiQuery.substring(0, 20)}...`
                    : aiQuery}
                  "
                </span>
              </div>
              <div className="sort-pills-bar-container">
                <SortPillsBar {...sortProps} />
              </div>

              <AIResultsView
                products={aiProducts}
                query={aiQuery}
                addFavorite={addFavorite}
                removeFavorite={removeFavorite}
                isFavorite={isFavorite}
                sortProps={sortProps}
              />
            </>
          );
        }
        return (
          <DefaultAIView
            onViewProducts={handleShowAiResults}
            clearChatHistory={false}
          />
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
