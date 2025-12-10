import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [hasValidCode, setHasValidCode] = useState(false);
    const navigate = useNavigate();

    const oobCode = searchParams.get('oobCode');
    const emailParam = searchParams.get('email');

    useEffect(() => {
        const init = async () => {
            if (oobCode) {
                try {
                    const userEmail = await verifyPasswordResetCode(auth, oobCode);
                    setEmail(userEmail);
                    setHasValidCode(true);
                } catch (err) {
                    console.error('Code verification error:', err);
                    if (err.code === 'auth/invalid-action-code') {
                        if (emailParam) {
                            setEmail(emailParam);
                        }
                        setSuccess(true);
                    } else {
                        setError('Invalid or expired reset link');
                    }
                }
            }
            else if (emailParam) {
                setEmail(emailParam);
                setSuccess(true);
            }

            setVerifying(false);
        };

        init();
    }, [oobCode, emailParam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            if (hasValidCode && oobCode) {
                await confirmPasswordReset(auth, oobCode, newPassword);
            }

            const response = await axios.post(`${API_URL}/reset-password-direct`, {
                email: email.toLowerCase(),
                newPassword
            });

            const result = response.data;

            if (!result.success) {
                throw new Error(result.message || 'Password reset failed');
            }

            setSuccess(true);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/');
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="bg-green-50 p-8 rounded-lg">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset successful!</h2>
                        <p className="text-gray-600 mb-4 text-lg">
                            Your password has been updated. You can now login with your new password.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-[#00a896] hover:bg-[#007f6e] transition-colors cursor-pointer text-lg"
                        >
                            Continue to Login
                        </button>
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
                        Set new password
                    </h2>
                    {email ? (
                        <p className="mt-2 text-center text-base text-gray-600">
                            For account: <strong>{email}</strong>
                        </p>
                    ) : (
                        <p className="mt-2 text-center text-base text-gray-600">
                            Enter your email and new password
                        </p>
                    )}
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-3">
                        {/* Show email input if email not pre-filled */}
                        {!email && (
                            <div>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] sm:text-lg"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] sm:text-lg"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] sm:text-lg"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-[#00a896] hover:bg-[#028090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02c39a] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Resetting password...' : 'Reset password'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center text-[#00a896] hover:text-[#028090] font-medium cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
