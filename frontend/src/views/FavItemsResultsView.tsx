import React, { useState } from "react";
import { Product } from "../types/product";
import ResultsView from "../components/common/ResultsView";
import ConfirmActionModal from "../components/modals/ConfirmActionModal";
import CustomProductCard from "../components/common/CustomProductCard";

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
  const [isClearExpiredFavsModalOpen, setIsClearExpiredFavsModalOpen] =
    useState(false);

  const handleClearAllFavorites = () => {
    // Clear all favorites when confirmed
    items.forEach((item) => {
      removeFavorite(item.id, item.retailer_id);
    });
    setIsClearFavsModalOpen(false); // Close modal after action
  };

  const isProductExpired = (product: Product): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = (dateString: string | undefined | null): boolean => {
      if (!dateString) return false;
      try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0);
          return date < today;
        }
      } catch (e) {
        // Invalid date format
      }
      return false;
    };

    if (product.promotion_to && checkDate(product.promotion_to)) {
      return true;
    }
    if (
      !product.promotion_to &&
      product.weekly_ad_valid_to &&
      checkDate(product.weekly_ad_valid_to)
    ) {
      return true;
    }
    return false;
  };

  const handleClearExpiredFavorites = () => {
    items.forEach((item) => {
      if (isProductExpired(item)) {
        removeFavorite(item.id, item.retailer_id);
      }
    });
    setIsClearExpiredFavsModalOpen(false); // Close modal after action
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
      >
        {items.length > 0 && !isLoading && (
          <CustomProductCard
            onRemoveAllClick={() => setIsClearFavsModalOpen(true)}
            onRemoveExpiredClick={() => setIsClearExpiredFavsModalOpen(true)}
          />
        )}
      </ResultsView>

      <ConfirmActionModal
        isOpen={isClearFavsModalOpen}
        onClose={() => setIsClearFavsModalOpen(false)}
        onConfirm={handleClearAllFavorites}
        title=""
      >
        <p>Remove all favorites?</p>
      </ConfirmActionModal>

      <ConfirmActionModal
        isOpen={isClearExpiredFavsModalOpen}
        onClose={() => setIsClearExpiredFavsModalOpen(false)}
        onConfirm={handleClearExpiredFavorites}
        title=""
      >
        <p>Remove expired favorites?</p>
      </ConfirmActionModal>
    </div>
  );
};

export default FavItemsResultsView;
