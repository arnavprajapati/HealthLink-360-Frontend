import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../context/ConnectionContext';
import {
    CheckCircle,
    AlertCircle,
    UserPlus,
    Users,
    Calendar
} from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const {
        incomingRequests,
        linkedPatients,
        appointments,
        getIncomingRequests,
        getLinkedPatients,
        getDoctorAppointments
    } = useConnection();
    const navigate = useNavigate();

    useEffect(() => {
        getIncomingRequests();
        getLinkedPatients();
        getDoctorAppointments();

        // Onboarding Check: If profile is incomplete, redirect to profile page
        if (user && (!user.doctorProfile || !user.doctorProfile.speciality || !user.doctorProfile.clinicName)) {
            navigate('/doctor-profile');
        }
    }, [user, navigate]);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#00a896] to-[#028090] rounded-xl shadow-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">
                    Welcome back, Dr. {user?.displayName || user?.email?.split('@')[0] || 'Doctor'}!
                </h1>
                <p className="text-teal-100">
                    Here's what's happening with your patients today
                </p>
            </div>

            {/* Two Column Layout - Appointments & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left - Today's Appointments */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-6 bg-[#00a896] rounded-full"></div>
                            Today's Appointments
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {appointments && appointments.length > 0 ? (
                            appointments.slice(0, 4).map((appointment) => (
                                <div
                                    key={appointment._id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        {appointment.patient?.photoURL ? (
                                            <img
                                                src={appointment.patient.photoURL}
                                                alt={appointment.patient.displayName}
                                                className="w-11 h-11 rounded-full border-2 border-teal-200 object-cover"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center text-white font-bold">
                                                {appointment.patient?.displayName?.charAt(0)?.toUpperCase() || 'P'}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {appointment.patient?.displayName || 'Patient'}
                                            </h3>
                                            <p className="text-lg text-gray-500">{appointment.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-medium text-gray-700">{appointment.time}</span>
                                        {appointment.status === 'confirmed' || appointment.status === 'scheduled' ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-700 mb-1">No Appointments Today</h3>
                                <p className="text-lg text-gray-500">Schedule appointments with patients</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right - Quick Overview */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                            Quick Overview
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium text-lg text-gray-700">Total Patients</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{linkedPatients?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <UserPlus className="w-5 h-5 text-yellow-600" />
                                </div>
                                <span className="font-medium text-lg text-gray-700">Pending Requests</span>
                            </div>
                            <span className="text-2xl font-bold text-yellow-600">{incomingRequests?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="font-medium text-lg text-gray-700">Total Appointments</span>
                            </div>
                            <span className="text-2xl font-bold text-green-600">{appointments?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-teal-600" />
                                </div>
                                <span className="font-medium text-lg text-gray-700">Completed</span>
                            </div>
                            <span className="text-2xl font-bold text-teal-600">{appointments?.filter(a => a.status === 'completed')?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;