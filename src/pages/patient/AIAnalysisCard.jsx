import React from 'react';
import {
    Brain, AlertTriangle, CheckCircle, TrendingUp,
    FileText, ChevronDown, ChevronUp, Info
} from 'lucide-react';

const AIAnalysisCard = ({ aiAnalysis, detectedConditions }) => {

    if (!aiAnalysis) return null;

    const isInvalidDocument = () => {
        const summary = aiAnalysis.summary?.toLowerCase() || '';
        return summary.includes('not contain any medical') ||
            summary.includes('no medical test') ||
            summary.includes('no health') ||
            (aiAnalysis.riskLevel === 'low' && !detectedConditions?.length && summary.includes('not'));
    };

    const getRiskColor = (riskLevel) => {
        if (isInvalidDocument()) return 'bg-gray-100 text-gray-600 border-gray-400';
        switch (riskLevel?.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-800 border-green-300';
            case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getRiskIcon = (riskLevel) => {
        if (isInvalidDocument()) return <AlertTriangle className="w-5 h-5" />;
        switch (riskLevel?.toLowerCase()) {
            case 'low': return <CheckCircle className="w-5 h-5" />;
            case 'moderate': return <Info className="w-5 h-5" />;
            case 'high': return <TrendingUp className="w-5 h-5" />;
            case 'critical': return <AlertTriangle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getRiskLabel = () => {
        if (isInvalidDocument()) return 'INVALID DOCUMENT';
        return `${aiAnalysis.riskLevel} RISK`;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border-2 border-[#00a896] overflow-hidden">
            <div className="bg-gradient-to-r from-[#00a896] to-[#02c39a] p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">AI Health Analysis</h3>
                            <p className="text-[#f0f3bd] text-lg">Powered by Advanced AI</p>
                        </div>
                    </div>

                    {aiAnalysis.riskLevel && (
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold border-2 ${getRiskColor(aiAnalysis.riskLevel)}`}>
                            {getRiskIcon(aiAnalysis.riskLevel)}
                            <span className="uppercase text-lg">{getRiskLabel()}</span>
                        </div>
                    )}
                </div>
            </div>

            {aiAnalysis.summary && (
                <div className="p-5 bg-blue-50 border-b-2 border-blue-200">
                    <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-2 text-lg">📋 Summary</h4>
                            <p className="text-blue-800 text-lg leading-relaxed">{aiAnalysis.summary}</p>
                        </div>
                    </div>
                </div>
            )}

            {(aiAnalysis.detectedConditions?.length > 0 || detectedConditions?.length > 0) && (
                <div className="p-5 bg-purple-50 border-b-2 border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center text-lg">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        🔍 Detected Conditions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {(aiAnalysis.detectedConditions || detectedConditions || []).map((condition, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-lg font-medium border border-purple-300 shadow-sm"
                            >
                                {condition}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {aiAnalysis.keyFindings?.length > 0 && (
                <div className="p-5 bg-yellow-50 border-b-2 border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-3 flex items-center text-lg">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        💡 Key Findings
                    </h4>
                    <ul className="space-y-2">
                        {aiAnalysis.keyFindings.map((finding, idx) => (
                            <li
                                key={idx}
                                className="flex items-start space-x-2 text-yellow-900 bg-yellow-100 p-3 rounded-lg border border-yellow-300"
                            >
                                <span className="font-bold text-yellow-700 mt-0.5">{idx + 1}.</span>
                                <span className="flex-1">{finding}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {aiAnalysis.abnormalTests?.length > 0 && (
                <div className="p-5 bg-red-50 border-b-2 border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center text-lg">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        ⚠️ Abnormal Tests Detected
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        {aiAnalysis.abnormalTests.map((test, idx) => (
                            <div
                                key={idx}
                                className="bg-red-100 border border-red-300 rounded-lg p-3 flex items-center space-x-2"
                            >
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                <span className="text-red-900 font-medium text-lg">{test}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {aiAnalysis.recommendations?.length > 0 && (
                <div className="bg-green-50 border-b-2 border-green-200">
                    <div
                        className="w-full flex items-center justify-between p-5 text-lg font-semibold text-green-900"
                    >
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            ✅ Recommendations ({aiAnalysis.recommendations.length})
                        </div>
                    </div>

                    <div className="px-5 pb-5 pt-0">
                        <ul className="space-y-3">
                            {aiAnalysis.recommendations.map((rec, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start space-x-3 bg-green-100 p-4 rounded-lg border border-green-300 shadow-sm"
                                >
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                                        {idx + 1}
                                    </div>
                                    <span className="flex-1 text-green-900 leading-relaxed">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="p-4 bg-gray-100 border-t-2 border-gray-300">
                <p className="text-lg text-gray-600 text-center">
                    ⚠️ <span className="font-extrabold">Medical Disclaimer:</span> This AI analysis is for informational purposes only.
                    Always consult with a qualified healthcare professional for medical advice, diagnosis, and treatment.
                </p>
            </div>
        </div>
    );
};

export default AIAnalysisCard;