import { useState, useEffect, useRef } from 'react';

export function useIntersectionObserver(options) {
    const [entry, setEntry] = useState(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const observer = useRef(null);
    const [node, setNode] = useState(null);

    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver(([entry]) => {
            setEntry(entry);
            setIsIntersecting(entry.isIntersecting);
        }, options);

        const { current: currentObserver } = observer;

        if (node) {
            currentObserver.observe(node);
        }

        return () => {
            if (currentObserver) {
                currentObserver.disconnect();
            }
        };
    }, [node, options]);

    return [setNode, isIntersecting, entry];
}
