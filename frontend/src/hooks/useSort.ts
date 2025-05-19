import { useState } from "react";
import {
  SortField,
  SortDirection,
  SortStateAndActions,
  SortOptions,
} from "../types/sort";

const defaultSortOptions: SortOptions = {
  activeSortField: "price",
  priceSortDirection: "asc",
  storeSortDirection: "asc",
  categorySortDirection: "asc",
};

export const useSort = (
  initialSortOptions?: Partial<SortOptions>
): SortStateAndActions => {
  const [activeSortField, setActiveSortField] = useState<SortField>(
    initialSortOptions?.activeSortField || defaultSortOptions.activeSortField
  );
  const [priceSortDirection, setPriceSortDirection] = useState<SortDirection>(
    initialSortOptions?.priceSortDirection ||
      defaultSortOptions.priceSortDirection
  );
  const [storeSortDirection, setStoreSortDirection] = useState<SortDirection>(
    initialSortOptions?.storeSortDirection ||
      defaultSortOptions.storeSortDirection
  );
  const [categorySortDirection, setCategorySortDirection] =
    useState<SortDirection>(
      initialSortOptions?.categorySortDirection ||
        defaultSortOptions.categorySortDirection
    );

  const toggleSortDirection = (field: SortField) => {
    switch (field) {
      case "price":
        setPriceSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        break;
      case "store":
        setStoreSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        break;
      case "category":
        setCategorySortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        break;
      default:
        break;
    }
  };

  const handlePillClick = (field: SortField) => {
    if (field === activeSortField) {
      toggleSortDirection(field);
    } else {
      setActiveSortField(field);
    }
  };

  return {
    activeSortField,
    priceSortDirection,
    storeSortDirection,
    categorySortDirection,
    setActiveSortField,
    setPriceSortDirection,
    setStoreSortDirection,
    setCategorySortDirection,
    toggleSortDirection,
    handlePillClick,
  };
};
