import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

            <main className="flex space-x-6">
                <Link
                    to="/login"
                    className="px-8 py-3 text-lg font-bold rounded-xl text-white bg-[#00a896] hover:bg-[#028090] transition-colors"
                >
                    Get Started (Login)
                </Link>
                <Link
                    to="/signup"
                    className="px-8 py-3 text-lg font-bold rounded-xl text-[#028090] border-2 border-[#00a896] hover:bg-[#f0f3bd] transition-colors"
                >
                    Create Account (Sign Up)
                </Link>
            </main>
        </div>
    );
};

export default HomePage;