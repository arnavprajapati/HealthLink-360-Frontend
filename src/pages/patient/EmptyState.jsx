import React from 'react';
import { Plus, Activity } from 'lucide-react';

const EmptyState = ({ onAddClick }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="flex justify-center mb-4">
                <div className="bg-[#f0f3bd] p-4 rounded-full">
                    <Activity className="w-12 h-12 text-[#00a896]" />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Logs Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start tracking your health by adding your first health log. Upload reports or enter readings manually.
            </p>
            <button
                onClick={onAddClick}
                className="inline-flex items-center px-6 py-3 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors shadow-sm font-medium cursor-pointer"
            >
                <Plus size={20} className="mr-2" />
                Add Your First Health Log
            </button>
        </div>
    );
};

export default EmptyState;