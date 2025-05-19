import React from "react";
import "./SortPillsBar.css"; // We will create this CSS file next

// Props will be added in Task 2 for interactivity
interface SortPillsBarProps {}

const SortPillsBar: React.FC<SortPillsBarProps> = () => {
  return (
    <div className="sort-pills-bar">
      <div className="sort-pill">Price</div>
      <div className="sort-pill">Store</div>
      <div className="sort-pill">Categ.</div>
    </div>
  );
};

export default SortPillsBar;
