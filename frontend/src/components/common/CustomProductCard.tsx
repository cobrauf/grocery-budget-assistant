import React from "react";

interface CustomProductCardProps {
  onRemoveAllClick: () => void;
  onRemoveExpiredClick: () => void;
}

const CustomProductCard: React.FC<CustomProductCardProps> = ({
  onRemoveAllClick,
  onRemoveExpiredClick,
}) => {
  const buttonStyle: React.CSSProperties = {
    width: "150px",
    height: "40px",
    padding: "10px 15px",
    backgroundColor: "#F7374F",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    // fontWeight: "bold",
    textAlign: "center",
  };

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
        gap: "30px",
      }}
    >
      <button
        onClick={onRemoveAllClick}
        // className="modal-button-confirm" // Assuming this class provides styling
        style={buttonStyle}
      >
        Remove All Favs
      </button>
      <button
        onClick={onRemoveExpiredClick}
        // className="modal-button-confirm" // Assuming this class provides styling
        style={buttonStyle}
      >
        Remove Expired
      </button>
    </div>
  );
};

export default CustomProductCard;
