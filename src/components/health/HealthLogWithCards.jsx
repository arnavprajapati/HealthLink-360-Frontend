import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Eye, X, Info } from 'lucide-react';

const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
        case 'normal': return 'bg-green-100 text-green-800 border-green-300';
        case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'critical': return 'bg-red-100 text-red-800 border-red-300';
        case 'borderline': return 'bg-blue-100 text-blue-800 border-blue-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
        case 'normal': return <CheckCircle className="w-4 h-4" />;
        case 'low': return <TrendingDown className="w-4 h-4" />;
        case 'high': return <TrendingUp className="w-4 h-4" />;
        case 'critical': return <AlertTriangle className="w-4 h-4" />;
        default: return <CheckCircle className="w-4 h-4" />;
    }
};

const TestCard = ({ reading, onClick }) => {
    const { testName, value, unit, normalRange, status, category } = reading;
    
    return (
        <div 
            onClick={() => onClick(reading)}
            className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-lg hover:border-[#00a896] transition-all duration-300 cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#00a896] transition-colors">
                        {testName}
                    </h4>
                    {category && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {category}
                        </span>
                    )}
                </div>
                <Eye className="w-4 h-4 text-gray-400 group-hover:text-[#00a896] transition-colors" />
            </div>

            <div className="mb-3">
                <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                        {value}
                    </span>
                    {unit && (
                        <span className="ml-2 text-lg text-gray-600">
                            {unit}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {normalRange && (
                    <div className="text-xs text-gray-600">
                        <span className="font-medium">Normal: </span>
                        <span>{normalRange.text || `${normalRange.min}-${normalRange.max} ${unit}`}</span>
                    </div>
                )}
                
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                    <span className="capitalize">{status || 'Normal'}</span>
                </div>
            </div>
        </div>
    );
};

const DetailModal = ({ reading, onClose }) => {
    if (!reading) return null;

    const { testName, value, unit, normalRange, status, category, healthInfo } = reading;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className={`sticky top-0 px-6 py-5 border-b flex justify-between items-center ${getStatusColor(status)} bg-opacity-20`}>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{testName}</h2>
                        {category && (
                            <p className="text-sm text-gray-600 mt-1">{category} Test</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-gradient-to-br from-[#00a896]/10 to-[#02c39a]/5 rounded-xl p-6 border-2 border-[#00a896]/20">
                        <p className="text-sm text-gray-600 mb-2">Your Result</p>
                        <div className="flex items-baseline mb-3">
                            <span className="text-5xl font-bold text-[#028090]">{value}</span>
                            {unit && <span className="ml-3 text-2xl text-gray-600">{unit}</span>}
                        </div>
                        
                        {normalRange && (
                            <div className="text-sm text-gray-700 mb-3">
                                <span className="font-semibold">Normal Range: </span>
                                <span className="text-[#028090] font-medium">
                                    {normalRange.text || `${normalRange.min}-${normalRange.max} ${unit}`}
                                </span>
                            </div>
                        )}

                        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-semibold border-2 ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span className="capitalize text-base">{status || 'Normal'}</span>
                        </div>
                    </div>

                    {healthInfo && (
                        <div className="space-y-4">
                            {healthInfo.description && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-2">
                                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-blue-900 mb-1">What is {testName}?</h3>
                                            <p className="text-sm text-blue-800">{healthInfo.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {healthInfo.causes && healthInfo.causes.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                                        Possible Causes
                                    </h3>
                                    <ul className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                                        {healthInfo.causes.map((cause, idx) => (
                                            <li key={idx} className="text-sm text-orange-900 flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{cause}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {healthInfo.symptoms && healthInfo.symptoms.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Common Symptoms</h3>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {healthInfo.symptoms.map((symptom, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                    {symptom}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {healthInfo.recommendations && healthInfo.recommendations.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                        Recommendations
                                    </h3>
                                    <ul className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                                        {healthInfo.recommendations.map((rec, idx) => (
                                            <li key={idx} className="text-sm text-green-900 flex items-start">
                                                <span className="mr-2">✓</span>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {healthInfo.relatedTests && healthInfo.relatedTests.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Related Tests</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {healthInfo.relatedTests.map((test, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium border border-purple-200">
                                                {test}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                        <p className="text-xs text-gray-600">
                            ⚠️ <span className="font-semibold">Disclaimer:</span> This information is for educational purposes only. 
                            Always consult with your healthcare provider for medical advice and treatment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HealthLogWithCards = ({ log }) => {
    const [selectedReading, setSelectedReading] = useState(null);
    
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const totalTests = log.readings?.length || 0;
    const abnormalTests = log.readings?.filter(r => 
        ['low', 'high', 'critical'].includes(r.status?.toLowerCase())
    ).length || 0;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-[#00a896] to-[#02c39a] p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Health Report Analysis</h2>
                        <p className="text-[#f0f3bd] text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(log.testDate || log.createdAt)}
                        </p>
                    </div>
                    {log.aiAnalysis?.riskLevel && (
                        <div className={`px-4 py-2 rounded-full font-semibold ${
                            log.aiAnalysis.riskLevel === 'low' ? 'bg-green-200 text-green-900' :
                            log.aiAnalysis.riskLevel === 'moderate' ? 'bg-yellow-200 text-yellow-900' :
                            log.aiAnalysis.riskLevel === 'high' ? 'bg-orange-200 text-orange-900' :
                            'bg-red-200 text-red-900'
                        }`}>
                            {log.aiAnalysis.riskLevel.toUpperCase()} RISK
                        </div>
                    )}
                </div>
            </div>

            {log.aiAnalysis?.summary && (
                <div className="p-6 border-b border-gray-200 bg-blue-50">
                    <h3 className="font-semibold text-gray-900 mb-2">📋 Summary</h3>
                    <p className="text-gray-700">{log.aiAnalysis.summary}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200 bg-gray-50">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
                    <p className="text-xs text-gray-600">Total Tests</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{abnormalTests}</p>
                    <p className="text-xs text-gray-600">Abnormal</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{totalTests - abnormalTests}</p>
                    <p className="text-xs text-gray-600">Normal</p>
                </div>
            </div>

            <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">📊 Test Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {log.readings && log.readings.map((reading, index) => (
                        <TestCard 
                            key={index} 
                            reading={reading} 
                            onClick={setSelectedReading}
                        />
                    ))}
                </div>
            </div>

            {selectedReading && (
                <DetailModal 
                    reading={selectedReading} 
                    onClose={() => setSelectedReading(null)}
                />
            )}
        </div>
    );
};

export default HealthLogWithCards;