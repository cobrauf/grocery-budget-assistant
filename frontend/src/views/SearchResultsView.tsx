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
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite?: (productId: string, retailerId: number) => boolean;
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
  addFavorite,
  removeFavorite,
  isFavorite,
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
      addFavorite={addFavorite}
      removeFavorite={removeFavorite}
      isFavorite={isFavorite}
    />
  );
};

export default SearchResultsView;
