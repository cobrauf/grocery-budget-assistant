import React from "react";
import { Retailer } from "../types/retailer";
import "../styles/DefaultBrowseView.css";

// Export categories for use in other components
export const PRODUCT_CATEGORIES_WITH_ICONS: { name: string; icon: string }[] = [
  { name: "Produce", icon: "🥦" },
  { name: "Fruits", icon: "🍓" },
  { name: "Dairy", icon: "🥛" },
  { name: "Meats", icon: "🥩" },
  { name: "Seafood", icon: "🐟" },
  { name: "Bakery", icon: "🍞" },
  { name: "Beverages", icon: "🥤" },
  { name: "Alcohol", icon: "🍹" },
  { name: "Frozen", icon: "🧊" },
  { name: "Deli", icon: "🥪" },
  { name: "Breakfast", icon: "🥞" },
  { name: "Snacks", icon: "🥨" },
  { name: "Dry Goods", icon: "🏜️" },
  { name: "Canned", icon: "🥫" },
  { name: "Condiments", icon: "🧂" },
  { name: "Personal Care", icon: "🧴" },
  { name: "Kitchen", icon: "🍲" },
  { name: "Outdoors", icon: "🏕️" },
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
