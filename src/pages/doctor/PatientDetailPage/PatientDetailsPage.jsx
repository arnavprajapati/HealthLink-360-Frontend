import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useConnection } from '../../../context/ConnectionContext';
import {
    ArrowLeft,
    Activity,
    Calendar,
    Plus,
    X,
    Save,
    Sparkles,
    ClipboardList,
    Target,
    CalendarCheck
} from 'lucide-react';

import ScheduleAppointmentModal from '../../doctor/ScheduleAppointmentModal';
import GoalDetailModal from '../../patient/GoalDetailModal';
import HealthCard from '../../patient/HealthCard';
import FullReportModal from '../../patient/FullReportModal';
import DetailModal from '../../patient/DetailModal';

import AppointmentsSection from './components/AppointmentsSection';
import NotesSection from './components/NotesSection';
import GoalCard from './components/GoalCard';
import PatientProfileCard from './components/PatientProfileCard';
import AddNoteForm from './components/AddNoteForm'; 

const PatientDetailsPage = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const {
        linkedPatients,
        patientLogs,
        patientNotes,
        patientGoals,
        loading,
        successMessage,
        aiSummary,
        getPatientHealthData,
        getLinkedPatients,
        getPatientNotes,
        getPatientGoals,
        analyzePatientGoal,
        createNote,
        clearConnectionMessage,
        generatePatientSummary
    } = useConnection();

    const { user } = useSelector((state) => state.auth);
    const [patient, setPatient] = useState(null);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedFullReport, setSelectedFullReport] = useState(null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteDescription, setNoteDescription] = useState('');
    const [activeTab, setActiveTab] = useState('records');
    const [selectedGoal, setSelectedGoal] = useState(null);

    const handleAnalyzeGoal = async (goalId) => {
        try {
            const analysis = await analyzePatientGoal(patientId, goalId);
            return analysis;
        } catch (error) {
            console.error('Failed to analyze goal:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!linkedPatients || linkedPatients.length === 0) {
            getLinkedPatients();
        }
        getPatientHealthData(patientId);
        getPatientNotes(patientId);
        getPatientGoals(patientId);
    }, [patientId, linkedPatients?.length]);

    useEffect(() => {
        if (linkedPatients) {
            const foundPatient = linkedPatients.find(p => p._id === patientId);
            if (foundPatient) {
                setPatient(foundPatient);
            }
        }
    }, [linkedPatients, patientId]);

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteTitle || !noteDescription) return;

        await createNote({
            patientId,
            title: noteTitle,
            description: noteDescription
        });

        setNoteTitle('');
        setNoteDescription('');
        setShowNoteForm(false);
        getPatientNotes(patientId);
        setTimeout(() => clearConnectionMessage(), 3000);
    };

    const filteredLogs = patientLogs?.filter(log => log.fileType !== 'manual') || [];

    if (loading && !patient) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-[#00a896]/20"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-[#00a896] animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Patient Not Found</h2>
                    <button
                        onClick={() => navigate('/doctor-patients')}
                        className="mt-4 cursor-pointer text-[#00a896] hover:underline"
                    >
                        Return to My Patients
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/doctor-patients')}
                    className="flex items cursor-pointer text-gray-600 hover:text-[#00a896] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to My Patients
                </button>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowAppointmentModal(true)}
                        className="px-4 cursor-pointer py-2 bg-white border border-[#00a896] text-[#00a896] rounded-lg hover:bg-teal-50 transition-colors flex items-center text-lg"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Appointment
                    </button>
                    <button
                        onClick={() => setShowNoteForm(!showNoteForm)}
                        className="px-4 cursor-pointer py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors flex items-center text-lg"
                    >
                        {showNoteForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {showNoteForm ? 'Cancel' : 'Add Note'}
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            <PatientProfileCard
                patient={patient}
                filteredLogs={filteredLogs}
                patientNotes={patientNotes}
                patientGoals={patientGoals}
                aiSummary={aiSummary}
                loading={loading}
                onGenerateSummary={() => generatePatientSummary(patientId)}
            />

            {showNoteForm && (
                <AddNoteForm
                    noteTitle={noteTitle}
                    noteDescription={noteDescription}
                    onTitleChange={setNoteTitle}
                    onDescriptionChange={setNoteDescription}
                    onSubmit={handleAddNote}
                />
            )}

            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('records')}
                    className={`px-4 cursor-pointer py-3 font-medium text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'records'
                        ? 'border-[#00a896] text-[#00a896]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Activity className="w-4 h-4" />
                    Health Records ({filteredLogs.length})
                </button>
                <button
                    onClick={() => setActiveTab('progress')}
                    className={`px-4 cursor-pointer py-3 font-medium text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'progress'
                        ? 'border-[#00a896] text-[#00a896]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Target className="w-4 h-4" />
                    Track Progress ({patientGoals?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 cursor-pointer py-3 font-medium text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'notes'
                        ? 'border-[#00a896] text-[#00a896]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <ClipboardList className="w-4 h-4" />
                    Clinical Notes ({patientNotes?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`px-4 cursor-pointer py-3 font-medium text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'appointments'
                        ? 'border-[#00a896] text-[#00a896]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <CalendarCheck className="w-4 h-4" />
                    Appointments
                </button>
            </div>

            {activeTab === 'records' ? (
                <div>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Health Records</h3>
                            <p className="text-gray-500">This patient hasn't uploaded any health records yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredLogs.map((log) => (
                                <HealthCard
                                    key={log._id}
                                    log={log}
                                    onViewDetails={setSelectedLog}
                                    onViewFullReport={setSelectedFullReport}
                                    formatDate={formatDate}
                                    readOnly={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : activeTab === 'progress' ? (
                <div>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
                        </div>
                    ) : patientGoals && patientGoals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {patientGoals.map((goal) => (
                                <GoalCard
                                    key={goal._id}
                                    goal={goal}
                                    onView={setSelectedGoal}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Health Goals</h3>
                            <p className="text-gray-500">This patient hasn't set any health goals yet.</p>
                        </div>
                    )}
                </div>
            ) : activeTab === 'appointments' ? (
                <AppointmentsSection
                    patientId={patientId}
                    formatDate={formatDate}
                />
            ) : (
                <NotesSection
                    patientNotes={patientNotes}
                    user={user}
                    formatDate={formatDate}
                    patientId={patientId}
                    getPatientNotes={getPatientNotes}
                />
            )}

            <ScheduleAppointmentModal
                isOpen={showAppointmentModal}
                onClose={() => setShowAppointmentModal(false)}
                patientId={patientId}
                patientName={patient?.displayName}
            />

            {selectedLog && (
                <DetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}

            {selectedFullReport && (
                <FullReportModal
                    log={selectedFullReport}
                    onClose={() => setSelectedFullReport(null)}
                />
            )}

            {selectedGoal && (
                <GoalDetailModal
                    goal={selectedGoal}
                    onClose={() => setSelectedGoal(null)}
                    onAnalyze={handleAnalyzeGoal}
                    readOnly={true}
                />
            )}
        </div>
    );
};

export default PatientDetailsPage;