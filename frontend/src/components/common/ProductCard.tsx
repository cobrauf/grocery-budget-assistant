import React, { useState } from "react";
import { Product } from "../../types/product"; // Corrected path
import "../../styles/ProductCard.css"; // Import the CSS file

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  console.log("Product data:", product);
  const [isLiked, setIsLiked] = useState(false);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="product-card">
      <div className="product-card-image-placeholder">
        {product.emoji || "🥬"}
      </div>
      <div className="product-card-details">
        <div className="product-card-title-row">
          <div className="product-card-text-details">
            <div>
              <span className="product-card-price">
                ${product.price.toFixed(2)}
              </span>
              {product.unit && (
                <span className="product-card-unit">{product.unit}</span>
              )}
              {product.promotion_details && (
                <span className="product-card-promo">
                  ({product.promotion_details})
                </span>
              )}
            </div>
            <div className="product-card-description">
              {truncateText(product.name, 70)}
            </div>
            {product.retailer && (
              <div className="product-card-retailer">
                {product.retailer_name}
              </div>
            )}
            {product.is_frontpage && (
              <span className="product-card-frontpage-indicator">
                ⭐ Front Page
              </span>
            )}
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
      </div>
    </div>
  );
};

export default ProductCard;
