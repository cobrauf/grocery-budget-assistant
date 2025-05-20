import React, { useState, useEffect, useRef } from "react";
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
  isDefaultBrowseView?: boolean; // Flag to determine button text
}

const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialSelectedCategories,
  onConfirmSelections,
  isDefaultBrowseView = false,
}) => {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(
    new Set(initialSelectedCategories)
  );
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

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

  const handleSelectAllToggle = () => {
    if (selectedNames.size === categories.length) {
      setSelectedNames(new Set());
    } else {
      setSelectedNames(new Set(categories.map((c) => c.name)));
    }
  };

  const isAllSelected =
    categories.length > 0 && selectedNames.size === categories.length;
  const isIndeterminate =
    selectedNames.size > 0 && selectedNames.size < categories.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleConfirm = () => {
    onConfirmSelections(selectedNames);
    // onClose(); // DefaultBrowseView will call onClose after calling handleShowItems
  };

  const footer = (
    <>
      {/* <button onClick={onClose} className="modal-button-cancel">
        Cancel
      </button> */}
      <button
        onClick={handleConfirm}
        className="modal-button-confirm"
        // disabled={selectedNames.size === 0} //allowing empty selection
      >
        {isDefaultBrowseView ? "Update Filters" : "Update Items"}
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
      {categories.length > 0 && (
        <div className="modal-select-all-item">
          <input
            type="checkbox"
            id="select-all-categories"
            ref={selectAllCheckboxRef}
            checked={isAllSelected}
            onChange={handleSelectAllToggle}
          />
          <label htmlFor="select-all-categories">Select All</label>
        </div>
      )}
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
