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
    const { cardsPerPage, cardsToRender } = useMemo(() => {
        if (windowWidth < 640) return { cardsPerPage: 1, cardsToRender: 3 }; // Current + Prev + Next
        if (windowWidth < 1024) return { cardsPerPage: 2, cardsToRender: 6 }; // Current + Prev + Next
        return { cardsPerPage: 4, cardsToRender: 12 }; // Current + Prev + Next (Full circle if items=12)
    }, [windowWidth]);

    const totalPages = Math.ceil((items?.length || 0) / cardsPerPage);
    const itemAngle = items && items.length > 0 ? 360 / items.length : 0;
    
    // Dynamic Sizing
    const isMobile = windowWidth < 768;
    const cardWidth = useMemo(() => {
        if (windowWidth < 640) return Math.min(180, windowWidth * 0.7);
        if (windowWidth < 1024) return 200;
        return 240;
    }, [windowWidth]);

    // Calculate radius to keep circular shape and prevent "clipping" on the sides
    const radius = useMemo(() => {
        if (!items || items.length <= 1) return 0;
        // Basic trig: radius = (width / 2) / tan(PI / items.length)
        let calculatedRadius = (cardWidth / 2) / Math.tan(Math.PI / items.length);
        
        // Add breathing room based on screen size
        const padding = windowWidth < 640 ? 40 : (windowWidth < 1024 ? 80 : 120);
        return calculatedRadius + padding;
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

    if (!items || items.length === 0) {
        return <div className="text-center text-white py-10">טוען מוצרים...</div>;
    }

    // Always render CURRENT page, PREVIOUS page, and NEXT page
    // This ensures cards are visible on both left and right during any rotation
    const renderedIndices = useMemo(() => {
        const indices = new Set();
        const pagesToRender = [
            (currentPage - 1 + totalPages) % totalPages, // Previous
            currentPage,                                  // Current
            (currentPage + 1) % totalPages               // Next
        ];

        pagesToRender.forEach(page => {
            for (let i = 0; i < cardsPerPage; i++) {
                const index = (page * cardsPerPage + i) % items.length;
                if (items[index]) indices.add(index);
            }
        });

        return Array.from(indices);
    }, [currentPage, totalPages, cardsPerPage, items]);

    return (
        <div className="w-full flex relative min-h-[450px] md:min-h-[600px] items-center justify-center overflow-x-hidden px-4 sm:px-12 md:px-24">
            {/* Left Arrow */}
            <button 
                onClick={handlePrev}
                disabled={isAnimating}
                className={`absolute left-2 sm:left-4 md:left-8 z-50 glass-panel p-3 sm:p-4 rounded-full border-gold-500/30 hover:border-gold-500/60 transition-all group active:scale-95 ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]'}`}
                aria-label="Previous"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`absolute right-2 sm:right-4 md:right-8 z-50 glass-panel p-3 sm:p-4 rounded-full border-gold-500/30 hover:border-gold-500/60 transition-all group active:scale-95 ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]'}`}
                aria-label="Next"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
