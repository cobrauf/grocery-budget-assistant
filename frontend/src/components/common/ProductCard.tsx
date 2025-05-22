import React, { useState, useRef } from "react";
import { Product } from "../../types/product"; // Corrected path
import "../../styles/ProductCard.css"; // Import the CSS file

interface ProductCardProps {
  product: Product;
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite: boolean;
  inFavoritesView?: boolean; // Added to track if we're in favorites view
  animationDelay?: number; // Delay in seconds for cascade animation
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  addFavorite,
  removeFavorite,
  isFavorite,
  inFavoritesView = false,
  animationDelay = 0,
}) => {
  // Local state to track visual liked status (especially for favorites view)
  const [visuallyLiked, setVisuallyLiked] = useState(isFavorite);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<"+" | "_">("+");

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

  const getExpirationDate = (): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of today

    // First try to get product's promotion end date if exists, if not use weekly ad's end date
    if (product.promotion_to) {
      try {
        const date = new Date(product.promotion_to);
        if (!isNaN(date.getTime())) {
          // Check if date is in the past
          date.setHours(0, 0, 0, 0); // Reset time for fair comparison
          if (date < today) {
            return "Expired";
          }
          return formatDate(date);
        }
      } catch (e) {
        // Invalid date format, continue to try weekly_ad_valid_to
      }
    }

    if (product.weekly_ad_valid_to) {
      try {
        const date = new Date(product.weekly_ad_valid_to);
        if (!isNaN(date.getTime())) {
          // Check if date is in the past
          date.setHours(0, 0, 0, 0); // Reset time for fair comparison
          if (date < today) {
            return "Expired";
          }
          return formatDate(date);
        }
      } catch (e) {
        // Invalid date format
      }
    }
    return null;
  };

  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1; // getMonth() is zero-based
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const handleFavoriteClick = () => {
    setAnimationType(visuallyLiked ? "_" : "+");
    setShowAnimation(true);
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

  const expirationDate = getExpirationDate();

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="product-card-image">
        {product.emoji ? Array.from(product.emoji)[0] : "🛒"}
      </div>
      <div className="product-card-details">
        <div className="product-card-title-row">
          <div className="product-card-text-details">
            <div className="product-card-description">
              {truncateText(product.name, 25)}
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
              <div className="product-card-meta-info">
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
            </div>

            <div className="product-card-promo-details-row">
              <span className="product-card-promo">
                {truncateText(product.promotion_details || "---", 25)}
              </span>
              {expirationDate && (
                <span className="product-card-expiration-date">
                  {expirationDate === "Expired"
                    ? "Expired"
                    : "Ends: " + expirationDate}
                </span>
              )}
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
