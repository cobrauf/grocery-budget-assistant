import React from "react";
import ModalBase from "../common/ModalBase";

interface ClearFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ClearFavoritesModal: React.FC<ClearFavoritesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <>
      <button onClick={onClose} className="modal-button-cancel">
        Cancel
      </button>
      <button onClick={handleConfirm} className="modal-button-confirm">
        Confirm
      </button>
    </>
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Clear Favorites"
      footer={footer}
    >
      <p style={{ textAlign: "center", margin: "20px 0" }}>
        Remove all favorited items?
      </p>
    </ModalBase>
  );
};

export default ClearFavoritesModal;
