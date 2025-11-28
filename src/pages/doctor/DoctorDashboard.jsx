import React from 'react';
import { useSelector } from 'react-redux';
import {
    Users,
    Calendar,
    Activity,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    const stats = [
        {
            name: 'Total Patients',
            value: '124',
            change: '+12%',
            changeType: 'positive',
            icon: Users,
            color: 'bg-[#00a896]'
        },
        {
            name: 'Today\'s Appointments',
            value: '8',
            change: '3 pending',
            changeType: 'neutral',
            icon: Calendar,
            color: 'bg-green-500'
        },
        {
            name: 'Active Cases',
            value: '42',
            change: '+5 this week',
            changeType: 'positive',
            icon: Activity,
            color: 'bg-purple-500'
        },
        {
            name: 'Consultations',
            value: '156',
            change: '+23% vs last month',
            changeType: 'positive',
            icon: TrendingUp,
            color: 'bg-orange-500'
        }
    ];

    const upcomingAppointments = [
        { id: 1, patient: 'John Doe', time: '10:00 AM', type: 'Follow-up', status: 'confirmed' },
        { id: 2, patient: 'Jane Smith', time: '11:30 AM', type: 'Consultation', status: 'confirmed' },
        { id: 3, patient: 'Mike Johnson', time: '2:00 PM', type: 'Check-up', status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#00a896] to-[#028090] rounded-lg shadow-lg p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, Dr. {user?.displayName || user?.email?.split('@')[0] || 'Doctor'}!
                </h1>
                <p className="text-[#f0f3bd]">
                    Here's what's happening with your patients today
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
                            <div className="flex items-baseline justify-between">
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' :
                                    stat.changeType === 'negative' ? 'text-red-600' :
                                        'text-gray-600'
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
                        <button className="text-sm text-[#00a896] hover:text-[#028090] font-medium">
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {upcomingAppointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-[#f0f3bd] p-2 rounded-full">
                                        <Clock className="w-5 h-5 text-[#028090]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{appointment.patient}</p>
                                        <p className="text-sm text-gray-600">{appointment.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-700">{appointment.time}</span>
                                    {appointment.status === 'confirmed' ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors">
                            <Users className="w-5 h-5 mr-2" />
                            Add New Patient
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Calendar className="w-5 h-5 mr-2" />
                            Schedule Appointment
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <Activity className="w-5 h-5 mr-2" />
                            View Reports
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Profile</h3>
                        <div className="flex items-center space-x-3">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full border-2 border-green-200"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                                    {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'D'}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-900">
                                    Dr. {user?.displayName || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;