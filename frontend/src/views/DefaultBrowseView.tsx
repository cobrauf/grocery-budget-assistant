import React, { useState } from "react";
import { Retailer } from "../types/retailer";
import { Product } from "../types/product";
import "../styles/DefaultBrowseView.css";
import StoreFilterModal from "../components/modals/StoreFilterModal";
import CategoryFilterModal from "../components/modals/CategoryFilterModal";
import BrowseResultsView from "./BrowseResultsView";

interface DefaultBrowseViewProps {
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  handleSingleRetailerClick: (id: number) => void;
  getLogoPath: (name: string) => string;
  singleRetailerProducts: Product[];
  isLoadingSingleRetailerProducts: boolean;
  handleFetchProductsByFilter: (
    storeIds: string[],
    categories: string[]
  ) => void;
  filteredBrowseProducts: Product[];
  isLoadingFilteredBrowseProducts: boolean;
  isBrowseResultsActive: boolean;
  onToggleBrowseView: () => void;
}

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

const DefaultBrowseView: React.FC<DefaultBrowseViewProps> = ({
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  handleSingleRetailerClick,
  getLogoPath,
  singleRetailerProducts,
  isLoadingSingleRetailerProducts,
  handleFetchProductsByFilter,
  filteredBrowseProducts,
  isLoadingFilteredBrowseProducts,
  isBrowseResultsActive,
  onToggleBrowseView,
}) => {
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<number>>(
    new Set()
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const isLoadingInitialData =
    isLoadingApiRetailers || isLoadingLogoVerification;

  const toggleStoreSelection = (id: number) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleCategorySelection = (categoryName: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const handleShowItems = () => {
    const isSingleStoreOnly =
      selectedStoreIds.size === 1 && selectedCategories.size === 0;
    const isMultiFilter =
      selectedStoreIds.size > 0 || selectedCategories.size > 0;

    if (isSingleStoreOnly) {
      const storeId = Array.from(selectedStoreIds)[0];
      handleSingleRetailerClick(storeId);
    } else if (isMultiFilter) {
      const storeIdsAsString = Array.from(selectedStoreIds).map(String);
      const categoryNames = Array.from(selectedCategories);
      handleFetchProductsByFilter(storeIdsAsString, categoryNames);
    } else {
      console.log("Show Items clicked with no selection.");
    }
  };

  const canShowItems = selectedStoreIds.size > 0 || selectedCategories.size > 0;

  const handleStoreModalConfirm = (newSelectedIds: Set<number>) => {
    setSelectedStoreIds(newSelectedIds);
    setIsStoreModalOpen(false);
    handleShowItems();
  };

  const handleCategoryModalConfirm = (newSelectedNames: Set<string>) => {
    setSelectedCategories(newSelectedNames);
    setIsCategoryModalOpen(false);
    handleShowItems();
  };

  const retailersToDisplay = verifiedRetailers;
  const categoriesToDisplay = PRODUCT_CATEGORIES_WITH_ICONS;

  const storeFilterButtonText =
    selectedStoreIds.size > 0 ? `Stores (${selectedStoreIds.size})` : "+ Store";
  const categoryFilterButtonText =
    selectedCategories.size > 0
      ? `Categories (${selectedCategories.size})`
      : "+ Category";

  const showFilteredResults =
    filteredBrowseProducts.length > 0 || isLoadingFilteredBrowseProducts;
  const showSingleRetailerResults =
    singleRetailerProducts.length > 0 || isLoadingSingleRetailerProducts;

  const displayProducts = showFilteredResults
    ? filteredBrowseProducts
    : singleRetailerProducts;
  const isLoadingDisplayProducts = showFilteredResults
    ? isLoadingFilteredBrowseProducts
    : isLoadingSingleRetailerProducts;

  const showForwardArrow = !isBrowseResultsActive && canShowItems;

  const handleForwardArrowClick = () => {
    if (canShowItems) {
      handleShowItems();
    } else {
      onToggleBrowseView();
    }
  };

  return (
    <div className="default-browse-view">
      <div className="filters-header">
        {isBrowseResultsActive && (
          <button
            onClick={onToggleBrowseView}
            className="browse-nav-arrow back-arrow"
          >
            &#x2190;
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
          {storeFilterButtonText}
        </button>
        <button
          className={`filter-button ${
            selectedCategories.size > 0 ? "active-filter" : ""
          }`}
          onClick={() => setIsCategoryModalOpen(true)}
        >
          {categoryFilterButtonText}
        </button>
        {showForwardArrow && (
          <button
            onClick={handleForwardArrowClick}
            className="browse-nav-arrow forward-arrow"
          >
            &#x2192;
          </button>
        )}
      </div>

      {isBrowseResultsActive ? (
        <BrowseResultsView
          items={displayProducts}
          isLoading={isLoadingDisplayProducts}
          error={null}
        />
      ) : (
        <>
          <div className="section-title">Stores</div>
          {isLoadingInitialData && <p>Loading retailers...</p>}
          {retailerApiError && (
            <p className="error-message">
              Error loading retailers: {retailerApiError}
            </p>
          )}
          {!isLoadingInitialData &&
            !retailerApiError &&
            retailersToDisplay.length === 0 && <p>No stores available.</p>}
          {retailersToDisplay.length > 0 && (
            <div className="logo-scroll-container horizontal-scroll">
              <div className="two-row-grid">
                {retailersToDisplay.map((retailer) => (
                  <div
                    key={retailer.id}
                    className={`logo-item-card ${
                      selectedStoreIds.has(retailer.id) ? "selected" : ""
                    }`}
                    onClick={() => {
                      toggleStoreSelection(retailer.id);
                    }}
                  >
                    <img
                      src={getLogoPath(retailer.name)}
                      alt={retailer.name}
                      className="logo-image"
                    />
                    <span className="logo-label">{retailer.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-title">Categories</div>
          {categoriesToDisplay.length > 0 && (
            <div className="logo-scroll-container horizontal-scroll">
              <div className="two-row-grid">
                {categoriesToDisplay.map((category) => (
                  <div
                    key={category.name}
                    className={`logo-item-card category-item ${
                      selectedCategories.has(category.name) ? "selected" : ""
                    }`}
                    onClick={() => toggleCategorySelection(category.name)}
                  >
                    <span className="logo-image category-icon">
                      {category.icon}
                    </span>
                    <span className="logo-label">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!isBrowseResultsActive && (
        <div className="show-items-button-container">
          <button
            className="show-items-button"
            onClick={handleShowItems}
            disabled={!canShowItems}
          >
            View Sales
          </button>
        </div>
      )}

      <StoreFilterModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        retailers={verifiedRetailers}
        initialSelectedStoreIds={selectedStoreIds}
        onConfirmSelections={handleStoreModalConfirm}
        getLogoPath={getLogoPath}
      />

      <CategoryFilterModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={PRODUCT_CATEGORIES_WITH_ICONS}
        initialSelectedCategories={selectedCategories}
        onConfirmSelections={handleCategoryModalConfirm}
      />
    </div>
  );
};

export default DefaultBrowseView;
