import React, { useState } from "react";
import { Product } from "../../types/product"; // Corrected path
import "../../styles/ProductCard.css"; // Import the CSS file

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // console.log("Product data:", product);
  const [isLiked, setIsLiked] = useState(false);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getRetailerLogoPath = (retailerName: string | undefined): string => {
    if (!retailerName) return "";
    // console.log(`public/assets/logos/${retailerName}.png`);
    return `public/assets/logos/${retailerName}.png`; // Adjusted path assuming assets are served from public root
  };

  return (
    <div className="product-card">
      <div className="product-card-image">{product.emoji || "🥬"}</div>
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
              {product.is_frontpage && (
                <span className="product-card-frontpage-indicator">
                  {" "}
                  ⭐ Front Page
                </span>
              )}
            </div>

            <div className="product-card-promo-details-row">
              <span className="product-card-promo">
                {truncateText(product.promotion_details || "No details", 30)}
              </span>
            </div>
          </div>
          <span
            className={`product-card-heart-icon ${
              isLiked
                ? "product-card-heart-icon-liked"
                : "product-card-heart-icon-unliked"
            }`}
            onClick={() => setIsLiked(!isLiked)}
            title={isLiked ? "Unlike" : "Like"}
          >
            {isLiked ? "❤️" : "🤍"}{" "}
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
