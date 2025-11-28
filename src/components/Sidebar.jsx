import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    Stethoscope,
    Activity,
    ClipboardList,
    MessageSquare,
    Settings,
    ChevronRight,
    Plus,
    HeartPulse,
} from 'lucide-react';

const patientNavigation = [
    { name: 'Dashboard', href: '/patient-dashboard', icon: LayoutDashboard },
    { name: 'My Health Logs', href: '/patient-health-logs', icon: Activity },
    { name: 'Appointments', href: '/patient-appointments', icon: Calendar },
    { name: 'Reports', href: '/patient-reports', icon: FileText },
    { name: 'Messages', href: '/patient-messages', icon: MessageSquare },
    { name: 'Settings', href: '/patient-settings', icon: Settings },
];

const doctorNavigation = [
    { name: 'Dashboard', href: '/doctor-dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/doctor-patients', icon: Users },
    { name: 'Appointments', href: '/doctor-appointments', icon: Calendar },
    { name: 'Consultations', href: '/doctor-consultations', icon: Stethoscope },
    { name: 'Reports', href: '/doctor-reports', icon: ClipboardList },
    { name: 'Messages', href: '/doctor-messages', icon: MessageSquare },
    { name: 'Settings', href: '/doctor-settings', icon: Settings },
];

const NavItem = ({ name, href, icon: Icon, active, onClick }) => {
    const baseClasses = "flex items-center justify-between p-3 my-1 cursor-pointer transition-all duration-200 rounded-lg text-sm font-medium";
    const activeClasses = active
        ? "bg-[#f0f3bd] text-[#028090] hover:bg-[#f0f3bd]/80 shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800";

    return (
        <li className={`${baseClasses} ${activeClasses}`} onClick={onClick}>
            <div className="flex items-center w-full">
                <Icon className="w-5 h-5 mr-3" />
                {name}
            </div>
            {active && (
                <ChevronRight className="w-4 h-4 text-[#00a896]" />
            )}
        </li>
    );
};

const Sidebar = ({ userRole }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigation = userRole === 'doctor' ? doctorNavigation : patientNavigation;
    const roleColor = userRole === 'doctor' ? 'from-green-500 to-emerald-600' : 'from-[#00a896] to-[#028090]';
    const roleText = userRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal';

    return (
        <div className="w-64 h-screen bg-white shadow-xl flex flex-col ">
            <div className="flex items-center justify-start p-6 border-b border-gray-100">
                <div className="p-2 bg-[#00a896] rounded-full text-white shadow-lg">
                    <HeartPulse className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-800 ml-3 tracking-wide">
                    HealthLink<span className="text-[#028090] font-black">-360</span>
                </h2>
            </div>

            <div className="px-6 py-3 bg-gray-50">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${userRole === 'doctor'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-[#f0f3bd] text-[#028090]'
                    }`}>
                    {roleText}
                </span>
            </div>

            <nav className="p-4 flex-grow overflow-y-auto  overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2 px-3">
                    Main Menu
                </h3>
                <ul className="space-y-1">
                    {navigation.map(item => (
                        <NavItem
                            key={item.name}
                            {...item}
                            active={location.pathname === item.href}
                            onClick={() => navigate(item.href)}
                        />
                    ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className={`bg-gradient-to-br ${roleColor} p-4 rounded-xl shadow-lg text-white text-center`}>
                        <div className="flex justify-center mb-3">
                            <Plus className="w-8 h-8 p-1 bg-white/20 rounded-full" />
                        </div>
                        <p className="text-sm font-semibold mb-1">
                            {userRole === 'doctor' ? 'Add Patient' : 'Book Appointment'}
                        </p>
                        <p className="text-xs opacity-80">
                            {userRole === 'doctor'
                                ? 'Quick patient registration'
                                : 'Schedule your next visit'}
                        </p>
                        <button className="mt-3 text-sm font-bold bg-white text-[#028090] py-1.5 px-4 rounded-full shadow-md hover:bg-gray-100 transition duration-150">
                            {userRole === 'doctor' ? 'Add Now →' : 'Book Now →'}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                    HealthLink-360 {userRole === 'doctor' ? 'Medical' : 'Patient'} Portal
                </p>
                <p className="text-xs text-gray-400">
                    © 2025 All Rights Reserved
                </p>
            </div>
        </div>
    );
};

export default Sidebar;