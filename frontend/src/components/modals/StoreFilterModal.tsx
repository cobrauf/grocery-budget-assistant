import React, { useState, useEffect, useRef } from "react";
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
  isDefaultBrowseView?: boolean; // Flag to determine button text
}

const StoreFilterModal: React.FC<StoreFilterModalProps> = ({
  isOpen,
  onClose,
  retailers,
  initialSelectedStoreIds,
  onConfirmSelections,
  getLogoPath,
  isDefaultBrowseView = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(initialSelectedStoreIds)
  );
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

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

  const handleSelectAllToggle = () => {
    if (selectedIds.size === retailers.length) {
      // If all are selected, deselect all
      setSelectedIds(new Set());
    } else {
      // Otherwise (none or some selected), select all
      setSelectedIds(new Set(retailers.map((r) => r.id)));
    }
  };

  const isAllSelected =
    retailers.length > 0 && selectedIds.size === retailers.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < retailers.length;

  // Effect to set indeterminate state on the checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleConfirm = () => {
    onConfirmSelections(selectedIds);
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
        // disabled={selectedIds.size === 0} // allowing empty selection
      >
        {isDefaultBrowseView ? "Update filters" : "View Sales"}
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
      {retailers.length > 0 && (
        <div className="modal-select-all-item">
          <input
            type="checkbox"
            id="select-all-stores"
            ref={selectAllCheckboxRef}
            checked={isAllSelected}
            onChange={handleSelectAllToggle}
          />
          <label htmlFor="select-all-stores">Select All</label>
        </div>
      )}
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
      {/* {retailers.length === 0 && <p>No stores available to filter.</p>} */}
    </ModalBase>
  );
};

export default StoreFilterModal;
