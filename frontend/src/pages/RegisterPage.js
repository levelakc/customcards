import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeOffIcon } from '../components/Icons';

export default function RegisterPage() {
    const { navigate } = useRouter();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const registrationData = {
            name,
            email,
            password,
            phone,
            address: { street, city, postalCode }
        };

        const result = await register(registrationData);
        setLoading(false);
        if (result.success) {
            navigate('home');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">יצירת חשבון חדש</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">שם מלא</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">כתובת אימייל</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">סיסמה</label>
                            <div className="mt-1 relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white pl-10 text-right"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">מספר טלפון</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">כתובת למשלוח</label>
                            <div className="space-y-2 mt-1">
                                <input type="text" placeholder="רחוב ומספר בית" value={street} onChange={e => setStreet(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                                <input type="text" placeholder="עיר" value={city} onChange={e => setCity(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                                <input type="text" placeholder="מיקוד" value={postalCode} onChange={e => setPostalCode(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        
                        <div className="text-sm text-center">
                           <button type="button" onClick={() => navigate('login')} className="font-medium text-indigo-400 hover:text-indigo-300">
                                יש לך כבר חשבון? התחבר
                           </button>
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                                {loading ? 'יוצר חשבון...' : 'הירשם'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}