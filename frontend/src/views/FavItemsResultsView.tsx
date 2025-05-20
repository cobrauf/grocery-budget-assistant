import React from "react";
import { Product } from "../types/product";
import ResultsView from "../components/common/ResultsView";

interface FavItemsResultsViewProps {
  items: Product[];
  isLoading: boolean;
  onScrollUpdate?: (scrollY: number) => void;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string, retailerId: number) => void;
  isFavorite: (productId: string, retailerId: number) => boolean;
}

const FavItemsResultsView: React.FC<FavItemsResultsViewProps> = ({
  items,
  isLoading,
  onScrollUpdate,
  addFavorite,
  removeFavorite,
  isFavorite,
}) => {
  return (
    <ResultsView
      items={items}
      isLoading={isLoading}
      error={null}
      hasMore={false}
      loadMore={() => {}}
      scrollableId="favoritesScrollableDiv"
      renderInitialLoaderFullPage={false}
      viewType="browse" // Reuse browse view styling
      onScrollUpdate={onScrollUpdate}
      addFavorite={addFavorite}
      removeFavorite={removeFavorite}
      isFavorite={isFavorite}
      inFavoritesView={true} // Indicate this is the favorites view
    />
  );
};

export default FavItemsResultsView;
