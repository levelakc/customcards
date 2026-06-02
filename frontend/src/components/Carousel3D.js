import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';

const DRAG_SENSITIVITY = 0.06;
const INERTIA_DAMPING = 0.96;
const AUTO_ROTATE_SPEED = -0.15;
const MOBILE_BREAKPOINT = 768;

export default function Carousel3D({ items }) {
    const rotationValue = useRef(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    const elementRef = useRef(null);
    const carouselInnerRef = useRef(null); // New ref for the inner carousel div
    const isDragging = useRef(false);
    const [dragging, setDragging] = useState(false); // New state to trigger effect
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
                // Rotation is handled in handleDragMove for direct tracking
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
                
                // PERFORMANCE OPTIMIZATION: Render only visible cards
                const children = carouselInnerRef.current.children;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    // Calculate the absolute angle of this item relative to the camera
                    let absAngle = (i * itemAngle + rotationValue.current) % 360;
                    
                    // Normalize to -180 to 180 degrees
                    if (absAngle > 180) absAngle -= 360;
                    if (absAngle < -180) absAngle += 360;
                    
                    // If the card is facing away from the camera (more than 90 degrees left/right), hide it.
                    // This prevents the browser from rendering and compositing complex SVGs that are hidden in the back.
                    if (Math.abs(absAngle) > 90) {
                        child.style.opacity = '0';
                        child.style.visibility = 'hidden';
                    } else {
                        child.style.opacity = '1';
                        child.style.visibility = 'visible';
                    }
                }
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
            setDragging(true);
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

    return (
        <div 
            ref={elementRef} 
            className="w-full flex relative min-h-[400px] md:min-h-[500px] max-h-screen items-center justify-center cursor-grab active:cursor-grabbing overflow-x-hidden overflow-y-hidden"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
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
                        </div>        </div>
    );
}