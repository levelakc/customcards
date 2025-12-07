import { useState, useEffect, useRef } from 'react';

const useColorCycle = (colors, intervalTime) => {
    const [colorIndex, setColorIndex] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (colors && colors.length > 1) {
            intervalRef.current = setInterval(() => {
                setColorIndex(prevIndex => (prevIndex + 1) % colors.length);
            }, intervalTime);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [colors, intervalTime]);

    if (!colors || colors.length === 0) {
        return 'black';
    }

    return colors[colorIndex];
};

export default useColorCycle;
