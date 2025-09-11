import React, { useState, useEffect, useRef } from 'react';

const SparkleSection = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    // The Intersection Observer API is the modern way to detect when an element
    // enters the viewport. It's much more efficient than listening to scroll events.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when the section's visibility changes
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // observing relative to the viewport
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Cleanup function to stop observing when the component unmounts
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const sparkleCount = 12; // Reduced count for a cleaner look
  const sparkles = Array.from({ length: sparkleCount });

  return (
    // The ref is attached here so the observer knows which element to watch
    <div ref={sectionRef} className="sparkle-section-container">
      {/* The actual content (e.g., the "Our Designs" section) goes here */}
      {children}
      
      {/* The sparkle container is only active when the section is visible */}
      <div className={`section-sparkle-container ${isVisible ? 'visible' : ''}`}>
        {sparkles.map((_, i) => (
          <div key={i} className="section-border-sparkle"></div>
        ))}
      </div>
    </div>
  );
};

export default SparkleSection;