import Signup from './components/Signup';
import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from './components/HomePage';
import Login from './components/Login';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import { setOnlineUsers } from './redux/userSlice';

// ✅ Add future flag config inside createBrowserRouter
const router = createBrowserRouter(
  [
    { path: "/", element: <HomePage /> },
    { path: "/signup", element: <Signup /> },
    { path: "/login", element: <Login /> },
  ],
  {
    future: {
      v7_startTransition: true, // ✅ Enable smoother transitions early
    },
  }
);

function App() {
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [socket, setSocketState] = useState(null);

  // ✅ Load backend URL safely from .env
  const API_URL = import.meta.env?.VITE_API_URL?.trim() || "http://localhost:8080";

  useEffect(() => {
    if (authUser?._id) {
      const socketio = io(API_URL, {
        query: { userId: authUser._id },
        transports: ["websocket", "polling"],
        withCredentials: true,
      });

      setSocketState(socketio);

      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      return () => socketio.close();
    } else {
      if (socket) {
        socket.close();
        setSocketState(null);
      }
    }
  }, [authUser]);

  console.log("✅ ENV (Frontend) =>", API_URL);

  return (
    <div className="p-4 h-screen flex items-center justify-center">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
