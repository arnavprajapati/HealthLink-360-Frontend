import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { setUser } from '../../app/reducers/authSlice';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    useEffect(() => {
        const verifyEmail = async () => {
            if (mode === 'verifyEmail' && oobCode) {
                try {
                    const info = await auth.checkActionCode(oobCode);
                    const userEmail = info.data.email;

                    await applyActionCode(auth, oobCode);

                    const response = await axios.post(`${API_URL}/verify-email-code`, {
                        oobCode,
                        email: userEmail
                    });

                    const result = response.data;

                    if (result.success) {
                        dispatch(setUser(result.user));
                        setSuccess(true);
                        setVerifying(false);

                        setTimeout(() => {
                            if (result.user.role === 'doctor') {
                                navigate('/dashboard/doctor', { replace: true });
                            } else {
                                navigate('/dashboard/patient', { replace: true });
                            }
                        }, 2000);
                        return;
                    }

                    throw new Error(result.message || 'Verification failed');
                } catch (err) {
                    console.error('Email verification error:', err);
                    if (err.code === 'auth/invalid-action-code') {
                        setError('This verification link is invalid or has expired');
                    } else {
                        setError('Failed to verify email. Please try again.');
                    }
                    setVerifying(false);
                }
            }
            else {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    await currentUser.reload();
                    if (currentUser.emailVerified) {

                        const response = await axios.post(`${API_URL}/verify-email-code`, {
                            oobCode: 'firebase-verified',
                            email: currentUser.email
                        });

                        const result = response.data;
                        if (result.success) {
                            dispatch(setUser(result.user));
                            setSuccess(true);
                            setVerifying(false);

                            setTimeout(() => {
                                if (result.user.role === 'doctor') {
                                    navigate('/dashboard/doctor', { replace: true });
                                } else {
                                    navigate('/dashboard/patient', { replace: true });
                                }
                            }, 2000);
                            return;
                        }
                    }
                }

                setSuccess(true);
                setVerifying(false);
                setError('');
            }
        };

        verifyEmail();
    }, [oobCode, mode, navigate, dispatch]);

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Mail className="h-16 w-16 text-[#00a896] mx-auto mb-4 animate-pulse" />
                    <p className="text-xl font-semibold text-gray-700">Verifying your email...</p>
                    <p className="text-gray-500 mt-2">Please wait</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="bg-green-50 p-8 rounded-lg">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified successfully!</h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            Your email has been verified. You can now log in to your account.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full cursor-pointer py-2 px-4 bg-[#00a896] text-white rounded-md hover:bg-[#028090] font-medium"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="bg-red-50 p-8 rounded-lg">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-2 px-4 bg-[#00a896] text-white rounded-md hover:bg-[#028090] font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
