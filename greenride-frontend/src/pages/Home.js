import React, { useState, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import Dock from '../components/Dock';

import CardNav from '../components/CardNav';
import { VscHome, VscAdd, VscSignOut, VscColorMode } from "react-icons/vsc";
import { FaCalendarAlt, FaCar, FaArrowRight } from "react-icons/fa";
import NotificationBell from '../components/NotificationBell';

import CountUp from '../components/CountUp';

function Home() {
    const [routes, setRoutes] = useState([
        {id: 1, destination: "Athens", startLocation: "Patras", costPerSeat: 15, availableSeats: 3, departureTime: "2023-10-15T09:00:00", vehicleBrand: "Toyota", vehicleModel: "Yaris", driver: {username: "TestDriver"}},
        {id: 2, destination: "Thessaloniki", startLocation: "Larissa", costPerSeat: 20, availableSeats: 0, departureTime: "2023-10-16T14:30:00", vehicleBrand: "Honda", vehicleModel: "Civic", driver: {username: "User2"}},
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [userRole, setUserRole] = useState('USER'); // Hardcoded for now
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const [formData, setFormData] = useState({
        startLocation: '', destination: '', departureTime: '', availableSeats: 1, costPerSeat: 0, vehicleBrand: '', vehicleModel: ''
    });

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        // TODO: Implement JWT Decode logic here to detect Admin role
        console.log("Auth check skipped - Defaulting to USER");
    }, []);

    const handleSearch = (e) => {
        if(e) e.preventDefault();
        alert("Search API is not ready yet. Showing static data.");
    };

    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        alert("Create Ride feature is currently disabled.");
    };

    // --- NAV ITEMS (Static, no Admin check) ---
    const navItems = [
        { label: "My Profile", bgColor: "#2ecc71", textColor: "#fff", links: [{ label: "View Profile", href: "/profile" }] },
        { label: "My Rides", bgColor: "#27ae60", textColor: "#fff", links: [{ label: "History", href: "/my-rides" }] }
    ];

    const currentStyles = {
        pageBackground: darkMode ? '#121212' : '#ffffff',
        formCardBg: darkMode ? '#1e1e1e' : 'white',
        textColor: darkMode ? '#ffffff' : '#333',
        inputBg: darkMode ? '#2d2d2d' : '#f9f9f9',
        inputColor: darkMode ? 'white' : '#333',
        cardBg: darkMode ? '#1e1e1e' : 'white',
        cardText: darkMode ? 'white' : '#333',
    };

    const dockItems = [
        { icon: <VscHome size={22} />, label: 'Home', onClick: () => { setShowCreateForm(false); } },
        { icon: <VscAdd size={22} />, label: 'Post Ride', onClick: () => setShowCreateForm(!showCreateForm) },
        { icon: <VscColorMode size={22} />, label: darkMode ? 'Light Mode' : 'Dark Mode', onClick: () => setDarkMode(!darkMode) },
        { icon: <VscSignOut size={22} />, label: 'Logout', onClick: handleLogout },
    ];

    return (
        <div style={{...styles.pageContainer, background: currentStyles.pageBackground}}>
            <NotificationBell />

            <CardNav logo="GreenRide" logoAlt="GreenRide" items={navItems} baseColor={darkMode ? '#1e1e1e' : '#fff'} menuColor={darkMode ? '#fff' : '#000'} buttonBgColor="#2ecc71" buttonTextColor="#fff" ease="power3.out" />

            <div style={styles.searchContainer}>
                {/* Replaced LiquidSearch with basic input */}
                <form onSubmit={handleSearch} style={{display: 'flex', gap: '10px'}}>
                    <input
                        style={{padding: '15px', borderRadius: '30px', width: '100%', border: '1px solid #ccc'}}
                        placeholder="Search destination (API Pending)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" style={styles.greenButton}>Search</button>
                </form>
            </div>

            <div style={styles.contentArea}>
                {showCreateForm ? (
                    <div style={{...styles.formCard, background: currentStyles.formCardBg}}>
                        <h2 style={{color: '#2ecc71', marginTop: 0}}>Post a New Ride</h2>
                        <form onSubmit={handleCreateSubmit} style={{ display: 'grid', gap: '15px' }}>
                            <input style={styles.cleanInput} placeholder="Start Location" onChange={e => setFormData({...formData, startLocation: e.target.value})} />
                            <input style={styles.cleanInput} placeholder="Destination" onChange={e => setFormData({...formData, destination: e.target.value})} />
                            <button type="submit" style={styles.greenButton}>Publish Ride (Simulated)</button>
                        </form>
                    </div>
                ) : (
                    <div style={styles.gridContainer}>
                        {routes.map(route => (
                            // Removed GlareHover - Basic Card
                            <div key={route.id} style={{
                                width: '300px', height: '320px',
                                background: currentStyles.cardBg,
                                borderRadius: '20px',
                                padding: '20px',
                                border: '1px solid #ccc',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                            }}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.priceTag}>€ {route.costPerSeat}</span>
                                </div>
                                <div style={styles.cardContent}>
                                    <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '0.8rem' }}><FaCar /> {route.vehicleBrand}</p>
                                    <h3 style={{...styles.destinationText, color: currentStyles.cardText}}>{route.destination}</h3>
                                    <p style={styles.fromText}>from {route.startLocation}</p>
                                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '8px' }}>
                                        <FaCalendarAlt /> {route.departureTime.split('T')[0]}
                                    </div>
                                    <div style={styles.driverInfo}>
                                        <div style={styles.driverAvatar}>{route.driver.username.charAt(0)}</div>
                                        <span style={{color: currentStyles.cardText}}>{route.driver.username}</span>
                                    </div>
                                </div>
                                <div style={styles.cardFooter}>
                                    <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{route.availableSeats} seats left</span>
                                    <span style={{color: '#888', fontSize: '0.8rem'}}>Details <FaArrowRight size={10} /></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dock items={dockItems} panelHeight={90} baseItemSize={75} magnification={105} />
        </div>
    );
}

const styles = {
    pageContainer: { minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '120px', transition: 'background 0.3s ease', fontFamily: "'Segoe UI', sans-serif" },
    searchContainer: { marginTop: '250px', marginBottom: '40px', width: '90%', maxWidth: '600px', zIndex: 10 },
    contentArea: { width: '90%', maxWidth: '1400px', zIndex: 2 },
    formCard: { padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', transition: 'background 0.3s ease', maxWidth: '600px', margin: '0 auto' },
    gridContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'flex-start', width: '100%' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', margin Bottom: '5px', width: '100%' },
    priceTag: { background: '#2ecc71', color: 'white', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem' },
    destinationText: { margin: '0', fontSize: '1.3rem', fontWeight: '800' },
    cardContent: { textAlign: 'left' },
    fromText: { margin: '5px 0 0 0', color: '#888', fontSize: '0.95rem' },
    driverInfo: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' },
    driverAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#eee', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '10px' },
    cleanInput: { padding: '12px 15px', borderRadius: '8px', outline: 'none', width: '100%', boxSizing: 'border-box', fontSize: '1rem', marginBottom: '10px', border: '1px solid #ccc' },
    greenButton: { background: '#2ecc71', border: 'none', padding: '14px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' }
};

export default Home;