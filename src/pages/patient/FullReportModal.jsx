import React from 'react';
import { X, FileText, Calendar, User } from 'lucide-react';
import AIAnalysisCard from './AIAnalysisCard';

const FullReportModal = ({ log, onClose }) => {
    if (!log) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4 ">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="sticky top-0 bg-gradient-to-r from-[#00a896] to-[#02c39a] px-6 py-5 border-b flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <FileText className="w-6 h-6 mr-2" />
                            Complete Medical Report
                        </h2>
                        <div className="flex items-center space-x-4 mt-2 text-[#f0f3bd] text-sm">
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(log.testDate || log.createdAt)}
                            </span>
                            {log.fileName && (
                                <span className="flex items-center">
                                    <FileText className="w-4 h-4 mr-1" />
                                    {log.fileName}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg cursor-pointer transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <AIAnalysisCard
                        aiAnalysis={log.aiAnalysis}
                        detectedConditions={log.aiAnalysis?.detectedConditions}
                    />

                    {log.readings && log.readings.length > 0 && (
                        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gray-100 px-5 py-3 border-b-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 text-lg">📊 Detailed Test Results</h3>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {log.readings.map((reading, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-[#00a896] transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-900">
                                                    {reading.testName}
                                                </h4>
                                                {reading.category && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {reading.category}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-baseline mb-2">
                                                <span className="text-2xl font-bold text-[#028090]">
                                                    {reading.value}
                                                </span>
                                                {reading.unit && (
                                                    <span className="ml-2 text-gray-600">
                                                        {reading.unit}
                                                    </span>
                                                )}
                                            </div>

                                            {reading.normalRange && (
                                                <div className="text-xs text-gray-600 mb-2">
                                                    <span className="font-medium">Normal Range: </span>
                                                    {reading.normalRange.text ||
                                                        `${reading.normalRange.min}-${reading.normalRange.max} ${reading.unit || ''}`}
                                                </div>
                                            )}

                                            {reading.status && (
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${['high', 'low', 'critical'].includes(reading.status.toLowerCase())
                                                        ? 'bg-red-100 text-red-800 border border-red-300'
                                                        : 'bg-green-100 text-green-800 border border-green-300'
                                                    }`}>
                                                    Status: {reading.status}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {log.description && (
                        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gray-100 px-5 py-3 border-b-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 text-lg">📝 Additional Notes</h3>
                            </div>
                            <div className="p-5">
                                <p className="text-gray-700 leading-relaxed">{log.description}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Disease Type</p>
                                <p className="font-semibold text-gray-900 capitalize">{log.diseaseType}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">File Type</p>
                                <p className="font-semibold text-gray-900 uppercase">{log.fileType}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Upload Date</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(log.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Risk Level</p>
                                <p className={`font-semibold uppercase ${log.aiAnalysis?.riskLevel === 'low' ? 'text-green-600' :
                                        log.aiAnalysis?.riskLevel === 'moderate' ? 'text-yellow-600' :
                                            log.aiAnalysis?.riskLevel === 'high' ? 'text-orange-600' :
                                                'text-red-600'
                                            }`}>
                                    {log.aiAnalysis?.riskLevel || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullReportModal;