export type SortField = "price" | "store" | "category";
export type SortDirection = "asc" | "desc";

export interface SortOptions {
  activeSortField: SortField;
  priceSortDirection: SortDirection;
  storeSortDirection: SortDirection;
  categorySortDirection: SortDirection;
}

export interface SortActions {
  setActiveSortField: (field: SortField) => void;
  setPriceSortDirection: (direction: SortDirection) => void;
  setStoreSortDirection: (direction: SortDirection) => void;
  setCategorySortDirection: (direction: SortDirection) => void;
  toggleSortDirection: (field: SortField) => void;
  handlePillClick: (field: SortField) => void;
}

// Interface for the props of a component that uses the sort state
export interface SortStateAndActions extends SortOptions, SortActions {}
