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
        <div className="bg-[#121212] py-20 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-4xl md:text-5xl text-white text-center mb-12">{t('whatOurCustomersSay')}</h2>
                </div>
                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review._id} className="luxury-card-surface p-6 rounded-2xl">
                            <strong className="text-gold-300 text-lg">{review.name}</strong>
                            <p className="text-gray-200 mt-2 leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">{t('leaveAReview')}</h3>
                    {error && <p className="bg-red-900/60 border border-red-500/40 text-red-200 p-3 rounded-md mb-4 text-center">{error}</p>}
                    {user ? (
                        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl space-y-5 max-w-lg mx-auto">
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gold-300">{t('rating')}</label>
                                <select value={rating} onChange={e => setRating(e.target.value)} required className="w-full bg-gray-900 text-white rounded-lg p-2.5 border border-gold-500/30 focus:outline-none focus:border-gold-400">
                                    <option value="">{t('select')}</option>
                                    <option value="1">{t('rating1')}</option>
                                    <option value="2">{t('rating2')}</option>
                                    <option value="3">{t('rating3')}</option>
                                    <option value="4">{t('rating4')}</option>
                                    <option value="5">{t('rating5')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gold-300">{t('comment')}</label>
                                <textarea value={comment} onChange={e => setComment(e.target.value)} required rows="4" className="w-full bg-gray-900 text-white rounded-lg p-2.5 border border-gold-500/30 focus:outline-none focus:border-gold-400"></textarea>
                            </div>
                            <button type="submit" className="w-full btn-premium btn-gold">{t('submitReview')}</button>
                        </form>
                    ) : (
                        <p className="text-gray-300 text-center">{t('loginToLeaveReviewStart')} <button onClick={() => navigate('login')} className="text-gold-400 hover:text-gold-300 font-semibold hover:underline bg-transparent border-none p-0">{t('login')}</button> {t('loginToLeaveReviewEnd')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}