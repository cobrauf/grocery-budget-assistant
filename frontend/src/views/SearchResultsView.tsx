import React from "react";
import { Product } from "../types/product";
import ResultsView from "../components/common/ResultsView";

interface SearchResultsViewProps {
  searchQuery: string;
  items: Product[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  onScrollUpdate?: (scrollY: number) => void;
}

const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  searchQuery,
  items,
  totalResults,
  isLoading,
  error,
  hasMore,
  loadMore,
  onScrollUpdate,
}) => {
  return (
    <ResultsView
      items={items}
      isLoading={isLoading}
      error={error}
      hasMore={hasMore}
      loadMore={loadMore}
      scrollableId="searchScrollableDiv"
      totalResults={totalResults}
      renderInitialLoaderFullPage={false}
      viewType="search"
      searchQuery={searchQuery}
      onScrollUpdate={onScrollUpdate}
    />
  );
};

export default SearchResultsView;
