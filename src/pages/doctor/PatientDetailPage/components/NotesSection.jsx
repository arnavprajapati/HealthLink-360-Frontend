import React, { useState } from 'react';
import { useConnection } from '../../../../context/ConnectionContext';
import {
    FileText,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Send
} from 'lucide-react';

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
                    <div
                        onClick={() => handleExpandNote(note)}
                        className="p-5 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-gray-900">{note.title}</h4>
                                {!note.isRead && note.senderRole === 'patient' && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-lg font-medium rounded-full">
                                        New Reply
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {formatDate(note.date)}
                                </span>
                                {note.replies?.length > 0 && (
                                    <span className="px-2 py-1 bg-teal-50 text-teal-600 text-lg rounded-full">
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
                        <div className="mt-3 pt-3 border-t border-gray-100 text-lg text-gray-500 flex items-center gap-2">
                            {note.senderRole === 'doctor' ? (
                                <>
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-lg">Doctor</span>
                                    <span>By Dr. {note.sender?.displayName || user?.displayName || 'You'}</span>
                                </>
                            ) : (
                                <>
                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-lg">Patient</span>
                                    <span>By {note.sender?.displayName || 'Patient'}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {expandedNote === note._id && (
                        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4 bg-gray-50">
                            <div className="p-4 bg-white rounded-lg">
                                <p className="text-gray-700 whitespace-pre-wrap">{note.description}</p>
                            </div>

                            {note.replies && note.replies.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-lg font-medium text-gray-600 flex items-center gap-2">
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
                                                <span className="text-lg font-medium text-gray-700">
                                                    {reply.senderRole === 'doctor' ? `Dr. ${reply.sender?.displayName || 'You'}` : reply.sender?.displayName || 'Patient'}
                                                </span>
                                                <span className="text-lg text-gray-400">
                                                    {formatDate(reply.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-lg text-gray-700">{reply.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

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

export default NotesSection;