import React from 'react';

const ParisStartTime = ({ startTime }) => {
  // Check if startTime is defined before using replace
  const cleanTime = startTime 
    ? startTime.replace(/\s*\(Paris\)\s*/, '').trim()
    : 'N/A';
  
  return (
    <div className="flex items-center">
      <span>{cleanTime}</span>
      <span className="ml-2" role="img" aria-label="French Flag">🇫🇷</span>
    </div>
  );
};

export default ParisStartTime;