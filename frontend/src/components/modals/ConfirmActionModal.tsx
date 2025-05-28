import React from "react";
import ModalBase from "../common/ModalBase";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
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
    <ModalBase isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div style={{ textAlign: "center", margin: "20px 0" }}>{children}</div>
    </ModalBase>
  );
};

export default ConfirmActionModal;
