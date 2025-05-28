import React, { useRef, useEffect } from "react";
import { Product } from "../../types/product";
import ProductCard from "./ProductCard";
import LoadingSpinner from "./LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";
import "../../styles/ResultsView.css"; // Common styles

interface ResultsViewProps {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  scrollableId: string;
  totalResults?: number;
  // True if we want a full screen loader when items.length === 0 && isLoading
  renderInitialLoaderFullPage?: boolean;
  searchQuery?: string; // For "no results" message in search context
  viewType: "browse" | "search"; // To differentiate messages and behavior
  onScrollUpdate?: (scrollY: number) => void; // New prop for scroll handling
  // Props for favorites functionality
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite?: (productId: string, retailerId: number) => boolean;
  inFavoritesView?: boolean; // Added to track if this is the favorites view
  // Sort info for animation triggers
  sortField?: string;
  sortDirection?: string;
  // New prop for display limit notification
  displayLimit?: number;
}

const infoTextStyle: React.CSSProperties = {
  textAlign: "center",
  justifyContent: "center",
  padding: "1rem 2rem", // Reduced padding for end message to look less spaced
  color: "#555",
};

const ResultsView: React.FC<ResultsViewProps> = ({
  sortField = "price",
  sortDirection = "asc",
  items,
  isLoading,
  error,
  hasMore,
  loadMore,
  scrollableId,
  totalResults,
  renderInitialLoaderFullPage = false,
  searchQuery,
  viewType,
  onScrollUpdate,
  addFavorite,
  removeFavorite,
  isFavorite,
  inFavoritesView,
  displayLimit,
}) => {
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  // Add scroll event handling
  useEffect(() => {
    const scrollableElement = scrollableDivRef.current;
    if (!scrollableElement || !onScrollUpdate) return;

    const handleScroll = () => {
      onScrollUpdate(scrollableElement.scrollTop);
    };

    scrollableElement.addEventListener("scroll", handleScroll);
    return () => scrollableElement.removeEventListener("scroll", handleScroll);
  }, [onScrollUpdate]);

  const resultsContainerStyle: React.CSSProperties = {
    height: "100%", // Take full height of parent flex container
    overflowY: "auto",
    padding: "1rem",
    flexGrow: 1,
  };

  const errorTextStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    padding: "2rem 0",
    color: "red",
  };

  // Determine if we should show the limit exceeded notification
  const shouldShowLimitExceededNotification =
    !isLoading &&
    items.length > 0 &&
    displayLimit &&
    items.length === displayLimit;

  // Limit exceeded notification element
  const limitExceededElement = shouldShowLimitExceededNotification ? (
    <div className="limit-exceeded-notification">
      Showing first {displayLimit} results only. Try narrowing your
      filters/search.
    </div>
  ) : null;

  let noResultsElement: React.ReactNode;
  if (viewType === "browse") {
    noResultsElement = (
      <p style={infoTextStyle}>No products found matching your filters.</p>
    );
  } else {
    // search view
    noResultsElement = (
      <p style={infoTextStyle}>
        No results found for "{searchQuery}". Try refining your search.
      </p>
    );
  }

  let endMessageElement: React.ReactNode | null = null;

  // Only show end message if not in favorites view
  if (!inFavoritesView && !isLoading && items.length > 0) {
    if (viewType === "browse") {
      endMessageElement = (
        <p style={infoTextStyle}>
          {totalResults && items.length === totalResults
            ? `Showing all ${totalResults} results.`
            : items.length > 0
            ? `End of results.`
            : ""}
        </p>
      );
    } else {
      // search view
      endMessageElement = (
        <p style={infoTextStyle}>
          {totalResults && items.length === totalResults
            ? `Showing all ${totalResults} results.`
            : `End of results.`}
        </p>
      );
    }
  }

  if (renderInitialLoaderFullPage && isLoading && items.length === 0) {
    return (
      <div
        style={{
          ...resultsContainerStyle,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <p style={errorTextStyle}>Error loading results: {error}</p>;
  }

  if (!isLoading && items.length === 0 && !error) {
    return <>{noResultsElement}</>;
  }

  return (
    <div id={scrollableId} ref={scrollableDivRef} style={resultsContainerStyle}>
      {limitExceededElement}
      <InfiniteScroll
        dataLength={items.length}
        next={loadMore}
        hasMore={hasMore && !isLoading}
        loader={
          <div
            style={{ width: "100%", textAlign: "center", padding: "1rem 0" }}
          >
            <LoadingSpinner />
          </div>
        }
        endMessage={endMessageElement}
        scrollableTarget={scrollableId}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
          width: "100%",
          overflow: "visible", // Handled by parent scrollable div
        }}
      >
        {items.map((item, index) => (
          <ProductCard
            key={`${item.id}-${item.retailer_id}-${sortField}-${sortDirection}`}
            product={item}
            addFavorite={addFavorite}
            removeFavorite={removeFavorite}
            isFavorite={
              isFavorite ? isFavorite(item.id, item.retailer_id) : false
            }
            inFavoritesView={inFavoritesView}
            animationDelay={index * 0.05}
          />
        ))}
      </InfiniteScroll>
      {/* For cases where initial loader isn't full page, but still loading */}
      {!renderInitialLoaderFullPage && isLoading && items.length === 0 && (
        <div style={{ width: "100%", textAlign: "center", padding: "1rem 0" }}>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default ResultsView;
