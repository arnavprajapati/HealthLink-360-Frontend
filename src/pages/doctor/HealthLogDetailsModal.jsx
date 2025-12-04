import React from 'react';
import { X, FileText, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const HealthLogDetailsModal = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full z-10">
                    
                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <Activity className="h-6 w-6 text-teal-600" />
                                </div>
                                <div className="ml-4 text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Health Log Details
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(log.recordDate)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <span className="sr-only">Close</span>
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</span>
                                <p className="mt-1 text-lg font-medium text-gray-900 capitalize">{log.diseaseType}</p>
                            </div>
                            <div className={`p-4 rounded-lg border ${getRiskColor(log.aiAnalysis?.riskLevel)}`}>
                                <span className="text-xs font-semibold uppercase tracking-wide opacity-75">Risk Level</span>
                                <p className="mt-1 text-lg font-bold capitalize flex items-center">
                                    {log.aiAnalysis?.riskLevel || 'Normal'}
                                    {log.aiAnalysis?.riskLevel === 'critical' && <AlertTriangle className="w-5 h-5 ml-2" />}
                                </p>
                            </div>
                        </div>

                        {/* AI Summary */}
                        {log.aiAnalysis?.summary && (
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center">
                                    <Info className="w-4 h-4 mr-2" />
                                    AI Analysis Summary
                                </h4>
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    {log.aiAnalysis.summary}
                                </p>
                            </div>
                        )}

                        {/* Readings / Tests */}
                        {log.readings && log.readings.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Test Readings</h4>
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {log.readings.map((reading, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{reading.testName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {reading.value} {reading.unit}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            reading.status === 'critical' ? 'bg-red-100 text-red-800' :
                                                            reading.status === 'high' || reading.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {reading.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {log.aiAnalysis?.recommendations && log.aiAnalysis.recommendations.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Recommendations</h4>
                                <ul className="space-y-2">
                                    {log.aiAnalysis.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                            <CheckCircle className="w-5 h-5 text-teal-500 mr-2 flex-shrink-0" />
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* File Attachment */}
                        {log.fileUrl && (
                            <div className="pt-4 border-t border-gray-100">
                                <a 
                                    href={log.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm text-[#00a896] hover:text-[#028090] font-medium"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Original Report File ({log.fileType})
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#00a896] text-base font-medium text-white hover:bg-[#028090] focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthLogDetailsModal;
