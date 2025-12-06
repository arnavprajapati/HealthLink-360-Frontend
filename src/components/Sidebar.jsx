import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    CalendarCheck,
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
    Target,
} from 'lucide-react';

const patientNavigation = [
    { name: 'Dashboard', href: '/patient-dashboard', icon: LayoutDashboard },
    { name: 'Track Progress', href: '/patient-track-progress', icon: Target },
    { name: 'Calendar', href: '/calendar', icon: CalendarCheck },
    { name: 'Appointments', href: '/patient-appointments', icon: Calendar },
    { name: 'Clinical Notes', href: '/patient-notes', icon: ClipboardList },
    { name: 'Reports', href: '/patient-reports', icon: FileText },
    { name: 'Settings', href: '/patient-settings', icon: Settings },
];

const doctorNavigation = [
    { name: 'Dashboard', href: '/doctor-dashboard', icon: LayoutDashboard },
    { name: 'My Patients', href: '/doctor-patients', icon: Users },
    { name: 'Profile', href: '/doctor-profile', icon: Stethoscope },
];

const NavItem = ({ name, href, icon: Icon, active, onClick }) => {
    const baseClasses = "flex items-center justify-between p-3 my-1 cursor-pointer transition-all duration-200 rounded-lg text-lg font-medium";
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
        <div className="w-64 min-w-64 h-screen bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-start p-6 border-b border-gray-100">
                <div className="p-2 bg-[#00a896] rounded-full text-white shadow-lg">
                    <HeartPulse className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-800 ml-3 tracking-wide">
                    HealthLink<span className="text-[#028090] font-black">-360</span>
                </h2>
            </div>

            <div className="px-6 py-3 bg-gray-50">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-semibold ${userRole === 'doctor'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-[#f0f3bd] text-[#028090]'
                    }`}>
                    {roleText}
                </span>
            </div>

            <nav className="p-4 flex-grow overflow-y-auto  overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <h3 className="text-lg font-semibold uppercase text-gray-400 mb-2 px-3">
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

                
            </nav>

            <div className="p-4 border-t border-gray-100 text-center">
                <p className="text-lg font-semibold text-gray-600 mb-1">
                    HealthLink-360 {userRole === 'doctor' ? 'Medical' : 'Patient'} Portal
                </p>
                <p className="text-lg text-gray-400">
                    © 2025 All Rights Reserved
                </p>
            </div>
        </div>
    );
};

export default Sidebar;