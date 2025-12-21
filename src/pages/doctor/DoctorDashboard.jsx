import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../context/ConnectionContext';
import { CheckCircle, AlertCircle, UserPlus, Users, Calendar, Clock, CalendarDays, X, ChevronRight, Check } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('upcoming');

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
        return aptDate.getTime() === today.getTime() &&
            apt.status !== 'cancelled' &&
            apt.status !== 'rejected';
    }) || [];

    // Categorize appointments for the modal
    const categorizeAppointments = () => {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const upcoming = [];
        const todayApts = [];
        const past = [];

        appointments?.forEach(apt => {
            if (apt.status === 'cancelled' || apt.status === 'rejected') return;

            const aptDate = new Date(apt.date);
            const [hours, minutes] = apt.time.split(':').map(Number);
            aptDate.setHours(hours, minutes, 0, 0);

            if (aptDate >= todayStart && aptDate <= todayEnd) {
                todayApts.push(apt);
            } else if (aptDate > todayEnd) {
                upcoming.push(apt);
            } else {
                past.push(apt);
            }
        });

        // Sort by date and time
        const sortByDateTime = (a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const [hoursA, minutesA] = a.time.split(':').map(Number);
            const [hoursB, minutesB] = b.time.split(':').map(Number);
            dateA.setHours(hoursA, minutesA);
            dateB.setHours(hoursB, minutesB);
            return dateA - dateB;
        };

        return {
            upcoming: upcoming.sort(sortByDateTime),
            today: todayApts.sort(sortByDateTime),
            past: past.sort((a, b) => sortByDateTime(b, a)) // Reverse for past
        };
    };

    const { upcoming, today: todayInModal, past } = categorizeAppointments();

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

    const formatFullDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
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

    const renderAppointmentCard = (appointment, showCompleteButton = false) => {
        const timePassed = isAppointmentTimePassed(appointment);
        const canComplete = showCompleteButton && timePassed && appointment.status !== 'completed';

        return (
            <div key={appointment._id} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-[#00a896] transition-all">
                <div className="flex items-start gap-3">
                    {appointment.patient?.photoURL ? (
                        <img
                            src={appointment.patient.photoURL}
                            alt={appointment.patient.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center text-white font-semibold text-lg">
                            {appointment.patient?.displayName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                                <h4 className="font-semibold text-gray-900 text-lg">
                                    {appointment.patient?.displayName || 'Patient'}
                                </h4>
                                <p className="text-lg text-gray-600">{appointment.type}</p>
                            </div>

                            {appointment.status === 'completed' ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-lg font-medium rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Completed
                                </span>
                            ) : canComplete ? (
                                <button
                                    onClick={() => handleMarkComplete(appointment._id)}
                                    className="px-3 py-1.5 bg-green-500 text-white text-lg font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Complete
                                </button>
                            ) : (
                                <span className={`px-3 py-1 text-lg font-medium rounded-full ${appointment.status === 'approved'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-lg text-gray-600 mb-2">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-[#00a896]" />
                                <span>{formatFullDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[#00a896]" />
                                <span>{appointment.time}</span>
                            </div>
                        </div>

                        {appointment.requestMessage && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-3 border-[#00a896]">
                                <p className="text-lg text-gray-700 italic">"{appointment.requestMessage}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-[#00a896] to-[#028090] bg-white rounded-2xl p-8 mb-6 shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, Dr. {user?.displayName || user?.email?.split('@')[0] || 'Doctor'}!
                    </h1>
                    <p className="text-white text-lg">Here's what's happening with your patients today</p>
                </div>

                {appointmentRequests && appointmentRequests.length > 0 && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-200">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-bold text-gray-900">
                                Pending Appointment Requests ({appointmentRequests.length})
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {appointmentRequests.slice(0, 3).map((request) => (
                                <div key={request._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-start gap-3">
                                        {request.patient?.photoURL ? (
                                            <img
                                                src={request.patient.photoURL}
                                                alt={request.patient.displayName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center text-white font-semibold text-lg">
                                                {request.patient?.displayName?.charAt(0)?.toUpperCase() || 'P'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                                {request.patient?.displayName}
                                            </h3>
                                            <p className="text-lg text-gray-600 mb-3">
                                                {formatAppointmentDate(request.date)} at {request.time} • {request.type}
                                            </p>
                                            {request.requestMessage && (
                                                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-lg text-gray-700 italic">"{request.requestMessage}"</p>
                                                </div>
                                            )}
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-6 h-6 text-[#00a896]" />
                                <h2 className="text-2xl font-bold text-gray-900">Today's Appointments</h2>
                            </div>
                            <button
                                onClick={() => setShowAllAppointments(true)}
                                className="text-lg text-[#00a896] hover:text-[#028090] font-medium flex items-center gap-1 cursor-pointer"
                            >
                                View All
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {todayAppointments && todayAppointments.length > 0 ? (
                                todayAppointments.slice(0, 4).map((appointment) => {
                                    const timePassed = isAppointmentTimePassed(appointment);
                                    const canComplete = timePassed && appointment.status !== 'completed';

                                    return (
                                        <div key={appointment._id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {appointment.patient?.photoURL ? (
                                                    <img
                                                        src={appointment.patient.photoURL}
                                                        alt={appointment.patient.displayName}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center text-white font-semibold">
                                                        {appointment.patient?.displayName?.charAt(0)?.toUpperCase() || 'P'}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {appointment.patient?.displayName || 'Patient'}
                                                    </h3>
                                                    <p className="text-lg text-gray-600">{appointment.type}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 text-lg font-medium text-gray-700">
                                                        <Clock className="w-4 h-4" />
                                                        {appointment.time}
                                                    </div>
                                                    {appointment.status === 'completed' ? (
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-lg font-medium rounded-full flex items-center gap-1">
                                                            <Check className="w-3 h-3" />
                                                            Completed
                                                        </span>
                                                    ) : canComplete ? (
                                                        <button
                                                            onClick={() => handleMarkComplete(appointment._id)}
                                                            className="px-3 py-1.5 bg-green-500 text-white text-lg font-medium rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-1"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            Complete
                                                        </button>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-lg font-medium rounded-full">
                                                            Scheduled
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Today</h3>
                                    <p className="text-gray-600 text-lg">Schedule appointments with patients</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Overview</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span className="text-lg font-medium text-gray-700">Total Patients</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-600">{linkedPatients?.length || 0}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        <span className="text-lg font-medium text-gray-700">Pending Requests</span>
                                    </div>
                                    <span className="text-xl font-bold text-yellow-600">
                                        {(incomingRequests?.length || 0) + (appointmentRequests?.length || 0)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                        <span className="text-lg font-medium text-gray-700">Total Appointments</span>
                                    </div>
                                    <span className="text-xl font-bold text-purple-600">
                                        {appointments?.filter(a => a.status !== 'cancelled' && a.status !== 'rejected')?.length || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-lg font-medium text-gray-700">Completed</span>
                                    </div>
                                    <span className="text-xl font-bold text-green-600">
                                        {appointments?.filter(a => a.status === 'completed')?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showAllAppointments && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="bg-gradient-to-r from-[#00a896] to-[#028090] text-white p-6 rounded-t-2xl flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">All Appointments</h2>
                                    <p className="text-white/90 text-lg mt-1">
                                        Manage and track all your appointments
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAllAppointments(false)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex border-b border-gray-200 px-6 bg-gray-50">
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`px-6 cursor-pointer py-3 font-medium text-lg transition-colors relative ${activeTab === 'upcoming'
                                            ? 'text-[#00a896] border-b-2 border-[#00a896]'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Upcoming ({upcoming.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('today')}
                                    className={`px-6 cursor-pointer py-3 font-medium text-lg transition-colors relative ${activeTab === 'today'
                                            ? 'text-[#00a896] border-b-2 border-[#00a896]'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Today ({todayInModal.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('past')}
                                    className={`px-6 cursor-pointer py-3 font-medium text-lg transition-colors relative ${activeTab === 'past'
                                            ? 'text-[#00a896] border-b-2 border-[#00a896]'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Past ({past.length})
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTab === 'upcoming' && (
                                    <div className="space-y-3">
                                        {upcoming.length > 0 ? (
                                            upcoming.map(apt => renderAppointmentCard(apt, false))
                                        ) : (
                                            <div className="text-center py-12">
                                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
                                                <p className="text-gray-600">All your future appointments will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'today' && (
                                    <div className="space-y-3">
                                        {todayInModal.length > 0 ? (
                                            todayInModal.map(apt => renderAppointmentCard(apt, true))
                                        ) : (
                                            <div className="text-center py-12">
                                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Today</h3>
                                                <p className="text-gray-600">You don't have any appointments scheduled for today</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'past' && (
                                    <div className="space-y-3">
                                        {past.length > 0 ? (
                                            past.map(apt => renderAppointmentCard(apt, true))
                                        ) : (
                                            <div className="text-center py-12">
                                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Appointments</h3>
                                                <p className="text-gray-600">Your completed appointments will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;