import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Toaster, 
  ToastBar, 
  toast 
} from 'react-hot-toast'
import Sidebar from './Sidebar'
import MessageContainer from './MessageContainer'
import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice'

const HomePage = () => {
  const { authUser } = useSelector(store => store.user)
  const [theme, setTheme] = useState('dark')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // ✅ FIXED: Simple and reliable auth check
  useEffect(() => {
    console.log("🔄 Checking authentication...")
    
    const checkAuth = () => {
      try {
        // 1. First check if we have authUser in Redux
        if (authUser && authUser._id) {
          console.log("✅ User already in Redux:", authUser.fullName)
          setIsCheckingAuth(false)
          return
        }

        // 2. Check persist:root data
        const persistData = localStorage.getItem('persist:root')
        if (!persistData) {
          console.log("❌ No persist data found")
          redirectToLogin()
          return
        }

        const parsedData = JSON.parse(persistData)
        const userData = JSON.parse(parsedData.user)
        
        console.log("📦 User data from persist:", userData)

        // 3. Extract authUser from different possible structures
        let currentUser = null;

        if (userData.authUser) {
          // Case 1: Nested structure {success: true, user: {...}}
          if (userData.authUser.success && userData.authUser.user) {
            currentUser = userData.authUser.user;
          }
          // Case 2: Direct user object
          else if (userData.authUser._id) {
            currentUser = userData.authUser;
          }
          // Case 3: Stringified JSON
          else if (typeof userData.authUser === 'string') {
            try {
              const parsed = JSON.parse(userData.authUser);
              currentUser = parsed.user || parsed;
            } catch (e) {
              console.error("Error parsing authUser string:", e)
            }
          }
        }

        if (currentUser && currentUser._id) {
          console.log("🎯 Setting current user:", currentUser.fullName)
          dispatch(setAuthUser(currentUser))
          
          // Set other data if available
          if (userData.otherUsers) {
            dispatch(setOtherUsers(userData.otherUsers))
          }
          if (userData.selectedUser) {
            dispatch(setSelectedUser(userData.selectedUser))
          }
          
          setIsCheckingAuth(false)
        } else {
          console.log("❌ No valid user found")
          redirectToLogin()
        }

      } catch (error) {
        console.error("💥 Error in auth check:", error)
        redirectToLogin()
      }
    }

    const redirectToLogin = () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error('Please login again')
        navigate('/login', { replace: true })
      } else {
        // Token exists but no user data - clear and redirect
        localStorage.removeItem('authToken')
        toast.error('Session expired, please login again')
        navigate('/login', { replace: true })
      }
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [authUser, dispatch, navigate])

  // Responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Theme management
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('chat-theme', newTheme)
  }, [theme])

  // Logout handler
  const handleLogout = useCallback((message = 'Logged out successfully') => {
    dispatch(setAuthUser(null))
    dispatch(setOtherUsers([]))
    dispatch(setSelectedUser(null))
    localStorage.removeItem('authToken')
    localStorage.removeItem('persist:root') // ✅ Clear persist data
    sessionStorage.clear()
    
    toast.success(message)
    navigate('/login', { replace: true })
  }, [dispatch, navigate])

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your chat...</p>
        </div>
      </div>
    )
  }

  // Final auth check
  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Authentication failed</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800 transition-all duration-300"
      data-theme={theme}
    >
      {/* ✅ DEBUG - Current User Info */}
      <div className="fixed top-4 left-4 bg-green-500 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
        <div className="font-bold mb-1">CURRENT USER:</div>
        <div>Name: {authUser?.fullName}</div>
        <div>Username: @{authUser?.username}</div>
        <div>ID: {authUser?._id?.substring(0, 8)}</div>
      </div>

      <div className="container mx-auto max-w-7xl h-screen p-4">
        <div className={`
          flex h-full rounded-2xl overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg 
          border border-white/20 dark:border-zinc-700/50 shadow-2xl
          transition-all duration-300
          ${isMobile ? 'relative' : ''}
        `}>
          {/* Sidebar - YAHAN LOGIN USER SHOW HOGA */}
          <div className={`
            flex-shrink-0 h-full transition-all duration-300 ease-in-out
            ${isMobile 
              ? `absolute inset-y-0 left-0 z-30 w-80 transform ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }` 
              : 'w-80'
            }
          `}>
            <Sidebar 
              onLogout={handleLogout}
              onToggleTheme={toggleTheme}
              currentTheme={theme}
            />
          </div>

          {/* Overlay for Mobile */}
          {isMobile && isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Message Container */}
          <div className={`
            flex-1 h-full transition-all duration-300
            ${isMobile && isSidebarOpen ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}>
            <MessageContainer 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#1f2937',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <div className="flex items-center gap-3">
                {icon}
                <div className="flex-1">{message}</div>
                {t.type !== 'loading' && (
                  <button 
                    onClick={() => toast.dismiss(t.id)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
    </div>
  )
}

export default HomePage