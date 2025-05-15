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
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  handleRetailerClick,
  getLogoPath,
  // children prop is not used anymore, can be removed from props if desired
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
    if (selectedStoreIds.size === 1 && selectedCategories.size === 0) {
      const storeId = Array.from(selectedStoreIds)[0];
      handleRetailerClick(storeId);
    } else {
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

  const retailersToDisplay = verifiedRetailers;
  const categoriesToDisplay = PRODUCT_CATEGORIES_WITH_ICONS;

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
      {!isLoading && !retailerApiError && retailersToDisplay.length === 0 && (
        <p>No stores available.</p>
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
        </div>
      )}

      {/* Category Icons Section */}
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
