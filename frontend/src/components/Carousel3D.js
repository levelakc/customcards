import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ProductCard from './ProductCard';

const ANIMATION_DURATION = 800; // 0.8 seconds

export default function Carousel3D({ items }) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [currentPage, setCurrentPage] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const carouselInnerRef = useRef(null);
    const rotationValue = useRef(0);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Responsive Configuration
    const cardsPerPage = useMemo(() => {
        if (windowWidth < 640) return 1;
        if (windowWidth < 1024) return 2;
        return 4;
    }, [windowWidth]);

    const totalPages = Math.ceil((items?.length || 0) / cardsPerPage);
    const itemAngle = items && items.length > 0 ? 360 / items.length : 0;
    
    // Dynamic Sizing - Scale cards to fit screen width
    const cardWidth = useMemo(() => {
        if (windowWidth < 640) return Math.min(180, windowWidth * 0.7);
        if (windowWidth < 1024) return 200;
        return 240;
    }, [windowWidth]);

    // Dynamic Radius with screen-width awareness to prevent clipping
    const radius = useMemo(() => {
        if (!items || items.length <= 1) return 0;
        let calculatedRadius = (cardWidth / 2) / Math.tan(Math.PI / items.length);
        
        // Cap radius to ensure it fits within the viewport with some margin
        const maxRadius = (windowWidth / 2) - 40; 
        const padding = windowWidth < 640 ? 30 : 60;
        
        return Math.min(calculatedRadius + padding, maxRadius);
    }, [items, cardWidth, windowWidth]);

    const changePage = useCallback((direction) => {
        if (isAnimating || !items || items.length === 0) return;

        setIsAnimating(true);
        const nextPage = (currentPage + direction + totalPages) % totalPages;
        
        const rotationStep = cardsPerPage * itemAngle;
        rotationValue.current += direction * -rotationStep;
        
        if (carouselInnerRef.current) {
            carouselInnerRef.current.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            carouselInnerRef.current.style.transform = `rotateY(${rotationValue.current}deg)`;
        }

        setTimeout(() => {
            setCurrentPage(nextPage);
            setIsAnimating(false);
            if (carouselInnerRef.current) {
                carouselInnerRef.current.style.transition = 'none';
            }
        }, ANIMATION_DURATION);

    }, [currentPage, totalPages, isAnimating, itemAngle, cardsPerPage, items]);

    const handleNext = () => changePage(1);
    const handlePrev = () => changePage(-1);

    // Visibility Logic: We need to hide cards that are in the "back" of the circle
    // to keep rendering performance high. Since we use CSS transitions, we'll
    // just use a simple state to track which cards are currently in the front arc.
    useEffect(() => {
        if (!carouselInnerRef.current) return;
        
        const updateVisibility = () => {
            const children = carouselInnerRef.current.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const index = parseInt(child.dataset.index);
                if (isNaN(index)) continue;

                let absAngle = (index * itemAngle + rotationValue.current) % 360;
                if (absAngle > 180) absAngle -= 360;
                if (absAngle < -180) absAngle += 360;

                // Show cards within a 120-degree arc at the front
                const isVisible = Math.abs(absAngle) < 110;
                child.style.opacity = isVisible ? '1' : '0';
                child.style.visibility = isVisible ? 'visible' : 'hidden';
            }
        };

        updateVisibility();
        if (isAnimating) {
            const interval = setInterval(updateVisibility, 50);
            return () => clearInterval(interval);
        }
    }, [isAnimating, itemAngle, windowWidth]);

    if (!items || items.length === 0) {
        return <div className="text-center text-white py-10">טוען מוצרים...</div>;
    }

    return (
        <div className="w-full flex relative min-h-[450px] md:min-h-[600px] items-center justify-center overflow-x-hidden px-2 sm:px-12 md:px-24">
            {/* Left Arrow */}
            <button 
                onClick={handlePrev}
                disabled={isAnimating}
                className={`absolute left-2 sm:left-4 z-50 glass-panel p-3 sm:p-5 rounded-full border-gold-500/30 hover:border-gold-500/60 transition-all group active:scale-90 ${isAnimating ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'}`}
                aria-label="Previous"
            >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="w-full h-full" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>
                <div
                    ref={carouselInnerRef} 
                    className="relative w-full h-full"
                    style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: '50% 50%',
                        transform: `rotateY(${rotationValue.current}deg)`
                    }}
                >
                    {items.map((item, index) => {
                        if (!item) return null;
                        return (
                            <div
                                key={`${item._id}-${index}`}
                                data-index={index}
                                className="absolute h-auto transition-opacity duration-300"
                                style={{
                                    width: `${cardWidth}px`,
                                    transform: `translateX(-50%) translateY(-50%) rotateY(${index * itemAngle}deg) translateZ(${radius}px)`,
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    top: '50%',
                                    left: '50%',
                                }}
                            >
                               <ProductCard
                                    product={item}
                                    disableClick={true}
                                    isMobile={windowWidth < 768}
                                    isCarousel={true}
                               />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Arrow */}
            <button 
                onClick={handleNext}
                disabled={isAnimating}
                className={`absolute right-2 sm:right-4 z-50 glass-panel p-3 sm:p-5 rounded-full border-gold-500/30 hover:border-gold-500/60 transition-all group active:scale-90 ${isAnimating ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'}`}
                aria-label="Next"
            >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
