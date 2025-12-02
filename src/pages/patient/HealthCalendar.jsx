import React from 'react';
import { Calendar } from 'lucide-react';

const HealthCalendar = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#00a896]" />
                Health Activity Calendar
            </h3>

            <div className="text-center py-8">
                <p className="text-base text-gray-600 mb-2">
                    🗓️ Calendar View Coming Soon
                </p>
                <p className="text-base text-gray-500">
                    Track your log dates, upcoming checkups, and medication reminders here.
                </p>
                <div className="mt-4 bg-gray-100 rounded-lg p-4 border border-gray-200">
                    <p className="text-2xl font-semibold text-[#00a896]">Nov 2025</p>
                    <div className="h-24 w-full bg-gray-200 mt-2 rounded"></div>
                </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors text-base font-medium">
                View Full Calendar
            </button>
        </div>
    );
};

export default HealthCalendar;