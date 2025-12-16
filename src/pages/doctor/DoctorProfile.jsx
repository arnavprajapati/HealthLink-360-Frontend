import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../app/reducers/authSlice';
import { User, Stethoscope, Building, Award, Clock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorProfile = () => {
    const { user, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        displayName: '',
        speciality: '',
        clinicName: '',
        experience: '',
        qualification: ''
    });

    const [message, setMessage] = useState(null);

    const timerRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                speciality: user.doctorProfile?.speciality || '',
                clinicName: user.doctorProfile?.clinicName || '',
                experience: user.doctorProfile?.experience || '',
                qualification: user.doctorProfile?.qualification || ''
            });
        }
    }, [user]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showTempMessage = (msgObj, ms = 3000) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setMessage(msgObj);
        timerRef.current = setTimeout(() => {
            setMessage(null);
            timerRef.current = null;
        }, ms);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await dispatch(updateUserProfile(formData)).unwrap();

            showTempMessage({ type: 'success', text: 'Profile updated successfully!' }, 2000);

            // Navigate to dashboard after successful profile update
            setTimeout(() => {
                navigate('/doctor-dashboard');
            }, 1500);

        } catch (error) {
            const errText = error?.message || String(error) || 'Failed to update profile';
            showTempMessage({ type: 'error', text: errText }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center">
                    <button
                        onClick={() => navigate('/doctor-dashboard')}
                        className="flex cursor-pointer items-center text-gray-600 hover:text-[#00a896] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-[#00a896] to-[#028090] px-6 py-4">
                        <h1 className="text-2xl font-bold text-white flex items-center">
                            <User className="w-6 h-6 mr-3" />
                            Doctor Profile
                        </h1>
                        <p className="text-[#f0f3bd] mt-1">Manage your professional information</p>
                    </div>

                    <div className="p-6">
                        {message?.text && (
                            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="col-span-2">
                                    <label className="block text-lg font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            className="focus:ring-[#00a896] focus:border-[#00a896] block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-2 border"
                                            placeholder="Dr. John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-1">
                                        Speciality
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Stethoscope className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="speciality"
                                            value={formData.speciality}
                                            onChange={handleChange}
                                            className="focus:ring-[#00a896] focus:border-[#00a896] block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-2 border"
                                            placeholder="Cardiologist"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-1">
                                        Clinic Name
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="clinicName"
                                            value={formData.clinicName}
                                            onChange={handleChange}
                                            className="focus:ring-[#00a896] focus:border-[#00a896] block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-2 border"
                                            placeholder="City Health Clinic"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-1">
                                        Years of Experience
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="focus:ring-[#00a896] focus:border-[#00a896] block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-2 border"
                                            placeholder="10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-1">
                                        Qualification
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Award className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleChange}
                                            className="focus:ring-[#00a896] focus:border-[#00a896] block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-2 border"
                                            placeholder="MBBS, MD"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex cursor-pointer items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-[#00a896] hover:bg-[#028090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02c39a] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
