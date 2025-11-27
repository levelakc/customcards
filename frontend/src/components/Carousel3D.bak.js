import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils';

const DRAG_SENSITIVITY = 0.25;
const INERTIA_DAMPING = 0.95;
const AUTO_ROTATE_SPEED = -0.05;
const IDLE_TIMEOUT = 5000;
const MOBILE_BREAKPOINT = 768;

export default function Carousel3D({ items }) {
    const [rotation, setRotation] = useState(0);
    const [colorIndexes, setColorIndexes] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    const elementRef = useRef(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, rotation: 0, lastX: 0, lastTime: 0 });
    const velocity = useRef(0);
    const animationFrameId = useRef(null);
    const idleTimer = useRef(null);
        const autoRotate = useRef(true);
        const isSnapping = useRef(false); // New ref for snapping state
    
        useEffect(() => {
            const handleResize = () => {
                setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);
    
        useEffect(() => {
            if (!items || items.length === 0) return;
            const initialIndexes = {};
            items.forEach(item => { if(item) initialIndexes[item._id] = 0; });
            setColorIndexes(initialIndexes);
        }, [items]);
        
        // Calculate itemAngle outside of useCallback for animate
        const itemAngle = items && items.length > 0 ? 360 / items.length : 0;
    
        const animate = useCallback(() => {
            setRotation(prev => {
                let newRotation = prev;
    
                if (isDragging.current) {
                    isSnapping.current = false; // Stop snapping if dragging starts
                    return prev;
                }
    
                if (isSnapping.current) {
                    const closestAngle = Math.round(prev / itemAngle) * itemAngle;
                    newRotation += (closestAngle - prev) * 0.1; // Smooth snap
                    if (Math.abs(closestAngle - newRotation) < 0.1) {
                        newRotation = closestAngle;
                        isSnapping.current = false; // Snapping finished
                        autoRotate.current = true; // Re-enable auto-rotate
                    }
                } else if (Math.abs(velocity.current) > 0.01) {
                    // Apply inertia
                    velocity.current *= INERTIA_DAMPING;
                    newRotation += velocity.current;
                } else {
                    velocity.current = 0; // Stop velocity when it's very small
                    if (autoRotate.current) {
                        newRotation += AUTO_ROTATE_SPEED;
                    }
                }
                return newRotation;
            });
            animationFrameId.current = requestAnimationFrame(animate);
        }, [itemAngle]);
    
        useEffect(() => {
            animationFrameId.current = requestAnimationFrame(animate);
            return () => {
                if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            };
        }, [animate]);
    
        useEffect(() => {
            const colorInterval = setInterval(() => {
                setColorIndexes(prevIndexes => {
                    const newIndexes = { ...prevIndexes };
                    items.forEach(item => {
                        if(item) {
                            const availableColors = item.availableColors || [];
                            if (availableColors.length > 1) {
                                newIndexes[item._id] = ((prevIndexes[item._id] || 0) + 1) % availableColors.length;
                            }
                        }
                    });
                    return newIndexes;
                });
            }, 3000);
            
            return () => clearInterval(colorInterval);
        }, [items]);
    
        const resetIdleTimer = () => {
            clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => {
                if (!isDragging.current && !isSnapping.current) {
                    autoRotate.current = true;
                }
            }, IDLE_TIMEOUT);
        };
    
        const handleDragStart = useCallback((e) => {
            isDragging.current = true;
            isSnapping.current = false; // Stop snapping if dragging starts
            velocity.current = 0;
            clearTimeout(idleTimer.current); 
            autoRotate.current = false; 
    
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            dragStart.current = { x: clientX, rotation: rotation, lastX: clientX, lastTime: Date.now() };
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';
            if (e.touches) {
                e.preventDefault(); 
            }
        }, [rotation]);
    
        const handleDragMove = useCallback((e) => {
            if (!isDragging.current) return;
            if (e.touches) {
                e.preventDefault(); 
            }
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const deltaX = clientX - dragStart.current.x;
            
            const now = Date.now();
            const moveDelta = clientX - dragStart.current.lastX;
            const timeDelta = now - dragStart.current.lastTime;
            
            if (timeDelta > 0) {
                velocity.current = (moveDelta / timeDelta) * 20; 
            }
    
            dragStart.current.lastX = clientX;
            dragStart.current.lastTime = now;
            
            setRotation(dragStart.current.rotation + (deltaX * DRAG_SENSITIVITY)); 
        }, []);
    
        const handleDragEnd = useCallback(() => {
.
            isDragging.current = false;
            if (Math.abs(velocity.current) < 0.5) { // If velocity is low, snap
                isSnapping.current = true;
                autoRotate.current = false; // Disable auto-rotate during snap
            }
            resetIdleTimer();
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }, []);
        
        if (!items || items.length === 0) {
            return <div className="text-center text-white py-10">טוען מוצרים...</div>;
        }
    
    // The minimum radius needed to prevent cards from overlapping is (cardWidth / 2) / tan(PI / itemCount).
    // We add a little extra padding.
    const cardWidthForCalc = isMobile ? 200 : 260;
    let calculatedRadius = (cardWidthForCalc / 2) / Math.tan(Math.PI / items.length);

    if (isMobile) {
        calculatedRadius = Math.max(calculatedRadius + 20, 220);
    } else {
        calculatedRadius = Math.max(calculatedRadius + 50, 350);
    }
    const radius = calculatedRadius;

    const cardWidth = isMobile ? Math.min(200, window.innerWidth * 0.8) : 260;


    return (
        <div 
            ref={elementRef} 
            className="w-full flex relative min-h-[400px] md:min-h-[500px] max-h-screen items-center justify-center cursor-grab active:cursor-grabbing overflow-x-hidden"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseMove={handleDragMove}
            onTouchMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            onMouseEnter={() => {
                clearTimeout(idleTimer.current);
                autoRotate.current = false;
            }}
            onMouseLeave={() => {
                if (!isDragging.current) { // Only reset idle timer if not currently dragging
                    resetIdleTimer();
                }
            }}
        >
            <div className="w-full h-full" style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}>
                <div 
                    className="relative w-full h-full" 
                    style={{ 
                        transformStyle: 'preserve-3d', 
                        transform: `rotateY(${rotation}deg)`,
                    }}
                >
                    {items.map((item, i) => {
                        if (!item || !item._id) return null;
                        const availableColors = item.availableColors || [];
                        const colorIndex = colorIndexes[item._id] || 0;
                        const safeColorIndex = colorIndex < availableColors.length ? colorIndex : 0;
                        const colorName = availableColors[safeColorIndex] || 'שחור';
                        const cardColorKey = nameToKeyMap[colorName] || 'black';
                        const engravingColorKey = getDefaultEngraving(cardColorKey);

                        return (
                            <div
                                key={item._id} 
                                className="absolute h-auto"
                                style={{
                                    width: `${cardWidth}px`,
                                    transform: `translateX(-50%) rotateY(${i * itemAngle}deg) translateZ(${radius}px) translateY(-50%)`,
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    top: '50%', 
                                    insetInlineStart: '50%',
                                    willChange: 'transform'
                                }}
                            >
                               <ProductCard 
                                    product={item} 
                                    cardColorKey={cardColorKey}
                                    engravingColorKey={engravingColorKey}
                                    disableClick={true}
                               />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}