import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Eye, EyeOff, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Validation schema
const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      clearError();
      const result = await login(data);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: result.message || 'Login failed',
        });
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'An error occurred during login',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Test Management System
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`form-input ${
                  errors.email ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input pr-10 ${
                    errors.password ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Error message */}
          {(error || errors.root) && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-error-400" />
                <div className="ml-3">
                  <p className="text-sm text-error-800">
                    {error || errors.root?.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex justify-center py-3"
            >
              {isSubmitting ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Create account
              </Link>
            </div>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Admin:</strong> admin@testms.com / password123</p>
            <p><strong>Teacher:</strong> teacher@testms.com / password123</p>
            <p><strong>Student:</strong> student@testms.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;