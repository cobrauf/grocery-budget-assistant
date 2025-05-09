import React, { useRef, useEffect } from "react";
import { Product } from "../../types/product"; // Path is correct relative to components/search/
import ProductCard from "../common/ProductCard";

interface SearchResultsListProps {
  searchQuery: string;
  items: Product[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({
  searchQuery,
  items,
  totalResults,
  isLoading,
  error,
  hasMore,
  loadMore,
}) => {
  const listStyle: React.CSSProperties = {
    padding: "1rem",
    color: "var(--theme-text, #212529)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.3rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  };

  const countStyle: React.CSSProperties = {
    fontSize: "0.9rem",
    color: "var(--theme-text-secondary, #6c757d)",
    marginLeft: "0.5rem",
  };

  const messageStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "2rem",
    fontSize: "1.1rem",
    color: "var(--theme-text-secondary, #6c757d)",
  };

  // For infinite scroll detection
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading && items.length > 0) return; // Don't re-observe if loading more
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        console.log("Reached bottom, loading more...");
        loadMore();
      }
    });

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMore, items.length]); // items.length to re-trigger if items change not due to loadingMore

  if (error) {
    return <div style={messageStyle}>Error: {error}</div>;
  }

  // Show loading for initial search, not for subsequent loads triggered by scroll
  if (isLoading && items.length === 0) {
    return <div style={messageStyle}>🔄 Searching for "{searchQuery}"...</div>;
  }

  if (!isLoading && items.length === 0 && searchQuery) {
    // Only show no results if a search was made
    return (
      <div style={messageStyle}>No results found for "{searchQuery}".</div>
    );
  }

  if (items.length === 0) {
    // If no search query and no items, don't show anything (MainContent handles default view)
    return null;
  }

  return (
    <div style={listStyle}>
      {searchQuery && (
        <div style={titleStyle}>
          Results for "{searchQuery}"
          {totalResults > 0 && <span style={countStyle}>({totalResults})</span>}
        </div>
      )}
      <div>
        {items.map((product, index) => {
          if (items.length === index + 1) {
            // Attach ref to the last element for intersection observer
            return (
              <div ref={lastElementRef} key={`${product.id}-${index}`}>
                <ProductCard product={product} />
              </div>
            );
          } else {
            return (
              <ProductCard key={`${product.id}-${index}`} product={product} />
            );
          }
        })}
      </div>
      {isLoading && items.length > 0 && (
        <div style={messageStyle}>🔄 Loading more...</div>
      )}
      {!isLoading && !hasMore && items.length > 0 && searchQuery && (
        <div style={messageStyle}>End of results.</div>
      )}
    </div>
  );
};

export default SearchResultsList;
