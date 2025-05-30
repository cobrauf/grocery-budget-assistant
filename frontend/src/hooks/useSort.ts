import { useState, useEffect } from "react";
import {
  SortField,
  SortDirection,
  SortStateAndActions,
  SortOptions,
} from "../types/sort";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  LS_ACTIVE_SORT_FIELD,
  LS_PRICE_SORT_DIRECTION,
  LS_STORE_SORT_DIRECTION,
  LS_CATEGORY_SORT_DIRECTION,
  LS_DATE_SORT_DIRECTION,
} from "../utils/localStorageUtils";

const defaultSortOptions: SortOptions = {
  activeSortField: "price",
  priceSortDirection: "asc",
  storeSortDirection: "asc",
  categorySortDirection: "asc",
  dateSortDirection: "asc",
};

export const useSort = (): SortStateAndActions => {
  const [activeSortField, setActiveSortField] = useState<SortField>(() =>
    loadFromLocalStorage<SortField>(
      LS_ACTIVE_SORT_FIELD,
      defaultSortOptions.activeSortField
    )
  );
  const [priceSortDirection, setPriceSortDirection] = useState<SortDirection>(
    () =>
      loadFromLocalStorage<SortDirection>(
        LS_PRICE_SORT_DIRECTION,
        defaultSortOptions.priceSortDirection
      )
  );
  const [storeSortDirection, setStoreSortDirection] = useState<SortDirection>(
    () =>
      loadFromLocalStorage<SortDirection>(
        LS_STORE_SORT_DIRECTION,
        defaultSortOptions.storeSortDirection
      )
  );
  const [categorySortDirection, setCategorySortDirection] =
    useState<SortDirection>(() =>
      loadFromLocalStorage<SortDirection>(
        LS_CATEGORY_SORT_DIRECTION,
        defaultSortOptions.categorySortDirection
      )
    );
  const [dateSortDirection, setDateSortDirection] = useState<SortDirection>(
    () =>
      loadFromLocalStorage<SortDirection>(
        LS_DATE_SORT_DIRECTION,
        defaultSortOptions.dateSortDirection
      )
  );

  useEffect(() => {
    saveToLocalStorage(LS_ACTIVE_SORT_FIELD, activeSortField);
  }, [activeSortField]);

  useEffect(() => {
    saveToLocalStorage(LS_PRICE_SORT_DIRECTION, priceSortDirection);
  }, [priceSortDirection]);

  useEffect(() => {
    saveToLocalStorage(LS_STORE_SORT_DIRECTION, storeSortDirection);
  }, [storeSortDirection]);

  useEffect(() => {
    saveToLocalStorage(LS_CATEGORY_SORT_DIRECTION, categorySortDirection);
  }, [categorySortDirection]);

  useEffect(() => {
    saveToLocalStorage(LS_DATE_SORT_DIRECTION, dateSortDirection);
  }, [dateSortDirection]);

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
      case "date":
        setDateSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
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
    dateSortDirection,
    setActiveSortField,
    setPriceSortDirection,
    setStoreSortDirection,
    setCategorySortDirection,
    setDateSortDirection,
    toggleSortDirection,
    handlePillClick,
  };
};
