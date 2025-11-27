import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';

const DRAG_SENSITIVITY = 0.05;
const INERTIA_DAMPING = 0.95;
const AUTO_ROTATE_SPEED = -0.05;
const MOBILE_BREAKPOINT = 768;

export default function Carousel3D({ items }) {
    const rotationValue = useRef(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    const elementRef = useRef(null);
    const carouselInnerRef = useRef(null); // New ref for the inner carousel div
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, rotation: 0, lastX: 0, lastTime: 0 });
    const velocity = useRef(0);
    const animationFrameId = useRef(null);
        const autoRotate = useRef(true);
        const isSnapping = useRef(false); // New ref for snapping state
    
        useEffect(() => {
            const handleResize = () => {
                setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);
    
        const itemAngle = items && items.length > 0 ? 360 / items.length : 0;
    
        const animate = useCallback(() => {
            let currentRotation = rotationValue.current;
    
            if (isDragging.current) {
                isSnapping.current = false;
                currentRotation += velocity.current * DRAG_SENSITIVITY * 0.1;
                velocity.current *= 0.8;
            } else if (isSnapping.current) {
                const closestAngle = Math.round(currentRotation / itemAngle) * itemAngle;
                currentRotation += (closestAngle - currentRotation) * 0.1;
                if (Math.abs(closestAngle - currentRotation) < 0.1) {
                    currentRotation = closestAngle;
                    isSnapping.current = false;
                    autoRotate.current = true;
                }
            } else if (Math.abs(velocity.current) > 0.01) {
                velocity.current *= INERTIA_DAMPING;
                currentRotation += velocity.current;
            } else {
                velocity.current = 0;
                if (autoRotate.current) {
                    currentRotation += AUTO_ROTATE_SPEED;
                }
            }
            rotationValue.current = currentRotation;
            if (carouselInnerRef.current) {
                carouselInnerRef.current.style.transform = `rotateY(${rotationValue.current}deg)`;
            }
            animationFrameId.current = requestAnimationFrame(animate);
        }, [itemAngle]);
    
        useEffect(() => {
            animationFrameId.current = requestAnimationFrame(animate);
            return () => {
                if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            };
        }, [animate]);
    

    
        const handleDragStart = useCallback((e) => {
            isDragging.current = true;
            isSnapping.current = false;
            velocity.current = 0;
            autoRotate.current = false; 
    
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            dragStart.current = { x: clientX, rotation: rotationValue.current, lastX: clientX, lastTime: Date.now() };
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';
            if (e.touches) {
                e.preventDefault(); 
            }
        }, []);
    
        const handleDragMove = useCallback((e) => {
            if (!isDragging.current) return;
            if (e.touches) {
                e.preventDefault(); 
            }
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            
            const now = Date.now();
            const moveDelta = clientX - dragStart.current.lastX;
            const timeDelta = now - dragStart.current.lastTime;
            
            if (timeDelta > 0) {
                velocity.current = (moveDelta / timeDelta) * 20; 
            }
    
            dragStart.current.lastX = clientX;
            dragStart.current.lastTime = now;
            
            // Do not set rotation here directly. Let the animate loop handle it using velocity.
            // setRotation(dragStart.current.rotation + (deltaX * DRAG_SENSITIVITY)); 
        }, []);
    
        const handleDragEnd = useCallback(() => {
            isDragging.current = false;
            if (Math.abs(velocity.current) < 0.5) { // If velocity is low, snap
                isSnapping.current = true;
                autoRotate.current = false; // Disable auto-rotate during snap
            } else {
                // If there's still momentum, let inertia continue, but ensure auto-rotate is eventually re-enabled
                autoRotate.current = true; // Instantly re-enable auto-rotate after inertia starts
            }
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }, []);
        
        if (!items || items.length === 0) {
            return <div className="text-center text-white py-10">טוען מוצרים...</div>;
        }
    
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

    const cardWidth = (isMobile ? Math.min(160, window.innerWidth * 0.7) : 220);


    return (
        <div 
            ref={elementRef} 
            className="w-full flex relative min-h-[400px] md:min-h-[500px] max-h-screen items-center justify-center cursor-grab active:cursor-grabbing overflow-x-hidden overflow-y-hidden"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseMove={handleDragMove}
            onTouchMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            onMouseEnter={() => {
                autoRotate.current = false;
            }}
            onMouseLeave={() => {
                if (!isDragging.current && !isSnapping.current) {
                    autoRotate.current = true; // Instantly resume auto-rotate
                }
            }}
        >
                        <div className="w-full h-full" style={{ perspective: '2500px', transformStyle: 'preserve-3d' }}>
                            <div
                                ref={carouselInnerRef} // Attach the ref here
                                className="relative w-full h-full"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transformOrigin: '50% 50%', // Explicitly set transform origin
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
                                                left: '50%', // Changed from insetInlineStart
                                                willChange: 'transform'
                                            }}
                                        >
                                           <ProductCard
                                                product={item}
                                                disableClick={true}
                                                isMobile={isMobile}
                                           />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>        </div>
    );
}