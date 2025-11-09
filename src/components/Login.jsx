import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../redux/userSlice";
import axiosInstance, { API_URL } from "../api/axiosConfig";

const Login = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!user.username.trim() || !user.password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (user.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Logging in...", user);

      const res = await axiosInstance.post("/user/login", user);
      console.log("✅ Login response:", res.data);

      if (!res.data.success) {
        toast.error(res.data.message || "Login failed");
        return;
      }

      const userData = res.data.user;
      const token = res.data.token;

      if (!userData) throw new Error("No user data received from server");

      // Save token if received
      if (token) {
        localStorage.setItem("authToken", token);
        if (rememberMe) localStorage.setItem("rememberMe", "true");
      }

      dispatch(setAuthUser(userData));
      toast.success(`Welcome back, ${userData.fullName || userData.username}!`);
      navigate("/");

    } catch (error) {
      console.error("❌ Login error:", error);

      if (error.code === "ERR_NETWORK") {
        toast.error(`Cannot connect to server. Is backend running on ${API_URL}?`);
      } else if (error.response) {
        toast.error(error.response.data?.message || "Login failed");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      user: { username: "demo_user", password: "demo123" },
      admin: { username: "demo_admin", password: "admin123" },
    };
    setUser(demoAccounts[role]);
    toast.success(`Demo ${role} credentials filled!`);
  };

  const testConnection = async () => {
    try {
      toast.loading("Testing server connection...");
      const res = await axiosInstance.get("/health");
      toast.dismiss();
      toast.success(`Server is running! Status: ${res.status}`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Server connection failed: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 px-4 py-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">

        <div className="flex justify-between items-center mb-6">
          <button onClick={testConnection} className="text-xs bg-black/30 px-3 py-1 rounded-full text-gray-300 hover:text-white transition-colors">
            Test Server Connection
          </button>
          <div className="text-xs text-gray-400">API: {API_URL.split("//")[1]}</div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {loading ? "Signing In..." : "Welcome Back"}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">Sign in to your account</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <button onClick={() => handleDemoLogin("user")} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium">
            Demo User
          </button>
          <button onClick={() => handleDemoLogin("admin")} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium">
            Demo Admin
          </button>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-gray-300 mb-2 text-sm sm:text-base">Username</label>
            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm sm:text-base">Password</label>
            <div className="relative">
              <input
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                disabled={loading}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded" disabled={loading}/>
              <span className="text-gray-300 text-sm">Remember me</span>
            </label>
            <button type="button" className="text-blue-400 hover:text-blue-300 text-sm" disabled={loading}>Forgot password?</button>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl font-semibold text-white ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
