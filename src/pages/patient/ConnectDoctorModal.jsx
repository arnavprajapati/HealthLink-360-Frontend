import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendConnectionRequest, clearConnectionMessage } from '../../app/reducers/connectionSlice';
import { X, UserPlus, Send, AlertCircle, CheckCircle } from 'lucide-react';

const ConnectDoctorModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { loading, error, successMessage } = useSelector((state) => state.connection);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearConnectionMessage());
        await dispatch(sendConnectionRequest(email));
    };

    const handleClose = () => {
        dispatch(clearConnectionMessage());
        setEmail('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                                <UserPlus className="h-6 w-6 text-teal-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Connect with a Doctor
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Enter your doctor's email address to send a connection request. Once accepted, they will be able to view your health logs.
                                    </p>

                                    {error && (
                                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                            <span className="text-sm">{error}</span>
                                        </div>
                                    )}

                                    {successMessage && (
                                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            <span className="text-sm">{successMessage}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="mt-4">
                                        <label htmlFor="doctor-email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Doctor's Email
                                        </label>
                                        <input
                                            type="email"
                                            id="doctor-email"
                                            required
                                            className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                            placeholder="doctor@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        
                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#00a896] text-base font-medium text-white hover:bg-[#028090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:col-start-2 sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {loading ? 'Sending...' : 'Send Request'}
                                            </button>
                                            <button
                                                type="button"
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                                onClick={handleClose}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectDoctorModal;
