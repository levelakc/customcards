import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils';

const DRAG_SENSITIVITY = 0.25; // How much rotation per pixel dragged
const INERTIA_DAMPING = 0.95; // Friction factor, closer to 1 means less friction
const AUTO_ROTATE_SPEED = -0.05; // Degrees to rotate per frame automatically
const IDLE_TIMEOUT = 5000; // 5 seconds before auto-rotation resumes

export default function Carousel3D({ items }) {
    const [rotation, setRotation] = useState(0);
    const [colorIndexes, setColorIndexes] = useState({});
    
    const elementRef = useRef(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, rotation: 0 });
    const velocity = useRef(0);
    const animationFrameId = useRef(null);
    const lastMoveTime = useRef(0);
    const lastMoveX = useRef(0);
    const idleTimer = useRef(null);
    const autoRotate = useRef(true);

    // Initialize color indexes for the products
    useEffect(() => {
        if (!items || items.length === 0) return;
        const initialIndexes = {};
        items.forEach(item => {
            initialIndexes[item._id] = 0;
        });
        setColorIndexes(initialIndexes);
    }, [items]);
    
    // Animation loop using requestAnimationFrame for smooth motion
    const animate = useCallback(() => {
        setRotation(prev => {
            let newRotation = prev;
            // Apply inertia if not dragging
            if (!isDragging.current && Math.abs(velocity.current) > 0.01) {
                velocity.current *= INERTIA_DAMPING;
                newRotation += velocity.current;
            } else if (!isDragging.current) {
                velocity.current = 0; // Stop completely
            }

            // Apply auto-rotation if enabled
            if (autoRotate.current && !isDragging.current && velocity.current === 0) {
                newRotation += AUTO_ROTATE_SPEED;
            }
            
            return newRotation;
        });
        animationFrameId.current = requestAnimationFrame(animate);
    }, []);

    // Start and stop the animation loop
    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [animate]);

    // Interval for changing card colors
    useEffect(() => {
        const colorInterval = setInterval(() => {
            // Only change colors if the user isn't interacting
            if (!isDragging.current && velocity.current === 0) {
                setColorIndexes(prevIndexes => {
                    const newIndexes = { ...prevIndexes };
                    items.forEach(item => {
                        const availableColors = item.availableColors || [];
                        if (availableColors.length > 1) {
                            const currentIndex = newIndexes[item._id] || 0;
                            newIndexes[item._id] = (currentIndex + 1) % availableColors.length;
                        }
                    });
                    return newIndexes;
                });
            }
        }, 3000);
        
        return () => clearInterval(colorInterval);
    }, [items]);

    // Function to restart the idle timer for auto-rotation
    const resetIdleTimer = () => {
        clearTimeout(idleTimer.current);
        autoRotate.current = false; // Stop auto-rotation immediately
        idleTimer.current = setTimeout(() => {
            autoRotate.current = true; // Resume after timeout
        }, IDLE_TIMEOUT);
    };

    const handleDragStart = useCallback((e) => {
        isDragging.current = true;
        velocity.current = 0; // Stop any existing inertia
        autoRotate.current = false; // Pause auto-rotation
        clearTimeout(idleTimer.current); // Clear any pending idle resume

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        dragStart.current = {
            x: clientX,
            rotation: rotation,
        };
        lastMoveX.current = clientX;
        lastMoveTime.current = Date.now();
        
        // Add a class to the body to prevent text selection during drag
        document.body.style.userSelect = 'none';
    }, [rotation]);

    const handleDragMove = useCallback((e) => {
        if (!isDragging.current) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - dragStart.current.x;
        
        const now = Date.now();
        const timeDelta = now - lastMoveTime.current;
        const moveDelta = clientX - lastMoveX.current;
        
        // Calculate velocity for the flick effect
        if (timeDelta > 0) {
            velocity.current = (moveDelta / timeDelta) * 15; // Multiplier for feel
        }
        
        lastMoveX.current = clientX;
        lastMoveTime.current = now;

        setRotation(dragStart.current.rotation + (deltaX * DRAG_SENSITIVITY));
    }, []);

    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
        resetIdleTimer(); // Start the timer to resume auto-rotation
        document.body.style.userSelect = ''; // Re-enable text selection
    }, []);
    
    if (!items || items.length === 0) {
        return <div className="text-center text-white py-10">טוען מוצרים...</div>;
    }

    const itemAngle = 360 / items.length;
    // Adjust radius based on the number of items to prevent overlap
    const radius = 200 + (items.length * 15);

    return (
        <div 
            ref={elementRef} 
            className="relative w-full h-[450px] flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseMove={handleDragMove}
            onTouchMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchEnd={handleDragEnd}
        >
            <div className="w-full h-full" style={{ perspective: '1500px' }}>
                <div 
                    className="relative w-full h-full" 
                    style={{ 
                        transformStyle: 'preserve-3d', 
                        transform: `rotateY(${rotation}deg)`,
                        // No transition here, as rotation is handled by requestAnimationFrame
                    }}
                >
                    {items.map((item, i) => {
                        if (!item || !item._id) return null; // Safety check
                        const availableColors = item.availableColors || [];
                        const colorIndex = colorIndexes[item._id] || 0;
                        const safeColorIndex = colorIndex < availableColors.length ? colorIndex : 0;
                        const colorName = availableColors[safeColorIndex] || 'שחור';
                        const cardColorKey = nameToKeyMap[colorName] || 'black';
                        const engravingColorKey = getDefaultEngraving(cardColorKey);

                        return (
                            <div
                                key={item._id} 
                                className="absolute w-[260px] h-auto"
                                style={{
                                    transform: `rotateY(${i * itemAngle}deg) translateZ(${radius}px)`,
                                    backfaceVisibility: 'hidden',
                                    top: '50%', left: '50%', marginTop: '-225px', marginLeft: '-130px'
                                }}
                            >
                               <ProductCard 
                                    product={item} 
                                    cardColorKey={cardColorKey}
                                    engravingColorKey={engravingColorKey}
                               />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
