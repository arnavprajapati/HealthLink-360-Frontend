import React, { useState } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import {
    X,
    Calendar,
    Clock,
    FileText,
    Send,
    Stethoscope
} from 'lucide-react';

const RequestAppointmentModal = ({ isOpen, onClose, doctors }) => {
    const { requestAppointment, loading } = useConnection();
    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        time: '',
        type: 'Consultation',
        requestMessage: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.doctorId || !formData.date || !formData.time) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            await requestAppointment(formData);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({
                    doctorId: '',
                    date: '',
                    time: '',
                    type: 'Consultation',
                    requestMessage: ''
                });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to send appointment request');
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#00a896] to-[#028090] rounded-t-xl">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Request Appointment
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 cursor-pointer text-white/80 hover:text-white rounded-lg hover:bg-white/10"
                    >
                        <X className="w-5 h-7" />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                        <p className="text-gray-600">
                            Your appointment request has been sent to the doctor. You'll be notified once they respond.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-lg">
                                {error}
                            </div>
                        )}

                        {/* Select Doctor */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">
                                <Stethoscope className="w-4 h-4 inline mr-1" />
                                Select Doctor *
                            </label>
                            <select
                                value={formData.doctorId}
                                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent"
                                required
                            >
                                <option value="">Choose a doctor...</option>
                                {doctors?.map((doctor) => (
                                    <option key={doctor._id} value={doctor._id}>
                                        Dr. {doctor.displayName} - {doctor.doctorProfile?.speciality || 'General Physician'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-1">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Preferred Date *
                                </label>
                                <input
                                    type="date"
                                    min={today}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-1">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Preferred Time *
                                </label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Appointment Type */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">
                                Appointment Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full cursor-pointer text-base px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent"
                            >
                                <option value="Consultation">Consultation</option>
                                <option value="Follow-up">Follow-up</option>
                                <option value="Check-up">Check-up</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">
                                <FileText className="w-4 h-4 inline mr-1" />
                                Message (Optional)
                            </label>
                            <textarea
                                value={formData.requestMessage}
                                onChange={(e) => setFormData({ ...formData, requestMessage: e.target.value })}
                                placeholder="Describe the reason for your appointment..."
                                rows={3}
                                className="w-full text-lg px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-lg text-blue-700">
                                💡 Your doctor will review this request and confirm or suggest an alternative time.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 cursor-pointer text-lg text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 text-lg cursor-pointer bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RequestAppointmentModal;
