import React, { useState, useEffect, createContext, useContext } from 'react';

export const RouterContext = createContext(null);

export const RouterProvider = ({ children }) => {
    // Initialize state from URL if possible
    const getInitialRoute = () => {
        const path = window.location.pathname.substring(1); // Remove leading slash
        const searchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(searchParams.entries());

        if (!path || path === '') return { page: 'home', params: {} };
        return { page: path, params };
    };

    const [route, setRoute] = useState(getInitialRoute());

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
        const url = `/${page}${queryString ? '?' + queryString : ''}`;
        
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
