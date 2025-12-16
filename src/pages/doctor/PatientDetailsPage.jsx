import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useConnection } from '../../context/ConnectionContext';
import {
    ArrowLeft,
    Activity,
    Calendar,
    FileText,
    Plus,
    X,
    Save,
    Sparkles,
    ClipboardList,
    Target,
    TrendingUp,
    TrendingDown,
    Trophy,
    Clock,
    Eye,
    ChevronRight,
    BarChart3,
    Send,
    ChevronDown,
    ChevronUp,
    MessageSquare
} from 'lucide-react';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import GoalDetailModal from '../patient/GoalDetailModal';

import HealthCard from '../patient/HealthCard';
import FullReportModal from '../patient/FullReportModal';
import DetailModal from '../patient/DetailModal';

// Notes Section Component with reply functionality
const NotesSection = ({ patientNotes, user, formatDate, patientId, getPatientNotes }) => {
    const { replyToNote, markNoteAsRead } = useConnection();
    const [expandedNote, setExpandedNote] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const handleExpandNote = async (note) => {
        if (expandedNote === note._id) {
            setExpandedNote(null);
        } else {
            setExpandedNote(note._id);
            if (!note.isRead && note.senderRole === 'patient') {
                await markNoteAsRead(note._id);
            }
        }
    };

    const handleReply = async (noteId) => {
        if (!replyText.trim()) return;

        setSendingReply(true);
        try {
            await replyToNote(noteId, replyText);
            setReplyText('');
            getPatientNotes(patientId);
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setSendingReply(false);
        }
    };

    if (!patientNotes || patientNotes.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Clinical Notes</h3>
                <p className="text-gray-500">Click "Add Note" to create your first clinical note for this patient.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {patientNotes.map((note) => (
                <div key={note._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                    {/* Note Header */}
                    <div
                        onClick={() => handleExpandNote(note)}
                        className="p-5 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-gray-900">{note.title}</h4>
                                {!note.isRead && note.senderRole === 'patient' && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                        New Reply
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {formatDate(note.date)}
                                </span>
                                {note.replies?.length > 0 && (
                                    <span className="px-2 py-1 bg-teal-50 text-teal-600 text-xs rounded-full">
                                        {note.replies.length} replies
                                    </span>
                                )}
                                {expandedNote === note._id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap text-lg line-clamp-2">{note.description}</p>
                        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2">
                            {note.senderRole === 'doctor' ? (
                                <>
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">Doctor</span>
                                    <span>By Dr. {note.sender?.displayName || user?.displayName || 'You'}</span>
                                </>
                            ) : (
                                <>
                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">Patient</span>
                                    <span>By {note.sender?.displayName || 'Patient'}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedNote === note._id && (
                        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4 bg-gray-50">
                            {/* Full Description */}
                            <div className="p-4 bg-white rounded-lg">
                                <p className="text-gray-700 whitespace-pre-wrap">{note.description}</p>
                            </div>

                            {/* Replies */}
                            {note.replies && note.replies.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Conversation
                                    </h5>
                                    {note.replies.map((reply) => (
                                        <div
                                            key={reply._id}
                                            className={`p-3 rounded-lg ${reply.senderRole === 'doctor'
                                                ? 'bg-blue-50 mr-8'
                                                : 'bg-green-50 ml-8'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {reply.senderRole === 'doctor' ? `Dr. ${reply.sender?.displayName || 'You'}` : reply.sender?.displayName || 'Patient'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(reply.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{reply.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleReply(note._id)}
                                />
                                <button
                                    onClick={() => handleReply(note._id)}
                                    disabled={!replyText.trim() || sendingReply}
                                    className="px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {sendingReply ? 'Sending...' : 'Reply'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Goal Card Component for Doctor (Read-only - no edit/delete)
const GoalCard = ({ goal, onView }) => {
    const getProgressColor = (progress) => {
        if (progress >= 75) return 'from-green-500 to-green-600';
        if (progress >= 50) return 'from-[#00a896] to-[#02c39a]';
        if (progress >= 25) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-red-600';
    };

    const getProgressBg = (progress) => {
        if (progress >= 75) return 'bg-green-50';
        if (progress >= 50) return 'bg-[#f0f3bd]';
        if (progress >= 25) return 'bg-yellow-50';
        return 'bg-red-50';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'achieved': return 'bg-green-100 text-green-800 border-green-300';
            case 'in-progress': return 'bg-[#f0f3bd] text-[#028090] border-[#02c39a]';
            case 'expired': return 'bg-gray-100 text-gray-800 border-gray-300';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
    };

    const getGoalIcon = (param) => {
        const icons = {
            'Blood Sugar': '🩸',
            'Blood Pressure Systolic': '❤️',
            'Blood Pressure Diastolic': '💓',
            'Hemoglobin': '🔴',
            'Cholesterol': '🫀',
            'Weight': '⚖️',
            'BMI': '📊',
            'Creatinine': '🧪',
            'TSH': '🦋'
        };
        return icons[param] || '🎯';
    };

    const daysRemaining = goal.deadline
        ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
    const hasDeadline = goal.deadline !== null && goal.deadline !== undefined;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
            {/* Card Header with Progress Bar */}
            <div className={`h-1.5 bg-gradient-to-r ${getProgressColor(goal.progress)}`}
                style={{ width: `${Math.min(goal.progress, 100)}%` }} />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl ${getProgressBg(goal.progress)} flex items-center justify-center text-3xl flex-shrink-0`}>
                            {getGoalIcon(goal.parameter)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">{goal.parameter}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-lg font-medium border ${getStatusColor(goal.status)}`}>
                                {goal.status === 'achieved' && <Trophy className="w-3 h-3 mr-1" />}
                                {goal.status.replace('-', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>
                    {/* Only View button for doctor */}
                    <button
                        onClick={() => onView(goal)}
                        className="p-2 cursor-pointer text-[#00a896] hover:bg-[#f0f3bd] rounded-full transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Circle & Values */}
                <div className="flex items-center gap-5 border-t border-b border-gray-100 py-4 mb-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                stroke="#e5e7eb"
                                strokeWidth="6"
                                fill="none"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                stroke="url(#progressGradientDoctor)"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(goal.progress / 100) * 226} 226`}
                            />
                            <defs>
                                <linearGradient id="progressGradientDoctor" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#00a896" />
                                    <stop offset="100%" stopColor="#02c39a" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-900">{Math.round(goal.progress)}%</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        {goal.initialValue !== undefined && goal.initialValue !== null && (
                            <div className="flex justify-between items-center">
                                <span className="text-lg text-gray-500">Initial Value</span>
                                <span className="text-lg font-medium text-gray-600">
                                    {goal.initialValue} {goal.unit}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-lg text-gray-500">Current Value</span>
                            <span className="text-lg font-bold text-[#028090]">
                                {goal.currentValue !== null && goal.currentValue !== undefined ? `${goal.currentValue} ${goal.unit}` : '—'}
                            </span>
                        </div>
                        {goal.goalType === 'range' || (goal.minValue !== null || goal.maxValue !== null) ? (
                            <div className="flex justify-between items-center">
                                <span className="text-lg text-gray-500">Target Range</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {goal.minValue !== null && goal.maxValue !== null
                                        ? `${goal.minValue} - ${goal.maxValue} ${goal.unit}`
                                        : goal.minValue !== null
                                            ? `≥ ${goal.minValue} ${goal.unit}`
                                            : `≤ ${goal.maxValue} ${goal.unit}`
                                    }
                                </span>
                            </div>
                        ) : goal.targetValue !== null && goal.targetValue !== undefined ? (
                            <div className="flex justify-between items-center">
                                <span className="text-lg text-gray-500">Target Value</span>
                                <span className="text-lg font-bold text-gray-900">{goal.targetValue} {goal.unit}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-lg text-gray-500">Goal Type</span>
                            <span className="text-lg font-medium text-gray-700 capitalize flex items-center gap-1">
                                {goal.goalType === 'decrease' && <TrendingDown className="w-3 h-3 text-red-500" />}
                                {goal.goalType === 'increase' && <TrendingUp className="w-3 h-3 text-green-500" />}
                                {goal.goalType === 'maintain' && <Activity className="w-3 h-3 text-blue-500" />}
                                {goal.goalType === 'range' && <BarChart3 className="w-3 h-3 text-purple-500" />}
                                {goal.goalType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                {hasDeadline ? (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between text-lg text-gray-600 mb-2">
                            <span>Start: {new Date(goal.startDate || goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className={daysRemaining > 0 ? 'text-[#028090] font-medium' : 'text-red-500 font-medium'}>
                                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                            </span>
                            <span>Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00a896] to-[#02c39a] rounded-full"
                                style={{
                                    width: `${Math.min(100, Math.max(0,
                                        ((Date.now() - new Date(goal.startDate || goal.createdAt)) /
                                            (new Date(goal.deadline) - new Date(goal.startDate || goal.createdAt))) * 100
                                    ))}%`
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between text-lg text-gray-600">
                            <span>Started: {new Date(goal.startDate || goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className="text-[#028090] font-medium">No deadline</span>
                        </div>
                    </div>
                )}

                {/* View Details Button */}
                <button
                    onClick={() => onView(goal)}
                    className="w-full cursor-pointer py-2.5 text-lg font-semibold bg-gray-100 text-[#028090] hover:bg-[#f0f3bd]/80 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                    <Eye className="w-4 h-4" />
                    View Details & Analysis ({goal.milestones ? goal.milestones.length : 0} Entries)
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

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
    const [activeTab, setActiveTab] = useState('records'); // 'records', 'notes', or 'progress'
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Handler for analyzing patient goal
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

    // Filter logs - exclude manual entries
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
            {/* Header */}
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

            {/* Patient Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {patient.photoURL ? (
                        <img
                            src={patient.photoURL}
                            alt={patient.displayName}
                            className="w-20 h-20 rounded-full border-4 border-teal-100 object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full border-4 border-teal-200 bg-white flex items-center justify-center text-teal-600 font-bold text-2xl">
                            {patient.displayName?.[0]?.toUpperCase() || 'P'}
                        </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900">{patient.displayName}</h1>
                        <p className="text-gray-500">{patient.email}</p>
                        <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-lg font-medium">
                                {filteredLogs.length} Health Records
                            </span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-lg font-medium">
                                {patientNotes?.length || 0} Clinical Notes
                            </span>
                            <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-lg font-medium">
                                {patientGoals?.length || 0} Health Goals
                            </span>
                        </div>
                    </div>
                    {/* AI Summary Button */}
                    <button
                        onClick={() => generatePatientSummary(patientId)}
                        disabled={loading}
                        className="px-4 py-2 cursor-pointer bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        {loading ? 'Generating...' : 'AI Summary'}
                    </button>
                </div>

                {/* AI Summary */}
                {aiSummary && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h4 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            AI Health Summary
                        </h4>
                        <p className="text-lg text-gray-700 whitespace-pre-wrap">{aiSummary}</p>
                    </div>
                )}
            </div>

            {/* Add Note Form */}
            {showNoteForm && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">New Clinical Note</h3>
                    <form onSubmit={handleAddNote} className="space-y-4">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                className="w-full rounded-lg p-3 border-gray-300 shadow-sm focus:border-[#00a896] focus:ring-[#00a896]"
                                placeholder="e.g. Follow-up Consultation"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={noteDescription}
                                onChange={(e) => setNoteDescription(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg p-3 border-gray-300 shadow-sm focus:border-[#00a896] focus:ring-[#00a896]"
                                placeholder="Enter clinical observations..."
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 cursor-pointer py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] flex items-center text-lg"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Note
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
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
            </div>

            {/* Content based on active tab */}
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
            ) : (
                <NotesSection
                    patientNotes={patientNotes}
                    user={user}
                    formatDate={formatDate}
                    patientId={patientId}
                    getPatientNotes={getPatientNotes}
                />
            )}

            {/* Modals */}
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
