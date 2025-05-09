import React from "react";

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return <main style={{ padding: "1rem", flexGrow: 1 }}>{children}</main>;
};

export default MainContent;
