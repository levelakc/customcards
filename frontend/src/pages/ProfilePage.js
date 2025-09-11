import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/api';

export default function ProfilePage() {
    const { user, token, updateUserState } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.getUserProfile(token);
                setName(data.name);
                setEmail(data.email);
                setPhone(data.phone);
                setStreet(data.address.street);
                setCity(data.address.city);
                setPostalCode(data.address.postalCode);
            } catch (error) {
                setMessage(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchProfile();
        }
    }, [user, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        try {
            const updatedData = { name, email, phone, address: { street, city, postalCode } };
            if (password) {
                updatedData.password = password;
            }
            const updatedUser = await api.updateUserProfile(updatedData, token);
            updateUserState(updatedUser);
            setMessage('Profile updated successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    if (loading) return <div className="text-center p-10 text-white">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">My Profile</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {message && <p className={message.includes('Error') ? 'text-red-400 text-center' : 'text-green-400 text-center'}>{message}</p>}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Phone Number</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Shipping Address</label>
                            <div className="space-y-2 mt-1">
                                <input type="text" placeholder="Street and house number" value={street} onChange={e => setStreet(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                                <input type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">New Password (leave blank to keep current)</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"/>
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}