import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../app/reducers/authSlice';

const PatientDashboard = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    async function handleLogout() {
        setError('');

        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError('Failed to log out');
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-800">HealthLink 360 - Patient Portal</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mr-3">
                                Patient
                            </span>
                            {user?.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full mr-3"
                                />
                            )}
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Patient Dashboard
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="px-4 py-8 sm:px-0">
                            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
                                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome, Patient!</h2>

                                <p className="text-gray-500">
                                    You are logged in as: <strong>{user?.email}</strong>
                                </p>

                                {user?.displayName && (
                                    <p className="text-gray-500 mt-2">Name: {user.displayName}</p>
                                )}

                                <p className="text-gray-500 mt-2">
                                    Role: <span className="font-semibold text-blue-600">{user?.role}</span>
                                </p>

                                {error && (
                                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PatientDashboard;