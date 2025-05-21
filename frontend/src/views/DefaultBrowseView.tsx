import React from "react";
import { Retailer } from "../types/retailer";
import "../styles/DefaultBrowseView.css";

// Export categories for use in other components
export const PRODUCT_CATEGORIES_WITH_ICONS: { name: string; icon: string }[] = [
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

interface DefaultBrowseViewProps {
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  getLogoPath: (name: string) => string;
  onShowItemsRequest: () => void;
  selectedStoreIds: Set<number>;
  selectedCategories: Set<string>;
  onToggleStoreSelection: (id: number) => void;
  onToggleCategorySelection: (categoryName: string) => void;
}

const DefaultBrowseView: React.FC<DefaultBrowseViewProps> = ({
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  getLogoPath,
  onShowItemsRequest,
  selectedStoreIds,
  selectedCategories,
  onToggleStoreSelection,
  onToggleCategorySelection,
}) => {
  const canShowItems = selectedStoreIds.size > 0 || selectedCategories.size > 0;

  const retailersToDisplay = verifiedRetailers;
  const categoriesToDisplay = PRODUCT_CATEGORIES_WITH_ICONS;

  return (
    <div className="default-browse-view-content">
      <div className="section-title">Stores</div>
      {(isLoadingApiRetailers || isLoadingLogoVerification) &&
        !retailerApiError && <p>Loading retailers...</p>}
      {retailerApiError && (
        <p className="error-message">
          Error loading retailers: {retailerApiError}
        </p>
      )}
      {!isLoadingApiRetailers &&
        !isLoadingLogoVerification &&
        retailersToDisplay.length === 0 &&
        !retailerApiError && <p>No retailers available.</p>}
      {retailersToDisplay.length > 0 && (
        <div className="logo-scroll-container horizontal-scroll">
          <div className="two-row-grid">
            {retailersToDisplay.map((retailer) => (
              <div
                key={retailer.id}
                className={`logo-item-card ${
                  selectedStoreIds.has(retailer.id) ? "selected" : ""
                }`}
                onClick={() => onToggleStoreSelection(retailer.id)}
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
                onClick={() => onToggleCategorySelection(category.name)}
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
          onClick={onShowItemsRequest}
          disabled={!canShowItems}
        >
          View Sales {">>"}
        </button>
      </div>
    </div>
  );
};

export default DefaultBrowseView;
