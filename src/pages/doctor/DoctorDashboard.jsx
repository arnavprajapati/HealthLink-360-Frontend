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

            <div className="space-y-6">
                {/* Pending Requests Section */}
                {incomingRequests && incomingRequests.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-400">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <UserPlus className="w-6 h-6 mr-2 text-yellow-500" />
                            Pending Patient Requests
                        </h2>
                        <div className="space-y-3">
                            {incomingRequests.map((request) => (
                                <div key={request._id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        {request.patient.photoURL ? (
                                            <img src={request.patient.photoURL} alt={request.patient.displayName} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 font-bold">
                                                {request.patient.displayName?.[0] || 'P'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900">{request.patient.displayName}</p>
                                            <p className="text-sm text-gray-600">{request.patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleRespond(request._id, 'accepted')}
                                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRespond(request._id, 'rejected')}
                                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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

                    {/* Linked Patients List */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">My Patients</h2>
                            <button className="text-base text-[#00a896] hover:text-[#028090] font-medium">
                                View All
                            </button>
                        </div>
                        <div className="space-y-3">
                            {linkedPatients && linkedPatients.length > 0 ? (
                                linkedPatients.map((patient) => (
                                    <div key={patient._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                        <div className="flex items-center space-x-4">
                                            {patient.photoURL ? (
                                                <img src={patient.photoURL} alt={patient.displayName} className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                                    {patient.displayName?.[0] || 'P'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900">{patient.displayName}</p>
                                                <p className="text-sm text-gray-600">{patient.email}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                                            className="text-[#00a896] hover:text-[#028090] font-medium text-sm"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No patients linked yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;