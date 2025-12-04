import React, { useState, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { Save, X, Scale, FileText } from 'lucide-react';


const extractNumber = (value) => {
    if (!value) return '';
    return parseFloat(value.split(' ')[0]) || '';
};

const parseHeight = (value) => {
    if (!value) return { ft: '', inc: '' };

    const match = value.match(/(\d+)'(\d+)"/i) || value.match(/(\d+)\s*ft\s*(\d+)\s*in/i);
    if (match) {
        return { ft: match[1], inc: match[2] };
    }

    const singleMatch = value.match(/(\d+)/);
    if (singleMatch) {
        return { ft: singleMatch[1], inc: '' };
    }

    return { ft: '', inc: '' };
};


const AddVitalsModal = ({ onClose, onSuccess, initialVitals }) => {
    const { createManualLog } = useHealth();

    const [weightKg, setWeightKg] = useState(extractNumber(initialVitals?.weight));

    const [heightFt, setHeightFt] = useState(parseHeight(initialVitals?.height).ft);
    const [heightIn, setHeightIn] = useState(parseHeight(initialVitals?.height).inc);

    const [smokingStatus, setSmokingStatus] = useState(
        initialVitals?.smokingStatus?.toLowerCase() === 'not recorded/non-smoker'
            ? 'non-smoker'
            : initialVitals?.smokingStatus || 'non-smoker'
    );

    const [description, setDescription] = useState('');

    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!weightKg || !heightFt) {
            setError('Please enter both Weight and Height.');
            return;
        }

        if (parseFloat(weightKg) <= 0 || parseFloat(heightFt) <= 0) {
            setError('Weight and Height must be positive numbers.');
            return;
        }

        setIsSaving(true);
        try {

            await createManualLog({
                weightKg,
                heightFt,
                heightIn: heightIn || 0,
                smokingStatus,
                description
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save vitals.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center ">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Scale className="w-6 h-6 mr-2 text-[#00a896]" />
                        Add/Update Current Vitals
                    </h2>
                    <button onClick={onClose} className="text-gray-400 cursor-pointer hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-lg">{error}</div>}

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                            <Scale className="w-4 h-4 mr-2" /> Weight
                        </label>
                        <input
                            type="number"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            placeholder="Enter weight"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#00a896] focus:border-[#00a896]"
                            required
                            min="1"
                        />
                        <p className="text-lg text-gray-500 mt-1">Units: kg (Kilograms)</p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" /> Height
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                value={heightFt}
                                onChange={(e) => setHeightFt(e.target.value)}
                                placeholder="Feet (e.g., 5)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#00a896] focus:border-[#00a896]"
                                required
                                min="0"
                            />
                            <input
                                type="number"
                                value={heightIn}
                                onChange={(e) => setHeightIn(e.target.value)}
                                placeholder="Inches (e.g., 10)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#00a896] focus:border-[#00a896]"
                                min="0"
                                max="11"
                            />
                        </div>
                        <p className="text-lg text-gray-500 mt-1">Units: Feet and Inches</p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                            <span className="text-lg mr-2">🚬</span> Smoking Status
                        </label>
                        <select
                            value={smokingStatus}
                            onChange={(e) => setSmokingStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#00a896] focus:border-[#00a896]"
                        >
                            <option value="non-smoker">Non-smoker</option>
                            <option value="current every day smoker">Current every day smoker</option>
                            <option value="current some day smoker">Current some day smoker</option>
                            <option value="former smoker">Former smoker</option>
                            <option value="unknown">Unknown</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            placeholder="Add any additional details (e.g., last measured date, medication changes)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#00a896] focus:border-[#00a896]"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center px-4 py-3 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] cursor-pointer transition-colors font-semibold disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Vitals
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default AddVitalsModal;