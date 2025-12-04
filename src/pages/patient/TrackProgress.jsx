import React, { useState, useEffect } from 'react';
import {
    Target, Plus, TrendingUp, TrendingDown, Activity,
    Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2,
    Award, BarChart3, Filter, X, Eye, Sparkles, ChevronRight,
    Zap, Trophy, Flame, CalendarCheck
} from 'lucide-react';
import { useGoals } from '../../context/GoalsContext';
import GoalDetailModal from './GoalDetailModal';

const SetGoalModal = ({ onClose, onSuccess, editingGoal = null }) => {
    const { createGoal, editGoal, loading, checkGoogleCalendarStatus, createGoogleCalendarEvent, googleCalendarConnected } = useGoals();
    const [formData, setFormData] = useState({
        parameter: editingGoal?.parameter || 'Blood Sugar',
        parameterKey: editingGoal?.parameterKey || 'blood_sugar',
        customParameterName: editingGoal?.customParameterName || '',
        initialValue: editingGoal?.initialValue || '',
        targetValue: editingGoal?.targetValue || '',
        minValue: editingGoal?.minValue || '',
        maxValue: editingGoal?.maxValue || '',
        unit: editingGoal?.unit || 'mg/dL',
        goalType: editingGoal?.goalType || 'decrease',
        trackingFrequency: editingGoal?.trackingFrequency || 'daily',
        deadline: editingGoal?.deadline ? new Date(editingGoal.deadline).toISOString().split('T')[0] : '',
        notes: editingGoal?.notes || ''
    });
    const [errors, setErrors] = useState({});
    const [goalMode, setGoalMode] = useState(
        editingGoal?.minValue || editingGoal?.maxValue ? 'range' : 'fixed'
    );
    const [syncToCalendar, setSyncToCalendar] = useState(editingGoal?.syncToGoogleCalendar || false);
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);

    // Check Google Calendar connection on mount
    useEffect(() => {
        const checkCalendar = async () => {
            const connected = await checkGoogleCalendarStatus();
            setIsCalendarConnected(connected);
        };
        checkCalendar();
    }, [checkGoogleCalendarStatus]);

    const isWeeklyGoal = formData.trackingFrequency === 'weekly';

    const parameters = [
        { name: 'Blood Sugar', key: 'blood_sugar', unit: 'mg/dL', defaultGoal: 'decrease', icon: '🩸' },
        { name: 'Blood Pressure Systolic', key: 'bp_systolic', unit: 'mmHg', defaultGoal: 'decrease', icon: '❤️' },
        { name: 'Blood Pressure Diastolic', key: 'bp_diastolic', unit: 'mmHg', defaultGoal: 'decrease', icon: '💓' },
        { name: 'Hemoglobin', key: 'hemoglobin', unit: 'g/dL', defaultGoal: 'increase', icon: '🔴' },
        { name: 'Cholesterol', key: 'cholesterol', unit: 'mg/dL', defaultGoal: 'decrease', icon: '🫀' },
        { name: 'Weight', key: 'weight', unit: 'kg', defaultGoal: 'decrease', icon: '⚖️' },
        { name: 'BMI', key: 'bmi', unit: 'kg/m²', defaultGoal: 'decrease', icon: '📊' },
        { name: 'Creatinine', key: 'creatinine', unit: 'mg/dL', defaultGoal: 'decrease', icon: '🧪' },
        { name: 'TSH', key: 'tsh', unit: 'mIU/L', defaultGoal: 'maintain', icon: '🦋' },
        { name: 'Other', key: 'custom', unit: '', defaultGoal: 'maintain', icon: '➕' }
    ];

    const isCustomParameter = formData.parameterKey === 'custom';

    const handleParameterChange = (param) => {
        const selected = parameters.find(p => p.name === param);
        if (selected.key === 'custom') {
            setFormData({
                ...formData,
                parameter: param,
                parameterKey: 'custom',
                customParameterName: '',
                unit: '',
                goalType: selected.defaultGoal
            });
        } else {
            setFormData({
                ...formData,
                parameter: param,
                parameterKey: selected.key,
                customParameterName: '',
                unit: selected.unit,
                goalType: selected.defaultGoal
            });
        }
        // Clear custom field errors
        if (errors.customParameterName || errors.customUnit) {
            setErrors({ ...errors, customParameterName: '', customUnit: '' });
        }
    };

    const handleSubmit = async () => {
        // Validate based on goal mode
        const newErrors = {};

        // Validate custom parameter fields when "Other" is selected
        if (isCustomParameter) {
            if (!formData.customParameterName || !formData.customParameterName.trim()) {
                newErrors.customParameterName = 'Custom parameter name is required';
            }
            if (!formData.unit || !formData.unit.trim()) {
                newErrors.customUnit = 'Unit is required for custom parameters';
            }
        }

        const hasTarget = formData.targetValue !== '' && formData.targetValue !== null;
        const hasMin = formData.minValue !== '' && formData.minValue !== null;
        const hasMax = formData.maxValue !== '' && formData.maxValue !== null;
        const hasRange = hasMin || hasMax;
        const hasInitial = formData.initialValue !== '' && formData.initialValue !== null;

        // Must have either target OR range
        if (!hasTarget && !hasRange) {
            newErrors.general = 'Please provide either a Target Value OR a Min/Max range';
        }

        // For fixed goals, require initial value
        if (goalMode === 'fixed' && hasTarget && !hasInitial) {
            newErrors.initialValue = 'Initial value is required for fixed target goals';
        }

        // Validate min < max
        if (hasMin && hasMax && parseFloat(formData.minValue) >= parseFloat(formData.maxValue)) {
            newErrors.minValue = 'Min must be less than Max';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            const submitData = {
                ...formData,
                parameter: isCustomParameter ? formData.customParameterName.trim() : formData.parameter,
                parameterKey: isCustomParameter ? 'custom' : formData.parameterKey,
                customParameterName: isCustomParameter ? formData.customParameterName.trim() : null,
                unit: formData.unit.trim(),
                syncToGoogleCalendar: syncToCalendar && isWeeklyGoal,
            };
            if (goalMode === 'fixed') {
                submitData.minValue = '';
                submitData.maxValue = '';
            } else if (goalMode === 'range') {
            }

            let savedGoal;
            if (editingGoal) {
                savedGoal = await editGoal(editingGoal._id, submitData);
            } else {
                savedGoal = await createGoal(submitData);
            }

            // Create Google Calendar event if sync is enabled and it's a weekly goal
            if (syncToCalendar && isWeeklyGoal && isCalendarConnected && savedGoal && !editingGoal?.googleEventId) {
                try {
                    const startDate = new Date();
                    startDate.setHours(9, 0, 0, 0); // 9 AM
                    const endDate = new Date(startDate);
                    endDate.setHours(10, 0, 0, 0); // 10 AM

                    await createGoogleCalendarEvent({
                        title: `Health Goal: ${submitData.parameter}`,
                        description: `Weekly health goal tracking for ${submitData.parameter}. Target: ${submitData.targetValue || `${submitData.minValue}-${submitData.maxValue}`} ${submitData.unit}`,
                        startDateTime: startDate.toISOString(),
                        endDateTime: endDate.toISOString(),
                        recurrence: 'RRULE:FREQ=WEEKLY',
                        goalId: savedGoal._id
                    });
                } catch (calendarError) {
                    console.error('Failed to sync with Google Calendar:', calendarError);
                    // Don't fail the goal creation if calendar sync fails
                }
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save goal:', error);
        }
    };

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    const minDateStr = minDate.toISOString().split('T')[0];

    const selectedParam = parameters.find(p => p.name === formData.parameter);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[50vw] max-h-[90vh] overflow-y-auto overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" >
                <div className="sticky top-0 bg-gradient-to-r from-[#00a896] to-[#028090] px-6 py-5 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <Target className="w-6 h-6 mr-2" />
                            {editingGoal ? 'Edit Health Goal' : 'Set New Health Goal'}
                        </h2>
                        <p className="text-white/80 text-lg mt-1">
                            Define your target and track progress automatically
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 cursor-pointer rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-[#f0f3bd]/30 border border-[#02c39a]/30 rounded-lg p-4">
                        <p className="text-lg text-[#028090]">
                            💡 <span className="font-semibold">Tip:</span> Your goals will be automatically updated when you add new health logs!
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            📊 Health Parameter *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {parameters.map(param => (
                                <button
                                    key={param.name}
                                    onClick={() => handleParameterChange(param.name)}
                                    disabled={!!editingGoal}
                                    className={`p-3 cursor-pointer rounded-lg border-2 transition-all text-left ${formData.parameter === param.name
                                        ? 'border-[#00a896] bg-[#f0f3bd]/30 text-[#028090]'
                                        : 'border-gray-200 hover:border-[#00a896]/50'
                                        } ${editingGoal ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <span className="text-lg">{param.icon}</span>
                                    <p className="text-lg font-medium mt-1 truncate">{param.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Parameter Fields - Only shown when "Other" is selected */}
                    {isCustomParameter && (
                        <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-lg text-amber-800 font-medium">
                                ✏️ Define your custom health metric
                            </p>
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    🏷️ Custom Parameter Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.customParameterName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, customParameterName: e.target.value });
                                        if (errors.customParameterName) setErrors({ ...errors, customParameterName: '' });
                                    }}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] ${errors.customParameterName ? 'border-red-400' : 'border-gray-300'}`}
                                    placeholder="e.g., Uric Acid, Vitamin D, CRP, Liver Enzyme..."
                                />
                                {errors.customParameterName && (
                                    <p className="text-lg text-red-500 mt-1">{errors.customParameterName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    📏 Unit *
                                </label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => {
                                        setFormData({ ...formData, unit: e.target.value });
                                        if (errors.customUnit) setErrors({ ...errors, customUnit: '' });
                                    }}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] ${errors.customUnit ? 'border-red-400' : 'border-gray-300'}`}
                                    placeholder="e.g., mg/dL, IU/mL, ng/mL, mmol/L..."
                                />
                                {errors.customUnit && (
                                    <p className="text-lg text-red-500 mt-1">{errors.customUnit}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            🎯 Goal Type *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['decrease', 'increase', 'maintain'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, goalType: type })}
                                    disabled={goalMode === 'range'}
                                    className={`flex flex-col cursor-pointer items-center justify-center p-4 rounded-lg border-2 transition-all ${formData.goalType === type
                                        ? 'border-[#00a896] bg-[#f0f3bd]/30 text-[#028090]'
                                        : 'border-gray-300 hover:border-[#00a896]/50'
                                        } ${goalMode === 'range' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {type === 'decrease' && <TrendingDown className="w-5 h-5" />}
                                    {type === 'increase' && <TrendingUp className="w-5 h-5" />}
                                    {type === 'maintain' && <Activity className="w-5 h-5" />}
                                    <span className="mt-2 text-lg font-medium capitalize">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Goal Mode Selector */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            📋 Goal Mode
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setGoalMode('fixed')}
                                className={`p-3 cursor-pointer rounded-lg border-2 transition-all text-left ${goalMode === 'fixed'
                                    ? 'border-[#00a896] bg-[#f0f3bd]/30 text-[#028090]'
                                    : 'border-gray-200 hover:border-[#00a896]/50'
                                    }`}
                            >
                                <p className="font-semibold">🎯 Fixed Goal</p>
                                <p className="text-lg text-gray-500 mt-1">Initial → Target value</p>
                            </button>
                            <button
                                onClick={() => setGoalMode('range')}
                                className={`p-3 cursor-pointer rounded-lg border-2 transition-all text-left ${goalMode === 'range'
                                    ? 'border-[#00a896] bg-[#f0f3bd]/30 text-[#028090]'
                                    : 'border-gray-200 hover:border-[#00a896]/50'
                                    }`}
                            >
                                <p className="font-semibold">📊 Range Goal</p>
                                <p className="text-lg text-gray-500 mt-1">Stay within Min-Max</p>
                            </button>
                        </div>
                        <p className="text-lg text-gray-500 mt-2">
                            {goalMode === 'fixed'
                                ? '💡 For normal goals, enter Initial + Target value.'
                                : '💡 For balance goals (like blood sugar), enter Min/Max range.'}
                        </p>
                    </div>

                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-lg text-red-600">{errors.general}</p>
                        </div>
                    )}

                    {/* Initial Value - shown for fixed mode or optionally for range */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            📍 Initial Value {goalMode === 'fixed' ? '*' : '(Optional)'}
                        </label>
                        <div className="flex items-center space-x-3">
                            <input
                                type="number"
                                step="0.1"
                                value={formData.initialValue}
                                onChange={(e) => {
                                    setFormData({ ...formData, initialValue: e.target.value });
                                    if (errors.initialValue) setErrors({ ...errors, initialValue: '' });
                                }}
                                className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] ${errors.initialValue ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Enter your current/starting value"
                            />
                            <span className="px-4 py-3 bg-[#f0f3bd] border-2 border-[#02c39a]/30 rounded-lg font-semibold text-[#028090]">
                                {formData.unit}
                            </span>
                        </div>
                        {errors.initialValue && (
                            <p className="text-lg text-red-500 mt-1">{errors.initialValue}</p>
                        )}
                        <p className="text-lg text-gray-500 mt-1">
                            Your starting point for this goal
                        </p>
                    </div>

                    {/* Target Value - for fixed mode */}
                    {goalMode === 'fixed' && (
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                🎯 Target Value (Optional)
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.targetValue}
                                    onChange={(e) => {
                                        setFormData({ ...formData, targetValue: e.target.value });
                                        if (errors.targetValue) setErrors({ ...errors, targetValue: '' });
                                    }}
                                    className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] ${errors.targetValue ? 'border-red-400' : 'border-gray-300'}`}
                                    placeholder="Enter target value"
                                />
                                <span className="px-4 py-3 bg-[#f0f3bd] border-2 border-[#02c39a]/30 rounded-lg font-semibold text-[#028090]">
                                    {formData.unit}
                                </span>
                            </div>
                            {errors.targetValue && (
                                <p className="text-lg text-red-500 mt-1">{errors.targetValue}</p>
                            )}
                            <p className="text-lg text-gray-500 mt-1">
                                Leave empty if you just want to track without a specific target
                            </p>
                        </div>
                    )}

                    {/* Min/Max Range - for range mode */}
                    {goalMode === 'range' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    📉 Min Value (Optional)
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.minValue}
                                        onChange={(e) => {
                                            setFormData({ ...formData, minValue: e.target.value });
                                            if (errors.minValue) setErrors({ ...errors, minValue: '' });
                                        }}
                                        className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] ${errors.minValue ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="Minimum acceptable value"
                                    />
                                    <span className="px-4 py-3 bg-[#f0f3bd] border-2 border-[#02c39a]/30 rounded-lg font-semibold text-[#028090]">
                                        {formData.unit}
                                    </span>
                                </div>
                                {errors.minValue && (
                                    <p className="text-lg text-red-500 mt-1">{errors.minValue}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    📈 Max Value (Optional)
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.maxValue}
                                        onChange={(e) => {
                                            setFormData({ ...formData, maxValue: e.target.value });
                                            if (errors.maxValue) setErrors({ ...errors, maxValue: '' });
                                        }}
                                        className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] ${errors.maxValue ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="Maximum acceptable value"
                                    />
                                    <span className="px-4 py-3 bg-[#f0f3bd] border-2 border-[#02c39a]/30 rounded-lg font-semibold text-[#028090]">
                                        {formData.unit}
                                    </span>
                                </div>
                                {errors.maxValue && (
                                    <p className="text-lg text-red-500 mt-1">{errors.maxValue}</p>
                                )}
                            </div>
                            <p className="text-lg text-gray-500">
                                At least one (min or max) is required for range goals
                            </p>
                        </div>
                    )}

                    {/* Tracking Frequency */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            🔄 Tracking Frequency
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['daily', 'weekly', 'monthly'].map(freq => (
                                <button
                                    key={freq}
                                    onClick={() => setFormData({ ...formData, trackingFrequency: freq })}
                                    className={`p-3 cursor-pointer rounded-lg border-2 transition-all text-center ${formData.trackingFrequency === freq
                                        ? 'border-[#00a896] bg-[#f0f3bd]/30 text-[#028090]'
                                        : 'border-gray-200 hover:border-[#00a896]/50'
                                        }`}
                                >
                                    <span className="text-lg font-medium capitalize">{freq}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-lg text-gray-500 mt-1">
                            How often you want to track this metric
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 mr-2 inline" />
                            Target Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            min={minDateStr}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896]"
                        />
                        <p className="text-lg text-gray-500 mt-1">
                            Leave empty to track progress without a deadline
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            📝 Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] resize-none"
                            placeholder="Why is this goal important to you?"
                        />
                    </div>

                    {/* Google Calendar Sync Toggle - Only for weekly goals */}
                    {isWeeklyGoal && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CalendarCheck className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Sync to Google Calendar</p>
                                        <p className="text-sm text-gray-600">
                                            {isCalendarConnected
                                                ? 'Create a recurring weekly reminder'
                                                : 'Connect Google Calendar in Settings to enable'}
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={syncToCalendar}
                                        onChange={(e) => setSyncToCalendar(e.target.checked)}
                                        disabled={!isCalendarConnected}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${isCalendarConnected
                                            ? 'bg-gray-300 peer-checked:bg-[#00a896]'
                                            : 'bg-gray-200 cursor-not-allowed'
                                        }`}></div>
                                </label>
                            </div>
                            {!isCalendarConnected && (
                                <p className="text-xs text-blue-600 mt-2">
                                    💡 Go to <a href="/calendar" className="underline font-medium">Calendar</a> page to connect your Google Calendar
                                </p>
                            )}
                        </div>
                    )}

                    {/* Preview */}
                    <div className="bg-gradient-to-r from-[#f0f3bd]/50 to-[#02c39a]/10 rounded-lg p-4 border border-[#02c39a]/30">
                        <h4 className="font-semibold text-[#028090] mb-2">📈 Your Goal Preview</h4>
                        <p className="text-lg text-gray-700">
                            {goalMode === 'fixed' ? (
                                <>
                                    <span className="font-semibold capitalize">{formData.goalType}</span> your{' '}
                                    <span className="font-semibold">{formData.parameter}</span>
                                    {formData.initialValue && (
                                        <> from <span className="font-semibold text-gray-600">{formData.initialValue} {formData.unit}</span></>
                                    )}
                                    {formData.targetValue && (
                                        <> to <span className="font-semibold text-[#00a896]">{formData.targetValue} {formData.unit}</span></>
                                    )}
                                </>
                            ) : (
                                <>
                                    Keep <span className="font-semibold">{formData.parameter}</span> within range:{' '}
                                    {formData.minValue && <span className="font-semibold text-[#00a896]">{formData.minValue}</span>}
                                    {formData.minValue && formData.maxValue && ' - '}
                                    {formData.maxValue && <span className="font-semibold text-[#00a896]">{formData.maxValue}</span>}
                                    {!formData.minValue && formData.maxValue && <> (max {formData.maxValue})</>}
                                    {formData.minValue && !formData.maxValue && <> (min {formData.minValue})</>}
                                    {' '}{formData.unit}
                                </>
                            )}
                            {formData.deadline && (
                                <> by <span className="font-semibold">{new Date(formData.deadline).toLocaleDateString()}</span></>
                            )}
                            {!formData.deadline && (
                                <span className="text-gray-500"> (no deadline)</span>
                            )}
                            <br />
                            <span className="text-lg text-gray-500">Tracking: {formData.trackingFrequency}</span>
                        </p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 cursor-pointer rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 cursor-pointer bg-gradient-to-r from-[#00a896] to-[#028090] text-white py-3 px-4 sm:px-6 rounded-lg hover:from-[#028090] hover:to-[#026f80] flex items-center justify-center font-medium transition-colors shadow-md disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Target className="mr-2" size={20} />
                                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Goal Card Component
const GoalCard = ({ goal, onEdit, onDelete, onView }) => {
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
                    <div className="flex items-center gap-1  transition-opacity">
                        <button
                            onClick={() => onView(goal)}
                            className="p-2 cursor-pointer text-[#00a896] hover:bg-[#f0f3bd] rounded-full transition-colors"
                            title="View Details"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onEdit(goal)}
                            className="p-2 cursor-pointer text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit Goal"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(goal._id)}
                            className="p-2 cursor-pointer text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Goal"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
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
                                stroke="url(#progressGradient)"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(goal.progress / 100) * 226} 226`}
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                        {/* Show Initial Value */}
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
                        {/* Show Target or Range */}
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
                            <span className="font-medium text-gray-700 capitalize flex items-center gap-1">
                                {goal.goalType === 'decrease' && <TrendingDown className="w-3 h-3 text-red-500" />}
                                {goal.goalType === 'increase' && <TrendingUp className="w-3 h-3 text-green-500" />}
                                {goal.goalType === 'maintain' && <Activity className="w-3 h-3 text-blue-500" />}
                                {goal.goalType === 'range' && <BarChart3 className="w-3 h-3 text-purple-500" />}
                                {goal.goalType}
                            </span>
                        </div>
                        {/* Show Tracking Frequency */}
                        {goal.trackingFrequency && goal.trackingFrequency !== 'daily' && (
                            <div className="flex justify-between items-center">
                                <span className="text-lg text-gray-500">Tracking</span>
                                <span className="text-lg font-medium text-gray-600 capitalize">{goal.trackingFrequency}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline - Only show if deadline exists */}
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

                {/* Milestones Preview and View Details Button */}
                <button
                    onClick={() => onView(goal)}
                    className="w-full py-2.5 text-lg font-semibold bg-gray-100 text-[#028090] hover:bg-[#f0f3bd]/80 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                    <Eye className="w-4 h-4" />
                    View Details & Analysis ({goal.milestones ? goal.milestones.length : 0} Entries)
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Main Component
const TrackProgress = () => {
    const { goals, stats, loading, getGoals, getGoalStats, deleteGoal, addMilestone, editMilestone, deleteMilestone, analyzeGoal } = useGoals();
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await Promise.all([
                getGoals(filterStatus),
                getGoalStats()
            ]);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleFilterChange = async (status) => {
        setFilterStatus(status);
        await getGoals(status);
    };

    const handleDeleteGoal = async (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await deleteGoal(id);
                await loadData();
            } catch (error) {
                console.error('Failed to delete goal:', error);
            }
        }
    };

    const handleEditGoal = (goal) => {
        setEditingGoal(goal);
        setShowGoalModal(true);
    };

    const handleViewGoal = (goal) => {
        setSelectedGoal(goal);
    };

    const handleModalClose = () => {
        setShowGoalModal(false);
        setEditingGoal(null);
    };

    const handleGoalSuccess = () => {
        loadData();
    };

    const handleAddMilestone = async (goalId, milestoneData) => {
        try {
            const updatedGoal = await addMilestone(goalId, milestoneData);
            if (updatedGoal) {
                setSelectedGoal(updatedGoal);
            }
            loadData();
        } catch (error) {
            console.error('Failed to add milestone:', error);
        }
    };

    const handleEditMilestone = async (goalId, milestoneIndex, milestoneData) => {
        try {
            const updatedGoal = await editMilestone(goalId, milestoneIndex, milestoneData);
            if (updatedGoal) {
                setSelectedGoal(updatedGoal);
            }
            loadData();
        } catch (error) {
            console.error('Failed to edit milestone:', error);
        }
    };

    const handleDeleteMilestone = async (goalId, milestoneIndex) => {
        try {
            const updatedGoal = await deleteMilestone(goalId, milestoneIndex);
            if (updatedGoal) {
                setSelectedGoal(updatedGoal);
            }
            loadData();
        } catch (error) {
            console.error('Failed to delete milestone:', error);
        }
    };

    const handleAnalyzeGoal = async (goalId) => {
        try {
            return await analyzeGoal(goalId);
        } catch (error) {
            console.error('Failed to analyze goal:', error);
            throw error;
        }
    };

    if (loading && !goals.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00a896] border-t-transparent"></div>
                    <p className="text-gray-600">Loading your goals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00a896] to-[#028090] rounded-2xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Target className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <span>Track Your<br className="sm:hidden" /> Progress</span>
                        </h1>
                        <p className="text-white/80 mt-2 text-lg sm:text-lg">
                            Set health goals, track milestones, and get AI-powered insights
                        </p>
                    </div>
                    <button
                        onClick={() => setShowGoalModal(true)}
                        className="flex cursor-pointer items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-[#028090] rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-lg text-lg sm:text-lg w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        Set New Goal
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg sm:text-lg text-gray-600 font-medium">Total Goals</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-[#f0f3bd] rounded-xl">
                                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#028090]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg sm:text-lg text-gray-600 font-medium">In Progress</p>
                                <p className="text-2xl sm:text-3xl font-bold text-[#00a896]">{stats.inProgress}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-[#f0f3bd] rounded-xl">
                                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#028090]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg sm:text-lg text-gray-600 font-medium">Achieved</p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.achieved}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg sm:text-lg text-gray-600 font-medium">Expired</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-500">{stats.expired}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-gray-100 rounded-xl">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg sm:text-lg text-gray-600 font-medium">Avg Progress</p>
                                <p className="text-2xl sm:text-3xl font-bold text-[#028090]">{stats.averageProgress}%</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-[#f0f3bd] rounded-xl">
                                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#028090]" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-sm overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-lg sm:text-lg font-medium text-gray-700 flex-shrink-0">Filter:</span>
                <div className="flex gap-2 flex-shrink-0">
                    {['all', 'in-progress', 'achieved', 'expired'].map(status => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer rounded-lg text-lg sm:text-lg font-medium transition-all whitespace-nowrap ${filterStatus === status
                                ? 'bg-gradient-to-r from-[#00a896] to-[#028090] text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'All Goals' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-[#f0f3bd] rounded-full flex items-center justify-center">
                        <Target className="w-10 h-10 text-[#028090]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Health Goals Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Start your health journey by setting your first goal. Track progress, get AI insights, and achieve your health targets!
                    </p>
                    <button
                        onClick={() => setShowGoalModal(true)}
                        className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00a896] to-[#028090] text-white rounded-xl hover:from-[#028090] hover:to-[#026f80] transition-colors font-semibold shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Set Your First Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <GoalCard
                            key={goal._id}
                            goal={goal}
                            onEdit={handleEditGoal}
                            onDelete={handleDeleteGoal}
                            onView={handleViewGoal}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showGoalModal && (
                <SetGoalModal
                    onClose={handleModalClose}
                    onSuccess={handleGoalSuccess}
                    editingGoal={editingGoal}
                />
            )}

            {selectedGoal && (
                <GoalDetailModal
                    goal={selectedGoal}
                    onClose={() => setSelectedGoal(null)}
                    onAddMilestone={handleAddMilestone}
                    onEditMilestone={handleEditMilestone}
                    onDeleteMilestone={handleDeleteMilestone}
                    onAnalyze={handleAnalyzeGoal}
                />
            )}
        </div>
    );
};

export default TrackProgress;