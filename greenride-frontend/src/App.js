import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all your pages
import Login from './pages/Login';
import Home from './pages/Home';
import RideDetails from './pages/RideDetails';
import MyRides from './pages/MyRides';
import Profile from './pages/Profile';
import RideProgress from './pages/RideProgress';
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <Router>
            <Routes>
                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />

                {/* Main Feed */}
                <Route path="/home" element={<Home />} />

                {/* Ride Info (Before booking) */}
                <Route path="/ride/:id" element={<RideDetails />} />

                {/* Live Ride Mode (After booking) */}
                <Route path="/ride/progress/:id" element={<RideProgress />} />

                {/* User Lists */}
                <Route path="/my-rides" element={<MyRides />} />

                {/* Profile Routes */}
                {/* 1. My Profile (No ID) */}
                <Route path="/profile" element={<Profile />} />
                {/* 2. Other User Profile (With ID) */}
                <Route path="/profile/:id" element={<Profile />} />

                <Route path="/admin" element={<AdminDashboard />} />

            </Routes>
        </Router>
    );
}

export default App;