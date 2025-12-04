import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../app/reducers/authSlice';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, onAddRecord }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Desktop Sidebar - always visible on lg screens */}
            <div className="hidden lg:block lg:flex-shrink-0">
                <Sidebar userRole={user?.role} />
            </div>

            {/* Mobile Sidebar - toggle based on state */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <Sidebar userRole={user?.role} />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar
                    toggleSidebar={toggleSidebar}
                    user={user}
                    onLogout={handleLogout}
                    onAddRecord={onAddRecord}
                />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 overflow-y-auto overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;