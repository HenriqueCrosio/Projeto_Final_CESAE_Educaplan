import React from "react";

export const PageLoader: React.FC = () => {
  return (
    <div className="page-loader">
      <div className="page-loader__spinner"></div>
      <p>Loading...</p>
    </div>
  );
};
