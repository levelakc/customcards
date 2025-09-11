import React, { useState, useEffect } from 'react';

const ScrollSparkles = () => {
  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Define the scroll range where the effect fades in
      const startFade = 100; // Start fading in after 100px of scrolling
      const endFade = 500;   // Fully visible at 500px

      if (scrollPosition > startFade) {
        const opacity = Math.min((scrollPosition - startFade) / (endFade - startFade), 1);
        setScrollOpacity(opacity);
      } else {
        setScrollOpacity(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create an array to easily render multiple sparkle streaks
  const sparkleCount = 20;
  const sparkles = Array.from({ length: sparkleCount });

  return (
    <div className="scroll-sparkle-container" style={{ opacity: scrollOpacity }}>
      {sparkles.map((_, i) => (
        <div key={i} className="border-sparkle"></div>
      ))}
    </div>
  );
};

export default ScrollSparkles;