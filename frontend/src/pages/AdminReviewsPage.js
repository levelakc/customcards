import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { getReviews, deleteReview, updateReview } from '../api/api'; // Import updateReview
// Removed unused imports: Loader, Message

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null); // New state for editing
    const [editedReviewData, setEditedReviewData] = useState({}); // New state for edited data

    const { userInfo, token } = useAuth();
    const { navigate } = useRouter();

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('home');
        } else {
            fetchReviews();
        }
    }, [userInfo, navigate, deleteSuccess]); // Re-fetch when a review is deleted

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getReviews(token);
            setReviews(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                setLoading(true);
                await deleteReview(id, token);
                setDeleteSuccess(true); // Trigger re-fetch
                setLoading(false);
                // Optionally, clear deleteSuccess after a short delay or next fetch
                setTimeout(() => setDeleteSuccess(false), 100); 
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }
    };

    // New handlers for editing
    const startEditHandler = (review) => {
        setEditingReviewId(review._id);
        setEditedReviewData({
            name: review.name,
            rating: review.rating,
            comment: review.comment,
        });
    };

    const cancelEditHandler = () => {
        setEditingReviewId(null);
        setEditedReviewData({});
    };

    const saveEditHandler = async (id) => {
        try {
            setLoading(true);
            await updateReview(id, editedReviewData, token);
            setEditingReviewId(null);
            setEditedReviewData({});
            fetchReviews(); // Re-fetch all reviews to show updated data
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedReviewData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Reviews</h1>
            {loading ? (
                <div className="text-center p-10 text-white">Loading Reviews...</div>
            ) : error ? (
                <div className="text-center p-10 text-red-400">Error: {error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">User</th>
                                <th className="py-2 px-4 border-b">Rating</th>
                                <th className="py-2 px-4 border-b">Comment</th>
                                <th className="py-2 px-4 border-b">Created At</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review._id}>
                                    <td className="py-2 px-4 border-b">{review._id}</td>
                                    <td className="py-2 px-4 border-b">
                                        {editingReviewId === review._id ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={editedReviewData.name || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-1 border rounded"
                                            />
                                        ) : (
                                            review.name
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {editingReviewId === review._id ? (
                                            <input
                                                type="number"
                                                name="rating"
                                                value={editedReviewData.rating || ''}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="5"
                                                className="w-full p-1 border rounded"
                                            />
                                        ) : (
                                            review.rating
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {editingReviewId === review._id ? (
                                            <textarea
                                                name="comment"
                                                value={editedReviewData.comment || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-1 border rounded"
                                                rows="3"
                                            ></textarea>
                                        ) : (
                                            review.comment
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">{new Date(review.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b">
                                        {editingReviewId === review._id ? (
                                            <>
                                                <button
                                                    onClick={() => saveEditHandler(review._id)}
                                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEditHandler}
                                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEditHandler(review)}
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteHandler(review._id)}
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminReviewsPage;
