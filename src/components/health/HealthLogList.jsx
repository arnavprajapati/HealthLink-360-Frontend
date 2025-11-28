import React from 'react';
import { getDiseaseConfig } from '../../utils/diseaseConfig';
import { Trash2, FileText, Calendar } from 'lucide-react';

const HealthLogList = ({ logs, onDelete }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReadingsDisplay = (log) => {
        const config = getDiseaseConfig(log.diseaseType);
        const readings = log.readings || {};

        return Object.entries(readings).map(([key, value]) => {
            const field = config.fields.find(f => f.name === key);
            return (
                <div key={key} className="text-sm">
                    <span className="font-medium">{field?.label || key}:</span>{' '}
                    <span className="text-gray-700">{value} {field?.unit || ''}</span>
                </div>
            );
        });
    };

    if (logs.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No health logs</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first health reading.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log) => {
                const config = getDiseaseConfig(log.diseaseType);
                return (
                    <div
                        key={log._id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-2xl">{config.icon}</span>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {config.label}
                                    </h3>
                                    {log.detectedDisease && log.detectedDisease !== log.diseaseType && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            AI Detected: {getDiseaseConfig(log.detectedDisease).label}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {getReadingsDisplay(log)}
                                </div>

                                {log.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        📝 {log.description}
                                    </p>
                                )}

                                {log.fileUrl && (
                                    <a
                                        href={`${import.meta.env.VITE_API_URL?.replace('/api/auth', '') || 'http://localhost:5000'}${log.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-[#00a896] hover:text-[#028090]"
                                    >
                                        <FileText size={14} className="mr-1" />
                                        View Uploaded File
                                    </a>
                                )}

                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                    <Calendar size={12} className="mr-1" />
                                    {formatDate(log.recordDate || log.createdAt)}
                                </div>
                            </div>

                            <button
                                onClick={() => onDelete(log._id)}
                                className="text-red-500 hover:text-red-700 p-2"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HealthLogList;