import React, { useState, createContext, useContext } from 'react';

export const RouterContext = createContext(null);

export const RouterProvider = ({ children }) => {
    const [route, setRoute] = useState({ page: 'home' });

    const navigate = (page, params = {}) => {
        window.scrollTo(0, 0); // Scroll to top on every page change
        setRoute({ page, params });
    };

    return (
        <RouterContext.Provider value={{ route, navigate }}>
            {children}
        </RouterContext.Provider>
    );
};

export const useRouter = () => useContext(RouterContext);