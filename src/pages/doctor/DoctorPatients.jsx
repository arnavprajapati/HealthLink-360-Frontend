import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../context/ConnectionContext';
import {
    Users,
    UserPlus,
    Calendar,
    CheckCircle,
    XCircle,
    Mail,
    Eye,
    ChevronRight,
    CalendarPlus,
    Search,
    Clock
} from 'lucide-react';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';

const DoctorPatients = () => {
    const navigate = useNavigate();
    const {
        incomingRequests,
        linkedPatients,
        loading,
        getIncomingRequests,
        getLinkedPatients,
        respondToRequest
    } = useConnection();

    const [searchTerm, setSearchTerm] = useState('');
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        getIncomingRequests();
        getLinkedPatients();
    }, []);

    const handleRespond = async (requestId, status) => {
        await respondToRequest({ requestId, status });
        getIncomingRequests();
        if (status === 'accepted') {
            getLinkedPatients();
        }
    };

    const handleOpenAppointmentModal = (patient, e) => {
        e.stopPropagation();
        setSelectedPatient(patient);
        setIsAppointmentModalOpen(true);
    };

    const handleCloseAppointmentModal = () => {
        setIsAppointmentModalOpen(false);
        setSelectedPatient(null);
    };

    const filteredPatients = linkedPatients?.filter(patient =>
        patient.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
                    <Users className="w-8 h-8" />
                    <h1 className="text-2xl font-bold">My Patients</h1>
                </div>
                <p className="text-teal-100">
                    Manage your connected patients and pending requests
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">Total Patients</p>
                            <p className="text-3xl font-bold text-blue-600">{linkedPatients?.length || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">Pending Requests</p>
                            <p className="text-3xl font-bold text-yellow-600">{incomingRequests?.length || 0}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-full">
                            <UserPlus className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">This Month</p>
                            <p className="text-3xl font-bold text-green-600">
                                {linkedPatients?.filter(p => {
                                    const linkedDate = new Date(p.linkedSince);
                                    const now = new Date();
                                    return linkedDate.getMonth() === now.getMonth() && linkedDate.getFullYear() === now.getFullYear();
                                }).length || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Connection Requests */}
            {incomingRequests && incomingRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                            Pending Requests
                        </h2>
                        <span className="bg-yellow-100 text-yellow-800 text-lg font-medium px-3 py-1 rounded-full">
                            {incomingRequests.length} Pending
                        </span>
                    </div>
                    <div className="space-y-3">
                        {incomingRequests.map((request) => (
                            <div
                                key={request._id}
                                className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100"
                            >
                                <div className="flex items-center gap-4">
                                    {request.patient?.photoURL ? (
                                        <img
                                            src={request.patient.photoURL}
                                            alt={request.patient.displayName}
                                            className="w-12 h-12 rounded-full border-2 border-yellow-200 object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                                            {request.patient?.displayName?.charAt(0)?.toUpperCase() || 'P'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {request.patient?.displayName || 'Patient'}
                                        </p>
                                        <p className="text-lg text-gray-600 flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {request.patient?.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRespond(request._id, 'accepted')}
                                        disabled={loading}
                                        className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRespond(request._id, 'rejected')}
                                        disabled={loading}
                                        className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search patients by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Connected Patients */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                    Connected Patients
                    <span className="ml-auto bg-blue-100 text-blue-800 text-lg font-medium px-3 py-1 rounded-full">
                        {filteredPatients.length} Patients
                    </span>
                </h2>

                {filteredPatients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {patient.photoURL ? (
                                            <img
                                                src={patient.photoURL}
                                                alt={patient.displayName}
                                                className="w-14 h-14 rounded-full border-2 border-blue-200 object-cover"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                                                {patient.displayName?.charAt(0)?.toUpperCase() || 'P'}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {patient.displayName || 'Patient'}
                                            </h3>
                                            <p className="text-lg text-gray-500">{patient.email}</p>
                                        </div>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={(e) => handleOpenAppointmentModal(patient, e)}
                                        className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-green-50  text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <CalendarPlus className="w-4 h-4" />
                                        <span className="text-lg font-medium">Schedule</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/doctor/patient/${patient._id}`);
                                        }}
                                        className="flex-1 cursor-pointer  flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="text-lg font-medium">View</span>
                                    </button>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-lg text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Connected {patient.linkedSince ? new Date(patient.linkedSince).toLocaleDateString() : ''}
                                    </span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {searchTerm ? 'No patients found' : 'No Patients Connected'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? 'Try a different search term'
                                : 'Patients will appear here once they connect with you.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Schedule Appointment Modal */}
            <ScheduleAppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={handleCloseAppointmentModal}
                patientId={selectedPatient?._id}
                patientName={selectedPatient?.displayName || selectedPatient?.email?.split('@')[0] || 'Patient'}
            />
        </div>
    );
};

export default DoctorPatients;
