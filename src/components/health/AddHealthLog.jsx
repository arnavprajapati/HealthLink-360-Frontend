import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createHealthLog, clearError } from '../../app/reducers/healthLogSlice';
import { diseaseTypes, getDiseaseConfig } from '../../utils/diseaseConfig';
import { Upload, X, Loader, FileText } from 'lucide-react';

const AddHealthLog = ({ onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.healthLog);

    const [step, setStep] = useState(1);
    const [diseaseType, setDiseaseType] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [description, setDescription] = useState('');
    const [manualReadings, setManualReadings] = useState({});

    const currentConfig = diseaseType ? getDiseaseConfig(diseaseType) : null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);

            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleReadingChange = (fieldName, value) => {
        setManualReadings(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleCategorySelect = (category) => {
        setDiseaseType(category);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('diseaseType', diseaseType);
        formData.append('description', description);
        formData.append('manualReadings', JSON.stringify(manualReadings));

        if (file) {
            formData.append('file', file);
        }

        try {
            await dispatch(createHealthLog(formData)).unwrap();
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to create health log:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-md p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-[#00a896] to-[#02c39a] px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Add Health Log</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            {step === 1 ? 'Select health category' : 'Enter your health details'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-center space-x-2">
                        <div className={`flex items-center ${step >= 1 ? 'text-[#00a896]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#00a896] text-white' : 'bg-gray-200'
                                }`}>
                                1
                            </div>
                            <span className="ml-2 text-sm font-medium">Category</span>
                        </div>
                        <div className="w-12 h-0.5 bg-gray-300"></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-[#00a896]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#00a896] text-white' : 'bg-gray-200'
                                }`}>
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium">Details</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                    {error && (
                        <div className="mx-6 mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                What would you like to track?
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {diseaseTypes.map((disease) => (
                                    <button
                                        key={disease.value}
                                        onClick={() => handleCategorySelect(disease.value)}
                                        className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#02c39a] hover:bg-[#f0f3bd]/50 transition-all duration-200 group"
                                    >
                                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                            {disease.icon}
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 group-hover:text-[#028090]">
                                            {disease.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && currentConfig && (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="flex items-center justify-between bg-[#f0f3bd]/50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-3xl">{currentConfig.icon}</div>
                                    <div>
                                        <p className="text-sm text-gray-600">Selected Category</p>
                                        <p className="text-lg font-semibold text-gray-900">{currentConfig.label}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-[#00a896] hover:text-[#028090] font-medium"
                                >
                                    Change
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Upload Medical Report (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#02c39a] transition-colors bg-gray-50">
                                    {filePreview ? (
                                        <div className="relative">
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                className="max-h-48 mx-auto rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFile(null);
                                                    setFilePreview(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : file ? (
                                        <div className="flex items-center justify-center space-x-3">
                                            <FileText className="w-8 h-8 text-[#00a896]" />
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setFile(null)}
                                                    className="text-xs text-red-500 hover:text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG or PDF (MAX. 10MB)
                                            </p>
                                            <p className="text-xs text-[#00a896] mt-2 font-medium">
                                                AI will automatically extract readings
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {currentConfig.fields.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Enter Readings Manually (Optional)
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentConfig.fields.map((field) => (
                                            <div key={field.name}>
                                                <label className="block text-sm text-gray-600 mb-2">
                                                    {field.label}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={field.type}
                                                        value={manualReadings[field.name] || ''}
                                                        onChange={(e) => handleReadingChange(field.name, e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02c39a] focus:border-[#02c39a]"
                                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    />
                                                    {field.unit && (
                                                        <span className="absolute right-3 top-2.5 text-sm text-gray-500 font-medium">
                                                            {field.unit}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02c39a] focus:border-[#02c39a]"
                                    placeholder="Add any symptoms, concerns, or additional information..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {description.length}/500 characters
                                </p>
                            </div>

                            <div className="flex space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-[#00a896] text-white py-3 px-6 rounded-lg hover:bg-[#028090] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin mr-2" size={20} />
                                            Processing...
                                        </>
                                    ) : (
                                        'Save Health Log'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddHealthLog;