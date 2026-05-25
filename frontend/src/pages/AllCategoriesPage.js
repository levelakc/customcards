import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import * as api from '../api/api';

export default function AllCategoriesPage() {
    const { navigate } = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const allCategories = await api.getCategories();
                setCategories(allCategories);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">טוען קטגוריות...</div>;
    if (categories.length === 0) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">לא נמצאו קטגוריות.</div>;

    return (
        <div className="bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-white mb-8 text-center">כל הקטגוריות</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {categories.map(category => (
                        <div 
                            key={category._id} 
                            onClick={() => navigate('category', { id: category._id })}
                            className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition duration-300 ease-in-out"
                        >
                            <h2 className="text-2xl font-semibold text-white text-center mb-2">{category.name}</h2>
                            {/* You can add an image or description here if available in category object */}
                            {/* <p className="text-gray-400 text-center">{category.description}</p> */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
