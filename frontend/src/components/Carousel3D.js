import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ProductCard from './ProductCard';

const MOBILE_BREAKPOINT = 768;
const ANIMATION_DURATION = 800; // 0.8 seconds

export default function Carousel3D({ items }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
    const [currentPage, setCurrentPage] = useState(0);
    const [visiblePageIndices, setVisiblePageIndices] = useState([0]); // Currently rendering pages
    const [isAnimating, setIsTransitioning] = useState(false);
    
    const carouselInnerRef = useRef(null);
    const rotationValue = useRef(0);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const cardsPerPage = isMobile ? 1 : 4;
    const totalPages = Math.ceil((items?.length || 0) / cardsPerPage);
    const itemAngle = items && items.length > 0 ? 360 / items.length : 0;
    
    // Calculate radius to keep circular shape
    const cardWidthForCalc = (isMobile ? 140 : 200);
    const radius = useMemo(() => {
        if (!items || items.length <= 1) return 0;
        let calculatedRadius = (cardWidthForCalc / 2) / Math.tan(Math.PI / items.length);
        return isMobile ? Math.max(calculatedRadius + 50, 200) : Math.max(calculatedRadius + 100, 350);
    }, [items, isMobile]);

    const cardWidth = (isMobile ? Math.min(160, window.innerWidth * 0.7) : 220);

    const changePage = useCallback((direction) => {
        if (isAnimating || !items || items.length === 0) return;

        const nextPage = (currentPage + direction + totalPages) % totalPages;
        
        // 1. Prepare: Add the next page to DOM (render behind the scenes)
        setVisiblePageIndices(prev => Array.from(new Set([...prev, nextPage])));
        setIsTransitioning(true);

        // 2. Wait for DOM to update
        setTimeout(() => {
            // 3. Animate rotation
            const rotationStep = (isMobile ? 1 : 4) * itemAngle;
            rotationValue.current += direction * -rotationStep;
            
            if (carouselInnerRef.current) {
                carouselInnerRef.current.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                carouselInnerRef.current.style.transform = `rotateY(${rotationValue.current}deg)`;
            }

            // 4. Cleanup: Remove old page from DOM after animation finishes
            setTimeout(() => {
                setCurrentPage(nextPage);
                setVisiblePageIndices([nextPage]);
                setIsTransitioning(false);
                if (carouselInnerRef.current) {
                    carouselInnerRef.current.style.transition = 'none';
                }
            }, ANIMATION_DURATION);
        }, 50); // Buffer for browser paint

    }, [currentPage, totalPages, isAnimating, itemAngle, isMobile, items]);

    const handleNext = () => changePage(1);
    const handlePrev = () => changePage(-1);

    if (!items || items.length === 0) {
        return <div className="text-center text-white py-10">טוען מוצרים...</div>;
    }

    // Identify which card indices are currently part of the rendered pages
    const renderedIndices = [];
    visiblePageIndices.forEach(page => {
        for (let i = 0; i < cardsPerPage; i++) {
            const index = (page * cardsPerPage + i) % items.length;
            if (!renderedIndices.includes(index)) {
                renderedIndices.push(index);
            }
        }
    });

    return (
        <div className="w-full flex relative min-h-[450px] md:min-h-[550px] items-center justify-center overflow-x-hidden px-4 md:px-20">
            {/* Left Arrow */}
            <button 
                onClick={handlePrev}
                disabled={isAnimating}
                className={`absolute left-4 md:left-8 z-50 glass-panel p-4 rounded-full border-gold-500/30 hover:border-gold-500/60 transition-all group active:scale-95 ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]'}`}
                aria-label="Previous"
            >
                <svg className="w-6 h-6 text-white group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="w-full h-full" style={{ perspective: '2500px', transformStyle: 'preserve-3d' }}>
                <div
                    ref={carouselInnerRef} 
                    className="relative w-full h-full"
                    style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: '50% 50%',
                        transform: `rotateY(${rotationValue.current}deg)`
                    }}
                >
                    {renderedIndices.map((index) => {
                        const item = items[index];
                        if (!item) return null;
                        return (
                            <div
                                key={`${item._id}-${index}`}
                                className="absolute h-auto"
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
                                    isMobile={isMobile}
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
                className={`absolute right-4 md:right-8 z-50 glass-panel p-4 rounded-full border-gold-500/30 hover:border-gold-500/60 transition-all group active:scale-95 ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]'}`}
                aria-label="Next"
            >
                <svg className="w-6 h-6 text-white group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
