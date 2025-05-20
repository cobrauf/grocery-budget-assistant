import React, { useState, useRef } from "react";
import { Product } from "../../types/product"; // Corrected path
import "../../styles/ProductCard.css"; // Import the CSS file

interface ProductCardProps {
  product: Product;
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite: boolean;
  inFavoritesView?: boolean; // Added to track if we're in favorites view
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  addFavorite,
  removeFavorite,
  isFavorite,
  inFavoritesView = false,
}) => {
  // Local state to track visual liked status (especially for favorites view)
  const [visuallyLiked, setVisuallyLiked] = useState(isFavorite);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<"+" | "-">("+");

  // Use this ref to track if the card has been unfavorited while in favorites view
  const hasBeenUnfavorited = useRef(false);

  // Update visual state when props change
  React.useEffect(() => {
    if (!inFavoritesView || !hasBeenUnfavorited.current) {
      setVisuallyLiked(isFavorite);
    }
  }, [isFavorite, inFavoritesView]);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getRetailerLogoPath = (retailerName: string | undefined): string => {
    if (!retailerName) return "";
    const imageName = retailerName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/&/g, "and");
    return `public/assets/logos/${imageName}.png`; // Adjusted path assuming assets are served from public root
  };

  const handleFavoriteClick = () => {
    // Trigger animation
    setAnimationType(visuallyLiked ? "-" : "+");
    setShowAnimation(true);

    // Reset animation after it completes
    setTimeout(() => {
      setShowAnimation(false);
    }, 800);

    if (visuallyLiked) {
      if (inFavoritesView) {
        // In favorites view, just update visual state but keep card visible
        setVisuallyLiked(false);
        hasBeenUnfavorited.current = true;
      }
      // Still call removeFavorite to update global state
      removeFavorite && removeFavorite(product.id, product.retailer_id);
    } else {
      setVisuallyLiked(true);
      hasBeenUnfavorited.current = false;
      addFavorite && addFavorite(product);
    }
  };

  // Don't show if it has been unfavorited in the favorites view and should be hidden
  const shouldShowInFavoritesView = !inFavoritesView || visuallyLiked;

  if (inFavoritesView && !shouldShowInFavoritesView) {
    return null;
  }

  return (
    <div className="product-card">
      <div className="product-card-image">
        {product.emoji ? Array.from(product.emoji)[0] : "🛒"}
      </div>
      <div className="product-card-details">
        <div className="product-card-title-row">
          <div className="product-card-text-details">
            <div className="product-card-description">
              {truncateText(product.name, 20)}
            </div>
            <div className="product-price-line">
              <div>
                <span className="product-card-price">
                  ${product.price.toFixed(2)}
                </span>
                {product.unit && (
                  <span className="product-card-unit">/{product.unit}</span>
                )}
              </div>
              {product.is_frontpage ? (
                <span className="product-card-frontpage-indicator">
                  Front Page
                </span>
              ) : product.category ? (
                <span className="product-card-category-label">
                  {truncateText(product.category, 15)}
                </span>
              ) : null}
            </div>

            <div className="product-card-promo-details-row">
              <span className="product-card-promo">
                {truncateText(product.promotion_details || "---", 30)}
              </span>
            </div>
          </div>
          <div className="heart-animation-container">
            {showAnimation && (
              <span className="heart-animation">{animationType}</span>
            )}
            <span
              className={`product-card-heart-icon ${
                visuallyLiked
                  ? "product-card-heart-icon-liked"
                  : "product-card-heart-icon-unliked"
              }`}
              onClick={handleFavoriteClick}
              title={
                visuallyLiked ? "Remove from favorites" : "Add to favorites"
              }
            >
              {visuallyLiked ? "❤️" : "🤍"}{" "}
              {/* Using actual heart emojis for simplicity */}
            </span>
          </div>
        </div>
        {product.retailer_name && (
          <img
            src={getRetailerLogoPath(product.retailer_name)}
            alt={`${product.retailer_name} logo`}
            className="product-card-retailer-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductCard;
