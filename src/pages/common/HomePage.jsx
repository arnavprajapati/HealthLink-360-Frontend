import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react'; 

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

            <main className="flex space-x-6">
                <Link
                    to="/login"
                    className="px-8 py-3 text-lg font-bold rounded-xl text-white bg-indigo-600 "
                >
                    Get Started (Login)
                </Link>
                <Link
                    to="/signup"
                    className="px-8 py-3 text-lg font-bold rounded-xl text-indigo-600 border-2 border-indigo-600 "
                >
                    Create Account (Sign Up)
                </Link>
            </main>
        </div>
    );
};

export default HomePage;