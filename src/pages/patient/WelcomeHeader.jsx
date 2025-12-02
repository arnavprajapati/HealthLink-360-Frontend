import React from 'react';
import { Plus } from 'lucide-react';

const WelcomeHeader = ({ user, onAddClick, filteredLogs, formatDate }) => {
    const getRoleBadge = (role) => {
        if (role === 'doctor') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Doctor
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0f3bd] text-[#028090]">
                Patient
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                    <h1 className="text-xl font-bold text-gray-900">
                        Hello, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
                    </h1>
                    {getRoleBadge(user?.role)}
                </div>

                {user?.role === 'patient' && (
                    <button
                        onClick={onAddClick}
                        className="flex items-center px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors font-medium text-sm cursor-pointer whitespace-nowrap"
                        title="Add New Health Record"
                    >
                        <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Add New Record</span>
                        <span className="inline sm:hidden">Add Log</span>
                    </button>
                )}
            </div>

            {filteredLogs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Records</p>
                        <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Categories</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {[...new Set(filteredLogs.map(log => log.diseaseType))].length}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                        <p className="text-sm font-bold text-gray-900">
                            {filteredLogs.length > 0 ? formatDate(filteredLogs[0].testDate || filteredLogs[0].createdAt) : '-'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WelcomeHeader;