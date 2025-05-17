import React, { useState } from "react";
import { Retailer } from "../types/retailer";
// Product type might still be needed if any logic depends on it, but not for BrowseResultsView
// import { Product } from "../types/product";
import "../styles/DefaultBrowseView.css";
import StoreFilterModal from "../components/modals/StoreFilterModal";
import CategoryFilterModal from "../components/modals/CategoryFilterModal";
// import BrowseResultsView from "./BrowseResultsView"; // Removed: MainContent now handles this

interface DefaultBrowseViewProps {
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  handleSingleRetailerClick: (id: number) => void;
  getLogoPath: (name: string) => string;
  // Removed props related to direct product display, as MainContent handles BrowseResultsView
  // singleRetailerProducts: Product[];
  // isLoadingSingleRetailerProducts: boolean;
  handleFetchProductsByFilter: (
    storeIds: string[],
    categories: string[]
  ) => void;
  // filteredBrowseProducts: Product[];
  // isLoadingFilteredBrowseProducts: boolean;
  isBrowseResultsActive: boolean; // Still needed for header conditional rendering (back arrow)
  onToggleBrowseView: () => void;
  selectedStoreIds: Set<number>;
  selectedCategories: Set<string>;
  onToggleStoreSelection: (id: number) => void;
  onToggleCategorySelection: (categoryName: string) => void;
  onStoreModalConfirm: (newSelectedIds: Set<number>) => void;
  onCategoryModalConfirm: (newSelectedNames: Set<string>) => void;
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
  isLoadingApiRetailers, // Retained for potential loading states in this view
  isLoadingLogoVerification, // Retained for potential loading states in this view
  retailerApiError,
  handleSingleRetailerClick,
  getLogoPath,
  handleFetchProductsByFilter,
  isBrowseResultsActive, // Used for header display logic
  onToggleBrowseView, // Used for back button
  selectedStoreIds,
  selectedCategories,
  onToggleStoreSelection,
  onToggleCategorySelection,
  onStoreModalConfirm,
  onCategoryModalConfirm,
}) => {
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // isLoadingInitialData can still be relevant for this view if it shows its own loaders
  // const isLoadingInitialData = isLoadingApiRetailers || isLoadingLogoVerification;

  const toggleStoreSelection = (id: number) => {
    onToggleStoreSelection(id);
  };

  const toggleCategorySelection = (categoryName: string) => {
    onToggleCategorySelection(categoryName);
  };

  const handleShowItems = () => {
    const isSingleStoreOnly =
      selectedStoreIds.size === 1 && selectedCategories.size === 0;
    const isMultiFilter =
      selectedStoreIds.size > 0 || selectedCategories.size > 0;

    if (isSingleStoreOnly) {
      const storeId = Array.from(selectedStoreIds)[0];
      handleSingleRetailerClick(storeId); // This should trigger data fetching in App.tsx / MainContent
      onToggleBrowseView(); // Switch to results view
    } else if (isMultiFilter) {
      const storeIdsAsString = Array.from(selectedStoreIds).map(String);
      const categoryNames = Array.from(selectedCategories);
      handleFetchProductsByFilter(storeIdsAsString, categoryNames); // This triggers data fetching
      onToggleBrowseView(); // Switch to results view
    } else {
      console.log("Show Items clicked with no selection.");
      // Optionally, directly toggle if there's nothing to fetch
      // onToggleBrowseView();
    }
  };

  const canShowItems = selectedStoreIds.size > 0 || selectedCategories.size > 0;

  const handleStoreModalConfirm = (newSelectedIds: Set<number>) => {
    setIsStoreModalOpen(false);
    onStoreModalConfirm(newSelectedIds);
  };

  const handleCategoryModalConfirm = (newSelectedNames: Set<string>) => {
    setIsCategoryModalOpen(false);
    onCategoryModalConfirm(newSelectedNames);
  };

  const retailersToDisplay = verifiedRetailers;
  const categoriesToDisplay = PRODUCT_CATEGORIES_WITH_ICONS;

  const storeFilterButtonText =
    selectedStoreIds.size > 0 ? `Stores (${selectedStoreIds.size})` : "+ Store";
  const categoryFilterButtonText =
    selectedCategories.size > 0
      ? `Categories (${selectedCategories.size})`
      : "+ Category";

  // Logic for displayProducts and isLoadingDisplayProducts is removed
  // const showFilteredResults =
  //   filteredBrowseProducts.length > 0 || isLoadingFilteredBrowseProducts;
  // const showSingleRetailerResults =
  //   singleRetailerProducts.length > 0 || isLoadingSingleRetailerProducts;
  // const displayProducts = showFilteredResults
  //   ? filteredBrowseProducts
  //   : singleRetailerProducts;
  // const isLoadingDisplayProducts = showFilteredResults
  //   ? isLoadingFilteredBrowseProducts
  //   : isLoadingSingleRetailerProducts;

  // This button is now the primary way to trigger view change AFTER selection
  const showForwardArrow = !isBrowseResultsActive && canShowItems;

  // handleForwardArrowClick is effectively replaced by direct calls in handleShowItems
  // or if it was meant for just toggling view without action, its purpose changes.
  // For now, let's assume the "View Sales" button or direct filter interaction leads to handleShowItems.

  // The header forward arrow logic changes: it should call handleShowItems
  const handleHeaderForwardArrowClick = () => {
    if (canShowItems) {
      handleShowItems(); // This will also call onToggleBrowseView
    } else {
      // If no items selected, perhaps it should not toggle or just be disabled.
      // For now, let's assume it calls handleShowItems which handles the no-selection case.
      // Or, if the button is meant to *just* navigate if items are shown elsewhere:
      // onToggleBrowseView();
      // However, the current logic is that handleShowItems triggers the fetch AND the view toggle.
    }
  };

  // Since MainContent controls rendering this component only when !isBrowseResultsActive,
  // the top-level conditional rendering of filter UI vs results UI is removed from here.
  return (
    <div className="default-browse-view">
      <div className="filters-header">
        {/* The back arrow appears if isBrowseResultsActive is true, controlled by MainContent for BrowseResultsView. 
            DefaultBrowseView itself won't show a back arrow leading to itself. 
            However, the prop isBrowseResultsActive is used to adjust style if MainContent passed it through
            even when rendering DefaultBrowseView. Let's assume it means "are results the ACTIVE main view?" 
            If so, this component (filter view) might have a way to go back TO results if that was the flow.
            Given the refactor, if THIS component is shown, results are NOT active. So the back arrow here is less relevant.
            The onToggleBrowseView in the header should probably be the forward arrow functionality now.
        */}
        {isBrowseResultsActive && ( // This condition seems odd now. If DefaultBrowseView is shown, isBrowseResultsActive should be false.
          // If it's true, MainContent shows BrowseResultsView instead.
          // This might be for the brief moment of transition or if the prop meaning is subtle.
          // Let's keep it for style adjustment of the title for now.
          <button
            onClick={onToggleBrowseView} // This would toggle back to results if it was an option FROM filters.
            className="browse-nav-arrow back-arrow"
          >
            {"<"}
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
        {/* The forward arrow in header should now trigger showing items if selectable */}
        {showForwardArrow && (
          <button
            onClick={handleHeaderForwardArrowClick}
            className="browse-nav-arrow forward-arrow"
          >
            {">"}
          </button>
        )}
      </div>

      {/* Filter selection UI - This is always shown when DefaultBrowseView is active */}
      <>
        <div className="section-title">Stores</div>
        {/* Optional: Show loader here if retailers are loading 
        {(isLoadingApiRetailers || isLoadingLogoVerification) && <p>Loading retailers...</p>} 
        */}
        {retailerApiError && (
          <p className="error-message">
            Error loading retailers: {retailerApiError}
          </p>
        )}
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

      {/* The "View Sales" button is always at the bottom of this view */}
      <div className="show-items-button-container">
        <button
          className="show-items-button"
          onClick={handleShowItems} // This now also handles toggling the view
          disabled={!canShowItems}
        >
          View Sales
        </button>
      </div>

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
