import React, { useState, useEffect } from 'react';
import { X, Lock, Users, UserCheck, Check, Loader2 } from 'lucide-react';
import { useConnection } from '../../context/ConnectionContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

const ShareModal = ({ isOpen, onClose, item, itemType, onSuccess }) => {
    const { linkedDoctors, getLinkedDoctors } = useConnection();
    const [visibility, setVisibility] = useState(item?.sharing?.visibility || 'all_doctors');
    const [selectedDoctors, setSelectedDoctors] = useState(item?.sharing?.sharedWith || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            getLinkedDoctors();
            setVisibility(item?.sharing?.visibility || 'all_doctors');
            setSelectedDoctors(item?.sharing?.sharedWith || []);
        }
    }, [isOpen, item]);

    const handleDoctorToggle = (doctorId) => {
        setSelectedDoctors(prev =>
            prev.includes(doctorId)
                ? prev.filter(id => id !== doctorId)
                : [...prev, doctorId]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            const endpoint = itemType === 'healthLog'
                ? `${API_URL}/api/health-logs/${item._id}/sharing`
                : `${API_URL}/api/goals/${item._id}/sharing`;

            const response = await axios.patch(endpoint, {
                visibility,
                sharedWith: visibility === 'specific_doctors' ? selectedDoctors : []
            });

            onSuccess && onSuccess(response.data.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update sharing settings');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const visibilityOptions = [
        {
            value: 'private',
            label: 'Private',
            description: 'Only you can see this',
            icon: Lock,
            color: 'text-red-600 bg-red-50 border-red-200'
        },
        {
            value: 'all_doctors',
            label: 'All Connected Doctors',
            description: 'All your connected doctors can see this',
            icon: Users,
            color: 'text-green-600 bg-green-50 border-green-200'
        },
        {
            value: 'specific_doctors',
            label: 'Specific Doctors',
            description: 'Only selected doctors can see this',
            icon: UserCheck,
            color: 'text-blue-600 bg-blue-50 border-blue-200'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#00a896] to-[#028090] p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Share Settings</h2>
                            <p className="text-teal-100 text-lg mt-1">
                                Choose who can see this {itemType === 'healthLog' ? 'health record' : 'health goal'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 cursor-pointer hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-lg">
                            {error}
                        </div>
                    )}

                    {/* Visibility Options */}
                    <div className="space-y-3">
                        {visibilityOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = visibility === option.value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setVisibility(option.value)}
                                    className={`w-full cursor-pointer p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                        ? option.color + ' border-current'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/50' : 'bg-gray-100'}`}>
                                            <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-500'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-semibold ${isSelected ? '' : 'text-gray-800'}`}>
                                                {option.label}
                                            </p>
                                            <p className={`text-lg ${isSelected ? 'opacity-80' : 'text-gray-500'}`}>
                                                {option.description}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Doctor Selection (only for specific_doctors) */}
                    {visibility === 'specific_doctors' && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Select Doctors</h3>
                            {linkedDoctors && linkedDoctors.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {linkedDoctors.map((doctor) => {
                                        const isSelected = selectedDoctors.includes(doctor._id);
                                        return (
                                            <button
                                                key={doctor._id}
                                                onClick={() => handleDoctorToggle(doctor._id)}
                                                className={`w-full cursor-pointer p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${isSelected
                                                    ? 'border-blue-500 cursor-pointer bg-blue-50'
                                                    : 'border-gray-200 cursor-pointer hover:border-gray-300'
                                                    }`}
                                            >
                                                {doctor.photoURL ? (
                                                    <img
                                                        src={doctor.photoURL}
                                                        alt={doctor.displayName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                        {doctor.displayName?.charAt(0)?.toUpperCase() || 'D'}
                                                    </div>
                                                )}
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium text-gray-800">
                                                        Dr. {doctor.displayName}
                                                    </p>
                                                    <p className="text-lg text-gray-500">
                                                        {doctor.doctorProfile?.speciality || 'General Physician'}
                                                    </p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                    }`}>
                                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No connected doctors</p>
                                    <p className="text-lg">Connect with a doctor first to share with them</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 cursor-pointer text-lg px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || (visibility === 'specific_doctors' && selectedDoctors.length === 0)}
                        className="flex-1 text-lg cursor-pointer px-4 py-2.5 curso bg-gradient-to-r from-[#00a896] to-[#028090] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
