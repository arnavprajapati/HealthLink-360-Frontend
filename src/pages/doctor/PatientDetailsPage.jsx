import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPatientHealthData, getLinkedPatients, getPatientNotes, createNote, clearConnectionMessage, generatePatientSummary } from '../../app/reducers/connectionSlice';
import {
    ArrowLeft,
    Activity,
    Calendar,
    FileText,
    TrendingUp,
    AlertCircle,
    Plus,
    X,
    Save,
    Sparkles
} from 'lucide-react';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import HealthLogDetailsModal from './HealthLogDetailsModal';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const PatientDetailsPage = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { linkedPatients, patientLogs, patientNotes, loading, error, successMessage, aiSummary } = useSelector((state) => state.connection);
    const { user } = useSelector((state) => state.auth);
    const [patient, setPatient] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteDescription, setNoteDescription] = useState('');

    useEffect(() => {
        // If linkedPatients is empty (e.g. refresh), fetch them to get patient details
        if (!linkedPatients || linkedPatients.length === 0) {
            dispatch(getLinkedPatients());
        }
        dispatch(getPatientHealthData(patientId));
        dispatch(getPatientNotes(patientId));
    }, [dispatch, patientId, linkedPatients?.length]);

    useEffect(() => {
        if (linkedPatients) {
            const foundPatient = linkedPatients.find(p => p._id === patientId);
            if (foundPatient) {
                setPatient(foundPatient);
            }
        }
    }, [linkedPatients, patientId]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter logs based on category
    const filteredLogs = selectedCategory === 'all'
        ? patientLogs
        : patientLogs.filter(log => log.diseaseType === selectedCategory);

    // Prepare data for charts
    const getChartData = (category) => {
        return patientLogs
            .filter(log => log.diseaseType === category)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(log => ({
                date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: parseFloat(log.value),
                unit: log.unit
            }));
    };

    const categories = ['Diabetes', 'Hypertension', 'Thyroid']; // Add more as needed or derive from logs

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteTitle || !noteDescription) return;

        await dispatch(createNote({
            patientId,
            title: noteTitle,
            description: noteDescription
        }));
        
        setNoteTitle('');
        setNoteDescription('');
        setShowNoteForm(false);
        setTimeout(() => dispatch(clearConnectionMessage()), 3000);
    };

    if (loading && !patient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Patient Not Found</h2>
                    <button
                        onClick={() => navigate('/doctor-dashboard')}
                        className="mt-4 text-[#00a896] hover:underline"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/doctor-dashboard')}
                        className="flex items-center text-gray-600 hover:text-[#00a896] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setShowAppointmentModal(true)}
                            className="px-4 py-2 bg-white border border-[#00a896] text-[#00a896] rounded-lg hover:bg-teal-50 transition-colors flex items-center"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Appointment
                        </button>
                        <button 
                            onClick={() => setShowNoteForm(!showNoteForm)}
                            className="px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors flex items-center"
                        >
                            {showNoteForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            {showNoteForm ? 'Cancel Note' : 'Add Clinical Note'}
                        </button>
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                        {successMessage}
                    </div>
                )}

                {/* Add Note Form */}
                {showNoteForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in-down">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">New Clinical Note</h3>
                        <form onSubmit={handleAddNote} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#00a896] focus:ring-[#00a896]"
                                    placeholder="e.g. Follow-up Consultation"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={noteDescription}
                                    onChange={(e) => setNoteDescription(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#00a896] focus:ring-[#00a896]"
                                    placeholder="Enter clinical observations and recommendations..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Note
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Patient Profile Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {patient.photoURL ? (
                        <img
                            src={patient.photoURL}
                            alt={patient.displayName}
                            className="w-24 h-24 rounded-full border-4 border-teal-50"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-3xl">
                            {patient.displayName?.[0] || 'P'}
                        </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900">{patient.displayName}</h1>
                        <p className="text-gray-500">{patient.email}</p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                            {/* Mock Data for MVP - In real app, this comes from patient profile */}
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                Male, 45
                            </span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                Type 2 Diabetes
                            </span>
                            <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                                Hypertension
                            </span>
                        </div>
                    </div>
                </div>



                {/* AI Summary Section */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm p-6 border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-purple-900 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                            AI Health Summary
                        </h3>
                        <button
                            onClick={() => dispatch(generatePatientSummary(patientId))}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            {loading && !aiSummary ? 'Generating...' : 'Generate New Summary'}
                        </button>
                    </div>
                    
                    {aiSummary ? (
                        <div className="prose prose-purple max-w-none">
                            <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
                            </div>
                            <p className="text-xs text-purple-500 mt-2 italic">
                                * This summary is generated by AI based on recent health logs and notes. Always verify with clinical data.
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-purple-400">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Click "Generate New Summary" to get an AI-powered analysis of the patient's recent health data.</p>
                        </div>
                    )}
                </div>

                {/* Trends Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {categories.map(category => {
                        const data = getChartData(category);
                        if (data.length === 0) return null;

                        return (
                            <div key={category} className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-[#00a896]" />
                                    {category} Trends
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#00a896"
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: '#00a896' }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Health Logs List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-[#00a896]" />
                            Health Logs
                        </h3>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#00a896] focus:border-[#00a896] sm:text-sm rounded-md"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Detected Disease
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Risk Level
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(log.recordDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                                                    {log.diseaseType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {log.detectedDisease || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    log.aiAnalysis?.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                                    log.aiAnalysis?.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    log.aiAnalysis?.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {log.aiAnalysis?.riskLevel?.toUpperCase() || 'NORMAL'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button 
                                                    onClick={() => setSelectedLog(log)}
                                                    className="text-[#00a896] hover:text-[#028090] font-medium"
                                                >
                                                    View Full Report
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                            No health logs found for this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Clinical Notes List */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-[#00a896]" />
                        Clinical Notes History
                    </h3>
                    <div className="space-y-4">
                        {patientNotes && patientNotes.length > 0 ? (
                            patientNotes.map((note) => (
                                <div key={note._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-base font-semibold text-gray-900">{note.title}</h4>
                                        <span className="text-sm text-gray-500">{formatDate(note.date)}</span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{note.description}</p>
                                    <div className="mt-2 text-xs text-gray-500">
                                        By Dr. {user?.displayName || 'You'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No clinical notes added yet.</p>
                        )}
                    </div>
                </div>


                {/* Schedule Appointment Modal */}
                <ScheduleAppointmentModal
                    isOpen={showAppointmentModal}
                    onClose={() => setShowAppointmentModal(false)}
                    patientId={patientId}
                    patientName={patient?.displayName}
                />

                {/* Health Log Details Modal */}
                <HealthLogDetailsModal
                    isOpen={!!selectedLog}
                    onClose={() => setSelectedLog(null)}
                    log={selectedLog}
                />
            </div>
        </div>
    );
};

export default PatientDetailsPage;
