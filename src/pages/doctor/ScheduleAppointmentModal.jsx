import React, { useState } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import { Calendar, Clock, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

const ScheduleAppointmentModal = ({ isOpen, onClose, patientId, patientName }) => {
    const { loading, error, successMessage, createAppointment, clearConnectionMessage } = useConnection();

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState('Consultation');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createAppointment({
            patientId,
            date,
            time,
            type,
            notes
        });
    };

    const handleClose = () => {
        clearConnectionMessage();
        setDate('');
        setTime('');
        setType('Consultation');
        setNotes('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Calendar className="h-6 w-6 text-teal-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Schedule Appointment with {patientName}
                                </h3>
                                <div className="mt-2">
                                    {error && (
                                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                            <span className="text-lg">{error}</span>
                                        </div>
                                    )}

                                    {successMessage && (
                                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            <span className="text-lg">{successMessage}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-lg font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-lg border-gray-300 rounded-md py-2 px-3 border"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-lg font-medium text-gray-700 mb-1">Time</label>
                                            <input
                                                type="time"
                                                required
                                                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-lg border-gray-300 rounded-md py-2 px-3 border"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-lg font-medium text-gray-700 mb-1">Type</label>
                                            <select
                                                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-lg border-gray-300 rounded-md py-2 px-3 border"
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                            >
                                                <option value="Consultation">Consultation</option>
                                                <option value="Follow-up">Follow-up</option>
                                                <option value="Check-up">Check-up</option>
                                                <option value="Emergency">Emergency</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-lg font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                            <textarea
                                                rows={3}
                                                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-lg border-gray-300 rounded-md py-2 px-3 border"
                                                placeholder="Add any specific instructions or notes..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                        </div>

                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`w-full cursor-pointer inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#00a896] text-lg font-medium text-white hover:bg-[#028090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:col-start-2 sm:text-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {loading ? 'Scheduling...' : 'Schedule'}
                                            </button>
                                            <button
                                                type="button"
                                                className="mt-3 w-full cursor-pointer inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-lg"
                                                onClick={handleClose}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleAppointmentModal;
