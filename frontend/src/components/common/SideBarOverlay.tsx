import React from "react";

interface SideBarOverlayProps {
  onClick: () => void;
  isOpen: boolean;
}

const SideBarOverlay: React.FC<SideBarOverlayProps> = ({ onClick, isOpen }) => {
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(4px)",
    zIndex: 1040, // Above Header (1001), below SideBar (1050)
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    transition: "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
  };

  return <div style={overlayStyle} onClick={onClick}></div>;
};

export default SideBarOverlay;
