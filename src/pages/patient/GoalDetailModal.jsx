import React, { useState, useEffect } from 'react';
import {
    X, Target, TrendingUp, TrendingDown, Activity, Calendar,
    Clock, Award, Sparkles, Plus, ChevronRight, AlertCircle,
    CheckCircle, Loader2, BarChart3, Edit2, Trash2
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';

const GoalDetailModal = ({ goal, onClose, onAddMilestone, onEditMilestone, onDeleteMilestone, onAnalyze }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [showAddEntry, setShowAddEntry] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [newNote, setNewNote] = useState('');
    const [addingEntry, setAddingEntry] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editNote, setEditNote] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    if (!goal) return null;

    const hasDeadline = goal.deadline !== null && goal.deadline !== undefined;
    const daysRemaining = hasDeadline
        ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
    const totalDays = hasDeadline
        ? Math.ceil((new Date(goal.deadline) - new Date(goal.startDate || goal.createdAt)) / (1000 * 60 * 60 * 24))
        : null;
    const daysElapsed = totalDays !== null ? totalDays - daysRemaining : null;
    const timeProgress = totalDays !== null
        ? Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))
        : null;

    const chartData = goal.milestones?.map((m, idx) => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m.value,
        note: m.note,
        index: idx
    })) || [];

    if (chartData.length > 0) {
        chartData.push({
            date: 'Target',
            value: goal.targetValue,
            isTarget: true
        });
    }

    const getProgressColor = (progress) => {
        if (progress >= 75) return '#02c39a';
        if (progress >= 50) return '#00a896';
        if (progress >= 25) return '#f59e0b';
        return '#ef4444';
    };

    const getStatusBadge = (status) => {
        const styles = {
            'achieved': 'bg-green-100 text-green-800 border-green-300',
            'in-progress': 'bg-[#f0f3bd] text-[#028090] border-[#02c39a]',
            'expired': 'bg-gray-100 text-gray-800 border-gray-300',
            'failed': 'bg-red-100 text-red-800 border-red-300'
        };
        return styles[status] || styles['in-progress'];
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const result = await onAnalyze(goal._id);
            setAiAnalysis(result);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAddEntry = async () => {
        if (!newValue || addingEntry) return;

        setAddingEntry(true);
        try {
            await onAddMilestone(goal._id, {
                value: parseFloat(newValue),
                note: newNote || 'Manual entry'
            });
            setNewValue('');
            setNewNote('');
            setShowAddEntry(false);
        } catch (error) {
            console.error('Failed to add entry:', error);
        } finally {
            setAddingEntry(false);
        }
    };

    const handleEditMilestone = (milestone, actualIndex) => {
        setEditingMilestone(actualIndex);
        setEditValue(milestone.value.toString());
        setEditNote(milestone.note || '');
    };

    const handleSaveEdit = async () => {
        if (!editValue || savingEdit) return;

        setSavingEdit(true);
        try {
            await onEditMilestone(goal._id, editingMilestone, {
                value: parseFloat(editValue),
                note: editNote
            });
            setEditingMilestone(null);
            setEditValue('');
            setEditNote('');
        } catch (error) {
            console.error('Failed to edit milestone:', error);
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDeleteMilestone = async (actualIndex) => {
        if (goal.milestones.length === 1) {
            alert('Cannot delete the last entry. Delete the goal instead.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await onDeleteMilestone(goal._id, actualIndex);
            } catch (error) {
                console.error('Failed to delete milestone:', error);
            }
        }
    };

    const calculatePrediction = () => {
        if (!goal.milestones || goal.milestones.length < 2) return null;

        const first = goal.milestones[0];
        const last = goal.milestones[goal.milestones.length - 1];
        const daysBetween = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);

        if (daysBetween === 0) return null;

        const ratePerDay = (last.value - first.value) / daysBetween;
        const remaining = goal.targetValue - last.value;
        const daysToTarget = remaining / ratePerDay;

        if (daysToTarget <= 0 || !isFinite(daysToTarget)) return null;

        const predictedDate = new Date();
        predictedDate.setDate(predictedDate.getDate() + Math.abs(daysToTarget));

        // Handle case where deadline is not set
        const onTrack = hasDeadline ? predictedDate <= new Date(goal.deadline) : true;

        return {
            date: predictedDate,
            daysFromNow: Math.abs(Math.round(daysToTarget)),
            onTrack
        };
    };

    const prediction = calculatePrediction();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#00a896] to-[#028090] px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-start flex-shrink-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{goal.parameter}</h2>
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-lg sm:text-lg font-semibold border ${getStatusBadge(goal.status)}`}>
                                {goal.status.replace('-', ' ').toUpperCase()}
                            </span>
                        </div>
                        <p className="text-white/80 text-lg sm:text-lg">
                            {goal.goalType === 'range'
                                ? `Keep within range: ${goal.minValue !== null ? goal.minValue : ''}${goal.minValue !== null && goal.maxValue !== null ? ' - ' : ''}${goal.maxValue !== null ? goal.maxValue : ''} ${goal.unit}`
                                : goal.targetValue !== null
                                    ? `${goal.goalType === 'decrease' ? 'Decrease' : goal.goalType === 'increase' ? 'Increase' : 'Maintain'} to ${goal.targetValue} ${goal.unit}`
                                    : `Tracking ${goal.parameter}`
                            }
                            {hasDeadline ? ` by ${new Date(goal.deadline).toLocaleDateString()}` : ' (no deadline)'}
                            {goal.trackingFrequency && goal.trackingFrequency !== 'daily' && ` • ${goal.trackingFrequency} tracking`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 cursor-pointer hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Split Content Area */}
                <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

                    {/* Left Pane: Fixed Statistics Overview */}
                    <div className="w-full md:w-1/3 p-4 sm:p-6 space-y-4 border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0 overflow-y-auto max-h-[40vh] md:max-h-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Goal Metrics</h3>

                        {/* Big Progress Circle */}
                        <div className="bg-gradient-to-br from-[#f0f3bd]/30 to-white rounded-xl p-6 border border-[#02c39a]/20 flex flex-col items-center justify-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#e5e7eb"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke={getProgressColor(goal.progress)}
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(goal.progress / 100) * 352} 352`}
                                        className="transition-all duration-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-900">{Math.round(goal.progress)}%</span>
                                    <span className="text-lg text-gray-500">Complete</span>
                                </div>
                            </div>
                            <p className="mt-3 text-lg font-medium text-gray-600">Goal Progress</p>
                        </div>

                        {/* Current vs Target */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                                <BarChart3 className="w-4 h-4 text-[#00a896]" />
                                Progress Overview
                            </h4>

                            {/* Initial Value */}
                            {goal.initialValue !== null && goal.initialValue !== undefined && (
                                <div className="flex justify-between items-center">
                                    <span className="text-lg text-gray-600">Initial</span>
                                    <span className="text-lg font-semibold text-gray-500">
                                        {goal.initialValue} {goal.unit}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-lg text-gray-600">Current</span>
                                <span className="text-xl font-bold text-[#028090]">
                                    {goal.currentValue ?? '—'} {goal.unit}
                                </span>
                            </div>

                            {/* Show Target or Range */}
                            {goal.goalType === 'range' || (goal.minValue !== null || goal.maxValue !== null) ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-lg text-gray-600">Target Range</span>
                                    <span className="text-xl font-bold text-gray-900">
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
                                    <span className="text-lg text-gray-600">Target</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {goal.targetValue} {goal.unit}
                                    </span>
                                </div>
                            ) : null}

                            {/* Range status indicator */}
                            {(goal.goalType === 'range' || (goal.minValue !== null || goal.maxValue !== null)) && goal.currentValue !== null && (
                                <div className="pt-2 border-t border-gray-100">
                                    {(() => {
                                        const min = goal.minValue;
                                        const max = goal.maxValue;
                                        const current = goal.currentValue;
                                        let status = 'in-range';
                                        let statusText = 'Within range ✅';
                                        let statusColor = 'text-green-600';

                                        if (min !== null && max !== null) {
                                            if (current < min) {
                                                status = 'below';
                                                statusText = `Below range by ${(min - current).toFixed(1)} ${goal.unit}`;
                                                statusColor = 'text-orange-600';
                                            } else if (current > max) {
                                                status = 'above';
                                                statusText = `Above range by ${(current - max).toFixed(1)} ${goal.unit}`;
                                                statusColor = 'text-orange-600';
                                            }
                                        } else if (min !== null && current < min) {
                                            statusText = `Below minimum by ${(min - current).toFixed(1)} ${goal.unit}`;
                                            statusColor = 'text-orange-600';
                                        } else if (max !== null && current > max) {
                                            statusText = `Above maximum by ${(current - max).toFixed(1)} ${goal.unit}`;
                                            statusColor = 'text-orange-600';
                                        }

                                        return <p className={`text-lg font-medium ${statusColor}`}>{statusText}</p>;
                                    })()}
                                </div>
                            )}

                            {/* Fixed goal progress info */}
                            {goal.goalType !== 'maintain' && goal.goalType !== 'range' && goal.targetValue !== null && goal.initialValue !== null && (
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-lg text-gray-600">
                                        {goal.goalType === 'decrease' ? 'Total reduction needed: ' : 'Total increase needed: '}
                                        <span className="font-semibold text-[#028090]">
                                            {Math.abs(goal.targetValue - goal.initialValue).toFixed(1)} {goal.unit}
                                        </span>
                                    </p>
                                    {goal.currentValue !== null && goal.currentValue !== undefined && (
                                        <p className="text-lg text-gray-600 mt-1">
                                            Remaining: {' '}
                                            <span className="font-semibold text-[#028090]">
                                                {Math.abs(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Tracking Frequency */}
                            {goal.trackingFrequency && (
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg text-gray-600">Tracking</span>
                                        <span className="text-lg font-medium text-[#028090] capitalize">{goal.trackingFrequency}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Time Remaining - Only show if deadline is set */}
                        {hasDeadline ? (
                            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                                    <Clock className="w-4 h-4 text-[#00a896]" />
                                    Time Status
                                </h4>

                                <div className="text-center py-1">
                                    <p className={`text-3xl font-bold ${daysRemaining > 0 ? 'text-[#028090]' : 'text-red-500'}`}>
                                        {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                                    </p>
                                    <p className="text-lg text-gray-600">
                                        {daysRemaining > 0 ? 'days remaining' : `by ${Math.abs(daysRemaining)} days`}
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between text-lg text-gray-500">
                                        <span>Time Progress</span>
                                        <span>{Math.round(timeProgress)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${timeProgress > goal.progress ? 'bg-orange-400' : 'bg-[#02c39a]'
                                                }`}
                                            style={{ width: `${timeProgress}%` }}
                                        />
                                    </div>
                                    {prediction && (
                                        <div className={`p-2 rounded-lg mt-2 ${prediction.onTrack ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                                            <p className={`text-lg font-medium ${prediction.onTrack ? 'text-green-700' : 'text-orange-700'}`}>
                                                {prediction.onTrack ? '✅ On Track!' : '⚠️ Behind Schedule'} - Predicted finish: {prediction.date.toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                                    <Clock className="w-4 h-4 text-[#00a896]" />
                                    Progress Tracking
                                </h4>
                                <div className="text-center py-2">
                                    <p className="text-lg text-gray-600">No deadline set</p>
                                    <p className="text-lg text-gray-500 mt-1">Track your progress at your own pace</p>
                                </div>
                            </div>
                        )}

                        {/* Notes Section (moved here for fixed side) */}
                        {goal.notes && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2">📝 Goal Notes</h4>
                                <p className="text-lg text-gray-600">{goal.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Pane: Scrollable Content (Chart & Analysis) */}
                    <div className="w-full md:w-2/3 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                        {/* Monthly Timeline Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#00a896]" />
                                    Progress Timeline
                                </h4>
                                <button
                                    onClick={() => setShowAddEntry(!showAddEntry)}
                                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-lg font-medium text-[#028090] hover:bg-[#f0f3bd]/50 rounded-lg transition-colors w-fit"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Entry
                                </button>
                            </div>

                            {showAddEntry && (
                                <div className="mb-4 p-4 bg-[#f0f3bd]/30 rounded-lg border border-[#02c39a]/20">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-lg font-medium text-gray-700 mb-1">Value</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] text-lg"
                                                placeholder={`Enter ${goal.unit}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-lg font-medium text-gray-700 mb-1">Note (optional)</label>
                                            <input
                                                type="text"
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] text-lg"
                                                placeholder="Weekly check-in"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleAddEntry}
                                                disabled={!newValue || addingEntry}
                                                className="w-full px-4 py-2 bg-gradient-to-r from-[#00a896] to-[#028090] text-white rounded-lg font-medium text-lg hover:from-[#028090] hover:to-[#026f80] disabled:opacity-50 transition-all flex items-center justify-center"
                                            >
                                                {addingEntry ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    'Add Entry'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {chartData.length > 1 ? (
                                <div className="w-full h-[180px] sm:h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00a896" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#00a896" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                                domain={['dataMin - 10', 'dataMax + 10']}
                                                width={35}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                }}
                                                formatter={(value, name) => [
                                                    `${value} ${goal.unit}`,
                                                    name === 'value' ? 'Reading' : name
                                                ]}
                                            />
                                            <ReferenceLine
                                                y={goal.targetValue}
                                                stroke="#028090"
                                                strokeDasharray="5 5"
                                                label={{ value: 'Target', position: 'right', fill: '#028090', fontSize: 10 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#00a896"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorProgress)"
                                                dot={{ fill: '#00a896', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, fill: '#028090' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-40 sm:h-48 flex flex-col items-center justify-center text-gray-500">
                                    <Activity className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-30" />
                                    <p className="text-lg sm:text-lg">Not enough data to show timeline</p>
                                    <p className="text-lg text-gray-400">Add more entries to see your progress chart</p>
                                </div>
                            )}

                            {/* Milestones List */}
                            {goal.milestones && goal.milestones.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#00a896]" />
                                        Milestone History ({goal.milestones.length} entries)
                                    </h5>
                                    <div className="space-y-3 max-h-60  overflow-y-auto  overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
                                        {[...goal.milestones].reverse().map((m, reversedIdx) => {
                                            const actualIndex = goal.milestones.length - 1 - reversedIdx;
                                            const isEditing = editingMilestone === actualIndex;

                                            return (
                                                <div key={reversedIdx} className="py-3 px-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                    {isEditing ? (
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-lg font-medium text-gray-600 mb-1">Value</label>
                                                                    <input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] text-lg"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-lg font-medium text-gray-600 mb-1">Note</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editNote}
                                                                        onChange={(e) => setEditNote(e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] text-lg"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 justify-end">
                                                                <button
                                                                    onClick={() => setEditingMilestone(null)}
                                                                    className="px-3 py-1.5 text-lg text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={handleSaveEdit}
                                                                    disabled={savingEdit || !editValue}
                                                                    className="px-3 py-1.5 text-lg bg-[#00a896] text-white rounded-lg hover:bg-[#028090] disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                                                >
                                                                    {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-3 h-3 rounded-full bg-[#00a896] flex-shrink-0" />
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-lg font-bold text-[#028090]">
                                                                        {m.value}
                                                                    </span>
                                                                    <span className="text-lg text-gray-600 font-medium">
                                                                        {goal.unit}
                                                                    </span>
                                                                </div>
                                                                {m.note && (
                                                                    <span className="text-lg text-gray-500 ml-4 hidden sm:inline-block">
                                                                        • {m.note}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-medium text-gray-600 flex-shrink-0">
                                                                    {new Date(m.date).toLocaleDateString()}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleEditMilestone(m, actualIndex)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                                                    title="Edit entry"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMilestone(actualIndex)}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                                                    title="Delete entry"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AI Analysis Section */}
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    AI Health Analysis
                                </h4>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="flex items-center  cursor-pointer gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium text-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Analyze with Gemini
                                        </>
                                    )}
                                </button>
                            </div>

                            {aiAnalysis ? (
                                <div className="space-y-4">
                                    {/* Progress Assessment */}
                                    <div className="bg-white/80 rounded-lg p-4">
                                        <h5 className="font-medium text-lg text-purple-900 mb-2 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Progress Assessment
                                        </h5>
                                        <p className="text-lg text-gray-700">{aiAnalysis.assessment}</p>
                                    </div>

                                    {/* Prediction */}
                                    {aiAnalysis.prediction && (
                                        <div className="bg-white/80 rounded-lg p-4">
                                            <h5 className="font-medium text-lg text-purple-900 mb-2 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Prediction
                                            </h5>
                                            <p className="text-lg text-gray-700">{aiAnalysis.prediction}</p>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                                        <div className="bg-white/80 rounded-lg p-4">
                                            <h5 className="font-medium text-lg text-purple-900 mb-2">💡 Recommendations</h5>
                                            <ul className="space-y-2">
                                                {aiAnalysis.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-lg text-gray-700">
                                                        <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Diet & Lifestyle */}
                                    {aiAnalysis.lifestyle && aiAnalysis.lifestyle.length > 0 && (
                                        <div className="bg-white/80 rounded-lg p-4">
                                            <h5 className="font-medium text-lg text-purple-900 mb-2">🥗 Diet & Lifestyle Tips</h5>
                                            <ul className="space-y-2">
                                                {aiAnalysis.lifestyle.map((tip, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-lg text-gray-700">
                                                        <span className="text-green-500">•</span>
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Warnings */}
                                    {aiAnalysis.warnings && aiAnalysis.warnings.length > 0 && (
                                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                            <h5 className="font-medium text-lg text-red-900 mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                Things to Watch
                                            </h5>
                                            <ul className="space-y-1">
                                                {aiAnalysis.warnings.map((warning, idx) => (
                                                    <li key={idx} className="text-lg text-red-700">• {warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                                    <p className="text-lg text-gray-600 cursor-pointer">
                                        Click "Analyze with Gemini" to get personalized insights about your goal progress
                                    </p>
                                    <p className="text-lg text-gray-400 mt-1">
                                        AI will analyze your progress and provide recommendations
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div >

                {/* Footer */}
                < div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0" >
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 cursor-pointer text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div >
            </div >
        </div >
    );
};

export default GoalDetailModal;