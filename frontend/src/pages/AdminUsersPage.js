import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal'; // Import the new Modal component

export default function AdminUsersPage() {
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
        if (window.confirm(`Are you sure you want to ${user.isAdmin ? 'remove admin' : 'grant admin'} privileges for ${user.name}?`)) {
            try {
                await api.updateUser(user._id, { isAdmin: !user.isAdmin }, token);
                fetchUsers();
            } catch (error) {
                alert(`Error updating user: ${error.message}`);
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.deleteUser(userId, token);
                fetchUsers();
            } catch (error) {
                alert(`Error deleting user: ${error.message}`);
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

    if (loading) return <div className="text-center p-10 text-white">Loading Users...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">ניהול משתמשים</h2>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Admin</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.isAdmin ? (
                                        <span className="text-green-400">Yes</span>
                                    ) : (
                                        <span className="text-red-400">No</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 space-x-4 space-x-reverse">
                                    <button onClick={() => openUserDetails(user)} className="font-medium text-green-500 hover:underline">
                                        View Details
                                    </button>
                                    <button onClick={() => handleToggleAdmin(user)} className="font-medium text-blue-500 hover:underline">
                                        {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                    </button>
                                    <button onClick={() => handleDeleteUser(user._id)} className="font-medium text-red-500 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={`User Details: ${selectedUser?.name}`}>
                {selectedUser && (
                    <div className="space-y-4 text-gray-300">
                        <div>
                            <strong className="text-white">User ID:</strong>
                            <p className="font-mono text-sm">{selectedUser._id}</p>
                        </div>
                        <div>
                            <strong className="text-white">Email:</strong>
                            <p>{selectedUser.email}</p>
                        </div>
                        <div>
                            <strong className="text-white">Phone Number:</strong>
                            <p>{selectedUser.phone}</p>
                        </div>
                        <div>
                            <strong className="text-white">Shipping Address:</strong>
                            <p>{selectedUser.address.street}</p>
                            <p>{`${selectedUser.address.city}, ${selectedUser.address.postalCode}`}</p>
                        </div>
                         <div>
                            <strong className="text-white">Is Admin:</strong>
                            <p>{selectedUser.isAdmin ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}