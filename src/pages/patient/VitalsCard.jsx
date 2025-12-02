import React from 'react';
import { Plus, Heart, Scale, FileText, Activity } from 'lucide-react';

const StatBox = ({ icon, label, value }) => (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center space-x-3">
        {icon}
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const VitalsCard = ({ vitals, loading, onUpdateClick, formatDate }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a896]"></div>
            </div>
        );
    }

    const hasVitalsData = vitals && (vitals.weight || vitals.height || vitals.bmi);
    const buttonLabel = hasVitalsData ? 'Update' : 'Add Now';

    const bmiValue = parseFloat(vitals?.bmi?.split(' ')[0]);
    
    const getBmiColor = (bmi) => {
        if (isNaN(bmi) || !hasVitalsData) return 'text-gray-900'; 
        if (bmi < 18.5) return 'text-yellow-600';
        if (bmi >= 18.5 && bmi < 25) return 'text-green-600';
        if (bmi >= 25 && bmi < 30) return 'text-orange-600';
        if (bmi >= 30) return 'text-red-600';
        return 'text-gray-900';
    };

    const getBmiStatus = (bmi) => {
        if (isNaN(bmi) || !hasVitalsData) return 'Awaiting Data';
        if (bmi < 18.5) return 'Underweight';
        if (bmi >= 18.5 && bmi < 25) return 'Normal';
        if (bmi >= 25 && bmi < 30) return 'Overweight';
        if (bmi >= 30) return 'Obese';
        return 'N/A';
    };

    const weightValue = vitals?.weight || '—';
    const heightValue = vitals?.height || '—';
    const bmiDisplay = vitals?.bmi || '—';
    const recordedDate = vitals?.recordedDate ? formatDate(vitals.recordedDate) : '—';
    const smokingStatus = vitals?.smokingStatus;

    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-[#00a896]" />
                    Current Vitals
                </h3>
                <button
                    onClick={onUpdateClick}
                    className="text-sm font-medium text-[#00a896] hover:text-[#028090] flex items-center transition-colors cursor-pointer"
                    title={`${buttonLabel} Vitals`}
                >
                    <Plus className="w-4 h-4 mr-1" /> {buttonLabel}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 mb-4">
                <StatBox
                    icon={<Scale className="w-6 h-6 text-[#028090]" />}
                    label="Weight"
                    value={weightValue}
                />
                <StatBox
                    icon={<FileText className="w-6 h-6 text-[#028090]" />}
                    label="Height"
                    value={heightValue}
                />

                <div className="col-span-2 bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Activity className="w-6 h-6 text-[#028090]" />
                        <div>
                            <p className="text-sm text-gray-600">BMI</p>
                            <p className={`text-xl font-bold ${getBmiColor(bmiValue)}`}>{bmiDisplay}</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                        {getBmiStatus(bmiValue)}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Recorded on: <span className="font-semibold text-gray-800">
                        {recordedDate}
                    </span>
                </p>
            </div>

            {smokingStatus && (
                <div className={`p-3 rounded-lg text-white font-medium text-sm ${smokingStatus.toLowerCase().includes('smoker') ? 'bg-red-600' : 'bg-[#00a896]'}`}>
                    🚬 Smoking Status: {smokingStatus}
                </div>
            )}
        </div>
    );
};

export default VitalsCard;