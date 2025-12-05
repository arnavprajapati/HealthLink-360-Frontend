import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    LogOut,
    Settings,
    User,
    ChevronDown,
    Menu,
    FileText,
    X,
    MessageSquare,
    Send
} from 'lucide-react';
import { useConnection } from '../context/ConnectionContext';

const Navbar = ({ toggleSidebar, user, onLogout, onAddRecord }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const {
        unreadNotesCount,
        getUnreadNotesCount,
        doctorUnreadNotes,
        getDoctorUnreadNotes,
        patientUnreadNotes,
        getPatientUnreadNotes,
        markNoteAsRead
    } = useConnection();

    useEffect(() => {
        if (user) {
            getUnreadNotesCount();
            if (user.role === 'patient') {
                getPatientUnreadNotes();
            } else if (user.role === 'doctor') {
                getDoctorUnreadNotes();
            }
        }
    }, [user]);

    // Refetch when notification bell is clicked
    const handleBellClick = async () => {
        if (!showNotifications) {
            await getUnreadNotesCount();
            if (user?.role === 'patient') {
                await getPatientUnreadNotes();
            } else if (user?.role === 'doctor') {
                await getDoctorUnreadNotes();
            }
        }
        setShowNotifications(!showNotifications);
    };

    const handleProfileClick = () => {
        setShowProfileMenu(false);
        if (user?.role === 'doctor') {
            navigate('/doctor-profile');
        } else {
        }
    };

    const handleNotificationClick = async (note) => {
        await markNoteAsRead(note._id);
        await getUnreadNotesCount();
        setShowNotifications(false);
        if (user?.role === 'patient') {
            navigate('/patient-notes');
        } else {
            navigate(`/doctor/patient/${note.patient?._id || note.patient}`);
        }
    };

    const unreadNotes = user?.role === 'patient'
        ? (patientUnreadNotes || []).slice(0, 5)
        : (doctorUnreadNotes || []).slice(0, 5);

    return (
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between w-full">

                {/* Hamburger Menu Button - Mobile Only */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold text-[#00a896]"></h2>

                <div className="flex items-center space-x-2 sm:space-x-4">

                    {/* Notifications Bell */}
                    <div className="relative">
                        <button
                            onClick={handleBellClick}
                            className="p-2 rounded-full cursor-pointer text-gray-500 hover:bg-gray-100 relative transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadNotesCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                                    {unreadNotesCount > 9 ? '9+' : unreadNotesCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#00a896] to-[#028090]">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <Bell className="w-4 h-4" />
                                            Notifications {unreadNotesCount > 0 && `(${unreadNotesCount})`}
                                        </h3>
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            className="text-white/80 hover:text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {unreadNotesCount === 0 || unreadNotes.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-gray-500 text-sm">No new notifications</p>
                                            </div>
                                        ) : (
                                            <>
                                                {unreadNotes.map((note) => (
                                                    <div
                                                        key={note._id}
                                                        onClick={() => handleNotificationClick(note)}
                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* Sender Avatar */}
                                                            {note.senderRole === 'doctor' ? (
                                                                note.doctor?.photoURL ? (
                                                                    <img
                                                                        src={note.doctor.photoURL}
                                                                        alt={note.doctor.displayName}
                                                                        className="w-10 h-10 rounded-full object-cover border-2 border-teal-100"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center text-white font-bold text-sm">
                                                                        {note.doctor?.displayName?.charAt(0)?.toUpperCase() || 'D'}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                (note.patient?.photoURL || note.sender?.photoURL) ? (
                                                                    <img
                                                                        src={note.patient?.photoURL || note.sender?.photoURL}
                                                                        alt={note.patient?.displayName || note.sender?.displayName}
                                                                        className="w-10 h-10 rounded-full object-cover border-2 border-green-100"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                                                                        {note.patient?.displayName?.charAt(0)?.toUpperCase() || note.sender?.displayName?.charAt(0)?.toUpperCase() || 'P'}
                                                                    </div>
                                                                )
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {note.title}
                                                                </p>
                                                                <p className="text-xs text-gray-600 mt-0.5 font-medium">
                                                                    {note.senderRole === 'doctor'
                                                                        ? `Dr. ${note.doctor?.displayName || 'Doctor'}`
                                                                        : note.patient?.displayName || note.sender?.displayName || 'Patient'}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                                                    <button
                                                        onClick={() => {
                                                            setShowNotifications(false);
                                                            navigate(user?.role === 'patient' ? '/patient-notes' : '/doctor-patients');
                                                        }}
                                                        className="w-full text-center text-sm text-[#00a896] hover:text-[#028090] font-medium"
                                                    >
                                                        View All Notes →
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center space-x-3 border-l border-gray-200 pl-4 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
                        >
                            {user?.photoURL ? (
                                <img
                                    className="h-9 w-9 rounded-full object-cover border-2 border-[#f0f3bd]"
                                    src={user.photoURL}
                                    alt={user.displayName || user.email}
                                    onError={(e) => e.target.src = 'https://placehold.co/40x40/00a896/FFF?text=' + (user.email?.[0]?.toUpperCase() || 'U')}
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#02c39a] to-[#028090] flex items-center justify-center text-white font-semibold text-lg">
                                    {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}

                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowProfileMenu(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-lg font-semibold text-gray-800">
                                            {user?.displayName || 'User'}
                                        </p>
                                        <p className="text-lg text-gray-500 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <button
                                        className="w-full flex items-center px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={handleProfileClick}
                                    >
                                        <User className="w-4 h-4 mr-3" />
                                        Profile Settings
                                    </button>

                                    <button
                                        className="w-full flex items-center px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <Settings className="w-4 h-4 mr-3" />
                                        Account Settings
                                    </button>

                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                onLogout();
                                            }}
                                            className="w-full flex items-center px-4 py-2 text-lg text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;