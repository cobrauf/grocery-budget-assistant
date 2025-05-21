import React from "react";
import "../../styles/FavItemBar.css";

interface FavItemBarProps {
  onUpdate: () => void;
  onEmail: () => void;
  isUpdateEnabled: boolean;
}

const FavItemBar: React.FC<FavItemBarProps> = ({
  onUpdate,
  onEmail,
  isUpdateEnabled,
}) => {
  return (
    <div className="fav-item-bar">
      <button
        className={`fav-item-button update-button${
          isUpdateEnabled ? " enabled" : ""
        }`}
        onClick={onUpdate}
        disabled={!isUpdateEnabled}
      >
        Update List
      </button>
      <button className="fav-item-button email-button" onClick={onEmail}>
        Email Favorites
      </button>
    </div>
  );
};

export default FavItemBar;
