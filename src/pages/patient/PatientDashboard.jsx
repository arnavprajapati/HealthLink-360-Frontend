import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHealthLogs, deleteHealthLog } from '../../app/reducers/healthLogSlice';
import AddHealthLog from '../../components/health/AddHealthLog';
import {
    Plus, TrendingUp, TrendingDown, Activity, Calendar,
    Trash2, Eye, MessageCircle, Send, Bot, User as UserIcon,
    Clock, Video
} from 'lucide-react';
import { getDiseaseConfig } from '../../utils/diseaseConfig';

const PatientDashboard = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', text: 'Hello! I\'m your AI health assistant. How can I help you today?' }
    ]);
    const [chatInput, setChatInput] = useState('');

    const dispatch = useDispatch();
    const { logs, loading } = useSelector((state) => state.healthLog);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getHealthLogs({ diseaseType: 'all' }));
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this health log?')) {
            try {
                await dispatch(deleteHealthLog(id)).unwrap();
            } catch (err) {
                console.error('Failed to delete:', err);
            }
        }
    };

    const handleAddSuccess = () => {
        dispatch(getHealthLogs({ diseaseType: 'all' }));
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;

        setChatMessages([...chatMessages,
        { role: 'user', text: chatInput },
        { role: 'ai', text: 'This is a demo AI response. Full AI integration coming soon!' }
        ]);
        setChatInput('');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const HealthCard = ({ log }) => {
        const config = getDiseaseConfig(log.diseaseType);
        const readings = log.readings || {};

        return (
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-[#f0f3bd] to-[#02c39a]/20 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">{config.icon}</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{config.label}</h3>
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(log.recordDate || log.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setSelectedLog(log)}
                                className="p-2 text-[#00a896] hover:bg-[#f0f3bd] rounded-lg transition-colors"
                                title="View Details"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(log._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-5">
                    {Object.keys(readings).length > 0 ? (
                        <div className="space-y-4">
                            {config.fields[0] && readings[config.fields[0].name] && (
                                <div className="bg-gradient-to-br from-[#00a896]/10 to-[#02c39a]/5 rounded-lg p-4 border border-[#00a896]/20">
                                    <p className="text-sm text-gray-600 mb-1">{config.fields[0].label}</p>
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold text-[#028090]">
                                            {readings[config.fields[0].name]}
                                        </span>
                                        <span className="ml-2 text-xl text-gray-600">
                                            {config.fields[0].unit}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            ✓ Reading Recorded
                                        </span>
                                    </div>
                                </div>
                            )}

                            {config.fields.length > 1 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {config.fields.slice(1).map((field) => {
                                        if (!readings[field.name]) return null;
                                        return (
                                            <div key={field.name} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-xs text-gray-500 mb-1">{field.label}</p>
                                                <p className="text-lg font-bold text-gray-800">
                                                    {readings[field.name]}
                                                    <span className="text-sm text-gray-500 ml-1">{field.unit}</span>
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Quick Analysis</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Parameters:</span>
                                        <span className="font-semibold text-gray-800">{Object.keys(readings).length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-semibold text-[#028090]">{config.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No readings available</p>
                    )}

                    {log.description && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">📝 Notes: </span>
                                {log.description}
                            </p>
                        </div>
                    )}

                    {log.detectedDisease && log.detectedDisease !== log.diseaseType && (
                        <div className="mt-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                🤖 AI Detected: {getDiseaseConfig(log.detectedDisease).label}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const EmptyState = () => (
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="flex justify-center mb-4">
                <div className="bg-[#f0f3bd] p-4 rounded-full">
                    <Activity className="w-12 h-12 text-[#00a896]" />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Logs Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start tracking your health by adding your first health log. Upload reports or enter readings manually.
            </p>
            <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-3 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors shadow-sm font-medium"
            >
                <Plus size={20} className="mr-2" />
                Add Your First Health Log
            </button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {logs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <p className="text-sm text-gray-600 mb-1">Total Records</p>
                            <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <p className="text-sm text-gray-600 mb-1">Categories</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {[...new Set(logs.map(log => log.diseaseType))].length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                            <p className="text-sm font-bold text-gray-900">
                                {logs.length > 0 ? formatDate(logs[0].recordDate || logs[0].createdAt) : '-'}
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Health Records</h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {logs.map((log) => (
                                <HealthCard key={log._id} log={log} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-[#00a896]" />
                        Health Activity Calendar
                    </h3>
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-600 mb-2">
                            🗓️ Calendar View Coming Soon
                        </p>
                        <p className="text-xs text-gray-500">
                            Track your log dates, upcoming checkups, and medication reminders here.
                        </p>
                        <div className="mt-4 bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <p className="text-2xl font-semibold text-[#00a896]">Nov 2025</p>
                            <div className="h-24 w-full bg-gray-200 mt-2 rounded"></div>
                        </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors text-sm font-medium">
                        View Full Calendar
                    </button>
                </div>


                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#00a896] to-[#02c39a] p-4">
                        <h3 className="text-lg font-bold text-white flex items-center">
                            <Bot className="w-5 h-5 mr-2" />
                            AI Health Assistant
                        </h3>
                        <p className="text-xs text-[#f0f3bd] mt-1">Ask me anything about your health</p>
                    </div>

                    <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'ai' ? 'bg-[#00a896]' : 'bg-gray-300'
                                        }`}>
                                        {msg.role === 'ai' ? (
                                            <Bot className="w-4 h-4 text-white" />
                                        ) : (
                                            <UserIcon className="w-4 h-4 text-gray-600" />
                                        )}
                                    </div>
                                    <div className={`rounded-lg p-3 ${msg.role === 'ai' ? 'bg-white border border-gray-200' : 'bg-[#00a896] text-white'
                                        }`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-white border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] text-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="p-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            🤖 Demo Mode - Full AI coming soon
                        </p>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <AddHealthLog
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}

            {selectedLog && (
                <DetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
};

// Detail Modal Component (same as before)
const DetailModal = ({ log, onClose }) => {
    const config = getDiseaseConfig(log.diseaseType);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl">{config.icon}</span>
                        <h2 className="text-2xl font-bold text-gray-800">{config.label}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-gray-500">Record Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {new Date(log.recordDate || log.createdAt).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Readings</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(log.readings || {}).map(([key, value]) => {
                                const field = config.fields.find(f => f.name === key);
                                return (
                                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">{field?.label || key}</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {value} <span className="text-sm text-gray-500">{field?.unit || ''}</span>
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {log.description && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{log.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;