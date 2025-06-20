import React, { useState, useEffect } from "react";
import { Product } from "../../types/product"; // Corrected path
import "../../styles/ProductCard.css"; // Import the CSS file

interface ProductCardProps {
  product: Product;
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite: boolean;
  inFavoritesView?: boolean;
  animationDelay?: number;
}

// Helper function to parse "YYYY-MM-DD" strings into local Date objects at midnight
const parseDateStringAsLocal = (dateString: string): Date | null => {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // This creates a date at 00:00:00 in the local timezone
      const d = new Date(year, month, day);
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  console.warn(
    `Invalid date string format for parseDateStringAsLocal: ${dateString}`
  );
  return null;
};

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
  const [isDisappearing, setIsDisappearing] = useState(false);

  // Animation durations
  const HEART_ANIMATION_DURATION = 800;
  const DISAPPEAR_ANIMATION_DURATION = 500;

  useEffect(() => {
    setVisuallyLiked(isFavorite);
  }, [isFavorite]);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getRetailerLogoPath = (retailerName: string | undefined): string => {
    if (!retailerName) return "";
    const imageName = retailerName.replace(/\s+/g, "").replace(/&/g, "and");
    return `/assets/logos/${imageName}.png`;
  };

  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const getExpirationDate = (): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today in local timezone

    const processDateString = (
      dateString: string | undefined | null
    ): string | null => {
      if (!dateString) return null;

      const dealLastValidDay = parseDateStringAsLocal(dateString);

      if (dealLastValidDay && !isNaN(dealLastValidDay.getTime())) {
        // A deal is valid *through* its dealLastValidDay.
        if (today > dealLastValidDay) {
          return "Expired";
        }
        return formatDate(dealLastValidDay);
      }
      return null;
    };

    // Prioritize product-specific promotion date
    let expirationDisplay = processDateString(product.promotion_to);
    if (expirationDisplay) {
      return expirationDisplay;
    }

    // Fallback to weekly ad's validity date
    expirationDisplay = processDateString(product.weekly_ad_valid_to);
    if (expirationDisplay) {
      return expirationDisplay;
    }

    return null;
  };

  const handleFavoriteClick = () => {
    setAnimationType(visuallyLiked ? "_" : "+");
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, HEART_ANIMATION_DURATION);

    if (visuallyLiked) {
      setVisuallyLiked(false);
      if (inFavoritesView) {
        setIsDisappearing(true);
        setTimeout(() => {
          removeFavorite && removeFavorite(product.id, product.retailer_id);
        }, DISAPPEAR_ANIMATION_DURATION); // Match animation duration
      } else {
        removeFavorite && removeFavorite(product.id, product.retailer_id);
      }
    } else {
      setVisuallyLiked(true);
      addFavorite && addFavorite(product);
    }
  };

  const expirationDate = getExpirationDate();

  return (
    <div
      className={`product-card ${isDisappearing ? "removing" : ""}`}
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
