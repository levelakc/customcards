import React from 'react';

const SparkleText = ({ children }) => {
  return (
    <div className="sparkle-container">
      {children}
      {/* We create multiple sparkle elements for a richer effect */}
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
    </div>
  );
};

export default SparkleText;