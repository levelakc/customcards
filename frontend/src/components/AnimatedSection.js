import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const AnimatedSection = ({ children, animation = 'fade-in-up' }) => {
    const [ref, isIntersecting] = useIntersectionObserver({
        threshold: 0.1,
    });

    let animationClasses = '';
    switch (animation) {
        case 'fade-in-left':
            animationClasses = isIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10';
            break;
        case 'fade-in-right':
            animationClasses = isIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';
            break;
        case 'fade-in-up':
        default:
            animationClasses = isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
            break;
    }

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${animationClasses}`}
        >
            {children}
        </div>
    );
};

export default AnimatedSection;
