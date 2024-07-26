import React from 'react';

const ParisStartTime = ({ startTime }) => {
  // Remove "(Paris)" from the startTime if it's present
  const cleanTime = startTime.replace(/\s*\(Paris\)\s*/, '').trim();
  
  return (
    <div className="flex items-center">
      <span>{cleanTime}</span>
      <span className="ml-2" role="img" aria-label="French Flag">🇫🇷</span>
    </div>
  );
};

export default ParisStartTime;