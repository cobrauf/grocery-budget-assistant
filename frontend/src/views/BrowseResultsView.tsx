import React from "react";
import { Product } from "../types/product";
import ResultsView from "../components/common/ResultsView";

interface BrowseResultsViewProps {
  items: Product[];
  totalResults?: number;
  isLoading: boolean;
  error: string | null;
  hasMore?: boolean;
  loadMore?: () => void;
  onScrollUpdate?: (scrollY: number) => void;
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite?: (productId: string, retailerId: number) => boolean;
}

const BrowseResultsView: React.FC<BrowseResultsViewProps> = ({
  items,
  totalResults,
  isLoading,
  error,
  hasMore = false,
  loadMore = () => {},
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
      scrollableId="browseScrollableDiv"
      totalResults={totalResults}
      renderInitialLoaderFullPage={true} // Browse view has specific full page initial loader
      viewType="browse"
      onScrollUpdate={onScrollUpdate}
      addFavorite={addFavorite}
      removeFavorite={removeFavorite}
      isFavorite={isFavorite}
    />
  );
};

export default BrowseResultsView;
