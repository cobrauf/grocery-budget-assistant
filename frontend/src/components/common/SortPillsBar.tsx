import React from "react";
import { SortStateAndActions, SortField } from "../../types/sort"; // Adjusted path
import "./SortPillsBar.css";

// Define an array for pill configuration to avoid repetition
const PILL_CONFIG: { label: string; field: SortField }[] = [
  { label: "Price", field: "price" },
  { label: "Store", field: "store" },
  { label: "Categ.", field: "category" },
];

// Use the SortStateAndActions for props type
interface SortPillsBarProps extends SortStateAndActions {}

const SortPillsBar: React.FC<SortPillsBarProps> = ({
  activeSortField,
  priceSortDirection,
  storeSortDirection,
  categorySortDirection,
  handlePillClick,
}) => {
  const getDirectionForField = (field: SortField) => {
    if (field === "price") return priceSortDirection;
    if (field === "store") return storeSortDirection;
    if (field === "category") return categorySortDirection;
    return "asc"; // Should not happen
  };

  return (
    <div className="sort-pills-bar">
      <span className="sort-header">Sort by:</span>
      {PILL_CONFIG.map(({ label, field }) => {
        const isSelected = activeSortField === field;
        const direction = getDirectionForField(field);
        const arrow = direction === "asc" ? "↓" : "↑";

        return (
          <button
            key={field}
            className={`sort-pill ${isSelected ? "selected" : ""}`}
            onClick={() => handlePillClick(field)}
            aria-pressed={isSelected}
            aria-label={`Sort by ${label} ${
              direction === "asc" ? "ascending" : "descending"
            }`}
          >
            {label} <span className="sort-arrow">{arrow}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SortPillsBar;
