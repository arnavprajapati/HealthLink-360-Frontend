import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHealth } from '../../context/HealthContext';

import AddHealthLog from './AddHealthLog';
import AddVitalsModal from './AddVitalsModal';
import WelcomeHeader from './WelcomeHeader';
import VitalsCard from './VitalsCard';
import HealthCard from './HealthCard';
import DetailModal from './DetailModal';
import FullReportModal from './FullReportModal';
import HealthCalendar from './HealthCalendar';
import AIHealthAssistant from './AIHealthAssistant';
import EmptyState from './EmptyState';

import GoalSettingModal from './GoalSettingModal';
import TrendsDashboard from './TrendsDashboard';

const PatientDashboard = ({ showAddModal, setShowAddModal }) => {
    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedFullReport, setSelectedFullReport] = useState(null);
    const [currentVitals, setCurrentVitals] = useState(null);
    const [vitalsLoading, setVitalsLoading] = useState(true);
    const [showVitalsModal, setShowVitalsModal] = useState(false);

    const { logs, loading, getHealthLogs, deleteHealthLog, getCurrentVitals } = useHealth();
    const { user } = useSelector((state) => state.auth);

    const [showGoalModal, setShowGoalModal] = useState(false);
    const [activeTab, setActiveTab] = useState('logs');

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const fetchHealthLogs = useCallback(() => {
        getHealthLogs({ diseaseType: 'all' });
    }, [getHealthLogs]);

    const fetchVitals = useCallback(() => {
        if (getCurrentVitals) {
            setVitalsLoading(true);
            getCurrentVitals()
                .then(data => {
                    setCurrentVitals(data.vitals);
                })
                .catch(err => console.error('Failed to fetch vitals:', err))
                .finally(() => setVitalsLoading(false));
        } else {
            setVitalsLoading(false);
        }
    }, [getCurrentVitals]);

    useEffect(() => {
        fetchHealthLogs();
        fetchVitals();
    }, [fetchHealthLogs, fetchVitals]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this health log?')) {
            try {
                await deleteHealthLog(id);
                fetchHealthLogs();
            } catch (err) {
                console.error('Failed to delete:', err);
            }
        }
    };

    const handleHealthLogSuccess = () => {
        fetchHealthLogs();
    };

    const handleVitalsSuccess = () => {
        fetchVitals();
    };

    const filteredLogs = logs.filter(log => log.fileType !== 'manual');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <WelcomeHeader
                    user={user}
                    onAddClick={() => setShowAddModal(true)}
                    filteredLogs={filteredLogs}
                    formatDate={formatDate}
                />

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Health Records</h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <EmptyState onAddClick={() => setShowAddModal(true)} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredLogs.map((log) => (
                                <HealthCard
                                    key={log._id}
                                    log={log}
                                    onViewDetails={setSelectedLog}
                                    onViewFullReport={setSelectedFullReport}
                                    onDelete={handleDelete}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <VitalsCard
                    vitals={currentVitals}
                    loading={vitalsLoading}
                    onUpdateClick={() => setShowVitalsModal(true)}
                    formatDate={formatDate}
                />

                <HealthCalendar />

                <AIHealthAssistant />
            </div>

            {showAddModal && (
                <AddHealthLog
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleHealthLogSuccess}
                />
            )}

            {selectedLog && (
                <DetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}

            {selectedFullReport && (
                <FullReportModal
                    log={selectedFullReport}
                    onClose={() => setSelectedFullReport(null)}
                />
            )}

            {showVitalsModal && (
                <AddVitalsModal
                    onClose={() => setShowVitalsModal(false)}
                    onSuccess={handleVitalsSuccess}
                    initialVitals={currentVitals}
                />
            )}
        </div>
    );
};

export default PatientDashboard;