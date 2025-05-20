import React from "react";
import { Product } from "../../types/product"; // Corrected path
import "../../styles/ProductCard.css"; // Import the CSS file

interface ProductCardProps {
  product: Product;
  addFavorite?: (product: Product) => void;
  removeFavorite?: (productId: string, retailerId: number) => void;
  isFavorite: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  addFavorite,
  removeFavorite,
  isFavorite,
}) => {
  // console.log("Product data:", product);

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
    console.log(`+++public/assets/logos/${imageName}.png`);
    return `public/assets/logos/${imageName}.png`; // Adjusted path assuming assets are served from public root
  };

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFavorite && removeFavorite(product.id, product.retailer_id);
    } else {
      addFavorite && addFavorite(product);
    }
  };

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
          <span
            className={`product-card-heart-icon ${
              isFavorite
                ? "product-card-heart-icon-liked"
                : "product-card-heart-icon-unliked"
            }`}
            onClick={handleFavoriteClick}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? "❤️" : "🤍"}{" "}
            {/* Using actual heart emojis for simplicity */}
          </span>
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
