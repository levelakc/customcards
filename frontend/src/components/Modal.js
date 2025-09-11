import React from 'react';
import { XIcon } from './Icons';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        // The semi-transparent background overlay
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
            onClick={onClose} // Close modal when clicking the background
        >
            {/* The actual modal content box */}
            <div 
                className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <XIcon />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}