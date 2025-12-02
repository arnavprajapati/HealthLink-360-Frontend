import React from 'react';
import { getDiseaseConfig } from '../../utils/diseaseConfig';

const DetailModal = ({ log, onClose }) => {
    if (!log) return null;

    const config = getDiseaseConfig(log.diseaseType);

    const readingsArray = log.readings || [];
    const readings = readingsArray.reduce((acc, currentReading) => {
        acc[currentReading.testName] = currentReading;
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl">{config.icon}</span>
                        <h2 className="text-2xl font-bold text-gray-800">{config.label}</h2>
                    </div>
                    <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-gray-500">Record Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {new Date(log.testDate || log.createdAt).toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Readings</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(readings || {}).map(([key, readingObject]) => {
                                const field = config.fields.find(f => f.name.toLowerCase() === key.toLowerCase());
                                return (
                                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">{readingObject.testName || field?.label || key}</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {readingObject.value}
                                            <span className="text-sm text-gray-500">{readingObject.unit || field?.unit || ''}</span>
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1
                                            ${readingObject.status === 'high' || readingObject.status === 'low' || readingObject.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            Status: {readingObject.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {log.description && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{log.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailModal;