import React from 'react';
import { Sparkles } from 'lucide-react';

const PatientProfileCard = ({ 
    patient, 
    filteredLogs, 
    patientNotes, 
    patientGoals, 
    aiSummary, 
    loading, 
    onGenerateSummary 
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {patient.photoURL ? (
                    <img
                        src={patient.photoURL}
                        alt={patient.displayName}
                        className="w-20 h-20 rounded-full border-4 border-teal-100 object-cover"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full border-4 border-teal-200 bg-white flex items-center justify-center text-teal-600 font-bold text-2xl">
                        {patient.displayName?.[0]?.toUpperCase() || 'P'}
                    </div>
                )}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-900">{patient.displayName}</h1>
                    <p className="text-gray-500">{patient.email}</p>
                    <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-lg font-medium">
                            {filteredLogs.length} Health Records
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-lg font-medium">
                            {patientNotes?.length || 0} Clinical Notes
                        </span>
                        <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-lg font-medium">
                            {patientGoals?.length || 0} Health Goals
                        </span>
                    </div>
                </div>
                <button
                    onClick={onGenerateSummary}
                    disabled={loading}
                    className="px-4 py-2 cursor-pointer bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-medium disabled:opacity-50 flex items-center gap-2"
                >
                    <Sparkles className="w-4 h-4" />
                    {loading ? 'Generating...' : 'AI Summary'}
                </button>
            </div>

            {aiSummary && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <h4 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Health Summary
                    </h4>
                    <p className="text-lg text-gray-700 whitespace-pre-wrap">{aiSummary}</p>
                </div>
            )}
        </div>
    );
};

export default PatientProfileCard;
