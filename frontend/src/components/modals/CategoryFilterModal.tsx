import React, { useState, useEffect } from "react";
import ModalBase from "../common/ModalBase";

interface CategoryItem {
  name: string;
  icon: string;
}

interface CategoryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  initialSelectedCategories: Set<string>;
  onConfirmSelections: (selectedNames: Set<string>) => void;
}

const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialSelectedCategories,
  onConfirmSelections,
}) => {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(
    new Set(initialSelectedCategories)
  );

  useEffect(() => {
    setSelectedNames(new Set(initialSelectedCategories));
  }, [initialSelectedCategories, isOpen]);

  const handleToggle = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirmSelections(selectedNames);
    // onClose(); // DefaultBrowseView will call onClose after calling handleShowItems
  };

  const footer = (
    <>
      <button onClick={onClose} className="modal-button-cancel">
        Cancel
      </button>
      <button onClick={handleConfirm} className="modal-button-confirm">
        Show Items
      </button>
    </>
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Filter by Categories"
      footer={footer}
    >
      {categories.map((category) => (
        <div key={category.name} className="modal-filter-item">
          <input
            type="checkbox"
            id={`category-${category.name}`}
            checked={selectedNames.has(category.name)}
            onChange={() => handleToggle(category.name)}
          />
          <span className="category-icon-small">{category.icon}</span>
          <label htmlFor={`category-${category.name}`}>{category.name}</label>
        </div>
      ))}
      {categories.length === 0 && <p>No categories available to filter.</p>}
    </ModalBase>
  );
};

export default CategoryFilterModal;
