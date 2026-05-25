import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal'; // Import the new Modal component

export default function AdminUsersPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    
    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getUsers(token);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token, fetchUsers]);

    const handleToggleAdmin = async (user) => {
        if (window.confirm(t('toggleAdminConfirmation', { status: user.isAdmin ? t('remove') : t('grant'), name: user.name }))) {
            try {
                await api.updateUser(user._id, { isAdmin: !user.isAdmin }, token);
                fetchUsers();
            } catch (error) {
                alert(`${t('error')}: ${error.message}`);
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm(t('deleteUserConfirmation'))) {
            try {
                await api.deleteUser(userId, token);
                fetchUsers();
            } catch (error) {
                alert(`${t('error')}: ${error.message}`);
            }
        }
    };

    const openUserDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    if (loading) return <div className="text-center p-10 text-white">{t('loadingUsers')}...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('userManagement')}</h2>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('name')}</th>
                            <th scope="col" className="px-6 py-3">{t('email')}</th>
                            <th scope="col" className="px-6 py-3">{t('admin')}</th>
                            <th scope="col" className="px-6 py-3">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.isAdmin ? (
                                        <span className="text-green-400">{t('yes')}</span>
                                    ) : (
                                        <span className="text-red-400">{t('no')}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 space-x-4 space-x-reverse">
                                    <button onClick={() => openUserDetails(user)} className="font-medium text-green-500 hover:underline">
                                        {t('viewDetails')}
                                    </button>
                                    <button onClick={() => handleToggleAdmin(user)} className="font-medium text-blue-500 hover:underline">
                                        {user.isAdmin ? t('revokeAdmin') : t('makeAdmin')}
                                    </button>
                                    <button onClick={() => handleDeleteUser(user._id)} className="font-medium text-red-500 hover:underline">
                                        {t('delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={`${t('userDetails')}: ${selectedUser?.name}`}>
                {selectedUser && (
                    <div className="space-y-4 text-gray-300">
                        <div>
                            <strong className="text-white">{t('userId')}:</strong>
                            <p className="font-mono text-sm">{selectedUser._id}</p>
                        </div>
                        <div>
                            <strong className="text-white">{t('email')}:</strong>
                            <p>{selectedUser.email}</p>
                        </div>
                        <div>
                            <strong className="text-white">{t('phoneNumber')}:</strong>
                            <p>{selectedUser.phone}</p>
                        </div>
                        <div>
                            <strong className="text-white">{t('shippingAddress')}:</strong>
                            <p>{selectedUser.address.street}</p>
                            <p>{`${selectedUser.address.city}, ${selectedUser.address.postalCode}`}</p>
                        </div>
                         <div>
                            <strong className="text-white">{t('isAdmin')}:</strong>
                            <p>{selectedUser.isAdmin ? t('yes') : t('no')}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}