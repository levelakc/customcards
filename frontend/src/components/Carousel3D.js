import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';

const DRAG_SENSITIVITY = 0.06;
const INERTIA_DAMPING = 0.96;
const MOBILE_BREAKPOINT = 768;

export default function Carousel3D({ items }) {
    const rotationValue = useRef(0);
    const targetRotation = useRef(0); // Track target angle for smooth transitions
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    const elementRef = useRef(null);
    const carouselInnerRef = useRef(null);
    const isDragging = useRef(false);
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ x: 0, rotation: 0, lastX: 0, lastTime: 0 });
    const velocity = useRef(0);
    const animationFrameId = useRef(null);
    const isSnapping = useRef(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const itemCount = items?.length || 0;
    const itemAngle = itemCount > 0 ? 360 / itemCount : 0;

    const animate = useCallback(() => {
        let shouldContinue = false;

        if (isDragging.current) {
            isSnapping.current = false;
            targetRotation.current = rotationValue.current;
            shouldContinue = true;
        } else if (isSnapping.current) {
            const diff = targetRotation.current - rotationValue.current;
            rotationValue.current += diff * 0.1;

            if (Math.abs(diff) < 0.1) {
                rotationValue.current = targetRotation.current;
                isSnapping.current = false;
            } else {
                shouldContinue = true;
            }
        } else if (Math.abs(velocity.current) > 0.01) {
            velocity.current *= INERTIA_DAMPING;
            rotationValue.current += velocity.current;
            targetRotation.current = rotationValue.current;
            shouldContinue = true;
        }

        if (carouselInnerRef.current) {
            carouselInnerRef.current.style.transform = `rotateY(${rotationValue.current}deg)`;

            const children = carouselInnerRef.current.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                let absAngle = (i * itemAngle + rotationValue.current) % 360;
                if (absAngle > 180) absAngle -= 360;
                if (absAngle < -180) absAngle += 360;

                // Keep roughly 4-5 cards visible at the front
                if (Math.abs(absAngle) > 75) {
                    if (child.style.visibility !== 'hidden') {
                        child.style.opacity = '0';
                        child.style.visibility = 'hidden';
                    }
                } else {
                    if (child.style.visibility !== 'visible') {
                        child.style.opacity = '1';
                        child.style.visibility = 'visible';
                    }
                }
            }
        }

        if (shouldContinue || isDragging.current) {
            animationFrameId.current = requestAnimationFrame(animate);
        } else {
            animationFrameId.current = null;
        }
    }, [itemAngle]);

    const startAnimation = useCallback(() => {
        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(animate);
        }
    }, [animate]);

    useEffect(() => {
        startAnimation();
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [startAnimation]);

    const handleNext = useCallback(() => {
        targetRotation.current -= (isMobile ? 1 : 4) * itemAngle;
        isSnapping.current = true;
        startAnimation();
    }, [itemAngle, isMobile, startAnimation]);

    const handlePrev = useCallback(() => {
        targetRotation.current += (isMobile ? 1 : 4) * itemAngle;
        isSnapping.current = true;
        startAnimation();
    }, [itemAngle, isMobile, startAnimation]);

    const handleDragStart = useCallback((e) => {
        isDragging.current = true;
        setDragging(true);
        isSnapping.current = false;
        velocity.current = 0;
        startAnimation();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        dragStart.current = { x: clientX, rotation: rotationValue.current, lastX: clientX, lastTime: Date.now() };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        
        if (e.touches && e.cancelable) {
            e.preventDefault();
        }
    }, [startAnimation]);
        const handleDragMove = useCallback((e) => {
            if (!isDragging.current) return;
            if (e.touches) {
                // Do not preventDefault here for mouse events to avoid blocking other interactions
                // but for touches it's often needed to prevent scrolling
            }
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            
            const now = Date.now();
            const moveDelta = clientX - dragStart.current.lastX;
            const timeDelta = now - dragStart.current.lastTime;
            
            if (timeDelta > 0) {
                velocity.current = (moveDelta / timeDelta) * 15; 
            }
    
            // Update rotation directly for real-time tracking
            rotationValue.current += moveDelta * DRAG_SENSITIVITY * 10;
            
            dragStart.current.lastX = clientX;
            dragStart.current.lastTime = now;
        }, []);
    
        const handleDragEnd = useCallback(() => {
            isDragging.current = false;
            setDragging(false);
            if (Math.abs(velocity.current) < 0.5) { // If velocity is low, snap
                isSnapping.current = true;
            }
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }, []);
        
    const cardWidth = (isMobile ? Math.min(160, window.innerWidth * 0.7) : 220);

    // The minimum radius needed to prevent cards from overlapping is (cardWidth / 2) / tan(PI / itemCount).
    // We add a little extra padding.
    const cardWidthForCalc = (isMobile ? 140 : 200);
    let radius;

    if (!items || items.length <= 1) { 
        radius = 0; 
    } else {
        let calculatedRadius = (cardWidthForCalc / 2) / Math.tan(Math.PI / items.length);

        if (isMobile) {
            calculatedRadius = Math.max(calculatedRadius + 50, 200);
        } else {
            calculatedRadius = Math.max(calculatedRadius + 100, 350);
        }
        radius = calculatedRadius;
    }

    useEffect(() => {
        const handleMove = (e) => handleDragMove(e);
        const handleEnd = () => handleDragEnd();

        if (dragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [dragging, handleDragMove, handleDragEnd]);

    if (!items || items.length === 0) {
        return <div className="text-center text-white py-10">טוען מוצרים...</div>;
    }

    return (
        <div 
            ref={elementRef} 
            className="w-full flex relative min-h-[400px] md:min-h-[500px] max-h-screen items-center justify-center overflow-x-hidden overflow-y-hidden px-12"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            {/* Left Arrow */}
            <button 
                onClick={handlePrev}
                className="absolute left-4 z-50 glass-panel p-4 rounded-full border-gold-500/30 hover:border-gold-500/60 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all group active:scale-95"
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
                    }}
                >
                    {items.map((item, i) => {
                        if (!item || !item._id) return null;
                        return (
                            <div
                                key={item._id}
                                className="absolute h-auto"
                                style={{
                                    width: `${cardWidth}px`,
                                    transform: `translateX(-50%) translateY(-50%) rotateY(${i * itemAngle}deg) translateZ(${radius}px)`,
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    top: '50%',
                                    left: '50%',
                                    willChange: 'transform, opacity'
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
                className="absolute right-4 z-50 glass-panel p-4 rounded-full border-gold-500/30 hover:border-gold-500/60 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all group active:scale-95"
                aria-label="Next"
            >
                <svg className="w-6 h-6 text-white group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}