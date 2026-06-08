import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeOffIcon } from './Icons';

export default function AuthDropdown({ onClose }) {
    const { t } = useTranslation();
    const { navigate } = useRouter();
    const { login, register } = useAuth();
    
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await register(name, email, password);
        }
        
        setLoading(false);
        if (result.success) {
            if (onClose) onClose();
            navigate('home');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="absolute top-full mt-2 end-0 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 z-50 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
                {isLogin ? t('loginTitle') || 'כניסה' : t('registerTitle') || 'הרשמה'}
            </h2>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">{t('fullName')}</label>
                        <input 
                            type="text" 
                            required 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{t('email')}</label>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{t('password')}</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 transition-colors pl-10"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-400 text-xs text-center">{t(error)}</p>}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-premium btn-gold py-2 text-sm font-bold mt-2"
                >
                    {loading ? (isLogin ? t('loggingIn') || 'מתחבר...' : t('registering') || 'נרשם...') : (isLogin ? t('login') : t('register'))}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    {isLogin ? t('noAccountRegister') || 'אין לך חשבון? הירשם כאן' : t('haveAccountLogin') || 'כבר יש לך חשבון? התחבר כאן'}
                </button>
            </div>
        </div>
    );
}
