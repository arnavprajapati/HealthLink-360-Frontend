import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { X, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { requestPasswordResetThunk } from '../../app/reducers/authSlice';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await dispatch(requestPasswordResetThunk({ email })).unwrap();

            const actionCodeSettings = {
                url: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`,
                handleCodeInApp: false
            };

            await sendPasswordResetEmail(auth, email, actionCodeSettings);

            setSuccess(true);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/');
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <button
                    onClick={handleClose}
                    className="absolute top-4 cursor-pointer right-4 p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02c39a]"
                    aria-label="Close"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="bg-green-50 p-8 rounded-lg">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                        <p className="text-gray-600 text-base mb-6">
                            We've sent password reset instructions to <strong>{email}</strong>
                        </p>
                        <p className="text-lg text-gray-500 mb-4">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center text-[#00a896] hover:text-[#028090] font-medium"
                        >
                            <ArrowLeft className="h-5 w-4 mr-2" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
            <button
                onClick={handleClose}
                className="absolute top-4 cursor-pointer right-4 p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02c39a]"
                aria-label="Close"
            >
                <X className="h-6 w-6" />
            </button>

            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-lg text-gray-600">
                        Enter your email address and we'll send you a link to reset your password
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-base font-medium text-red-700">{error}</p>
                                {error.includes('Google authentication') && (
                                    <div className="mt-3">
                                        <p className="text-base text-red-600 mb-2">
                                            Please use the "Sign in with Google" button on the login page.
                                        </p>
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center px-3 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                                        >
                                            Go to Login
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] focus:z-10 sm:text-lg"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-[#00a896] hover:bg-[#028090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02c39a] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Sending...' : 'Send reset link'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="inline-flex items-center text-[#00a896] hover:text-[#028090] font-medium">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
