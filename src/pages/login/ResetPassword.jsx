import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, EyeOff, Eye, AlertCircle, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isValidToken, setIsValidToken] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setIsValidToken(false);
      setMessage("No reset token provided");
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      console.log('=== FRONTEND TOKEN VERIFICATION ===');
      console.log('1. Token from URL:', token);
      console.log('2. Token length:', token ? token.length : 'null');
      console.log('3. API URL:', process.env.REACT_APP_API_URL);
      console.log('4. Full request URL:', `${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`);
      
      console.log('5. Token verification successful:', response.data);
      setIsValidToken(true);
      setUserEmail(response.data.email || "");
      
    } catch (err) {
      console.error('=== FRONTEND TOKEN VERIFICATION ERROR ===');
      console.error('1. Error:', err);
      console.error('2. Response status:', err.response?.status);
      console.error('3. Response data:', err.response?.data);
      console.error('4. Response headers:', err.response?.headers);
      console.error('5. Request config:', err.config);
      
      setIsValidToken(false);
      const errorMessage = err.response?.data?.message || "Invalid or expired reset token";
      setMessage(errorMessage);
      if (err.response?.data?.debug) {
        console.error('6. Debug info from server:', err.response.data.debug);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      console.log('Attempting password reset for token:', token);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        token,
        password
      });

      console.log('Password reset successful:', response.data);
      setIsSuccess(true);
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err.response?.data?.message || "Failed to reset password";
      setMessage(errorMessage);
      if (errorMessage.toLowerCase().includes('token') && 
          (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('expired'))) {
        setIsValidToken(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-purple-400 mb-4">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-white">Verifying Token</h2>
            <p className="text-gray-400 mt-2">
              Please wait while we verify your reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-400 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Invalid Token</h2>
            <p className="text-gray-400 mt-2">
              {message || "This password reset link is invalid or has expired."}
            </p>
          </div>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg mb-3"
          >
            Request New Reset Link
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            {isSuccess ? (
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            ) : (
              <Lock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            )}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              {isSuccess ? "Success!" : "Reset Password"}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSuccess 
                ? "Your password has been reset successfully"
                : userEmail 
                  ? `Reset password for ${userEmail}`
                  : "Enter your new password below"
              }
            </p>
          </div>

          {!isSuccess && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-white/20 focus:ring-blue-500/50 focus:border-blue-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-white/20 focus:ring-blue-500/50 focus:border-blue-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {message && (
            <div
              className={`text-center p-3 rounded-xl mt-6 ${
                message.includes("failed") || message.includes("error") || message.includes("Invalid")
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/login")}
              className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}