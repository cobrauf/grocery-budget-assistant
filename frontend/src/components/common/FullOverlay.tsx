import React from "react";

interface FullOverlayProps {
  onClick?: () => void;
  isOpen: boolean;
  children?: React.ReactNode;
  isTransparent?: boolean;
}

const FullOverlay: React.FC<FullOverlayProps> = ({
  onClick,
  isOpen,
  children,
  isTransparent = true,
}) => {
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isTransparent
      ? "rgba(0, 0, 0, 0.3)"
      : "rgba(0, 0, 0, 0.7)",
    backdropFilter: isTransparent ? "blur(4px)" : "none",
    zIndex: 1040,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    transition: "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={overlayStyle} onClick={onClick}>
      {children}
    </div>
  );
};

export default FullOverlay;
