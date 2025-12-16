import React, { useEffect, useState } from 'react';
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
    CalendarDays,
    X,
    ChevronRight,
    Check
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
        respondToAppointmentRequest,
        updateAppointmentStatus
    } = useConnection();
    const navigate = useNavigate();
    const [showAllAppointments, setShowAllAppointments] = useState(false);

    useEffect(() => {
        getIncomingRequests();
        getLinkedPatients();
        getDoctorAppointments();
        getAppointmentRequests();
    }, []);

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

    // Check if appointment time has passed
    const isAppointmentTimePassed = (appointment) => {
        const now = new Date();
        const aptDate = new Date(appointment.date);
        const [hours, minutes] = appointment.time.split(':').map(Number);
        aptDate.setHours(hours, minutes, 0, 0);
        return now > aptDate;
    };

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

    const handleMarkComplete = async (appointmentId) => {
        try {
            await updateAppointmentStatus({ appointmentId, status: 'completed' });
            getDoctorAppointments();
        } catch (error) {
            console.error('Failed to mark complete:', error);
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
                        <button
                            onClick={() => setShowAllAppointments(true)}
                            className="text-lg text-[#00a896] hover:text-[#028090] font-medium flex items-center gap-1 cursor-pointer"
                        >
                            View All
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {todayAppointments && todayAppointments.length > 0 ? (
                            todayAppointments.slice(0, 4).map((appointment) => {
                                const timePassed = isAppointmentTimePassed(appointment);
                                const canComplete = timePassed && appointment.status !== 'completed';

                                return (
                                    <div
                                        key={appointment._id}
                                        className={`flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 transition-colors border ${appointment.status === 'completed'
                                            ? 'bg-green-50 border-green-200'
                                            : timePassed
                                                ? 'bg-yellow-50 border-yellow-200'
                                                : 'bg-gray-50 border-gray-100'
                                            }`}
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
                                            {appointment.status === 'completed' ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    Completed
                                                </span>
                                            ) : canComplete ? (
                                                <button
                                                    onClick={() => handleMarkComplete(appointment._id)}
                                                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Complete
                                                </button>
                                            ) : (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })
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
                            <span className="text-2xl font-bold text-yellow-600">{(incomingRequests?.length || 0) + (appointmentRequests?.length || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="font-medium text-lg text-gray-700">Total Appointments</span>
                            </div>
                            <span className="text-2xl font-bold text-green-600">{appointments?.filter(a => a.status !== 'cancelled' && a.status !== 'rejected')?.length || 0}</span>
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

            {/* All Appointments Modal */}
            {showAllAppointments && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#00a896] to-[#028090] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <CalendarDays className="w-6 h-6" />
                                All Appointments
                            </h2>
                            <button
                                onClick={() => setShowAllAppointments(false)}
                                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                            {appointments && appointments.length > 0 ? (
                                <div className="space-y-3">
                                    {appointments
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((appointment) => {
                                            const aptDate = new Date(appointment.date);
                                            const isToday = aptDate.toDateString() === new Date().toDateString();
                                            const isPast = aptDate < new Date() && !isToday;
                                            const timePassed = isAppointmentTimePassed(appointment);
                                            const canComplete = (isToday && timePassed || isPast) &&
                                                appointment.status !== 'completed' &&
                                                appointment.status !== 'cancelled' &&
                                                appointment.status !== 'rejected';

                                            return (
                                                <div
                                                    key={appointment._id}
                                                    className={`p-4 rounded-xl border ${appointment.status === 'cancelled' || appointment.status === 'rejected'
                                                        ? 'bg-red-50 border-red-200'
                                                        : appointment.status === 'completed'
                                                            ? 'bg-green-50 border-green-200'
                                                            : isToday
                                                                ? 'bg-teal-50 border-teal-200'
                                                                : isPast
                                                                    ? 'bg-gray-50 border-gray-200'
                                                                    : 'bg-blue-50 border-blue-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {appointment.patient?.photoURL ? (
                                                                <img
                                                                    src={appointment.patient.photoURL}
                                                                    alt={appointment.patient.displayName}
                                                                    className="w-12 h-12 rounded-full border-2 border-white object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center text-white font-bold text-lg">
                                                                    {appointment.patient?.displayName?.charAt(0)?.toUpperCase() || 'P'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">
                                                                    {appointment.patient?.displayName || 'Patient'}
                                                                </h3>
                                                                <p className="text-lg text-gray-600">{appointment.type}</p>
                                                                <p className="text-lg text-gray-500">
                                                                    {formatAppointmentDate(appointment.date)} • {appointment.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/* Status Badge */}
                                                            <span className={`px-3 py-1 rounded-full text-base font-medium ${appointment.status === 'cancelled' || appointment.status === 'rejected'
                                                                ? 'bg-red-100 text-red-700'
                                                                : appointment.status === 'completed'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : appointment.status === 'confirmed' || appointment.status === 'scheduled' || appointment.status === 'approved'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                                                            </span>

                                                            {/* Mark Complete Button - for past/time passed appointments */}
                                                            {canComplete && (
                                                                <button
                                                                    onClick={() => handleMarkComplete(appointment._id)}
                                                                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-1"
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                    Complete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {appointment.requestMessage && (
                                                        <p className="mt-2 text-lg text-gray-500 italic pl-15">
                                                            "{appointment.requestMessage}"
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Appointments</h3>
                                    <p className="text-gray-500">You don't have any appointments yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;