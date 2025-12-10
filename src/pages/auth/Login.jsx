import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithEmail, loginWithGoogle, clearError } from '../../app/reducers/authSlice';
import { X, Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());

    if (user) {
      if (user.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else {
        navigate('/dashboard/patient');
      }
    }
  }, [user, navigate, dispatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    setEmailNotVerified(false);

    try {
      let firebaseVerified = false;
      let firebaseLoginSuccess = false;

      try {
        const firebaseUser = await signInWithEmailAndPassword(auth, email, password);
        firebaseLoginSuccess = true;
        firebaseVerified = firebaseUser.user.emailVerified;

        if (firebaseVerified) {
          try {
            await axios.post(`${API_URL}/verify-email-code`, {
              oobCode: 'firebase-verified',
              email: email
            });
          } catch (syncErr) {
          }

          try {
            await axios.post(`${API_URL}/reset-password-direct`, {
              email: email,
              newPassword: password
            });
          } catch (syncErr) {
          }
        }
        await auth.signOut();
      } catch (firebaseErr) {
      }

      await dispatch(loginWithEmail({ email, password })).unwrap();
    } catch (err) {
      console.error("Login Failed", err);
      if (err && typeof err === 'string' && err.includes('verify')) {
        setEmailNotVerified(true);
      }
    }
  }

  const handleResendVerification = () => {
    navigate('/signup');
  };

  async function handleGoogleSignIn() {
    try {
      await dispatch(loginWithGoogle(role)).unwrap();
    } catch (err) {
      console.error("Google Login Failed", err);
    }
  }

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button
        onClick={handleClose}
        className="absolute cursor-pointer top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02c39a]"
        aria-label="Close Login"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            {error}
          </div>
        )}

        {/* {emailNotVerified && !verificationSent && (
          <div className="bg-yellow-50 border border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-base font-medium text-yellow-800">Email not verified</h3>
                <p className="text-base text-yellow-700 mt-1">
                  Please verify your email address before logging in.
                </p>
                <button
                  onClick={handleResendVerification}
                  className="mt-3 text-base font-medium text-yellow-800 underline hover:text-yellow-900"
                >
                  Resend verification email
                </button>
              </div>
            </div>
          </div>
        )} */}

        {verificationSent && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            Verification email sent! Please check your inbox.
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`px-6 cursor-pointer py-2 rounded-lg font-medium ${role === 'patient'
              ? 'bg-[#00a896] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`px-6 cursor-pointer py-2 rounded-lg font-medium ${role === 'doctor'
              ? 'bg-[#00a896] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Doctor
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] focus:z-10 sm:text-lg"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] focus:z-10 sm:text-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-lg text-[#00a896] hover:text-[#028090]">
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-[#00a896] hover:bg-[#028090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02c39a] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-lg">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full cursor-pointer flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <FcGoogle className="h-6 w-6 mr-2" />
              Sign in with Google as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link to="/signup" className="font-medium text-[#00a896] hover:text-[#028090]">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;