import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';

const AdminReviewsPage = () => {
    const { userInfo, token, isAdmin } = useAuth();
    const { navigate } = useRouter();
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        console.log("AdminReviewsPage useEffect triggered.");
        console.log("userInfo:", userInfo);
        console.log("isAdmin from useAuth:", isAdmin);

        if (userInfo !== undefined && isAdmin !== undefined) { // Check if auth context has loaded
            setLoading(false); // Auth status determined
            if (!userInfo || !isAdmin) {
                console.log("Redirecting to home: userInfo or isAdmin is false.");
                navigate('home');
            } else {
                console.log("User is admin. Displaying Admin Reviews Page content.");
                // In a real scenario, you would fetch reviews here.
            }
        }
    }, [userInfo, isAdmin, navigate]);

    if (loading) {
        return <div className="text-white text-center p-4">Loading authentication status...</div>; // Loading spinner or message
    }

    if (!userInfo || !isAdmin) {
        return null; // Should not be reached if loading is handled, but as a fallback
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
