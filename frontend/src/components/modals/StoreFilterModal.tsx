import React, { useState, useEffect } from "react";
import ModalBase from "../common/ModalBase";
import { Retailer } from "../../types/retailer";
// Assuming getLogoPath is available or passed, or we just show names

interface StoreFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  retailers: Retailer[];
  initialSelectedStoreIds: Set<number>;
  onConfirmSelections: (selectedIds: Set<number>) => void;
  getLogoPath: (name: string) => string; // To display logos in modal
}

const StoreFilterModal: React.FC<StoreFilterModalProps> = ({
  isOpen,
  onClose,
  retailers,
  initialSelectedStoreIds,
  onConfirmSelections,
  getLogoPath,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(initialSelectedStoreIds)
  );

  // Reset temporary selections if modal is reopened with different initial selections
  useEffect(() => {
    setSelectedIds(new Set(initialSelectedStoreIds));
  }, [initialSelectedStoreIds, isOpen]);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirmSelections(selectedIds);
    // onClose(); // DefaultBrowseView will call onClose after calling handleShowItems
  };

  const footer = (
    <>
      <button onClick={onClose} className="modal-button-cancel">
        Cancel
      </button>
      <button onClick={handleConfirm} className="modal-button-confirm">
        View Sales
      </button>
    </>
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Filter by Stores"
      footer={footer}
    >
      {retailers.map((retailer) => (
        <div key={retailer.id} className="modal-filter-item">
          <input
            type="checkbox"
            id={`store-${retailer.id}`}
            checked={selectedIds.has(retailer.id)}
            onChange={() => handleToggle(retailer.id)}
          />
          <img
            src={getLogoPath(retailer.name)}
            alt={retailer.name}
            className="logo-image-small"
          />
          <label htmlFor={`store-${retailer.id}`}>{retailer.name}</label>
        </div>
      ))}
      {retailers.length === 0 && <p>No stores available to filter.</p>}
    </ModalBase>
  );
};

export default StoreFilterModal;
