import React, { useState, useEffect, createContext, useContext } from 'react';

export const RouterContext = createContext(null);

export const RouterProvider = ({ children }) => {
    // Initialize state from URL if possible
    const getInitialRoute = () => {
        const path = window.location.pathname.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
        const searchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(searchParams.entries());

        if (!path || path === '' || path === 'home' || path === 'index.html') {
            return { page: 'home', params };
        }
        return { page: path, params };
    };

    const [route, setRoute] = useState(getInitialRoute);

    useEffect(() => {
        // Normalize /home or /index.html URLs to / so browser refresh never hits a missing static path
        const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
        if (cleanPath === 'home' || cleanPath === 'index.html') {
            const newUrl = `/${window.location.search}${window.location.hash}`;
            window.history.replaceState({ page: 'home', params: route.params }, '', newUrl);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const handlePopState = () => {
            setRoute(getInitialRoute());
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (page, params = {}) => {
        window.scrollTo(0, 0);
        
        const searchParams = new URLSearchParams(params);
        const queryString = searchParams.toString();
        const basePath = page === 'home' ? '/' : `/${page}`;
        const url = `${basePath}${queryString ? '?' + queryString : ''}`;
        
        window.history.pushState({ page, params }, '', url);
        setRoute({ page, params });
    };

    return (
        <RouterContext.Provider value={{ route, navigate }}>
            {children}
        </RouterContext.Provider>
    );
};

export const useRouter = () => useContext(RouterContext);
