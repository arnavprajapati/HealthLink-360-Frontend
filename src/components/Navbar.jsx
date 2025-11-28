import React, { useState } from 'react';
import {
    Bell,
    LogOut,
    Settings,
    User,
    ChevronDown,
    Plus
} from 'lucide-react';

const Navbar = ({ toggleSidebar, user, onLogout, onAddRecord }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

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
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-gray-800">
                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </h2>
                    {getRoleBadge(user?.role)}
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    {user?.role === 'patient' && onAddRecord && (
                        <button 
                            onClick={onAddRecord}
                            className="flex items-center px-4 py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Add Record</span>
                        </button>
                    )}

                    <button className="p-2 rounded-full cursor-pointer text-gray-500 hover:bg-gray-100 relative transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

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
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#02c39a] to-[#028090] flex items-center justify-center text-white font-semibold text-sm">
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
                                        <p className="text-sm font-semibold text-gray-800">
                                            {user?.displayName || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <button
                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <User className="w-4 h-4 mr-3" />
                                        Profile Settings
                                    </button>

                                    <button
                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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