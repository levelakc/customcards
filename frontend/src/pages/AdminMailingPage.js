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
        <div className="glass-panel p-8">
            <h2 className="text-3xl font-extrabold gold-gradient-text mb-6 font-dancing">{t('emailBroadcast') || 'Email Broadcast System'}</h2>
            <p className="text-gray-400 mb-8">{t('emailBroadcastDesc') || 'Send an email to all registered users.'}</p>
            
            {status.message && (
                <div className={`p-4 mb-8 rounded-lg font-bold text-center ${status.isError ? 'bg-red-900/40 text-red-200 border border-red-500/50' : 'bg-green-900/40 text-green-200 border border-green-500/50'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSend} className="space-y-8">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-gold-500 font-bold mb-3">{t('emailSubject') || 'Subject'}</label>
                    <input 
                        type="text" 
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-6 text-white focus:outline-none focus:border-gold-500/50 transition-all"
                        placeholder={t('emailSubjectPlaceholder') || 'Enter email subject...'}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-widest text-gold-500 font-bold mb-3">{t('emailBody') || 'HTML Body'}</label>
                    <textarea 
                        required
                        value={htmlBody}
                        onChange={(e) => setHtmlBody(e.target.value)}
                        rows="10"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-gold-500/50 font-mono text-sm"
                        placeholder={t('emailBodyPlaceholder') || 'Enter HTML content here...'}
                    ></textarea>
                </div>
                <div>
                    <button 
                        type="submit" 
                        disabled={status.loading}
                        className={`btn-premium w-full text-lg py-4 ${status.loading ? 'opacity-50 cursor-not-allowed' : 'btn-gold'}`}
                    >
                        {status.loading ? (t('sending') || 'Sending...') : (t('sendBroadcast') || 'Send to All Users')}
                    </button>
                </div>
            </form>
        </div>
    );
}
