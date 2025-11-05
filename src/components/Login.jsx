// Login.js - HANDLE ALL RESPONSE FORMATS
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../redux/userSlice";
import axiosInstance from "../api/axiosConfig";

const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!user.username || !user.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Attempting login...", user);
      
      const res = await axiosInstance.post("/api/v1/user/login", user);
      console.log("✅ Raw login response:", res.data);

      // ✅ HANDLE DIFFERENT RESPONSE FORMATS
      let userData, token;

      if (res.data.success) {
        // Format 1: { success: true, user: {}, token: '' }
        userData = res.data.user;
        token = res.data.token;
      } else if (res.data._id) {
        // Format 2: Direct user object { _id, username, fullName, ... }
        userData = res.data;
        token = res.data.token || res.data.accessToken;
      } else {
        console.error("❌ Unexpected response format:", res.data);
        toast.error("Unexpected response from server");
        return;
      }

      if (!userData) {
        toast.error("No user data received");
        return;
      }

      // ✅ Save token to localStorage (if available)
      if (token) {
        localStorage.setItem('authToken', token);
        console.log("✅ Token saved to localStorage");
      } else {
        console.log("⚠️ No token received in response");
      }

      // ✅ Save user to Redux
      console.log("✅ Dispatching authUser:", userData);
      dispatch(setAuthUser(userData));
      
      toast.success(`Welcome back, ${userData.fullName || userData.username}!`);
      navigate("/");

    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "ERR_NETWORK") {
        toast.error("Network error: Cannot connect to server");
      } else if (error.response) {
        toast.error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
      setUser({
        username: "",
        password: "",
      });
    }
  };

  return (
    <div className="min-w-96 mx-auto">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {loading ? "Logging in..." : "Login"}
        </h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4">
            <label className="label p-2">
              <span className="text-base label-text font-semibold">
                Username
              </span>
            </label>
            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full input input-bordered h-10 bg-white"
              type="text"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="label p-2">
              <span className="text-base label-text font-semibold">
                Password
              </span>
            </label>
            <input
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full input input-bordered h-10 bg-white"
              type="password"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <p className="text-center my-4 text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign up
            </Link>
          </p>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn btn-sm mt-2 border border-slate-700 ${
                loading
                  ? "btn-disabled opacity-50"
                  : "hover:bg-slate-700 hover:text-white"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                      5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 
                      5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;