import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        authUser: null,
        selectedUser: null,
        otherUsers: [],
        onlineUsers: [],
        usersLoading: false,
        usersError: null,
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.authUser = action.payload;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        setOtherUsers: (state, action) => {
            state.otherUsers = action.payload;
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setUsersLoading: (state, action) => {
            state.usersLoading = action.payload;
        },
        setUsersError: (state, action) => {
            state.usersError = action.payload;
        },
        clearUsers: (state) => {
            state.otherUsers = [];
            state.selectedUser = null;
            state.usersLoading = false;
            state.usersError = null;
        }
    }
});

export const { 
    setAuthUser, 
    setSelectedUser, 
    setOtherUsers, 
    setOnlineUsers,
    setUsersLoading,
    setUsersError,
    clearUsers
} = userSlice.actions;

export default userSlice.reducer;