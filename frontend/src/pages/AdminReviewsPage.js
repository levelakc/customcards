import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';

const AdminReviewsPage = () => {
    const { userInfo, token, isAdmin } = useAuth(); // Destructure isAdmin directly
    const { navigate } = useRouter();

    useEffect(() => {
        console.log("AdminReviewsPage useEffect triggered.");
        console.log("userInfo:", userInfo);
        console.log("isAdmin from useAuth:", isAdmin);

        if (!userInfo || !isAdmin) { // Use isAdmin from useAuth directly
            console.log("Redirecting to home: userInfo or isAdmin is false.");
            navigate('home');
        } else {
            console.log("User is admin. Displaying Admin Reviews Page content.");
            // In a real scenario, you would fetch reviews here.
        }
    }, [userInfo, isAdmin, navigate]); // Add isAdmin to dependency array

    if (!userInfo || !isAdmin) {
        return null; // Or a loading spinner, as the redirect will happen in useEffect
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
