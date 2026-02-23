import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  EyeOff,
  Eye,
  AlertCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isgoogleLoading, setIsGoogleLoading] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmail = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      setTimeout(async () => {
        try {
          const res = await axios.post(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5001/api"
            }/auth/login`,
            {
              username,
              password,
            }
          );

          setMessage("Login successful! Redirecting...");
          await login(res.data.token);
          setTimeout(() => navigate("/home"), 1000);
        } catch (err) {
          setMessage("Invalid credentials. Please try again");
        } finally {
          setIsLoading(false);
        }
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setTimeout(async () => {
      try {
        await loginWithGoogle();
        setMessage("Google login successful! Redirecting...");
      } catch (err) {
        setMessage("Google login failed");
        setIsGoogleLoading(false);
      }
    }, 1500);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }
    setIsForgotPasswordLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5001/api"
        }/auth/forgot-password`,
        { email }
      );

      setMessage("Password reset link sent to your email!");
      setEmail("");
      setTimeout(() => {
        setShowForgotPassword(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const resetToLogin = () => {
    setShowForgotPassword(false);
    setMessage("");
    setErrors({});
    setEmail("");
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            {showForgotPassword && (
              <button
                onClick={resetToLogin}
                className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              AniMatch
            </h1>
            <p className="text-gray-400 text-sm">
              {showForgotPassword
                ? "Enter your email to reset your password"
                : "Welcome back! Please sign in to your account"}
            </p>
          </div>

          {!showForgotPassword ? (
            <div className="space-y-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isgoogleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/20 disabled:bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-gray-800 font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group disabled:cursor-not-allowed disabled:scale-100"
              >
                {isgoogleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white">Signing in...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-900 px-4 text-gray-400">
                    Or continue with email
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) {
                        setErrors((prev) => ({ ...prev, username: "" }));
                      }
                    }}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.username
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-white/20 focus:ring-blue-500/50 focus:border-blue-500/50"
                    }`}
                  />
                </div>
                {errors.username && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
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
                    placeholder="Enter your password"
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

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium hover:underline transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors"
                  >
                    Create one here
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    placeholder="Enter your email address"
                    required
                    disabled={isForgotPasswordLoading}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-white/20 focus:ring-blue-500/50 focus:border-blue-500/50"
                    }`}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              <button
                type="submit"
                onClick={handleForgotPassword}
                disabled={isForgotPasswordLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:scale-100"
              >
                {isForgotPasswordLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="text-gray-400 hover:text-white font-medium hover:underline transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`text-center p-3 rounded-xl mt-6 ${
                message.includes("failed") || message.includes("error")
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
