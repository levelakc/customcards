import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import * as api from '../api/api';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function Reviews() {
    const { user, token } = useAuth();
    const { navigate } = useRouter();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const { t } = useTranslation(); // Initialize useTranslation

    const fetchReviews = useCallback(async () => {
        try {
            const data = await api.getReviews();
            setReviews(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.createReview({ rating, comment }, token);
            setRating(0);
            setComment('');
            fetchReviews();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="bg-gray-800 py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-white text-center mb-12">{t('whatOurCustomersSay')}</h2>
                <div className="space-y-8">
                    {reviews.map(review => (
                        <div key={review._id} className="bg-gray-900 p-6 rounded-lg">
                            <strong className="text-white">{review.name}</strong>
                            <p className="text-gray-300 mt-2">{review.comment}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-white mb-4 text-center">{t('leaveAReview')}</h3>
                    {error && <p className="bg-red-900 text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
                    {user ? (
                        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg space-y-4 max-w-lg mx-auto">
                            <div>
                                <label className="block mb-1 text-sm font-medium">{t('rating')}</label>
                                <select value={rating} onChange={e => setRating(e.target.value)} required className="w-full bg-gray-700 rounded p-2 border border-gray-600">
                                    <option value="">{t('select')}</option>
                                    <option value="1">{t('rating1')}</option>
                                    <option value="2">{t('rating2')}</option>
                                    <option value="3">{t('rating3')}</option>
                                    <option value="4">{t('rating4')}</option>
                                    <option value="5">{t('rating5')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">{t('comment')}</label>
                                <textarea value={comment} onChange={e => setComment(e.target.value)} required rows="4" className="w-full bg-gray-700 rounded p-2 border border-gray-600"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">{t('submitReview')}</button>
                        </form>
                    ) : (
                        <p className="text-gray-400 text-center">{t('loginToLeaveReviewStart')} <button onClick={() => navigate('login')} className="text-indigo-400 hover:underline bg-transparent border-none p-0">{t('login')}</button> {t('loginToLeaveReviewEnd')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}