import React from 'react';
import { Calendar, Eye, Trash2, FileText } from 'lucide-react';
import { getDiseaseConfig } from '../../utils/diseaseConfig';

const HealthCard = ({ log, onViewDetails, onViewFullReport, onDelete, formatDate }) => {
    const config = getDiseaseConfig(log.diseaseType);

    const readingsArray = log.readings || [];
    const readings = readingsArray.reduce((acc, currentReading) => {
        acc[currentReading.testName] = currentReading.value;
        return acc;
    }, {});

    // Check if document is invalid (non-medical) - defined first as it's used by getDisplayTitle
    const isInvalidDocument = () => {
        const summary = log.aiAnalysis?.summary?.toLowerCase() || '';
        const hasNoMedicalData = summary.includes('resume') ||
            summary.includes('not contain any medical') ||
            summary.includes('no medical test') ||
            summary.includes('no health') ||
            (log.aiAnalysis?.riskLevel === 'low' && !log.readings?.length && !log.aiAnalysis?.detectedConditions?.length);
        return hasNoMedicalData;
    };

    // Get display title - for 'Other' type, use detected condition or first detected condition from AI
    const getDisplayTitle = () => {
        // First check if invalid document
        if (isInvalidDocument()) {
            return 'Invalid Document';
        }

        if (log.diseaseType !== 'other') return config.label;

        // Check if AI detected any conditions
        if (log.aiAnalysis?.detectedConditions?.length > 0) {
            return log.aiAnalysis.detectedConditions[0];
        }

        // Check detected disease
        if (log.detectedDisease && log.detectedDisease !== 'other') {
            return getDiseaseConfig(log.detectedDisease).label;
        }

        return 'Medical Report';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-[#f0f3bd] to-[#02c39a]/20 p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl">{config.icon}</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{getDisplayTitle()}</h3>
                            <p className="text-lg text-gray-500 flex items-center mt-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(log.testDate || log.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onViewFullReport && onViewFullReport(log)}
                            className="p-2 text-purple-600 cursor-pointer hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Full Report"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onViewDetails(log)}
                            className="p-2 text-[#00a896] cursor-pointer hover:bg-[#f0f3bd] rounded-lg transition-colors"
                            title="Quick View"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(log._id)}
                            className="p-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
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
                                <p className="text-lg text-gray-600 mb-1">{config.fields[0].label}</p>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-[#028090]">
                                        {readings[config.fields[0].name]}
                                    </span>
                                    <span className="ml-2 text-xl text-gray-600">
                                        {config.fields[0].unit}
                                    </span>
                                </div>

                                <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-lg font-medium bg-green-100 text-green-800">
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
                                            <p className="text-lg text-gray-500 mb-1">{field.label}</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {readings[field.name]}
                                                <span className="text-lg text-gray-500 ml-1">{field.unit}</span>
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="pt-3 border-t border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">📊 Quick Analysis</h4>
                            <div className="space-y-2 text-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Total Parameters:</span>
                                    <span className="font-semibold text-gray-800">{readingsArray.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Category:</span>
                                    <span className="font-semibold text-[#028090]">{config.label}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {isInvalidDocument() ? (
                            <div className="text-center py-8">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-medium bg-gray-100 text-gray-600 border border-gray-300">
                                    ⚠️ Non-medical document
                                </span>
                                <p className="text-lg text-gray-500 mt-2">This file doesn't contain medical test data</p>
                            </div>
                        ) : log.aiAnalysis?.summary ? (
                            <div className="pt-3 border-t border-gray-100">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">📋 Summary</h4>
                                <p className="text-lg text-gray-600 line-clamp-3">{log.aiAnalysis.summary}</p>
                            </div>
                        ) : (
                            <p className="text-lg text-gray-500 text-center py-2">View full report for details</p>
                        )}
                    </div>
                )}

                {log.description && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-lg text-gray-600">
                            <span className="font-medium">📝 Notes: </span>
                            {log.description}
                        </p>
                    </div>
                )}

                {log.detectedDisease && log.detectedDisease !== log.diseaseType && (
                    <div className="mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-lg font-medium bg-yellow-100 text-yellow-800">
                            🤖 AI Detected: {getDiseaseConfig(log.detectedDisease).label}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthCard;