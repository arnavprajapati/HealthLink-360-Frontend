import React, { useEffect, useState } from 'react';
import { useConnection } from '../../../../context/ConnectionContext';
import {
    Calendar,
    Clock,
    MessageSquare,
    CheckCircle,
    CalendarCheck
} from 'lucide-react';

const AppointmentsSection = ({ patientId, formatDate }) => {
    const { appointments, getDoctorAppointments, loading } = useConnection();
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        getDoctorAppointments();
    }, []);

    const patientAppointments = appointments?.filter(apt => apt.patient?._id === patientId) || [];

    const filteredAppointments = patientAppointments.filter(apt => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'upcoming') {
            const aptDate = new Date(apt.date);
            const [hours, minutes] = apt.time.split(':').map(Number);
            aptDate.setHours(hours, minutes, 0, 0);
            return aptDate >= new Date() && apt.status === 'approved';
        }
        return apt.status === filterStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const getStatusBadge = (status) => {
        const badges = {
            completed: 'bg-green-100 text-green-700 border-green-300',
            approved: 'bg-blue-100 text-blue-700 border-blue-300',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            cancelled: 'bg-red-100 text-red-700 border-red-300',
            rejected: 'bg-gray-100 text-gray-700 border-gray-300'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const formatFullDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getUpcomingCount = () => {
        return patientAppointments.filter(apt => {
            const aptDate = new Date(apt.date);
            const [hours, minutes] = apt.time.split(':').map(Number);
            aptDate.setHours(hours, minutes, 0, 0);
            return aptDate >= new Date() && apt.status === 'approved';
        }).length;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 cursor-pointer py-2 rounded-lg text-lg font-medium transition-colors ${filterStatus === 'all'
                            ? 'bg-[#00a896] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    All ({patientAppointments.length})
                </button>
                <button
                    onClick={() => setFilterStatus('upcoming')}
                    className={`px-4 cursor-pointer py-2 rounded-lg text-lg font-medium transition-colors ${filterStatus === 'upcoming'
                            ? 'bg-[#00a896] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Upcoming ({getUpcomingCount()})
                </button>
                <button
                    onClick={() => setFilterStatus('completed')}
                    className={`px-4 cursor-pointer py-2 rounded-lg text-lg font-medium transition-colors ${filterStatus === 'completed'
                            ? 'bg-[#00a896] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Completed ({patientAppointments.filter(apt => apt.status === 'completed').length})
                </button>
                <button
                    onClick={() => setFilterStatus('cancelled')}
                    className={`px-4 cursor-pointer py-2 rounded-lg text-lg font-medium transition-colors ${filterStatus === 'cancelled'
                            ? 'bg-[#00a896] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Cancelled ({patientAppointments.filter(apt => apt.status === 'cancelled' || apt.status === 'rejected').length})
                </button>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {filterStatus === 'all' ? 'No Appointments' : `No ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Appointments`}
                    </h3>
                    <p className="text-gray-500">
                        {filterStatus === 'all'
                            ? 'Schedule appointments with this patient using the button above.'
                            : `This patient has no ${filterStatus} appointments.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                        <div
                            key={appointment._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-shrink-0">
                                    <div className="bg-gradient-to-br from-[#00a896] to-[#028090] text-white rounded-lg p-4 text-center min-w-[100px]">
                                        <div className="text-2xl font-bold">
                                            {new Date(appointment.date).getDate()}
                                        </div>
                                        <div className="text-lg">
                                            {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </div>
                                        <div className="text-lg opacity-90 mt-1">
                                            {new Date(appointment.date).getFullYear()}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-center gap-1 text-lg text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        {appointment.time}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {appointment.type}
                                            </h3>
                                            <p className="text-lg text-gray-500">
                                                {formatFullDate(appointment.date)}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 cursor-pointer rounded-full text-lg font-medium border ${getStatusBadge(appointment.status)}`}>
                                            {appointment.status === 'completed' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>
                                    </div>

                                    {appointment.requestMessage && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-3 border-[#00a896]">
                                            <p className="text-lg text-gray-700 italic">
                                                <MessageSquare className="w-4 h-4 inline mr-1 text-gray-400" />
                                                "{appointment.requestMessage}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-3 flex flex-wrap gap-3 text-lg text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Scheduled: {formatDate(appointment.createdAt)}
                                        </span>
                                        {appointment.status === 'completed' && appointment.updatedAt && (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="w-3 h-3" />
                                                Completed: {formatDate(appointment.updatedAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentsSection;