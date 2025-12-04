import React, { useState } from 'react';
import { Target, X, Calendar, TrendingDown, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { useGoals } from '../../context/GoalsContext';

const GoalSettingModal = ({ onClose, onSuccess }) => {
    const { createGoal, loading: contextLoading } = useGoals();
    const [goalMode, setGoalMode] = useState('fixed');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        parameter: 'Blood Sugar',
        parameterKey: 'blood_sugar',
        customParameterName: '',
        initialValue: '',
        targetValue: '',
        minValue: '',
        maxValue: '',
        unit: 'mg/dL',
        goalType: 'decrease',
        trackingFrequency: 'daily',
        deadline: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});

    const parameters = [
        { name: 'Blood Sugar', key: 'blood_sugar', unit: 'mg/dL', defaultGoal: 'decrease' },
        { name: 'Blood Pressure (Systolic)', key: 'bp_systolic', unit: 'mmHg', defaultGoal: 'decrease' },
        { name: 'Blood Pressure (Diastolic)', key: 'bp_diastolic', unit: 'mmHg', defaultGoal: 'decrease' },
        { name: 'Hemoglobin', key: 'hemoglobin', unit: 'g/dL', defaultGoal: 'increase' },
        { name: 'Cholesterol', key: 'cholesterol', unit: 'mg/dL', defaultGoal: 'decrease' },
        { name: 'Weight', key: 'weight', unit: 'kg', defaultGoal: 'decrease' },
        { name: 'BMI', key: 'bmi', unit: 'kg/m²', defaultGoal: 'decrease' },
        { name: 'Creatinine', key: 'creatinine', unit: 'mg/dL', defaultGoal: 'decrease' },
        { name: 'TSH', key: 'tsh', unit: 'mIU/L', defaultGoal: 'maintain' },
        { name: 'Other', key: 'custom', unit: '', defaultGoal: 'maintain' }
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
        // Clear custom field errors when switching parameters
        if (errors.customParameterName || errors.customUnit) {
            setErrors({ ...errors, customParameterName: '', customUnit: '' });
        }
    };

    const handleSubmit = async () => {
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

        if (goalMode === 'fixed') {
            // Fixed goal requires initialValue and targetValue
            if (!formData.initialValue) {
                newErrors.initialValue = 'Initial value is required for fixed goals';
            }
            if (!formData.targetValue) {
                newErrors.targetValue = 'Target value is required for fixed goals';
            }
        } else {
            // Range goal requires at least one of minValue or maxValue
            if (!formData.minValue && !formData.maxValue) {
                newErrors.range = 'At least one range value (min or max) is required';
            }
            if (formData.minValue && formData.maxValue &&
                parseFloat(formData.minValue) >= parseFloat(formData.maxValue)) {
                newErrors.range = 'Minimum value must be less than maximum value';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        // Prepare data for submission
        const submitData = {
            ...formData,
            // For custom parameters, use the custom name as the parameter display name
            parameter: isCustomParameter ? formData.customParameterName.trim() : formData.parameter,
            parameterKey: isCustomParameter ? 'custom' : formData.parameterKey,
            customParameterName: isCustomParameter ? formData.customParameterName.trim() : null,
            unit: formData.unit.trim(),
            goalType: goalMode === 'range' ? 'range' : formData.goalType,
            initialValue: formData.initialValue || null,
            targetValue: goalMode === 'fixed' ? formData.targetValue : null,
            minValue: goalMode === 'range' ? (formData.minValue || null) : null,
            maxValue: goalMode === 'range' ? (formData.maxValue || null) : null,
        };

        try {
            setSubmitting(true);
            console.log('Creating goal:', submitData);

            await createGoal(submitData);
            onSuccess && onSuccess();
            onClose();

        } catch (error) {
            console.error('Failed to create goal:', error);
            alert(error.message || 'Failed to create goal. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getGoalTypeIcon = (type) => {
        switch (type) {
            case 'decrease': return <TrendingDown className="w-5 h-5" />;
            case 'increase': return <TrendingUp className="w-5 h-5" />;
            case 'maintain': return <Activity className="w-5 h-5" />;
            default: return <Target className="w-5 h-5" />;
        }
    };

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    const minDateStr = minDate.toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <Target className="w-6 h-6 mr-2" />
                            Set Health Goal
                        </h2>
                        <p className="text-purple-100 text-lg mt-1">
                            Define your target and track your progress
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-lg text-blue-800">
                            💡 <span className="font-semibold">Tip:</span> Set realistic, achievable goals.
                            We'll track your progress automatically with each health log you add.
                        </p>
                    </div>

                    {/* Goal Mode Selector */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            🎯 Goal Mode *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setGoalMode('fixed')}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${goalMode === 'fixed'
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-300 hover:border-purple-300'
                                    }`}
                            >
                                <Target className="w-5 h-5" />
                                <span className="mt-2 text-lg font-medium">Fixed Goal</span>
                                <span className="text-lg text-gray-500 mt-1">Track to specific target</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGoalMode('range')}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${goalMode === 'range'
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-300 hover:border-purple-300'
                                    }`}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span className="mt-2 text-lg font-medium">Range Goal</span>
                                <span className="text-lg text-gray-500 mt-1">Stay within a range</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            📊 Health Parameter *
                        </label>
                        <select
                            value={formData.parameter}
                            onChange={(e) => handleParameterChange(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {parameters.map(param => (
                                <option key={param.name} value={param.name}>
                                    {param.key === 'custom' ? param.name : `${param.name} (${param.unit})`}
                                </option>
                            ))}
                        </select>
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
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.customParameterName ? 'border-red-400' : 'border-gray-300'}`}
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
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.customUnit ? 'border-red-400' : 'border-gray-300'}`}
                                    placeholder="e.g., mg/dL, IU/mL, ng/mL, mmol/L..."
                                />
                                {errors.customUnit && (
                                    <p className="text-lg text-red-500 mt-1">{errors.customUnit}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Goal Type - Only for Fixed mode */}
                    {goalMode === 'fixed' && (
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                🎯 Goal Type *
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['decrease', 'increase', 'maintain'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData({ ...formData, goalType: type })}
                                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${formData.goalType === type
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-300 hover:border-purple-300'
                                            }`}
                                    >
                                        {getGoalTypeIcon(type)}
                                        <span className="mt-2 text-lg font-medium capitalize">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Initial Value - For Fixed mode */}
                    {goalMode === 'fixed' && (
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                📍 Initial Value *
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
                                    className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.initialValue ? 'border-red-400' : 'border-gray-300'}`}
                                    placeholder="Enter your current/starting value"
                                />
                                <span className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg font-semibold text-gray-700">
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
                    )}

                    {/* Target Value - For Fixed mode */}
                    {goalMode === 'fixed' && (
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                🎯 Target Value *
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
                                    className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.targetValue ? 'border-red-400' : 'border-gray-300'}`}
                                    placeholder="Enter target value"
                                />
                                <span className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg font-semibold text-gray-700">
                                    {formData.unit}
                                </span>
                            </div>
                            {errors.targetValue && (
                                <p className="text-lg text-red-500 mt-1">{errors.targetValue}</p>
                            )}
                            <p className="text-lg text-gray-500 mt-1">
                                {formData.goalType === 'decrease' && 'Enter a value lower than your current reading'}
                                {formData.goalType === 'increase' && 'Enter a value higher than your current reading'}
                                {formData.goalType === 'maintain' && 'Enter the value you want to maintain'}
                            </p>
                        </div>
                    )}

                    {/* Range Values - For Range mode */}
                    {goalMode === 'range' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    📉 Minimum Value
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.minValue}
                                        onChange={(e) => {
                                            setFormData({ ...formData, minValue: e.target.value });
                                            if (errors.range) setErrors({ ...errors, range: '' });
                                        }}
                                        className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.range ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="Lower bound of healthy range"
                                    />
                                    <span className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg font-semibold text-gray-700">
                                        {formData.unit}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    📈 Maximum Value
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.maxValue}
                                        onChange={(e) => {
                                            setFormData({ ...formData, maxValue: e.target.value });
                                            if (errors.range) setErrors({ ...errors, range: '' });
                                        }}
                                        className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.range ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="Upper bound of healthy range"
                                    />
                                    <span className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg font-semibold text-gray-700">
                                        {formData.unit}
                                    </span>
                                </div>
                            </div>
                            {errors.range && (
                                <p className="text-lg text-red-500">{errors.range}</p>
                            )}
                            <p className="text-lg text-gray-500">
                                Set the healthy range you want to maintain. You can specify just a minimum, just a maximum, or both.
                            </p>

                            {/* Optional Initial Value for Range */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    📍 Current Value (Optional)
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.initialValue}
                                        onChange={(e) => setFormData({ ...formData, initialValue: e.target.value })}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Your current value (optional)"
                                    />
                                    <span className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg font-semibold text-gray-700">
                                        {formData.unit}
                                    </span>
                                </div>
                            </div>
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
                                    type="button"
                                    onClick={() => setFormData({ ...formData, trackingFrequency: freq })}
                                    className={`p-3 rounded-lg border-2 transition-all text-lg font-medium capitalize ${formData.trackingFrequency === freq
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-300 hover:border-purple-300'
                                        }`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Target Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            min={minDateStr}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                            placeholder="Why is this goal important to you? Add any notes or motivation..."
                        />
                        <p className="text-lg text-gray-500 mt-1">
                            {formData.notes.length}/500 characters
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">📈 Your Goal Preview</h4>
                        <p className="text-lg text-purple-800">
                            {goalMode === 'fixed' ? (
                                <>
                                    <span className="font-semibold capitalize">{formData.goalType}</span> your{' '}
                                    <span className="font-semibold">{isCustomParameter ? (formData.customParameterName || 'Custom Metric') : formData.parameter}</span> from{' '}
                                    <span className="font-semibold">{formData.initialValue || '___'} {formData.unit || '___'}</span> to{' '}
                                    <span className="font-semibold">{formData.targetValue || '___'} {formData.unit || '___'}</span>
                                </>
                            ) : (
                                <>
                                    Keep <span className="font-semibold">{isCustomParameter ? (formData.customParameterName || 'Custom Metric') : formData.parameter}</span> within{' '}
                                    <span className="font-semibold">
                                        {formData.minValue && formData.maxValue
                                            ? `${formData.minValue} - ${formData.maxValue} ${formData.unit || '___'}`
                                            : formData.minValue
                                                ? `≥ ${formData.minValue} ${formData.unit || '___'}`
                                                : formData.maxValue
                                                    ? `≤ ${formData.maxValue} ${formData.unit || '___'}`
                                                    : '___ - ___ ' + (formData.unit || '___')
                                        }
                                    </span>
                                </>
                            )}
                            {formData.deadline && (
                                <> by <span className="font-semibold">
                                    {new Date(formData.deadline).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span></>
                            )}
                            {!formData.deadline && (
                                <span className="text-purple-600"> (no deadline)</span>
                            )}
                            {formData.trackingFrequency !== 'daily' && (
                                <span className="text-purple-600"> • Track {formData.trackingFrequency}</span>
                            )}
                        </p>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center font-medium transition-colors shadow-md disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Target className="mr-2" size={20} />
                                    Create Goal
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalSettingModal;