import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';

const AdminReviewsPage = () => {
    const { userInfo, token, isAdmin, loading: authLoading } = useAuth();
    const { navigate } = useRouter();
    // Remove local loading state, use authLoading instead
    // const [loading, setLoading] = useState(true); 

    useEffect(() => {
        console.log("AdminReviewsPage useEffect triggered.");
        console.log("userInfo:", userInfo);
        console.log("isAdmin from useAuth:", isAdmin);
        console.log("authLoading:", authLoading);

        if (authLoading) {
            // Still loading auth context, do nothing yet
            return;
        }

        if (!authLoading && !userInfo) {
            // If auth is done loading and userInfo is null, it means user is not logged in
            console.log("Redirecting to login: User not logged in.");
            navigate('login'); // Or 'home', depending on desired behavior for non-logged-in users
            return;
        }

        if (!authLoading && userInfo && !isAdmin) {
            // If auth is done loading, user is logged in but not an admin
            console.log("Redirecting to home: User is logged in but not an admin.");
            navigate('home');
            return;
        }

        if (!authLoading && userInfo && isAdmin) {
            // If auth is done loading, user is logged in and is an admin
            console.log("User is admin. Displaying Admin Reviews Page content.");
            // In a real scenario, you would fetch reviews here.
        }
        // The previous inconsistent state check is no longer needed due to authLoading
    }, [userInfo, isAdmin, authLoading, navigate]);

    if (authLoading) {
        return <div className="text-white text-center p-4">Loading authentication status...</div>; // Loading spinner or message
    }

    // If not loading and not admin (should have been redirected by useEffect, but as a fallback)
    if (!userInfo || !isAdmin) {
        return null; 
    }

    return (
        <div className="container mx-auto p-4 text-white">
            <h1 className="text-2xl font-bold mb-4">Admin Reviews Page - Content Placeholder</h1>
            <p>This is a simplified version of the Admin Reviews Page.</p>
            <p>If you see this, it means the routing to this page is working correctly.</p>
            <p>User Info: {userInfo ? userInfo.email : 'N/A'}</p>
            <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
        </div>
    );
};

export default AdminReviewsPage;
