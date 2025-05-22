import React, { useState } from "react";
import { Product } from "../types/product";
import ResultsView from "../components/common/ResultsView";
import ClearFavoritesModal from "../components/modals/ClearFavoritesModal";

interface FavItemsResultsViewProps {
  items: Product[];
  isLoading: boolean;
  onScrollUpdate?: (scrollY: number) => void;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string, retailerId: number) => void;
  isFavorite: (productId: string, retailerId: number) => boolean;
  // Sort props for animation triggers
  sortField: string;
  sortDirection: string;
}

const FavItemsResultsView: React.FC<FavItemsResultsViewProps> = ({
  items,
  isLoading,
  onScrollUpdate,
  addFavorite,
  removeFavorite,
  isFavorite,
  sortField,
  sortDirection,
}) => {
  const [isClearFavsModalOpen, setIsClearFavsModalOpen] = useState(false);

  const handleClearAllFavorites = () => {
    // Clear all favorites when confirmed
    items.forEach((item) => {
      removeFavorite(item.id, item.retailer_id);
    });
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
        sortField={sortField}
        sortDirection={sortDirection}
      />

      {items.length > 0 && !isLoading && (
        <div
          style={{
            textAlign: "center",
            margin: "20px 0",
            position: "absolute",
            bottom: "20px",
            left: "0",
            right: "0",
          }}
        >
          <button
            onClick={() => setIsClearFavsModalOpen(true)}
            className="modal-button-confirm"
          >
            Clear All Favs
          </button>
        </div>
      )}
      <ClearFavoritesModal
        isOpen={isClearFavsModalOpen}
        onClose={() => setIsClearFavsModalOpen(false)}
        onConfirm={handleClearAllFavorites}
      />
    </div>
  );
};

export default FavItemsResultsView;
