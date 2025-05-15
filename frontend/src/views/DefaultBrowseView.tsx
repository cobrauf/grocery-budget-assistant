import React, { useState } from "react";
import { Retailer } from "../types/retailer";
import "../styles/DefaultBrowseView.css";

interface DefaultBrowseViewProps {
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  handleRetailerClick: (id: number) => void;
  getLogoPath: (name: string) => string;
  children?: React.ReactNode;
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
  rawRetailers,
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  handleRetailerClick,
  getLogoPath,
  children,
}) => {
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<number>>(
    new Set()
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  const isLoading = isLoadingApiRetailers || isLoadingLogoVerification;

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
    // For now, if only one store is selected and no categories, mimic single retailer click
    if (selectedStoreIds.size === 1 && selectedCategories.size === 0) {
      const storeId = Array.from(selectedStoreIds)[0];
      handleRetailerClick(storeId);
    } else {
      // TODO: Implement multi-filter logic: fetch products for selectedStoreIds & selectedCategories
      // And then display them using BrowseResultsView via a callback to App.tsx
      console.log(
        "Show Items clicked with stores:",
        selectedStoreIds,
        "and categories:",
        selectedCategories
      );
      alert(
        "Multi-filter 'Show Items' not fully implemented yet for BrowseResultsView. Only single store selection works for now when clicking 'Show Items' with one store selected or clicking the store logo directly."
      );
    }
  };

  const canShowItems = selectedStoreIds.size > 0 || selectedCategories.size > 0;

  // Split retailers into two rows for display
  const retailersPerRow = Math.ceil(verifiedRetailers.length / 2);
  const retailerRow1 = verifiedRetailers.slice(0, retailersPerRow);
  const retailerRow2 = verifiedRetailers.slice(retailersPerRow);

  // Split categories into two rows for display
  const categoriesPerRow = Math.ceil(PRODUCT_CATEGORIES_WITH_ICONS.length / 2);
  const categoryRow1 = PRODUCT_CATEGORIES_WITH_ICONS.slice(0, categoriesPerRow);
  const categoryRow2 = PRODUCT_CATEGORIES_WITH_ICONS.slice(categoriesPerRow);

  return (
    <div className="default-browse-view">
      <div className="filters-header">
        <span>Filters:</span>
        <button className="filter-button">+ Add store Filter</button>
        <button className="filter-button">+ Add Category Filter</button>
      </div>

      {/* Retailer Logos Section */}
      <div className="section-title">Stores</div>
      {isLoading && <p>Loading retailers...</p>}
      {retailerApiError && (
        <p className="error-message">
          Error loading retailers: {retailerApiError}
        </p>
      )}
      {!isLoading && !retailerApiError && verifiedRetailers.length === 0 && (
        <p>No stores available.</p>
      )}

      {[retailerRow1, retailerRow2].map(
        (row, rowIndex) =>
          row.length > 0 && (
            <div
              key={`retailer-row-${rowIndex}`}
              className="logo-scroll-container horizontal-scroll"
            >
              {row.map((retailer) => (
                <div
                  key={retailer.id}
                  className={`logo-item-card ${
                    selectedStoreIds.has(retailer.id) ? "selected" : ""
                  }`}
                  onClick={() => {
                    // If user clicks a store logo, this is treated as a direct view request for that store's items
                    // It also toggles selection for the multi-filter UI state.
                    toggleStoreSelection(retailer.id);
                    // For immediate view on single click (as per original requirement for retailer logos):
                    // handleRetailerClick(retailer.id);
                    // Decided to make logo click primarily for selection. Actual view via Show Items or single logo click with specific behavior.
                    // The task says: "Clicking a single retailer logo loads its products into BrowseResultsView"
                    // So, we will call handleRetailerClick here directly as well.
                    handleRetailerClick(retailer.id);
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
          )
      )}

      {/* Category Icons Section */}
      <div className="section-title">Categories</div>
      {[categoryRow1, categoryRow2].map(
        (row, rowIndex) =>
          row.length > 0 && (
            <div
              key={`category-row-${rowIndex}`}
              className="logo-scroll-container horizontal-scroll"
            >
              {row.map((category) => (
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
          )
      )}

      <div className="show-items-button-container">
        <button
          className="show-items-button"
          onClick={handleShowItems}
          disabled={!canShowItems}
        >
          Show Items
        </button>
      </div>
    </div>
  );
};

export default DefaultBrowseView;
