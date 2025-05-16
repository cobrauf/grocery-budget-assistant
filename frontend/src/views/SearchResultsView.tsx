import React, { useRef } from "react";
import { Product } from "../types/product"; // Adjust path if necessary
import ProductCard from "../components/common/ProductCard"; // Adjust path if necessary
import LoadingSpinner from "../components/common/LoadingSpinner"; // Adjust path if necessary
import InfiniteScroll from "react-infinite-scroll-component";
import "../styles/ResultsView.css";

interface SearchResultsViewProps {
  searchQuery: string;
  items: Product[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  searchQuery,
  items,
  totalResults,
  isLoading,
  error,
  hasMore,
  loadMore,
}) => {
  const scrollableDivRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container

  const resultsContainerStyle: React.CSSProperties = {
    height: "calc(100vh - 120px)", // Example: Adjust based on header/footer height
    overflowY: "auto", // Make the container scrollable
  };

  const infoTextStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    padding: "0rem 0",
    color: "#555",
  };

  const errorTextStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    padding: "2rem 0",
    color: "red",
  };

  return (
    <div
      id="scrollableDiv"
      ref={scrollableDivRef}
      style={resultsContainerStyle}
    >
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
              {items.length === totalResults
                ? `Showing all ${totalResults} results.`
                : `End of results.`}
            </p>
          ) : null
        }
        scrollableTarget="scrollableDiv" // Target the scrollable container
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
          width: "100%",
          overflow: "visible",
          padding: "1rem",
        }}
      >
        {items.map((item) => (
          <ProductCard key={`${item.id}-${item.retailer_id}`} product={item} />
        ))}
      </InfiniteScroll>

      {isLoading && items.length === 0 && (
        <div style={{ width: "100%" }}>
          {" "}
          {/* Wrap spinner for centering */}
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && items.length === 0 && !error && (
        <p style={infoTextStyle}>
          No results found for "{searchQuery}". Try refining your search.
        </p>
      )}

      {error && <p style={errorTextStyle}>Error loading results: {error}</p>}
    </div>
  );
};

export default SearchResultsView;
