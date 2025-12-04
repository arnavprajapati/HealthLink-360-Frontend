import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    CalendarCheck,
    Link as LinkIcon,
    Unlink,
    Trash2,
    Target,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    ExternalLink,
    Calendar
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

const CalendarPage = () => {
    const [searchParams] = useSearchParams();
    const [isConnected, setIsConnected] = useState(false);
    const [syncedEvents, setSyncedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [deletingEventId, setDeletingEventId] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        checkConnectionAndFetchEvents();

        // Handle redirect params
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success === 'true') {
            showNotification('Google Calendar connected successfully!', 'success');
            // Clean URL
            window.history.replaceState({}, document.title, '/calendar');
        } else if (error) {
            showNotification('Failed to connect Google Calendar. Please try again.', 'error');
            window.history.replaceState({}, document.title, '/calendar');
        }
    }, [searchParams]);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const checkConnectionAndFetchEvents = async () => {
        setLoading(true);
        try {
            const [statusRes, eventsRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/google/status`),
                axios.get(`${BASE_URL}/api/google/events`)
            ]);

            setIsConnected(statusRes.data.connected);
            setSyncedEvents(eventsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/google/url`);
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Failed to get auth URL:', error);
            showNotification('Failed to initiate connection', 'error');
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect Google Calendar? This will unlink all synced events.')) {
            return;
        }

        try {
            await axios.post(`${BASE_URL}/api/google/disconnect`);
            setIsConnected(false);
            setSyncedEvents([]);
            showNotification('Google Calendar disconnected', 'success');
        } catch (error) {
            console.error('Failed to disconnect:', error);
            showNotification('Failed to disconnect', 'error');
        }
    };

    const handleDeleteEvent = async (eventId, goalId) => {
        if (!confirm('Are you sure you want to remove this event from Google Calendar?')) {
            return;
        }

        setDeletingEventId(goalId);
        try {
            await axios.post(`${BASE_URL}/api/google/delete-event`, { eventId });
            setSyncedEvents(prev => prev.filter(e => e.goalId !== goalId));
            showNotification('Event removed from Google Calendar', 'success');
        } catch (error) {
            console.error('Failed to delete event:', error);
            showNotification('Failed to delete event', 'error');
        } finally {
            setDeletingEventId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00a896]" />
                    <span className="text-gray-600">Loading calendar...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${notification.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <CalendarCheck className="w-8 h-8 mr-3 text-[#00a896]" />
                    Google Calendar Sync
                </h1>
                <p className="text-gray-600 mt-2">
                    Sync your weekly health goals with Google Calendar for better tracking
                </p>
            </div>

            {/* Connection Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {isConnected ? (
                                <LinkIcon className="w-6 h-6 text-green-600" />
                            ) : (
                                <Unlink className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Connection Status
                            </h2>
                            <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-medium ${isConnected
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {isConnected ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Connected
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            Not Connected
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isConnected ? (
                        <button
                            onClick={handleDisconnect}
                            className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2 font-medium"
                        >
                            <Unlink className="w-4 h-4" />
                            <span>Disconnect</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="px-5 py-2.5 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors flex items-center space-x-2 font-medium disabled:opacity-50"
                        >
                            {connecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-4 h-4" />
                                    <span>Connect Google Calendar</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {!isConnected && (
                    <div className="mt-4 p-4 bg-[#f0f3bd]/30 border border-[#02c39a]/30 rounded-lg">
                        <p className="text-lg text-[#028090]">
                            💡 Connect your Google Calendar to automatically sync weekly health goals as recurring events.
                            You'll receive reminders to help you stay on track!
                        </p>
                    </div>
                )}
            </div>

            {/* Synced Events */}
            {isConnected && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-[#00a896]" />
                        Synced Goals
                    </h2>

                    {syncedEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Target className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                No synced goals yet
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                When you create weekly goals with calendar sync enabled, they'll appear here.
                                Go to <span className="font-medium text-[#00a896]">Track Progress</span> to create a new goal.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {syncedEvents.map((event) => (
                                <div
                                    key={event.goalId}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-[#f0f3bd] rounded-lg">
                                            <Target className="w-5 h-5 text-[#028090]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center space-x-3 mt-1 text-lg text-gray-500">
                                                <span className="flex items-center">
                                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                                    {event.frequency}
                                                </span>
                                                <span>•</span>
                                                <span>{formatDate(event.deadline)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <a
                                            href="https://calendar.google.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-[#00a896] transition-colors"
                                            title="Open in Google Calendar"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                        <button
                                            onClick={() => handleDeleteEvent(event.googleEventId, event.goalId)}
                                            disabled={deletingEventId === event.goalId}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            title="Remove from calendar"
                                        >
                                            {deletingEventId === event.goalId ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
