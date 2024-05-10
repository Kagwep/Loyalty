import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const CreateRoomModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        status: '',
        maxPlayers: 0,
        description: '',
        roomId: '',
        creatorName: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Submit logic here, you might need to adjust based on how you're interacting with your blockchain or backend
        console.log(formData);
        onClose(); // Close modal after submission
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-2xl font-medium leading-6 text-gray-900">
                                    Create Room
                                </h3>
                                <div className="mt-2">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <input type="text" name="name" placeholder="Room Name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-2xl" />
                                        <input type="text" name="status" placeholder="Status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-2xl" />
                                        <input type="number" name="maxPlayers" placeholder="Max Players" value={formData.maxPlayers} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-2xl" />
                                        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-2xl" />
                                        <input type="text" name="roomId" placeholder="Room ID" value={formData.roomId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-2xl" />
                                        <input type="text" name="creatorName" placeholder="Creator Name" value={formData.creatorName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-2xl" />
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-purple-950 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500  text-2xl" onClick={handleSubmit}>
                            Create Room
                        </button>
                        <button type="button" className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-red-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-4xl" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoomModal;
