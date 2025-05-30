import React from "react";

interface CustomProductCardProps {
  onRemoveAllClick: () => void;
  onRemoveExpiredClick: () => void;
}

const CustomProductCard: React.FC<CustomProductCardProps> = ({
  onRemoveAllClick,
  onRemoveExpiredClick,
}) => {
  return (
    <div
      style={{
        textAlign: "center",
        margin: "20px 0",
        padding: "0px 15px",
        // border: "1px solid #ccc",
        // borderRadius: "8px",
        // backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "row",
        // alignItems: "center",
        justifyContent: "center",
        gap: "50px",
      }}
    >
      <button
        onClick={onRemoveAllClick}
        className="modal-button-confirm" // Assuming this class provides styling
        style={{ width: "150px" }} // Added width for consistency
      >
        Remove All Favs
      </button>
      <button
        onClick={onRemoveExpiredClick}
        className="modal-button-confirm" // Assuming this class provides styling
        style={{ width: "150px" }} // Added width for consistency
      >
        Remove Expired
      </button>
    </div>
  );
};

export default CustomProductCard;
