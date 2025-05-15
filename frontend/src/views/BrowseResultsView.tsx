import React, { useRef } from "react";
import { Product } from "../types/product";
import ProductCard from "../components/common/ProductCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";

interface BrowseResultsViewProps {
  // title?: string; // Optional title for the view (e.g., "Results for Walmart" or "Filtered Deals")
  items: Product[];
  totalResults?: number; // Might not always be known for browse, or might be items.length
  isLoading: boolean;
  error: string | null;
  hasMore?: boolean; // For potential pagination/infinite scroll if applicable
  loadMore?: () => void; // For potential pagination/infinite scroll
  filterDescription?: string; // e.g. "Tokyo Central"
}

const BrowseResultsView: React.FC<BrowseResultsViewProps> = ({
  items,
  totalResults,
  isLoading,
  error,
  hasMore = false, // Default to false if not paginating browse results initially
  loadMore = () => {},
  filterDescription,
}) => {
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const resultsContainerStyle: React.CSSProperties = {
    height: "calc(100vh - 120px)", // Adjust based on header/footer height
    overflowY: "auto",
    padding: "1rem",
  };

  const infoTextStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    padding: "2rem 0",
    color: "#555",
  };

  const errorTextStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    padding: "2rem 0",
    color: "red",
  };

  if (isLoading && items.length === 0) {
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
    return (
      <p style={infoTextStyle}>
        No products found{" "}
        {filterDescription
          ? `for ${filterDescription}`
          : "matching your filters"}
        .
      </p>
    );
  }

  return (
    <div
      id="browseScrollableDiv"
      ref={scrollableDivRef}
      style={resultsContainerStyle}
    >
      {filterDescription && (
        <h2 style={{ textAlign: "center" }}>{filterDescription}</h2>
      )}
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
        endMessage={
          !isLoading && items.length > 0 ? (
            <p style={infoTextStyle}>
              {totalResults && items.length === totalResults
                ? `Showing all ${totalResults} results.`
                : items.length > 0
                ? `End of results.`
                : ""}
            </p>
          ) : null
        }
        scrollableTarget="browseScrollableDiv"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
          width: "100%",
          overflow: "visible", // Handled by parent scrollable div
        }}
      >
        {items.map((item) => (
          <ProductCard key={`${item.id}-${item.retailer_id}`} product={item} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default BrowseResultsView;
