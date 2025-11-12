import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as api from '../api/api'; // Import the api file
import { cardColorOptions } from '../utils/colorUtils';

// Helper function to check if a string is a valid CSS color
const isValidCssColor = (color) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
};

const SVG_WIDTH = 335;
const SVG_HEIGHT = 210;
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;
const X_RATIO = SVG_WIDTH / CARD_WIDTH_MM;
const Y_RATIO = SVG_HEIGHT / CARD_HEIGHT_MM;
const MOBILE_BREAKPOINT = 768; // Corresponds to Tailwind's `md` breakpoint

export default function CreditCardPreview({
    cardColor = 'black',
    engravingColor = 'silver',
    logoUrl = null,
    position = { x: 45, y: 10 },
    scale = 1,
    rotation = 0,
    onPositionChange,
    isDraggable = true
}) {

    const [svgContent, setSvgContent] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const svgRef = useRef(null);
    const dragStartOffset = useRef({ x: 0, y: 0 });

    const uniqueIds = useMemo(() => {
        const randomString = Math.random().toString(36).substr(2, 9);
        return {
            mask: `logo-mask-${randomString}`,
            silverGradient: `silver-gradient-${randomString}`,
            goldGradient: `gold-gradient-${randomString}`,
            blackGradient: `black-gradient-${randomString}`,
            roseGoldGradient: `roseGold-gradient-${randomString}`,
            colorfulGradient: `colorful-gradient-${randomString}`,
            shimmerFilter: `metallic-shimmer-filter-${randomString}`,
            spotlight: `spotlight-reflection-gradient-${randomString}`,
            blackSpotlight: `black-card-spotlight-gradient-${randomString}`,
            silverSpotlight: `silver-card-spotlight-gradient-${randomString}`,
            simStripes: `sim-stripes-gradient-${randomString}`,
            visaGradient: `visa-gradient-${randomString}`,
        };
    }, []);

    const finalLogoUrl = useMemo(() => {
        const url = (logoUrl && logoUrl.startsWith('/uploads')) ? `${api.BASE_URL}${logoUrl}` : logoUrl;
        console.log('finalLogoUrl:', url); // Debug log
        return url;
    }, [logoUrl]);

    useEffect(() => {
        console.log('useEffect for svgContent triggered. finalLogoUrl:', finalLogoUrl); // Debug log
        if (finalLogoUrl && finalLogoUrl.endsWith('.svg')) {
            fetch(finalLogoUrl)
                .then(response => response.text())
                .then(svgText => {
                    console.log('SVG fetched successfully. svgText length:', svgText.length); // Debug log
                    const parser = new DOMParser();
                    const svgDoc = parser.documentElement;

                    // Remove width and height attributes to prevent incorrect scaling
                    svgDoc.removeAttribute('width');
                    svgDoc.removeAttribute('height');

                    // Set fill to white for all paths, circles, rects within the SVG
                    svgDoc.querySelectorAll('path, circle, rect, polygon, line, polyline, ellipse')
                        .forEach(el => {
                            el.setAttribute('fill', 'white');
                            el.removeAttribute('stroke'); // Remove stroke to ensure clean mask
                        });
                    const processedSvg = svgDoc.outerHTML;
                    console.log('Processed SVG content length:', processedSvg.length); // Debug log
                    setSvgContent(processedSvg);
                })
                .catch(error => {
                    console.error("Error fetching SVG:", error);
                    setSvgContent(null);
                });
        } else {
            console.log('finalLogoUrl is not an SVG or is null:', finalLogoUrl); // Debug log
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
        setIsDragging(true);
        const startPoint = getSVGPoint(e);
        dragStartOffset.current = {
            x: startPoint.x - (position.x * X_RATIO),
            y: startPoint.y - (position.y * Y_RATIO),
        };
    };
    
    // Wrapped in useCallback for performance and to prevent stale closures
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
        const handleMove = (e) => handleDragMove(e);
        const handleEnd = () => handleDragEnd();
        
        // THE FIX: Add { passive: false } to the touchmove listener
        const options = { passive: false };

        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove, options);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove, options);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, handleDragMove]); // Dependency array updated

    const engravingFillColors = {
        silver: '#D1D5DB',
        gold: '#D4AF37',
        black: '#000000',
    };

    const getContrastingEngravingColor = useCallback((cardColor, requestedEngravingColor) => {
        let effectiveEngravingColor = requestedEngravingColor;

        // Define contrasting colors for problematic card/engraving color combinations
        if (cardColor === 'black' && requestedEngravingColor === 'black') {
            effectiveEngravingColor = 'silver';
        } else if (cardColor === 'gold' && requestedEngravingColor === 'gold') {
            effectiveEngravingColor = 'black';
        } else if (cardColor === 'silver' && requestedEngravingColor === 'silver') {
            effectiveEngravingColor = 'black';
        }
        // Add more rules as needed.

        // Return the hex code if available in engravingFillColors, otherwise return the color name
        return engravingFillColors[effectiveEngravingColor] || effectiveEngravingColor;
    }, []);





    const logoWidth = 35;
    const logoHeight = 20;

    const effectiveEngravingColor = useMemo(() => {
        return getContrastingEngravingColor(cardColor, engravingColor);
    }, [cardColor, engravingColor, getContrastingEngravingColor]);


    const logoX = position.x * X_RATIO;
    const logoY = position.y * Y_RATIO;
    const logoSvgWidth = (logoWidth * scale) * X_RATIO;
    const logoSvgHeight = (logoHeight * scale) * Y_RATIO;

    const gradientMap = {
        silver: `url(#${uniqueIds.silverGradient})`,
        gold: `url(#${uniqueIds.goldGradient})`,
        black: `url(#${uniqueIds.blackGradient})`,
        roseGold: `url(#${uniqueIds.roseGoldGradient})`,
        colorful: `url(#${uniqueIds.colorfulGradient})`,
        visa: `url(#${uniqueIds.visaGradient})`,
    };

    return (
        <div className="w-full md:perspective-1000">
            <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className={`w-full object-cover transition-transform duration-300 md:transform-style-3d md:rotate-x-5 md:-rotate-y-10 ${isDraggable ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                style={{
                    filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.4))'
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                <defs>
                    <linearGradient id={uniqueIds.silverGradient} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c0c0c0" /><stop offset="100%" stopColor="#a9a9a9" /></linearGradient>
                    <linearGradient id={uniqueIds.goldGradient} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d4af37" /><stop offset="100%" stopColor="#b8860b" /></linearGradient>
                    <linearGradient id={uniqueIds.blackGradient} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#222222" /><stop offset="100%" stopColor="#000000" /></linearGradient>
                    <linearGradient id={uniqueIds.roseGoldGradient} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#E5B4A3" /><stop offset="100%" stopColor="#C98E7A" /></linearGradient>
                    <linearGradient id={uniqueIds.colorfulGradient} x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6b21a8" /><stop offset="20%" stopColor="#c026d3" /><stop offset="40%" stopColor="#db2777" /><stop offset="60%" stopColor="#ca8a04" /><stop offset="80%" stopColor="#16a34a" /><stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id={uniqueIds.visaGradient} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1A237E" />
                        <stop offset="50%" stopColor="#42A5F5" />
                        <stop offset="100%" stopColor="#1565C0" />
                    </linearGradient>
                    
                    <filter id={uniqueIds.shimmerFilter} x="-20%" y="-20%" width="140%" height="140%">
                        <feDistantLight azimuth="225" elevation="30" />
                        <feSpecularLighting in="SourceAlpha" surfaceScale="3" specularConstant="0.5" specularExponent="15" lightingColor="white" result="specular" />
                        <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
                    </filter>
                    
                    <radialGradient id={uniqueIds.spotlight} cx="25%" cy="25%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.75" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
                    <radialGradient id={uniqueIds.blackSpotlight} cx="25%" cy="25%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.15" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
                    <radialGradient id={uniqueIds.silverSpotlight} cx="25%" cy="25%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.9" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>

                    <filter id="white-mask-filter">
                        <feColorMatrix type="matrix" values="0 0 0 0 1
                                                              0 0 0 0 1
                                                              0 0 0 0 1
                                                              0 0 0 1 0" />
                    </filter>







                                        <linearGradient id={uniqueIds.simStripes} x1="0" y1="0" x2="1" y2="0">





                                            <stop offset="30%" stopColor="#D4AF37" />





                                            <stop offset="30.5%" stopColor="#A9A9A9" />





                                            <stop offset="32.5%" stopColor="#A9A9A9" />





                                            <stop offset="33%" stopColor="#D4AF37" />





                                            <stop offset="66%" stopColor="#D4AF37" />





                                            <stop offset="66.5%" stopColor="#A9A9A9" />





                                            <stop offset="68.5%" stopColor="#A9A9A9" />





                                            <stop offset="69%" stopColor="#D4AF37" />





                                        </linearGradient>





                    





                                                                                                                                                                                                        {finalLogoUrl && (





                    





                                                                                                                                                                                                            <mask id={uniqueIds.mask}>





                    





                                                                                                                                                                                                                {console.log('Rendering mask. svgContent available:', !!svgContent)} {/* Debug log */}





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                {svgContent ? (





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <g





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        dangerouslySetInnerHTML={{ __html: svgContent }}





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        transform={`





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            translate(${logoX}, ${logoY})





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            rotate(${rotation}, ${logoSvgWidth / 2}, ${logoSvgHeight / 2})





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            scale(${scale})





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        `}





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    />





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ) : (





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <g





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        transform={`





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            translate(${logoX}, ${logoY})





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            rotate(${rotation}, ${logoSvgWidth / 2}, ${logoSvgHeight / 2})





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            scale(${scale})





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        `}





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    >





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <image





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                href={finalLogoUrl}





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                x="0" y="0"





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                height={logoSvgHeight} width={logoSvgWidth}





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                preserveAspectRatio="xMidYMid meet"





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                filter="url(#white-mask-filter)"





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        />





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </g>





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                )}





                    





                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                )}





                    





                                                                                                                                                                                                            </mask>





                    





                                                                                                                                                                                                        )}





                                                                            </defs>





                                        





                                                                            <g>





                                                                                <g>





                                                                                    <rect





                                                                                        width={SVG_WIDTH}





                                                                                        height={SVG_HEIGHT}





                                                                                        rx="20"





                                                                                        fill={





                                                                                            gradientMap[cardColor] ||





                                                                                            (isValidCssColor(cardColor) ? cardColor : gradientMap.black)





                                                                                        }





                                                                                        stroke={cardColor === 'visa' ? '#CCCCCC' : 'none'}





                                                                                        strokeWidth={cardColor === 'visa' ? '1' : '0'}





                                                                                    />





                                                                                </g>





                                        





                                        





                                                                                                                        {finalLogoUrl && (
                                                                                                                            <rect
                                                                                                                                x={logoX}
                                                                                                                                y={logoY}
                                                                                                                                height={logoSvgHeight}
                                                                                                                                width={logoSvgWidth}
                                                                                                                                mask={`url(#${uniqueIds.mask})`}
                                                                                                                                fill={effectiveEngravingColor}
                                                                                                                                                                                                                                                                                                                            transform={`
                                                                                                                                                                                                                                                                                                                                rotate(${rotation}, ${logoX + logoSvgWidth / 2}, ${logoY + logoSvgHeight / 2})
                                                                                                                                                                                                                                                                                                                            `}                                                                                                                            />
                                                                                                                        )}





                                        





                                                                                {cardColor === 'black' && ( <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.blackSpotlight})`} style={{ mixBlendMode: 'lighten' }} /> )}





                                        {cardColor === 'silver' && ( <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.silverSpotlight})`} style={{ mixBlendMode: 'lighten' }} /> )}





                                        {cardColor !== 'black' && cardColor !== 'silver' && ( <rect width={SVG_WIDTH} height={SVG_HEIGHT} rx="20" fill={`url(#${uniqueIds.spotlight})`} style={{ mixBlendMode: 'lighten' }} /> )}





                                                                                





                                    </g>

                <path d="M40,85 h30 a5,5 0 0 1 5,5 v20 a5,5 0 0 1 -5,5 h-30 a5,5 0 0 1 -5,-5 v-20 a5,5 0 0 1 5,-5 z" fill={`url(#${uniqueIds.simStripes})`} opacity="0.9" />
            </svg>
        </div>
    );
}