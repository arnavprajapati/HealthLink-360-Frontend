import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupWithEmail, loginWithGoogle, clearError, clearUser } from '../../app/reducers/authSlice';
import { X, Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { sendEmailVerification, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error: reduxError, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());

    if (user && !emailVerificationSent) {
      if (user.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else {
        navigate('/dashboard/patient');
      }
    }
  }, [user, navigate, dispatch, emailVerificationSent]);

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError('');

    if (!name) {
      return setValidationError('Please enter your name');
    }

    if (password !== passwordConfirm) {
      return setValidationError('Passwords do not match');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);

      await dispatch(signupWithEmail({
        email,
        password,
        name,
        role,
      })).unwrap();

      await auth.signOut();

      dispatch(clearUser());

      setEmailVerificationSent(true);
      setValidationError('');
    } catch (err) {
      console.error("Signup Failed", err);
      if (err.code === 'auth/email-already-in-use') {
        setValidationError('This email is already registered. Please login instead.');
      } else {
        setValidationError(err.message || 'Signup failed. Please try again.');
      }
    }
  }

  async function handleGoogleSignIn() {
    try {
      await dispatch(loginWithGoogle(role)).unwrap();
    } catch (err) {
      console.error("Google Sign In Failed", err);
    }
  }

  const handleClose = () => {
    navigate('/');
  };

  if (emailVerificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-blue-50 p-8 rounded-lg">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
            <p className="text-gray-600 mb-6 text-base">
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-lg text-gray-500 mb-6">
              Please check your email and click the verification link to activate your account.
              After verifying, you can log in to your account.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full py-2 cursor-pointer px-4 bg-[#00a896] text-white rounded-md hover:bg-[#028090] font-medium"
              >
                Go to Login
              </Link>
              <button
                onClick={() => setEmailVerificationSent(false)}
                className="block w-full cursor-pointer py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Back to Signup
              </button>
            </div>
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
        aria-label="Close Signup"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        {(validationError || reduxError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            {validationError || reduxError}
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
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] focus:z-10 sm:text-lg"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              <input
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] focus:z-10 sm:text-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#02c39a] focus:border-[#02c39a] focus:z-10 sm:text-lg"
                placeholder="Password Confirmation"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-[#00a896] hover:bg-[#028090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02c39a] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating Account...' : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
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
              Sign up with Google as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link to="/login" className="font-medium text-[#00a896] hover:text-[#028090]">
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;