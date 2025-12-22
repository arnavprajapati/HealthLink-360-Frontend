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
    Calendar,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

const CalendarPage = () => {
    const [searchParams] = useSearchParams();
    const [isConnected, setIsConnected] = useState(false);
    const [syncedEvents, setSyncedEvents] = useState([]);
    const [allGoals, setAllGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [deletingEventId, setDeletingEventId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        checkConnectionAndFetchEvents();

        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success === 'true') {
            showNotification('Google Calendar connected successfully!', 'success');
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
            const [statusRes, eventsRes, goalsRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/google/status`),
                axios.get(`${BASE_URL}/api/google/events`),
                axios.get(`${BASE_URL}/api/goals`)
            ]);

            setIsConnected(statusRes.data.connected);
            setSyncedEvents(eventsRes.data.data || []);
            setAllGoals(goalsRes.data.data || []);
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

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getEventsForDate = (date) => {
        if (!date || !allGoals || allGoals.length === 0) return [];
        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        return allGoals.filter(goal => {
            if (!goal) return false;
            if (goal.status === 'completed' || goal.status === 'failed' || goal.status === 'cancelled') return false;

            const startDate = new Date(goal.createdAt || goal.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(goal.deadline);
            endDate.setHours(23, 59, 59, 999);

            if (checkDate < startDate || checkDate > endDate) return false;

            const frequency = (goal.trackingFrequency || 'daily').toLowerCase();

            if (frequency === 'daily') {
                return true;
            } else if (frequency === 'weekly') {
                return startDate.getDay() === checkDate.getDay();
            } else if (frequency === 'monthly') {
                return startDate.getDate() === checkDate.getDate();
            }
            return true;
        }) || [];
    };

    const getGoalName = (goal) => {
        if (!goal) return 'Goal';
        return goal.customParameterName || goal.parameter || goal.title || 'Goal';
    };

    const calculateProgress = (goal) => {
        if (!goal) return 0;
        const current = goal.currentValue || 0;
        const target = goal.targetValue;
        const initial = goal.initialValue || current;

        if (goal.goalType === 'decrease') {
            const totalToLose = initial - target;
            const lost = initial - current;
            return Math.max(0, Math.min(100, Math.round((lost / totalToLose) * 100)));
        } else if (goal.goalType === 'increase') {
            if (current >= target) return 100;
            return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
        } else if (goal.goalType === 'maintain' || goal.goalType === 'range') {
            const min = goal.minValue || target * 0.9;
            const max = goal.maxValue || target * 1.1;
            if (current >= min && current <= max) return 100;
        }
        return Math.min(100, Math.round((current / target) * 100));
    };

    const getProgressColor = (goal) => {
        const progress = calculateProgress(goal);
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-[#02c39a]';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const getTrendIcon = (goal) => {
        if (!goal) return <Minus className="w-3 h-3 text-gray-400" />;
        const current = goal.currentValue || 0;
        const initial = goal.initialValue || current;

        if (goal.goalType === 'decrease') {
            if (current < initial) return <TrendingDown className="w-3 h-3 text-green-500" />;
            if (current > initial) return <TrendingUp className="w-3 h-3 text-red-500" />;
        } else {
            if (current > initial) return <TrendingUp className="w-3 h-3 text-green-500" />;
            if (current < initial) return <TrendingDown className="w-3 h-3 text-red-500" />;
        }
        return <Minus className="w-3 h-3 text-gray-400" />;
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        if (!date || !selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = getDaysInMonth(currentDate);
    const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#00a896]" />
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
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <CalendarCheck className="w-8 h-8 mr-3 text-[#00a896]" />
                        Health Calendar
                    </h1>
                    <p className="text-gray-600 text-base mt-1">
                        Track your health goals and reminders
                    </p>
                </div>

                {/* Google Calendar Connection Status */}
                <div className="flex items-center space-x-3">
                    {isConnected ? (
                        <>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-base font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Google Connected
                            </span>
                            <button
                                onClick={handleDisconnect}
                                className="px-3 py-1.5 text-base bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-1"
                            >
                                <Unlink className="w-4 h-4" />
                                <span>Disconnect</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors flex items-center space-x-2 font-medium disabled:opacity-50"
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 text-base bg-[#f0f3bd] text-[#028090] rounded-lg hover:bg-[#e0e8a0] transition-colors font-medium"
                            >
                                Today
                            </button>
                            <button
                                onClick={goToPreviousMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={goToNextMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-base font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            const dayGoals = day ? getEventsForDate(day) : [];
                            const hasGoals = dayGoals.length > 0;

                            return (
                                <div
                                    key={index}
                                    onClick={() => day && setSelectedDate(day)}
                                    className={`
                                        min-h-[80px] p-2 rounded-lg border transition-all cursor-pointer
                                        ${!day ? 'bg-gray-50 border-transparent' : 'border-gray-100 hover:border-[#00a896]'}
                                        ${isToday(day) ? 'bg-[#00a896]/10 border-[#00a896]' : ''}
                                        ${isSelected(day) ? 'ring-2 ring-[#00a896] border-[#00a896]' : ''}
                                    `}
                                >
                                    {day && (
                                        <>
                                            <span className={`
                                                text-base font-medium
                                                ${isToday(day) ? 'text-[#00a896]' : 'text-gray-700'}
                                            `}>
                                                {day.getDate()}
                                            </span>

                                            {/* Goal indicators with progress */}
                                            {hasGoals && (
                                                <div className="mt-1 space-y-1">
                                                    {dayGoals.slice(0, 2).map((goal, i) => {
                                                        const goalName = getGoalName(goal);
                                                        const prog = calculateProgress(goal);
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`text-base px-1.5 py-0.5 text-white rounded truncate ${getProgressColor(goal)}`}
                                                                title={`${goalName}: ${goal.currentValue || 0} ${goal.unit} (Target: ${goal.targetValue} ${goal.unit})`}
                                                            >
                                                                {goalName.length > 8 ? goalName.substring(0, 8) + '..' : goalName}
                                                            </div>
                                                        );
                                                    })}
                                                    {dayGoals.length > 2 && (
                                                        <div className="text-base text-gray-500 px-1">
                                                            +{dayGoals.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date Events / All Events */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-[#00a896]" />
                        {selectedDate ? (
                            <>Goals for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                        ) : (
                            <>All Active Goals</>
                        )}
                    </h2>

                    {selectedDate ? (
                        selectedDateEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <Target className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-base">No goals for this date</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedDateEvents.map((goal, index) => {
                                    const progress = calculateProgress(goal);
                                    const goalName = getGoalName(goal);
                                    return (
                                        <div
                                            key={index}
                                            className="p-4 bg-gray-50 rounded-xl"
                                        >
                                            {/* Goal Name */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2.5 rounded-xl ${getProgressColor(goal)}`}>
                                                        <Target className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 text-lg">
                                                            {goalName}
                                                        </h3>
                                                        <span className="text-base text-gray-500 capitalize">
                                                            {goal.goalType} goal • {goal.trackingFrequency}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    {getTrendIcon(goal)}
                                                    <span className="text-2xl font-bold text-gray-800">{progress}%</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all ${getProgressColor(goal)}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>

                                            {/* Values Display */}
                                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                {goal.goalType === 'decrease' ? (
                                                    <div className="flex items-center justify-between text-center">
                                                        <div className="flex-1">
                                                            <p className="text-base text-gray-400 mb-1">Started</p>
                                                            <p className="text-lg font-semibold text-gray-600">{goal.initialValue || '-'} {goal.unit}</p>
                                                        </div>
                                                        <div className="text-gray-300 text-lg">→</div>
                                                        <div className="flex-1">
                                                            <p className="text-base text-gray-400 mb-1">Now</p>
                                                            <p className="text-lg font-bold text-gray-800">{goal.currentValue || 0} {goal.unit}</p>
                                                        </div>
                                                        <div className="text-gray-300 text-lg">→</div>
                                                        <div className="flex-1">
                                                            <p className="text-base text-gray-400 mb-1">Target</p>
                                                            <p className="text-lg font-bold text-green-600">{goal.targetValue} {goal.unit}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between text-center">
                                                        <div className="flex-1">
                                                            <p className="text-base text-gray-400 mb-1">Current</p>
                                                            <p className="text-lg font-bold text-gray-800">{goal.currentValue || 0} {goal.unit}</p>
                                                        </div>
                                                        <div className="text-gray-300 text-lg">→</div>
                                                        <div className="flex-1">
                                                            <p className="text-base text-gray-400 mb-1">Target</p>
                                                            <p className="text-lg font-bold text-[#00a896]">{goal.targetValue} {goal.unit}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        !allGoals || (allGoals || []).filter(g => g && g.status === 'active').length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <Target className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-base font-medium text-gray-700 mb-1">
                                    No active goals
                                </h3>
                                <p className="text-gray-500 text-base">
                                    Create goals in Track Progress
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {(allGoals || []).filter(g => g && g.status === 'active').map((goal) => {
                                    const progress = calculateProgress(goal);
                                    const goalName = getGoalName(goal);
                                    return (
                                        <div
                                            key={goal._id}
                                            className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                            onClick={() => setSelectedDate(new Date())}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-2 rounded-lg ${getProgressColor(goal)}`}>
                                                        <Target className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800">
                                                            {goalName}
                                                        </h3>
                                                        <span className="text-base text-gray-500 capitalize">
                                                            {goal.goalType} • {goal.trackingFrequency}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-bold text-gray-800">{progress}%</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${getProgressColor(goal)}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>

                                            {/* Current / Target */}
                                            <div className="flex items-center justify-between text-base text-gray-600">
                                                <span>Now: <b>{goal.currentValue || 0} {goal.unit}</b></span>
                                                <span>Target: <b className="text-[#00a896]">{goal.targetValue} {goal.unit}</b></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {isConnected && (
                        <a
                            href="https://calendar.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-base"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open Google Calendar</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
