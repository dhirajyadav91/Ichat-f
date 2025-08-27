import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '..'; 
// const BASE_URL = import.meta.env.VITE_BASE_URL;

const Signup = () => {
  const [user, setUser] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/user/register`, user, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log("API response:", res.data);
      console.log("Submitted user:", user);

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errMsg = error?.response?.data?.message || "Something went wrong!";
      toast.error(errMsg);
    }

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
      <div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100'>
        <h1 className='text-3xl font-bold text-center'>Signup</h1>
        <form onSubmit={onSubmitHandler}>
          {/* Full Name */}
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Full Name</span>
            </label>
            <input
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              className='w-full input input-bordered h-10'
              type="text"
              placeholder='Full Name' />
          </div>

          {/* Username */}
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Username</span>
            </label>
            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className='w-full input input-bordered h-10'
              type="text"
              placeholder='Username' />
          </div>

          {/* Password */}
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Password</span>
            </label>
            <input
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className='w-full input input-bordered h-10'
              type="password"
              placeholder='Password' />
          </div>

          {/* Confirm Password */}
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Confirm Password</span>
            </label>
            <input
              value={user.confirmPassword}
              onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
              className='w-full input input-bordered h-10'
              type="password"
              placeholder='Confirm Password' />
          </div>

          {/* Gender (Radio Buttons) */}
          <div className='my-4'>
            <label className='label p-2'>
              <span className='text-base label-text'>Gender</span>
            </label>
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-2'>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={user.gender === "male"}
                  onChange={(e) => setUser({ ...user, gender: e.target.value })}
                  className="radio"
                />
                Male
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={user.gender === "female"}
                  onChange={(e) => setUser({ ...user, gender: e.target.value })}
                  className="radio"
                />
                Female
              </label>
            </div>
          </div>

          {/* Login Link */}
          <p className='text-center my-2'>
            Already have an account? <Link to="/login" className="text-blue-500 underline">Login</Link>
          </p>

          {/* Submit Button */}
          <div>
            <button type='submit' className='btn btn-block btn-sm mt-2 border border-slate-700'>
              Signup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
