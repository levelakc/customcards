import React from 'react';
import { useRouter } from '../contexts/RouterContext';

export default function OrderSuccessPage() {
    const { navigate } = useRouter();

    return (
        <div className="bg-gray-900 min-h-screen text-white text-center flex flex-col justify-center items-center p-10">
            <svg className="w-24 h-24 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h1 className="text-4xl font-extrabold mb-4 font-dancing">ההזמנה הושלמה בהצלחה!</h1>
            <p className="text-gray-400 mb-8">תודה רבה על רכישתך. תוכל לעקוב אחר סטטוס ההזמנה בחשבונך.</p>
            <button 
                onClick={() => navigate('home')} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg"
            >
                חזור לדף הבית
            </button>
        </div>
    );
}
