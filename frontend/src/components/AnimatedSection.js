import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const AnimatedSection = ({ children, animation = 'fade-in-up' }) => {
    const [ref, isIntersecting] = useIntersectionObserver({
        threshold: 0.1,
    });

    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (isIntersecting && !hasAnimated) {
            setHasAnimated(true);
        }
    }, [isIntersecting, hasAnimated]);

    let animationClasses = '';
    switch (animation) {
        case 'fade-in-left':
            animationClasses = hasAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10';
            break;
        case 'fade-in-right':
            animationClasses = hasAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';
            break;
        case 'fade-in-up':
        default:
            animationClasses = hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
            break;
    }

    return (
        <div
            ref={ref}
            className={`duration-1000 ease-out ${animationClasses}`}
            style={{ 
                transitionProperty: 'opacity, transform',
                willChange: 'opacity, transform' 
            }}
        >
            {children}
        </div>
    );
};

export default AnimatedSection;
