import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getIncomingRequests, getLinkedPatients, respondToRequest, getDoctorAppointments } from '../../app/reducers/connectionSlice';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    UserPlus
} from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const { incomingRequests, linkedPatients, appointments, loading } = useSelector((state) => state.connection);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getIncomingRequests());
        dispatch(getLinkedPatients());
        dispatch(getDoctorAppointments());

        // Onboarding Check: If profile is incomplete, redirect to profile page
        if (user && (!user.doctorProfile || !user.doctorProfile.speciality || !user.doctorProfile.clinicName)) {
            navigate('/doctor-profile');
        }
    }, [dispatch, user, navigate]);

    const handleRespond = async (requestId, status) => {
        await dispatch(respondToRequest({ requestId, status }));
        dispatch(getIncomingRequests());
        if (status === 'accepted') {
            dispatch(getLinkedPatients());
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#00a896] to-[#028090] rounded-lg shadow-lg p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, Dr. {user?.displayName || user?.email?.split('@')[0] || 'Doctor'}!
                </h1>
                <p className="text-[#f0f3bd]">
                    Here's what's happening with your patients today
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-lg font-medium mb-1">{stat.name}</h3>
                            <div className="flex items-baseline justify-between">
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <span className={`text-lg font-medium ${stat.changeType === 'positive' ? 'text-green-600' :
                                    stat.changeType === 'negative' ? 'text-red-600' :
                                        'text-gray-600'
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
                        <button className="text-lg text-[#00a896] hover:text-[#028090] font-medium">
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {upcomingAppointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-[#f0f3bd] p-2 rounded-full">
                                        <Clock className="w-5 h-5 text-[#028090]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{appointment.patient}</p>
                                        <p className="text-lg text-gray-600">{appointment.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg font-medium text-gray-700">{appointment.time}</span>
                                    {appointment.status === 'confirmed' ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Appointments */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
                            <button className="text-base text-[#00a896] hover:text-[#028090] font-medium">
                                View All
                            </button>
                        </div>
                        <div className="space-y-3">
                            {appointments && appointments.length > 0 ? (
                                appointments.slice(0, 5).map((appointment) => (
                                    <div
                                        key={appointment._id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-[#f0f3bd] p-2 rounded-full">
                                                <Clock className="w-5 h-5 text-[#028090]" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{appointment.patient.displayName}</p>
                                                <p className="text-base text-gray-600">{appointment.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-base font-medium text-gray-700">{appointment.time}</span>
                                            {appointment.status === 'confirmed' || appointment.status === 'scheduled' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No upcoming appointments.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Profile</h3>
                        <div className="flex items-center space-x-3">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full border-2 border-green-200"
                                />
                            ) : (
                                <p className="text-gray-500 text-center py-4">No patients linked yet.</p>
                            )}
                            <div>
                                <p className="font-semibold text-gray-900">
                                    Dr. {user?.displayName || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-lg text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;