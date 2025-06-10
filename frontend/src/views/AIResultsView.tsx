import React, { useMemo } from "react";
import { Product } from "../types/product";
import { useSort } from "../hooks/useSort";
import ResultsView from "../components/common/ResultsView";

interface AIResultsViewProps {
  products: Product[];
  query: string;
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite?: (productId: string, retailerId: number) => boolean;
  sortProps: ReturnType<typeof useSort>;
}

const AIResultsView: React.FC<AIResultsViewProps> = ({
  products: initialProducts,
  query,
  addFavorite,
  removeFavorite,
  isFavorite,
  sortProps,
}) => {
  const {
    activeSortField,
    priceSortDirection,
    storeSortDirection,
    dateSortDirection,
  } = sortProps;

  const sortedItems = useMemo(() => {
    let items = [...initialProducts];
    let direction = "asc";
    if (activeSortField === "price") direction = priceSortDirection;
    if (activeSortField === "store") direction = storeSortDirection;
    if (activeSortField === "date") direction = dateSortDirection;

    items.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      if (activeSortField === "date") {
        aValue = a.weekly_ad_valid_from
          ? new Date(a.weekly_ad_valid_from).getTime()
          : 0;
        bValue = b.weekly_ad_valid_from
          ? new Date(b.weekly_ad_valid_from).getTime()
          : 0;
      } else if (activeSortField === "store") {
        aValue = a.retailer_name?.toLowerCase() || "";
        bValue = b.retailer_name?.toLowerCase() || "";
      } else {
        aValue = a[activeSortField as keyof Product] as number;
        bValue = b[activeSortField as keyof Product] as number;
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;

      if (activeSortField !== "price" && a.price && b.price) {
        if (a.price < b.price) return -1;
        if (a.price > b.price) return 1;
      }

      return 0;
    });

    return items;
  }, [
    initialProducts,
    activeSortField,
    priceSortDirection,
    storeSortDirection,
    dateSortDirection,
  ]);

  const loadMore = () => {
    // No pagination needed - backend controls the limit
  };

  if (initialProducts.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "2rem" }}>
        No product results to display.
      </p>
    );
  }

  return (
    <ResultsView
      items={sortedItems}
      isLoading={false}
      error={null}
      hasMore={false}
      loadMore={loadMore}
      scrollableId="aiResultsScrollableDiv"
      totalResults={sortedItems.length}
      renderInitialLoaderFullPage={false}
      viewType="ai"
      searchQuery={query}
      addFavorite={addFavorite}
      removeFavorite={removeFavorite}
      isFavorite={isFavorite}
      sortField={activeSortField}
      sortDirection={
        activeSortField === "price"
          ? priceSortDirection
          : activeSortField === "store"
          ? storeSortDirection
          : dateSortDirection
      }
    />
  );
};

export default AIResultsView;
