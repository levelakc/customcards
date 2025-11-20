import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/api';

function EditReviewModal({ review, onClose, onSave, token }) {
    const [comment, setComment] = useState(review.comment);
    const [rating, setRating] = useState(review.rating);

    const handleSave = () => {
        onSave(review._id, { ...review, comment, rating });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Edit Review</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Rating</label>
                        <select value={rating} onChange={e => setRating(e.target.value)} required className="w-full bg-gray-700 rounded p-2 border border-gray-600">
                            <option value="">Select...</option>
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Comment</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} required rows="4" className="w-full bg-gray-700 rounded p-2 border border-gray-600"></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Save</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminReviewsPage() {
    const { token } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingReview, setEditingReview] = useState(null);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getReviews();
            setReviews(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await api.deleteReview(id, token);
                fetchReviews();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleUpdate = async (id, updatedReview) => {
        try {
            await api.updateReview(id, updatedReview, token);
            setEditingReview(null);
            fetchReviews();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading reviews...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Reviews</h2>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Rating</th>
                            <th scope="col" className="px-6 py-3">Comment</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(review => (
                            <tr key={review._id} className="border-b border-gray-700 hover:bg-gray-600">
                                <td className="px-6 py-4">{review.name}</td>
                                <td className="px-6 py-4">{review.rating}</td>
                                <td className="px-6 py-4">{review.comment}</td>
                                <td className="px-6 py-4 space-x-2 space-x-reverse">
                                    <button onClick={() => setEditingReview(review)} className="font-medium text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(review._id)} className="font-medium text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingReview && (
                <EditReviewModal
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                    onSave={handleUpdate}
                    token={token}
                />
            )}
        </div>
    );
}
