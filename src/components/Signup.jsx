import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../redux/userSlice";
import axiosInstance, { API_URL } from "../api/axiosConfig"; // ✅ centralized axios + API_URL

const Signup = () => {
  const [user, setUser] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      console.log("✅ Using API URL:", API_URL);

      const res = await axiosInstance.post("/api/v1/user/register", user);

      if (res.data?.success) {
        toast.success("Signup successful!");
        dispatch(setAuthUser(res.data.user));
        navigate("/");
      } else {
        toast.error(res.data?.message || "Signup failed!");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong!";
      toast.error(msg);
    }

    // Reset form
    setUser({
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      gender: "",
    });
  };

  return (
    <div className="min-w-96 mx-auto">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-4">Signup</h1>

        <form onSubmit={onSubmitHandler}>
          <label className="label p-2">
            <span className="text-base label-text">Fullname</span>
          </label>
          <input
            value={user.fullName}
            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            className="w-full input input-bordered h-10"
            type="text"
            placeholder="Fullname"
            required
          />

          <label className="label p-2">
            <span className="text-base label-text">Username</span>
          </label>
          <input
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="w-full input input-bordered h-10"
            type="text"
            placeholder="Username"
            required
          />

          <label className="label p-2">
            <span className="text-base label-text">Password</span>
          </label>
          <input
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="w-full input input-bordered h-10"
            type="password"
            placeholder="Password"
            required
          />

          <label className="label p-2">
            <span className="text-base label-text">Confirm Password</span>
          </label>
          <input
            value={user.confirmPassword}
            onChange={(e) =>
              setUser({ ...user, confirmPassword: e.target.value })
            }
            className="w-full input input-bordered h-10"
            type="password"
            placeholder="Confirm Password"
            required
          />

          <label className="label p-2">
            <span className="text-base label-text">Gender</span>
          </label>
          <select
            value={user.gender}
            onChange={(e) => setUser({ ...user, gender: e.target.value })}
            className="w-full input input-bordered h-10"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <p className="text-center my-3">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 underline">
              Login
            </Link>
          </p>

          <button
            type="submit"
            className="btn btn-block btn-sm mt-2 border border-slate-700"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
