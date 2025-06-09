import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Product } from "../types/product";
import { useSort } from "../hooks/useSort";
import SortPillsBar from "../components/common/SortPillsBar";
import ResultsView from "../components/common/ResultsView";
import "../styles/AIResultsView.css";

interface AIResultsViewProps {
  products: Product[];
  query: string;
  onBack: () => void;
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite?: (productId: string, retailerId: number) => boolean;
}

const AIResultsView: React.FC<AIResultsViewProps> = ({
  products: initialProducts,
  query,
  onBack,
  addFavorite,
  removeFavorite,
  isFavorite,
}) => {
  const sortProps = useSort();

  const sortedItems = useMemo(() => {
    let items = [...initialProducts];
    const { activeSortField } = sortProps;
    let direction = "asc";
    if (activeSortField === "price") direction = sortProps.priceSortDirection;
    if (activeSortField === "store") direction = sortProps.storeSortDirection;
    if (activeSortField === "date") direction = sortProps.dateSortDirection;

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
  }, [initialProducts, sortProps]);

  const [displayedItems, setDisplayedItems] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setDisplayedItems(sortedItems.slice(0, 20));
    setHasMore(sortedItems.length > 20);
  }, [sortedItems]);

  const loadMore = useCallback(() => {
    const currentLength = displayedItems.length;
    if (currentLength >= sortedItems.length) {
      setHasMore(false);
      return;
    }
    const nextItems = sortedItems.slice(currentLength, currentLength + 20);
    setDisplayedItems((prev) => [...prev, ...nextItems]);
    if (displayedItems.length + nextItems.length >= sortedItems.length) {
      setHasMore(false);
    }
  }, [displayedItems, sortedItems]);

  if (initialProducts.length === 0) {
    return (
      <div className="ai-results-view">
        <div className="ai-results-header">
          <button onClick={onBack} className="back-link">
            &larr; Back to Chat
          </button>
          <h1 className="ai-results-title">AI Search Results</h1>
        </div>
        <p style={{ textAlign: "center", padding: "2rem" }}>
          No product results to display.
        </p>
      </div>
    );
  }

  return (
    <div className="ai-results-view">
      <div className="ai-results-header">
        <button onClick={onBack} className="back-link">
          &larr; Back to Chat
        </button>
        <h1 className="ai-results-title">AI Search Results</h1>
        <p className="ai-results-query">Showing results for: "{query}"</p>
      </div>
      <SortPillsBar {...sortProps} />
      <ResultsView
        items={displayedItems}
        isLoading={false}
        error={null}
        hasMore={hasMore}
        loadMore={loadMore}
        scrollableId="aiResultsScrollableDiv"
        totalResults={sortedItems.length}
        renderInitialLoaderFullPage={false}
        viewType="search"
        searchQuery={query}
        addFavorite={addFavorite}
        removeFavorite={removeFavorite}
        isFavorite={isFavorite}
        sortField={sortProps.activeSortField}
        sortDirection={
          sortProps.activeSortField === "price"
            ? sortProps.priceSortDirection
            : sortProps.activeSortField === "store"
            ? sortProps.storeSortDirection
            : sortProps.dateSortDirection
        }
      />
    </div>
  );
};

export default AIResultsView;
