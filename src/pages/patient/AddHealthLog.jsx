import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { Upload, X, Loader, FileText, CheckCircle } from 'lucide-react';

const AddHealthLog = ({ onClose, onSuccess }) => {
    const { createHealthLog, loading, error } = useHealth();

    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [description, setDescription] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (selectedFile) => {
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

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please upload a medical report');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        if (description) {
            formData.append('description', description);
        }

        try {
            await createHealthLog(formData);
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to create health log:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4  ">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ">
                <div className="bg-gradient-to-r from-[#00a896] to-[#02c39a] px-6 py-5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Upload Medical Report</h2>
                        <p className="text-[#f0f3bd] text-lg mt-1">
                            🤖 AI will automatically analyze and extract all test results
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white cursor-pointer hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto overflow-y-auto overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                            <span className="mr-2">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                            📄 Upload Your Medical Report *
                        </label>

                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive
                                ? 'border-[#00a896] bg-[#f0f3bd]/30 scale-105'
                                : 'border-gray-300 hover:border-[#02c39a] bg-gray-50'
                                }`}
                        >
                            {filePreview ? (
                                <div className="relative">
                                    <img
                                        src={filePreview}
                                        alt="Preview"
                                        className="max-h-64 mx-auto rounded-lg shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setFilePreview(null);
                                        }}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className="mt-4 flex items-center justify-center text-green-600">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Image uploaded successfully!</span>
                                    </div>
                                </div>
                            ) : file ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center space-x-3 bg-white rounded-lg p-4 border border-gray-200">
                                        <FileText className="w-10 h-10 text-[#00a896]" />
                                        <div className="text-left flex-1">
                                            <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                                            <p className="text-lg text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFile(null)}
                                            className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center text-green-600">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        <span className="font-medium">PDF uploaded successfully!</span>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                    <p className="text-lg font-semibold text-gray-700 mb-2">
                                        Drop your medical report here
                                    </p>
                                    <p className="text-lg text-gray-500 mb-3">
                                        or click to browse files
                                    </p>
                                    <div className="inline-flex items-center px-6 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors font-medium">
                                        Choose File
                                    </div>
                                    <p className="text-lg text-gray-500 mt-4">
                                        Supported: PNG, JPG, JPEG, PDF (Max 10MB)
                                    </p>
                                    <div className="mt-4 bg-[#f0f3bd] rounded-lg p-3 inline-block">
                                        <p className="text-lg text-[#028090] font-semibold">
                                            🤖 AI will automatically detect:
                                        </p>
                                        <p className="text-lg text-gray-600 mt-1">
                                            Blood tests, vitals, ranges, and abnormalities
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleFileChange(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            📝 Additional Notes (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02c39a] focus:border-[#02c39a] resize-none"
                            placeholder="Any symptoms, concerns, or additional information about this report..."
                        />
                        <p className="text-lg text-gray-500 mt-1">
                            {description.length}/500 characters
                        </p>
                    </div>


                    <div className="flex space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="flex-1 bg-[#00a896] text-white py-3 px-6 rounded-lg hover:bg-[#028090] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors shadow-md cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin mr-2" size={20} />
                                    Analyzing Report...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2" size={20} />
                                    Upload & Analyze
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHealthLog;