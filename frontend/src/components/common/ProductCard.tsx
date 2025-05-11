import React, { useState } from "react";
import { Product } from "../../types/product"; // Corrected path

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  console.log("Product data:", product);
  const [isLiked, setIsLiked] = useState(false);

  const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    padding: "1rem",
    borderBottom: "1px solid var(--theme-sidebar-divider, #eee)",
    backgroundColor: "var(--theme-background, white)",
    color: "var(--theme-text, #212529)",
  };

  const imagePlaceholderStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    backgroundColor: "var(--theme-secondary-bg, #e9ecef)", // A light grey for placeholder
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    borderRadius: "4px",
    marginRight: "1rem",
    color: "var(--theme-secondary-text, #495057)",
  };

  const detailsStyle: React.CSSProperties = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  };

  const titleRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  };

  const textDetailsStyle: React.CSSProperties = {
    flexGrow: 1,
  };

  const priceStyle: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "var(--theme-primary, #007bff)",
  };

  const unitStyle: React.CSSProperties = {
    fontSize: "0.9rem",
    marginLeft: "0.3rem",
    color: "var(--theme-text-secondary, #6c757d)", // A secondary text color
  };

  const promoStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    fontStyle: "italic",
    color: "var(--theme-text-secondary, #6c757d)",
    marginLeft: "0.5rem",
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "1rem",
    margin: "0.3rem 0",
    // For truncation, a CSS approach is often better but JS can work too
    // whiteSpace: 'nowrap', // if single line
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
    // display: '-webkit-box',
    // WebkitLineClamp: 2, // Number of lines
    // WebkitBoxOrient: 'vertical',
  };

  const retailerStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    color: "var(--theme-text-secondary, #6c757d)",
  };

  const heartIconStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    cursor: "pointer",
    marginLeft: "1rem",
    color: isLiked
      ? "var(--theme-error, red)"
      : "var(--theme-icon-secondary, #ccc)", // Use error color for liked
    transition: "color 0.2s ease-in-out",
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div style={cardStyle}>
      <div style={imagePlaceholderStyle}>{product.emoji || "🥬"}</div>
      <div style={detailsStyle}>
        <div style={titleRowStyle}>
          <div style={textDetailsStyle}>
            <div>
              <span style={priceStyle}>${product.price.toFixed(2)}</span>
              {product.unit && <span style={unitStyle}>{product.unit}</span>}
              {product.promotion_details && (
                <span style={promoStyle}>({product.promotion_details})</span>
              )}
            </div>
            <div style={descriptionStyle}>{truncateText(product.name, 70)}</div>
            {product.retailer && (
              <div style={retailerStyle}>{product.retailer.name}</div>
            )}
          </div>
          <span
            style={heartIconStyle}
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
