import React, { useEffect } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import {
    Calendar,
    Clock,
    User,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    CalendarDays,
    Stethoscope,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';

const PatientAppointments = () => {
    const {
        appointments,
        getPatientAppointments,
        linkedDoctors,
        getLinkedDoctors,
        loading
    } = useConnection();

    useEffect(() => {
        getPatientAppointments();
        getLinkedDoctors();
    }, []);

    const upcomingAppointments = appointments?.filter(
        a => a.status !== 'completed' && a.status !== 'cancelled'
    ).sort((a, b) => new Date(a.date) - new Date(b.date)) || [];

    const pastAppointments = appointments?.filter(
        a => a.status === 'completed' || a.status === 'cancelled'
    ).sort((a, b) => new Date(b.date) - new Date(a.date)) || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'scheduled':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const AppointmentCard = ({ appointment, isPast = false }) => (
        <div className={`bg-white rounded-xl shadow-sm border ${isPast ? 'border-gray-200 opacity-75' : 'border-teal-100'} p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    {appointment.doctor?.photoURL ? (
                        <img
                            src={appointment.doctor.photoURL}
                            alt={appointment.doctor.displayName}
                            className="w-14 h-14 rounded-full border-2 border-teal-200 object-cover"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center text-white font-bold text-xl">
                            {appointment.doctor?.displayName?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                            Dr. {appointment.doctor?.displayName || 'Doctor'}
                        </h3>
                        <p className="text-lg text-gray-600 flex items-center gap-1">
                            <Stethoscope className="w-4 h-4" />
                            {appointment.doctor?.doctorProfile?.speciality || 'General Physician'}
                        </p>
                        {appointment.doctor?.doctorProfile?.clinicName && (
                            <p className="text-lg text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {appointment.doctor.doctorProfile.clinicName}
                            </p>
                        )}
                    </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-lg font-semibold flex items-center gap-1 border ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-[#00a896]" />
                    </div>
                    <div>
                        <p className="text-lg text-gray-500">Date</p>
                        <p className="text-lg font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-lg text-gray-500">Time</p>
                        <p className="text-lg font-medium text-gray-900">{appointment.time}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-lg text-gray-500">Type</p>
                        <p className="text-lg font-medium text-gray-900">{appointment.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <CalendarDays className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-lg text-gray-500">Booked On</p>
                        <p className="text-lg font-medium text-gray-900">
                            {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {appointment.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg text-gray-600">
                        <span className="font-medium">📝 Notes:</span> {appointment.notes}
                    </p>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00a896] to-[#028090] rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-8 h-8" />
                    <h1 className="text-2xl font-bold">My Appointments</h1>
                </div>
                <p className="text-teal-100">
                    View and manage your scheduled appointments with your healthcare providers
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">Upcoming</p>
                            <p className="text-3xl font-bold text-[#00a896]">{upcomingAppointments.length}</p>
                        </div>
                        <div className="p-3 bg-teal-50 rounded-full">
                            <Calendar className="w-6 h-6 text-[#00a896]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">Completed</p>
                            <p className="text-3xl font-bold text-green-600">
                                {appointments?.filter(a => a.status === 'completed').length || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">My Doctors</p>
                            <p className="text-3xl font-bold text-blue-600">{linkedDoctors?.length || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Appointments (Left) and Doctors (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments - Left Side */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-[#00a896] rounded-full"></div>
                        Upcoming Appointments
                    </h2>
                    {upcomingAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingAppointments.map((appointment) => (
                                <AppointmentCard key={appointment._id} appointment={appointment} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Upcoming Appointments</h3>
                            <p className="text-gray-500">
                                Your doctor will schedule appointments for you. Connect with a doctor to get started.
                            </p>
                        </div>
                    )}
                </div>

                {/* Connected Doctors - Right Side */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                        My Doctors
                    </h2>
                    {linkedDoctors && linkedDoctors.length > 0 ? (
                        <div className="space-y-4">
                            {linkedDoctors.map((doctor) => (
                                <div
                                    key={doctor._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        {doctor.photoURL ? (
                                            <img
                                                src={doctor.photoURL}
                                                alt={doctor.displayName}
                                                className="w-14 h-14 rounded-full border-2 border-blue-200 object-cover"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                                                {doctor.displayName?.charAt(0)?.toUpperCase() || 'D'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                Dr. {doctor.displayName}
                                            </h3>
                                            <p className="text-lg text-gray-600">
                                                {doctor.doctorProfile?.speciality || 'General Physician'}
                                            </p>
                                            {doctor.doctorProfile?.clinicName && (
                                                <p className="text-lg text-gray-500 mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {doctor.doctorProfile.clinicName}
                                                </p>
                                            )}
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100 text-lg text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {doctor.email}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Doctors Connected</h3>
                            <p className="text-sm text-gray-500">
                                Connect with a doctor to get started.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-gray-400 rounded-full"></div>
                        Past Appointments
                    </h2>
                    <div className="space-y-4">
                        {pastAppointments.slice(0, 5).map((appointment) => (
                            <AppointmentCard key={appointment._id} appointment={appointment} isPast />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;
