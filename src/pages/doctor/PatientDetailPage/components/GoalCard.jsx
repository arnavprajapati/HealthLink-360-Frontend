import React from 'react';
import {
    Eye,
    Trophy,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    ChevronRight
} from 'lucide-react';

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
                    <button
                        onClick={() => onView(goal)}
                        className="p-2 cursor-pointer text-[#00a896] hover:bg-[#f0f3bd] rounded-full transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>

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

export default GoalCard;