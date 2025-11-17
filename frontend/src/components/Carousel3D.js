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
    
    const animate = useCallback(() => {
        setRotation(prev => {
            let newRotation = prev;
            if (!isDragging.current && Math.abs(velocity.current) > 0.01) {
                velocity.current *= INERTIA_DAMPING;
                newRotation += velocity.current;
            } else if (!isDragging.current) {
                velocity.current = 0;
            }

            if (autoRotate.current && !isDragging.current && velocity.current === 0) {
                newRotation += AUTO_ROTATE_SPEED;
            }
            return newRotation;
        });
        animationFrameId.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [animate]);

    useEffect(() => {
        const colorInterval = setInterval(() => {
            if (!isDragging.current && velocity.current === 0 && items && items.length > 0) {
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
            }
        }, 3000);
        
        return () => clearInterval(colorInterval);
    }, [items]);

    const resetIdleTimer = () => {
        clearTimeout(idleTimer.current);
        // autoRotate.current is set to false on drag start.
        // It will be set to true after IDLE_TIMEOUT if no further interaction.
        idleTimer.current = setTimeout(() => {
            autoRotate.current = true;
        }, IDLE_TIMEOUT);
    };

    const handleDragStart = useCallback((e) => {
        isDragging.current = true;
        velocity.current = 0;
        clearTimeout(idleTimer.current); // Clear any existing idle timer
        autoRotate.current = false; // Disable auto-rotate immediately

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        dragStart.current = { x: clientX, rotation: rotation, lastX: clientX, lastTime: Date.now() };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        if (e.touches) {
            e.preventDefault(); // Prevent default scrolling behavior on touch devices
        }
    }, [rotation]);

    const handleDragMove = useCallback((e) => {
        if (!isDragging.current) return;
        if (e.touches) {
            e.preventDefault(); // Prevent default scrolling behavior on touch devices
        }
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - dragStart.current.x;
        
        const now = Date.now();
        const moveDelta = clientX - dragStart.current.lastX;
        const timeDelta = now - dragStart.current.lastTime;
        
        if (timeDelta > 0) {
            velocity.current = (moveDelta / timeDelta) * 20; // Adjusted multiplier for velocity
        }

        dragStart.current.lastX = clientX;
        dragStart.current.lastTime = now;
        
        setRotation(dragStart.current.rotation + (deltaX * 0.35)); // Adjusted DRAG_SENSITIVITY
    }, []);

    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
        resetIdleTimer();
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    }, []);
    
    if (!items || items.length === 0) {
        return <div className="text-center text-white py-10">טוען מוצרים...</div>;
    }

    const itemAngle = 360 / items.length;
    
    // The minimum radius needed to prevent cards from overlapping is (cardWidth / 2) / tan(PI / itemCount).
    // We add a little extra padding.
    const cardWidthForCalc = isMobile ? 200 : 260;
    const minRadius = (cardWidthForCalc / 2) / Math.tan(Math.PI / items.length);
    const radius = isMobile ? Math.min(minRadius + 50, 400) : minRadius + 100;

    const cardWidth = isMobile ? Math.min(200, window.innerWidth * 0.8) : 260;
    const cardMarginLeft = isMobile ? -(cardWidth / 2) : -130;

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
            <div className="w-full h-full" style={{ perspective: '1500px' }}>
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
                                    transform: `rotateY(${i * itemAngle}deg) translateZ(${radius}px) translateY(-50%)`,
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    zIndex: items.length - i,
                                    top: '50%', 
                                    left: '50%', 
                                    marginLeft: `${cardMarginLeft}px`,
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
