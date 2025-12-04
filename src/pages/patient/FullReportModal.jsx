import React, { useState } from 'react';
import { X, FileText, Calendar, Eye, ExternalLink, Image, File } from 'lucide-react';
import AIAnalysisCard from './AIAnalysisCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FullReportModal = ({ log, onClose }) => {
    const [showDocument, setShowDocument] = useState(false);

    if (!log) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isPdf = log.fileType === 'pdf' || log.fileUrl?.toLowerCase().endsWith('.pdf');
    const isImage = log.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(log.fileUrl || '');

    const getFullFileUrl = () => {
        if (!log.fileUrl) return '';
        if (log.fileUrl.startsWith('http')) {
            return log.fileUrl;
        }
        return `${API_URL}${log.fileUrl}`;
    };

    const fullFileUrl = getFullFileUrl();

    const handleViewDocument = () => {
        setShowDocument(true);
    };

    const handleOpenInNewTab = () => {
        if (fullFileUrl) {
            window.open(fullFileUrl, '_blank', 'noopener,noreferrer');
        }
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
                        <div className="flex items-center space-x-4 mt-2 text-[#f0f3bd] text-lg">
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
                    {log.fileUrl && (
                        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gray-100 px-5 py-3 border-b-2 border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 text-lg flex items-center">
                                    {isPdf ? <File className="w-5 h-5 mr-2 text-red-500" /> : <Image className="w-5 h-5 mr-2 text-blue-500" />}
                                    📄 Original Document
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowDocument(!showDocument)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors text-lg cursor-pointer"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {showDocument ? 'Hide' : 'View'}
                                    </button>
                                    <button
                                        onClick={handleOpenInNewTab}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg cursor-pointer"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open
                                    </button>
                                </div>
                            </div>

                            {showDocument && (
                                <div className="p-4">
                                    {isPdf ? (
                                        <div className="w-full">
                                            <div className="w-full h-[500px] rounded-lg border border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6">
                                                <File className="w-16 h-16 text-red-500 mb-4" />
                                                <p className="text-gray-700 text-lg font-medium mb-2">PDF Document</p>
                                                <p className="text-gray-500 text-lg mb-4 text-center">
                                                    {log.fileName || 'Medical Report PDF'}
                                                </p>
                                                <p className="text-gray-400 text-lg mb-4">
                                                    Click below to view the PDF in a new tab
                                                </p>
                                            </div>
                                            <div className="flex justify-center gap-3 mt-4">
                                                <a
                                                    href={fullFileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 bg-[#00a896] text-white px-4 py-2 rounded-lg hover:bg-[#028090] transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Open PDF in New Tab
                                                </a>
                                                <a
                                                    href={fullFileUrl}
                                                    download={log.fileName || 'medical-report.pdf'}
                                                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Download PDF
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center">
                                            <img
                                                src={fullFileUrl}
                                                alt="Medical Report"
                                                className="max-w-full max-h-[500px] rounded-lg border border-gray-300 object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image not available</text></svg>';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

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
                                                    <span className="text-lg bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
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
                                                <div className="text-lg text-gray-600 mb-2">
                                                    <span className="font-medium">Normal Range: </span>
                                                    {reading.normalRange.text ||
                                                        `${reading.normalRange.min}-${reading.normalRange.max} ${reading.unit || ''}`}
                                                </div>
                                            )}

                                            {reading.status && (
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-lg font-medium ${['high', 'low', 'critical'].includes(reading.status.toLowerCase())
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-lg">
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
                                {(() => {
                                    const summary = log.aiAnalysis?.summary?.toLowerCase() || '';
                                    const isInvalid = summary.includes('resume') ||
                                        summary.includes('not contain any medical') ||
                                        summary.includes('no medical test') ||
                                        summary.includes('no health') ||
                                        (log.aiAnalysis?.riskLevel === 'low' && !log.readings?.length && !log.aiAnalysis?.detectedConditions?.length && summary.includes('not'));

                                    if (isInvalid) {
                                        return <p className="font-semibold uppercase text-gray-500">INVALID</p>;
                                    }

                                    return (
                                        <p className={`font-semibold uppercase ${log.aiAnalysis?.riskLevel === 'low' ? 'text-green-600' :
                                            log.aiAnalysis?.riskLevel === 'moderate' ? 'text-yellow-600' :
                                                log.aiAnalysis?.riskLevel === 'high' ? 'text-orange-600' :
                                                    'text-red-600'
                                            }`}>
                                            {log.aiAnalysis?.riskLevel || 'N/A'}
                                        </p>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullReportModal;