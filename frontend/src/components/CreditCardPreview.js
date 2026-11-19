import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as api from '../api/api'; // Import the api file
import { cardColorOptions, engravingColorHex, getDefaultEngraving } from '../utils/colorUtils';

// Helper function to check if a string is a valid CSS color
const isValidCssColor = (color) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
};

// Utility function for throttling
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

const SVG_WIDTH = 335;
const SVG_HEIGHT = 210;
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;
const X_RATIO = SVG_WIDTH / CARD_WIDTH_MM;
const Y_RATIO = SVG_HEIGHT / CARD_HEIGHT_MM;

// Simple in-memory cache for SVG content
const svgCache = new Map();

const CreditCardPreview = React.memo(function CreditCardPreview({
    cardColorKey = 'black',
    engravingColorKey = 'silver',
    logoUrl = null,
    position = { x: 0, y: 0 },
    scale = 1,
    rotation = 0,
    onPositionChange,
    onScaleChange,
    onRotationChange,
    isDraggable = true,
    showTransformHandles = false,
    isCarousel = false,
    isThumbnail = false
}) {

    const [svgContent, setSvgContent] = useState(null);
    const [svgRatio, setSvgRatio] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState(null);
    const svgRef = useRef(null);
    const dragStartOffset = useRef({ x: 0, y: 0 });

    const uniqueIds = useMemo(() => {
        const randomString = Math.random().toString(36).substr(2, 9);
        return {
            mask: `logo-mask-${randomString}`,
            whiteMaskFilter: `white-mask-filter-${randomString}`,
            silverGradient: `silver-gradient-${randomString}`,
            goldGradient: `gold-gradient-${randomString}`,
            blackGradient: `black-gradient-${randomString}`,
            roseGoldGradient: `roseGold-gradient-${randomString}`,
            colorfulGradient: `colorful-gradient-${randomString}`,
            colorfulTopRight: `colorful-top-right-${randomString}`,
            colorfulBottomRight: `colorful-bottom-right-${randomString}`,
            colorfulBottomLeft: `colorful-bottom-left-${randomString}`,
            colorfulTopRim: `colorful-top-rim-${randomString}`,
            colorfulCornerLeft: `colorful-corner-left-${randomString}`,
            colorfulCornerRight: `colorful-corner-right-${randomString}`,
            colorfulSheen: `colorful-sheen-${randomString}`,
            blackSheen: `black-sheen-${randomString}`,
            metallicSheen: `metallic-sheen-${randomString}`,
            spotlight: `spotlight-reflection-gradient-${randomString}`,
            silverSpotlight: `silver-card-spotlight-gradient-${randomString}`,
            simStripes: `sim-stripes-gradient-${randomString}`,
        };
    }, []);

    const finalLogoUrl = useMemo(() => {
        const url = (logoUrl && logoUrl.startsWith('/uploads')) ? `${api.BASE_URL}${logoUrl}` : logoUrl;
        return url;
    }, [logoUrl]);

    useEffect(() => {
        if (finalLogoUrl && finalLogoUrl.endsWith('.svg')) {
            if (svgCache.has(finalLogoUrl)) {
                const { svgText, ratio } = svgCache.get(finalLogoUrl);
                setSvgContent(svgText);
                setSvgRatio(ratio);
                return;
            }

            fetch(finalLogoUrl)
                .then(response => response.text())
                .then(svgText => {
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgText, "image/svg+xml").documentElement;

                    let ratio = 1;
                    const viewBox = svgDoc.getAttribute('viewBox');
                    if (viewBox) {
                        const parts = viewBox.split(' ').map(parseFloat);
                        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                            ratio = parts[2] / parts[3];
                        }
                    } else {
                        const w = parseFloat(svgDoc.getAttribute('width'));
                        const h = parseFloat(svgDoc.getAttribute('height'));
                        if (w > 0 && h > 0) {
                            ratio = w / h;
                            svgDoc.setAttribute('viewBox', `0 0 ${w} ${h}`);
                        }
                    }
                    
                    svgDoc.setAttribute('width', '100%');
                    svgDoc.setAttribute('height', '100%');
                    svgDoc.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                    const finalSvgContent = svgDoc.outerHTML;
                    setSvgContent(finalSvgContent);
                    setSvgRatio(ratio);
                    svgCache.set(finalLogoUrl, { svgText: finalSvgContent, ratio });
                })
                .catch(error => {
                    console.error("Error fetching SVG:", error);
                    setSvgContent('<text x="50%" y="50%" fill="red" text-anchor="middle">Error loading SVG</text>');
                });
        } else {
            setSvgContent(null);
        }
    }, [finalLogoUrl]);

    const getSVGPoint = (e) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const point = svgRef.current.createSVGPoint();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        point.x = clientX;
        point.y = clientY;
        return point.matrixTransform(svgRef.current.getScreenCTM().inverse());
    };

    const handleDragStart = (e) => {
        if (!isDraggable) return;
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        const startPoint = getSVGPoint(e);
        dragStartOffset.current = {
            x: startPoint.x - (position.x * X_RATIO),
            y: startPoint.y - (position.y * Y_RATIO),
        };
    };
    
    const handleDragMove = useCallback((e) => {
        if (!isDragging || !isDraggable) return;
        if (e.cancelable) e.preventDefault();
        const newPoint = getSVGPoint(e);
        const newSvgPos = {
            x: newPoint.x - dragStartOffset.current.x,
            y: newPoint.y - dragStartOffset.current.y,
        };
        
        if (onPositionChange) {
            const newMmPos = {
                x: newSvgPos.x / X_RATIO,
                y: newSvgPos.y / Y_RATIO,
            };
            onPositionChange(newMmPos);
        }
    }, [isDragging, isDraggable, onPositionChange]);

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const throttledHandleMove = throttle(handleDragMove, 50);
        const handleEnd = () => handleDragEnd();
        
        if (isDragging) {
            window.addEventListener('mousemove', throttledHandleMove);
            window.addEventListener('touchmove', throttledHandleMove, { passive: false });
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', throttledHandleMove);
            window.removeEventListener('touchmove', throttledHandleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, handleDragMove]);

    const handleCornerDragStart = (e, cornerIndex) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        const startPoint = getSVGPoint(e);
        
        const centerX = logoX + (unscaledLogoSvgWidth * scale) / 2;
        const centerY = logoY + (unscaledLogoSvgHeight * scale) / 2;
        const originalCorner = transformBoundaries.drag[cornerIndex];

        setResizeStart({
            cornerIndex,
            startPoint,
            initialScale: scale,
            initialRotation: rotation,
            initialCenter: { x: centerX, y: centerY },
            initialCorner: originalCorner,
        });
    };

    const handleCornerDragMove = useCallback((e) => {
        if (!isResizing || !resizeStart) return;
        if (e.cancelable) e.preventDefault();
        const newPoint = getSVGPoint(e);

        const { initialCenter, initialCorner, initialScale, initialRotation } = resizeStart;
        const originalVector = { x: initialCorner.x - initialCenter.x, y: initialCorner.y - initialCenter.y };
        const newVector = { x: newPoint.x - initialCenter.x, y: newPoint.y - initialCenter.y };
        const originalDist = Math.sqrt(originalVector.x ** 2 + originalVector.y ** 2);
        const newDist = Math.sqrt(newVector.x ** 2 + newVector.y ** 2);

        if (originalDist === 0) return;

        const scaleFactor = newDist / originalDist;
        if (onScaleChange) onScaleChange(initialScale * scaleFactor);

        const originalAngle = Math.atan2(originalVector.y, originalVector.x) * (180 / Math.PI);
        const newAngle = Math.atan2(newVector.y, newVector.x) * (180 / Math.PI);
        const angleDiff = newAngle - originalAngle;

        if (onRotationChange) onRotationChange(initialRotation + angleDiff);

    }, [isResizing, resizeStart, onScaleChange, onRotationChange]);

    const handleCornerDragEnd = () => {
        setIsResizing(false);
        setResizeStart(null);
    };

    useEffect(() => {
        const throttledHandleMove = throttle(handleCornerDragMove, 50);
        const handleEnd = () => handleCornerDragEnd();

        if (isResizing) {
            window.addEventListener('mousemove', throttledHandleMove);
            window.addEventListener('touchmove', throttledHandleMove, { passive: false });
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', throttledHandleMove);
            window.removeEventListener('touchmove', throttledHandleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isResizing, handleCornerDragMove]);

    const getContrastingEngravingColor = useCallback((cardKey, engravingKey) => {
        const options = cardColorOptions[cardKey];
        if (options && options.engraving.includes(engravingKey)) {
            return engravingColorHex[engravingKey];
        }
        const defaultEngraving = getDefaultEngraving(cardKey);
        return engravingColorHex[defaultEngraving] || engravingColorHex.silver;
    }, []);

    const logoWidth = CARD_WIDTH_MM;
    const logoHeight = CARD_WIDTH_MM / svgRatio;

    const effectiveEngravingColor = useMemo(() => {
        return getContrastingEngravingColor(cardColorKey, engravingColorKey);
    }, [cardColorKey, engravingColorKey, getContrastingEngravingColor]);

    const logoX = position.x * X_RATIO;
    const logoY = position.y * Y_RATIO;
    const unscaledLogoSvgWidth = logoWidth * X_RATIO;
    const unscaledLogoSvgHeight = logoHeight * X_RATIO;
    const currentLogoSvgWidth = unscaledLogoSvgWidth * scale;
    const currentLogoSvgHeight = unscaledLogoSvgHeight * scale;

    const transformBoundaries = useMemo(() => {
        const centerX = logoX + currentLogoSvgWidth / 2;
        const centerY = logoY + currentLogoSvgHeight / 2;
        const corners = [
            { x: logoX, y: logoY },
            { x: logoX + currentLogoSvgWidth, y: logoY },
            { x: logoX + currentLogoSvgWidth, y: logoY + currentLogoSvgHeight },
            { x: logoX, y: logoY + currentLogoSvgHeight },
        ];
    
        const rotatePoint = (point, angle) => {
            const rad = (angle * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            const dx = point.x - centerX;
            const dy = point.y - centerY;
            return {
                x: centerX + dx * cos - dy * sin,
                y: centerY + dx * sin + dy * cos,
            };
        };
        
        const unoffsetRotatedCorners = corners.map(p => rotatePoint(p, rotation));
        return { drag: unoffsetRotatedCorners, render: unoffsetRotatedCorners };
    }, [logoX, logoY, currentLogoSvgWidth, currentLogoSvgHeight, rotation]);

    const cardFill = useMemo(() => {
        const option = cardColorOptions[cardColorKey];
        if (!option) return 'black';

        const colorBg = option.bgColor;
        if (colorBg.startsWith('gradient')) {
            const gradientKey = colorBg.replace('gradient-', '');
            switch (gradientKey) {
                case 'colorful': return `url(#${uniqueIds.colorfulGradient})`;
                case 'roseGold': return `url(#${uniqueIds.roseGoldGradient})`;
                case 'black': return `url(#${uniqueIds.blackGradient})`;
                default: return 'black';
            }
        } else if (colorBg.startsWith('bg-')) {
            switch (colorBg) {
                case 'bg-yellow-500': return `url(#${uniqueIds.goldGradient})`;
                case 'bg-gray-300': return `url(#${uniqueIds.silverGradient})`;
                default: return 'black';
            }
        }
        return 'black';
    }, [cardColorKey, uniqueIds]);

    return (
        <div className="w-full md:perspective-1000">
            <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className={`w-full object-cover md:transform-style-3d md:rotate-x-5 md:-rotate-y-10 ${isDraggable ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                style={{ filter: (isCarousel || isThumbnail) ? undefined : 'drop-shadow(0 10px 10px rgba(0,0,0,0.4))' }}
                onMouseDown={isDraggable ? handleDragStart : undefined}
                onTouchStart={isDraggable ? handleDragStart : undefined}
            >
                <defs>
                    <linearGradient id={uniqueIds.silverGradient} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e5e7eb" /><stop offset="50%" stopColor="#ffffff" /><stop offset="100%" stopColor="#9ca3af" /></linearGradient>
                    <linearGradient id={uniqueIds.goldGradient} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="25%" stopColor="#f9d423" />
                        <stop offset="50%" stopColor="#ffd700" />
                        <stop offset="75%" stopColor="#ffbf00" />
                        <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                    {/* Solid Deep Jet-Black Brushed Metal Finish */}
                    <linearGradient id={uniqueIds.blackGradient} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e1e20" />
                        <stop offset="28%" stopColor="#0c0c0e" />
                        <stop offset="56%" stopColor="#040404" />
                        <stop offset="82%" stopColor="#141416" />
                        <stop offset="100%" stopColor="#020202" />
                    </linearGradient>
                    {/* Crisp Metallic Satin Highlight for Solid Black Card (no milky washout) */}
                    <linearGradient id={uniqueIds.blackSheen} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                        <stop offset="32%" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="48%" stopColor="#fff8e1" stopOpacity="0.11" />
                        <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={uniqueIds.roseGoldGradient} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fda4af" /><stop offset="50%" stopColor="#fecdd3" /><stop offset="100%" stopColor="#be123c" /></linearGradient>
                    {/* Photo-Accurate PVD Iridescent Metal Card:
                        Deep royal violet-purple to rich magenta face, electric blue upper-right,
                        warm amber-gold bottom-right & lower-left side glow, and thin cyan/emerald/gold top edge */}
                    <linearGradient id={uniqueIds.colorfulGradient} x1="15%" y1="0%" x2="85%" y2="100%">
                        <stop offset="0%" stopColor="#3c2eb8" />
                        <stop offset="28%" stopColor="#5c28b5" />
                        <stop offset="58%" stopColor="#742395" />
                        <stop offset="86%" stopColor="#89227b" />
                        <stop offset="100%" stopColor="#9c2d64" />
                    </linearGradient>
                    {/* Upper-right royal blue metallic sweep */}
                    <radialGradient id={uniqueIds.colorfulTopRight} cx="90%" cy="16%" r="48%">
                        <stop offset="0%" stopColor="#266de8" stopOpacity="0.9" />
                        <stop offset="45%" stopColor="#433fd1" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#5c28b5" stopOpacity="0" />
                    </radialGradient>
                    {/* Bottom-right warm rose -> amber -> gold iridescent glow */}
                    <radialGradient id={uniqueIds.colorfulBottomRight} cx="98%" cy="80%" r="44%">
                        <stop offset="0%" stopColor="#ebc026" stopOpacity="0.96" />
                        <stop offset="30%" stopColor="#dc8029" stopOpacity="0.86" />
                        <stop offset="60%" stopColor="#b83a6d" stopOpacity="0.48" />
                        <stop offset="100%" stopColor="#89227b" stopOpacity="0" />
                    </radialGradient>
                    {/* Subtle lower-left warm amber/magenta side glint */}
                    <radialGradient id={uniqueIds.colorfulBottomLeft} cx="1%" cy="74%" r="26%">
                        <stop offset="0%" stopColor="#d98a32" stopOpacity="0.72" />
                        <stop offset="38%" stopColor="#b03373" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#742395" stopOpacity="0" />
                    </radialGradient>
                    {/* Razor-thin PVD iridescent top rim (gold -> emerald -> cyan -> indigo) */}
                    <linearGradient id={uniqueIds.colorfulTopRim} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#dfc24a" stopOpacity="0.94" />
                        <stop offset="2.8%" stopColor="#22b878" stopOpacity="0.9" />
                        <stop offset="6%" stopColor="#1292c7" stopOpacity="0.78" />
                        <stop offset="11%" stopColor="#3842c8" stopOpacity="0.25" />
                        <stop offset="18%" stopColor="#5c28b5" stopOpacity="0" />
                    </linearGradient>
                    {/* Thin teal-cyan sheen along upper-left & upper-right side corners */}
                    <radialGradient id={uniqueIds.colorfulCornerLeft} cx="0%" cy="6%" r="22%">
                        <stop offset="0%" stopColor="#28bf7e" stopOpacity="0.92" />
                        <stop offset="38%" stopColor="#1688c2" stopOpacity="0.62" />
                        <stop offset="100%" stopColor="#3c2eb8" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id={uniqueIds.colorfulCornerRight} cx="100%" cy="6%" r="22%">
                        <stop offset="0%" stopColor="#28bf7e" stopOpacity="0.92" />
                        <stop offset="38%" stopColor="#1688c2" stopOpacity="0.62" />
                        <stop offset="100%" stopColor="#266de8" stopOpacity="0" />
                    </radialGradient>
                    {/* Subtle brushed metallic luster */}
                    <linearGradient id={uniqueIds.colorfulSheen} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
                        <stop offset="32%" stopColor="#ffffff" stopOpacity="0.02" />
                        <stop offset="52%" stopColor="#ffffff" stopOpacity="0.14" />
                        <stop offset="72%" stopColor="#080614" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
                    </linearGradient>
                    {/* Lightweight Brushed Metallic Sheen (keeps non-black cards bright and realistic) */}
                    <linearGradient id={uniqueIds.metallicSheen} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                        <stop offset="35%" stopColor="#ffffff" stopOpacity="0.04" />
                        <stop offset="55%" stopColor="#fff8e1" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
                    </linearGradient>
                    
                    <radialGradient id={uniqueIds.spotlight} cx="25%" cy="25%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.2" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
                    <radialGradient id={uniqueIds.silverSpotlight} cx="25%" cy="25%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.55" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>

                    <filter id={uniqueIds.whiteMaskFilter}>
                        <feColorMatrix type="matrix" values="0 0 0 0 1
                                                              0 0 0 0 1
                                                              0 0 0 0 1
                                                              0 0 0 1 0" />
                    </filter>
                    <linearGradient id={uniqueIds.simStripes} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="30%" stopColor="#D4AF37" /><stop offset="30.5%" stopColor="#A9A9A9" /><stop offset="32.5%" stopColor="#A9A9A9" /><stop offset="33%" stopColor="#D4AF37" /><stop offset="66%" stopColor="#D4AF37" /><stop offset="66.5%" stopColor="#A9A9A9" /><stop offset="68.5%" stopColor="#A9A9A9" /><stop offset="69%" stopColor="#D4AF37" />
                    </linearGradient>
                                        
                    {finalLogoUrl && (
                        <mask id={uniqueIds.mask}>
                            {svgContent ? (
                                <g dangerouslySetInnerHTML={{ __html: svgContent }} filter={`url(#${uniqueIds.whiteMaskFilter})`} />
                            ) : (
                                <image href={finalLogoUrl} x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" filter={`url(#${uniqueIds.whiteMaskFilter})`} />
                            )}
                        </mask>
                    )}
                </defs>
                <g>
                    {/* Guaranteed 100% solid opaque base so cards never appear translucent */}
                    <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill="#050505" fillOpacity="1" />
                    <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={cardFill} fillOpacity="1" />
                    {cardColorKey === 'colorful' && (
                        <g pointerEvents="none">
                            <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.colorfulTopRight})`} />
                            <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.colorfulBottomRight})`} />
                            <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.colorfulBottomLeft})`} />
                            <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.colorfulTopRim})`} />
                            <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.colorfulCornerLeft})`} />
                            <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.colorfulCornerRight})`} />
                            <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.colorfulSheen})`} />
                        </g>
                    )}
                    {cardColorKey === 'black' && (
                        <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.blackSheen})`} pointerEvents="none" />
                    )}
                    {cardColorKey !== 'colorful' && cardColorKey !== 'black' && (
                        <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.metallicSheen})`} pointerEvents="none" />
                    )}
                    <rect
                        x="0.75"
                        y="0.75"
                        width={SVG_WIDTH - 1.5}
                        height={SVG_HEIGHT - 1.5}
                        rx="19.5"
                        fill="none"
                        stroke={cardColorKey === 'black' ? 'rgba(212,175,55,0.42)' : 'rgba(255,248,220,0.28)'}
                        strokeWidth="1.25"
                        pointerEvents="none"
                    />
                    {finalLogoUrl && (
                        <g>
                            <g transform={`translate(${logoX}, ${logoY}) scale(${scale}) rotate(${rotation}, ${unscaledLogoSvgWidth / 2}, ${unscaledLogoSvgHeight / 2})`} style={{ willChange: 'transform' }}>
                                <rect x="0" y="0" height={unscaledLogoSvgHeight} width={unscaledLogoSvgWidth} mask={`url(#${uniqueIds.mask})`} fill={effectiveEngravingColor} />
                            </g>
                            {showTransformHandles && transformBoundaries.render.map((pos, i) => (
                                <circle key={i} cx={pos.x} cy={pos.y} r="4" fill="white" stroke="black" strokeWidth="1" cursor="pointer" onMouseDown={(e) => handleCornerDragStart(e, i)} onTouchStart={(e) => handleCornerDragStart(e, i)} />
                            ))}
                        </g>
                    )}
                    {!(isCarousel || isThumbnail) && cardColorKey === 'silver' && ( <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.silverSpotlight})`} pointerEvents="none" /> )}
                    {!(isCarousel || isThumbnail) && cardColorKey !== 'black' && cardColorKey !== 'silver' && ( <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.spotlight})`} pointerEvents="none" /> )}
                </g>
                <path d="M40,85 h30 a5,5 0 0 1 5,5 v20 a5,5 0 0 1 -5,5 h-30 a5,5 0 0 1 -5,-5 v-20 a5,5 0 0 1 5,-5 z" fill={`url(#${uniqueIds.simStripes})`} opacity="0.9" stroke="black" strokeWidth="0.5" />
            </svg>
        </div>
    );
});

export default CreditCardPreview;
