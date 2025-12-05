import React, { useEffect, useState } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import {
    FileText,
    Send,
    MessageSquare,
    User,
    Clock,
    ChevronDown,
    ChevronUp,
    Plus,
    X,
    Stethoscope
} from 'lucide-react';

const PatientNotesPage = () => {
    const {
        myNotes,
        linkedDoctors,
        getMyNotes,
        getLinkedDoctors,
        createPatientNote,
        replyToNote,
        markNoteAsRead,
        loading,
        successMessage,
        clearConnectionMessage
    } = useConnection();

    const [expandedNote, setExpandedNote] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [showNewNoteModal, setShowNewNoteModal] = useState(false);
    const [newNote, setNewNote] = useState({ doctorId: '', title: '', description: '' });
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        getMyNotes();
        getLinkedDoctors();
    }, []);

    useEffect(() => {
        if (successMessage) {
            setTimeout(() => clearConnectionMessage(), 3000);
        }
    }, [successMessage]);

    const handleExpandNote = async (note) => {
        if (expandedNote === note._id) {
            setExpandedNote(null);
        } else {
            setExpandedNote(note._id);
            if (!note.isRead && note.senderRole === 'doctor') {
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
            getMyNotes();
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setSendingReply(false);
        }
    };

    const handleSendNewNote = async (e) => {
        e.preventDefault();
        if (!newNote.doctorId || !newNote.title || !newNote.description) return;

        try {
            await createPatientNote({
                doctorId: newNote.doctorId,
                title: newNote.title,
                description: newNote.description
            });
            setShowNewNoteModal(false);
            setNewNote({ doctorId: '', title: '', description: '' });
            getMyNotes();
        } catch (error) {
            console.error('Failed to send note:', error);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00a896] to-[#028090] rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Clinical Notes</h1>
                        </div>
                        <p className= "text-lg text-teal-100">
                            View notes from your doctors and send replies
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewNoteModal(true)}
                        className="px-4 py-2 bg-white text-[#00a896] rounded-lg hover:bg-teal-50 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        New Note
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">Total Notes</p>
                            <p className="text-3xl font-bold text-[#00a896]">{myNotes?.length || 0}</p>
                        </div>
                        <div className="p-3 bg-teal-50 rounded-full">
                            <FileText className="w-6 h-6 text-[#00a896]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">From Doctors</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {myNotes?.filter(n => n.senderRole === 'doctor').length || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Stethoscope className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg text-gray-500">Unread</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {myNotes?.filter(n => !n.isRead && n.senderRole === 'doctor').length || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-full">
                            <MessageSquare className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-2 h-6 bg-[#00a896] rounded-full"></div>
                        All Notes
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
                    </div>
                ) : myNotes && myNotes.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {myNotes.map((note) => (
                            <div key={note._id} className="p-4">
                                {/* Note Header */}
                                <div
                                    onClick={() => handleExpandNote(note)}
                                    className="flex items-start justify-between cursor-pointer"
                                >
                                    <div className="flex items-start gap-4">
                                        {note.doctor?.photoURL ? (
                                            <img
                                                src={note.doctor.photoURL}
                                                alt={note.doctor.displayName}
                                                className="w-12 h-12 rounded-full border-2 border-teal-100 object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center text-white font-bold">
                                                {note.doctor?.displayName?.charAt(0)?.toUpperCase() || 'D'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{note.title}</h3>
                                                {!note.isRead && note.senderRole === 'doctor' && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-lg text-gray-500 mt-1">
                                                {note.senderRole === 'doctor'
                                                    ? `From: Dr. ${note.doctor?.displayName}`
                                                    : `Sent by you`}
                                                {note.doctor?.doctorProfile?.speciality && (
                                                    <span className="text-gray-400"> • {note.doctor.doctorProfile.speciality}</span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(note.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {note.replies?.length > 0 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
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

                                {/* Expanded Content */}
                                {expandedNote === note._id && (
                                    <div className="mt-4 ml-16 space-y-4">
                                        {/* Note Description */}
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-gray-700 whitespace-pre-wrap">{note.description}</p>
                                        </div>

                                        {/* Replies */}
                                        {note.replies && note.replies.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-lg font-medium text-gray-600">Conversation</h4>
                                                {note.replies.map((reply) => (
                                                    <div
                                                        key={reply._id}
                                                        className={`p-3 rounded-lg ${reply.senderRole === 'patient'
                                                                ? 'bg-teal-50 ml-8'
                                                                : 'bg-blue-50 mr-8'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-lg font-medium text-gray-700">
                                                                {reply.senderRole === 'patient' ? 'You' : `Dr. ${reply.sender?.displayName}`}
                                                            </span>
                                                            <span className="text-sm text-gray-400">
                                                                {formatDate(reply.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-lg text-gray-700">{reply.description}</p>
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
                ) : (
                    <div className="py-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Clinical Notes</h3>
                        <p className="text-gray-500">Notes from your doctors will appear here</p>
                    </div>
                )}
            </div>

            {/* New Note Modal */}
            {showNewNoteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Send Note to Doctor</h3>
                            <button
                                onClick={() => setShowNewNoteModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSendNewNote} className="p-6 space-y-4">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-1">
                                    Select Doctor
                                </label>
                                <select
                                    value={newNote.doctorId}
                                    onChange={(e) => setNewNote({ ...newNote, doctorId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896]"
                                    required
                                >
                                    <option value="">Choose a doctor...</option>
                                    {linkedDoctors?.map((doctor) => (
                                        <option key={doctor._id} value={doctor._id}>
                                            Dr. {doctor.displayName} - {doctor.doctorProfile?.speciality || 'General'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                    placeholder="e.g., Question about medication"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-1">
                                    Message
                                </label>
                                <textarea
                                    value={newNote.description}
                                    onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                                    placeholder="Type your message here..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896] resize-none"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNewNoteModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {loading ? 'Sending...' : 'Send Note'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientNotesPage;
