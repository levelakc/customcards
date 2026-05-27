import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/api';

export default function AdminMailingPage() {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [subject, setSubject] = useState('');
    const [htmlBody, setHtmlBody] = useState('');
    const [status, setStatus] = useState({ loading: false, message: '', isError: false });

    const handleSend = async (e) => {
        e.preventDefault();
        
        if (!window.confirm(t('confirmSendBroadcast') || "Are you sure you want to send this email to ALL users?")) {
            return;
        }

        setStatus({ loading: true, message: '', isError: false });
        try {
            const response = await fetch(`${api.BASE_URL}/api/admin/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subject, htmlBody }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send broadcast');
            
            setStatus({ loading: false, message: data.message || 'Broadcast sent successfully!', isError: false });
            setSubject('');
            setHtmlBody('');
        } catch (error) {
            setStatus({ loading: false, message: error.message, isError: true });
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">{t('emailBroadcast') || 'Email Broadcast System'}</h2>
            <p className="text-gray-400 mb-6">{t('emailBroadcastDesc') || 'Send an email to all registered users.'}</p>
            
            {status.message && (
                <div className={`p-4 mb-6 rounded-md ${status.isError ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSend} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('emailSubject') || 'Subject'}</label>
                    <input 
                        type="text" 
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:border-indigo-500"
                        placeholder={t('emailSubjectPlaceholder') || 'Enter email subject...'}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('emailBody') || 'HTML Body'}</label>
                    <textarea 
                        required
                        value={htmlBody}
                        onChange={(e) => setHtmlBody(e.target.value)}
                        rows="10"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm"
                        placeholder={t('emailBodyPlaceholder') || 'Enter HTML content here...'}
                    ></textarea>
                </div>
                <div>
                    <button 
                        type="submit" 
                        disabled={status.loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-indigo-400"
                    >
                        {status.loading ? (t('sending') || 'Sending...') : (t('sendBroadcast') || 'Send to All Users')}
                    </button>
                </div>
            </form>
        </div>
    );
}
