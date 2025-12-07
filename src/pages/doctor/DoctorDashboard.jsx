import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../context/ConnectionContext';
import {
    CheckCircle,
    AlertCircle,
    UserPlus,
    Users,
    Calendar,
    Clock,
    CalendarDays
} from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const {
        incomingRequests,
        linkedPatients,
        appointments,
        appointmentRequests,
        getIncomingRequests,
        getLinkedPatients,
        getDoctorAppointments,
        getAppointmentRequests,
        respondToAppointmentRequest
    } = useConnection();
    const navigate = useNavigate();

    useEffect(() => {
        getIncomingRequests();
        getLinkedPatients();
        getDoctorAppointments();
        getAppointmentRequests();

        // Onboarding Check: If profile is incomplete, redirect to profile page
        if (user && (!user.doctorProfile || !user.doctorProfile.speciality || !user.doctorProfile.clinicName)) {
            navigate('/doctor-profile');
        }
    }, [user, navigate]);

    // Filter today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments?.filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime() && apt.status !== 'cancelled' && apt.status !== 'rejected';
    }) || [];

    const formatAppointmentDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleAppointmentResponse = async (appointmentId, status) => {
        try {
            await respondToAppointmentRequest({ appointmentId, status });
            getDoctorAppointments();
        } catch (error) {
            console.error('Failed to respond:', error);
        }
    };

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

            {/* Appointment Requests Section */}
            {appointmentRequests && appointmentRequests.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Pending Appointment Requests ({appointmentRequests.length})
                    </h3>
                    <div className="space-y-2">
                        {appointmentRequests.slice(0, 3).map((request) => (
                            <div key={request._id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {request.patient?.photoURL ? (
                                        <img
                                            src={request.patient.photoURL}
                                            alt={request.patient.displayName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 font-bold">
                                            {request.patient?.displayName?.charAt(0)?.toUpperCase() || 'P'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{request.patient?.displayName}</p>
                                        <p className="text-lg text-gray-500">
                                            {formatAppointmentDate(request.date)} at {request.time} • {request.type}
                                        </p>
                                        {request.requestMessage && (
                                            <p className="text-xs text-gray-400 mt-1">"{request.requestMessage}"</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAppointmentResponse(request._id, 'approved')}
                                        className="px-3 py-1.5 bg-green-500 text-white text-lg rounded-lg hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAppointmentResponse(request._id, 'rejected')}
                                        className="px-3 py-1.5 bg-red-100 text-red-600 text-lg rounded-lg hover:bg-red-200"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                        {todayAppointments && todayAppointments.length > 0 ? (
                            todayAppointments.slice(0, 4).map((appointment) => (
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
                                        <div className="text-right">
                                            <span className="text-lg font-medium text-gray-700 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {appointment.time}
                                            </span>
                                        </div>
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

                    {/* Upcoming Appointments Preview */}
                    {appointments && appointments.filter(apt => {
                        const aptDate = new Date(apt.date);
                        aptDate.setHours(0, 0, 0, 0);
                        return aptDate.getTime() > today.getTime() && apt.status !== 'cancelled' && apt.status !== 'rejected';
                    }).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-lg font-medium text-gray-600 mb-3">Upcoming Appointments</h4>
                                <div className="space-y-2">
                                    {appointments.filter(apt => {
                                        const aptDate = new Date(apt.date);
                                        aptDate.setHours(0, 0, 0, 0);
                                        return aptDate.getTime() > today.getTime() && apt.status !== 'cancelled' && apt.status !== 'rejected';
                                    }).slice(0, 3).map((apt) => (
                                        <div key={apt._id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg lgm">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4 text-blue-500" />
                                                <span className="font-medium text-gray-700">{apt.patient?.displayName}</span>
                                            </div>
                                            <span className="text-blue-600 font-medium">
                                                {formatAppointmentDate(apt.date)} • {apt.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            <span className="text-2xl font-bold text-yellow-600">{(incomingRequests?.length || 0) + (appointmentRequests?.length || 0)}</span>
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