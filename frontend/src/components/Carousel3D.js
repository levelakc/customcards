import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils';

const DRAG_SENSITIVITY = 0.25;
const INERTIA_DAMPING = 0.95;
const AUTO_ROTATE_SPEED = -0.05;
const IDLE_TIMEOUT = 5000;

export default function Carousel3D({ items }) {
    const [rotation, setRotation] = useState(0);
    const [colorIndexes, setColorIndexes] = useState({});
    
    const elementRef = useRef(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, rotation: 0 });
    const velocity = useRef(0);
    const animationFrameId = useRef(null);
    const idleTimer = useRef(null);
    const autoRotate = useRef(true);

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
        autoRotate.current = false;
        idleTimer.current = setTimeout(() => {
            autoRotate.current = true;
        }, IDLE_TIMEOUT);
    };

    const handleDragStart = useCallback((e) => {
        isDragging.current = true;
        velocity.current = 0;
        autoRotate.current = false;
        clearTimeout(idleTimer.current);

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        dragStart.current = { x: clientX, rotation: rotation, lastX: clientX, lastTime: Date.now() };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
    }, [rotation]);

    const handleDragMove = useCallback((e) => {
        if (!isDragging.current) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - dragStart.current.x;
        
        const now = Date.now();
        const moveDelta = clientX - dragStart.current.lastX;
        const timeDelta = now - dragStart.current.lastTime;
        
        if (timeDelta > 0) {
            velocity.current = (moveDelta / timeDelta) * 15;
        }

        dragStart.current.lastX = clientX;
        dragStart.current.lastTime = now;
        
        setRotation(dragStart.current.rotation + (deltaX * DRAG_SENSITIVITY));
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
    const radius = 200 + (items.length * 15);

    return (
        <div ref={elementRef} className="w-full">
            {/* Mobile View: Horizontal Scroll (Spacing Fixed) */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-4">
                <div className="flex gap-4">
                    {items.map((item) => {
                         if (!item) return null;
                         const availableColors = item.availableColors || [];
                         const colorIndex = colorIndexes[item._id] || 0;
                         const safeColorIndex = colorIndex < availableColors.length ? colorIndex : 0;
                         const colorName = availableColors[safeColorIndex] || 'שחור';
                         const cardColorKey = nameToKeyMap[colorName] || 'black';
                         const engravingColorKey = getDefaultEngraving(cardColorKey);

                        return (
                            <div key={item._id} className="w-64 flex-shrink-0 snap-center">
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

            {/* Desktop View: 3D Carousel */}
            <div 
                className="hidden md:flex relative w-full h-[500px] items-center justify-center cursor-grab active:cursor-grabbing"
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
                                    className="absolute w-[260px] h-auto"
                                    style={{
                                        transform: `rotateY(${i * itemAngle}deg) translateZ(${radius}px)`,
                                        backfaceVisibility: 'hidden',
                                        WebkitBackfaceVisibility: 'hidden',
                                        top: '50%', left: '50%', marginTop: '-250px', marginLeft: '-130px'
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
        </div>
    );
}