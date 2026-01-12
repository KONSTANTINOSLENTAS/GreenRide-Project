import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Dock from '../components/Dock';
import LiquidSearch from '../components/LiquidSearch';
import CardNav from '../components/CardNav';
import { VscHome, VscAdd, VscSignOut, VscColorMode } from "react-icons/vsc";
import { FaCalendarAlt, FaCar, FaArrowRight, FaUniversity } from "react-icons/fa"; // Removed Map Icon
import NotificationBell from '../components/NotificationBell';
import GlareHover from '../components/GlareHover';
import CountUp from '../components/CountUp';

function Home() {
    const [routes, setRoutes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [userRole, setUserRole] = useState('USER');
    const [bookedRides, setBookedRides] = useState({});
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const [formData, setFormData] = useState({
        startLocation: '',
        destination: '',
        departureTime: '',
        availableSeats: 1,
        costPerSeat: 0,
        vehicleBrand: '',
        vehicleModel: ''
    });

    const [uploads, setUploads] = useState({ license: false, registration: false });

    //  PRELOADED UNIVERSITY ADDRESS
    const setUniversity = (field) => {
        setFormData(prev => ({ ...prev, [field]: "Omirou 9, Tavros" }));
    };


    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        fetchRoutes();
        fetchBookedRides();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Robust Role Detection
                let rawRole = decoded.role || decoded.roles || decoded.authorities || 'USER';
                if (Array.isArray(rawRole)) {
                    rawRole = (rawRole[0] && typeof rawRole[0] === 'object') ? rawRole[0].authority : rawRole[0];
                }
                const cleanRole = String(rawRole).replace('ROLE_', '').toUpperCase().trim();
                setUserRole(cleanRole);
            } catch (e) {
                console.error("Token decode failed", e);
            }
        }
    }, []);

    const fetchRoutes = async (query = '') => {
        try {
            const url = query ? `/routes?destination=${query}` : '/routes';
            const response = await api.get(url);
            setRoutes(response.data);
        } catch (error) { console.error("Error fetching routes", error); }
    };

    const fetchBookedRides = async () => {
        try {
            const response = await api.get('/routes/booked');
            const bookedMap = {};
            response.data.forEach(id => { bookedMap[id] = true; });
            setBookedRides(bookedMap);
        } catch (error) {}
    };

    const handleSearch = (e) => { if(e) e.preventDefault(); fetchRoutes(searchQuery); };
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/routes', formData);
            setShowCreateForm(false);
            fetchRoutes(searchQuery);
            setUploads({ license: false, registration: false });
        } catch (error) {}
    };

    // --- NAV ITEMS ---
    const navItems = useMemo(() => {
        const items = [
            {
                label: "My Profile",
                bgColor: "#2ecc71",
                textColor: "#fff",
                links: [{ label: "View Profile", href: "/profile" }]
            },
            {
                label: "My Rides",
                bgColor: "#27ae60",
                textColor: "#fff",
                links: [
                    { label: "Upcoming Rides", href: "/my-rides?type=upcoming" },
                    { label: "Ride History", href: "/my-rides?type=history" }
                ]
            }
        ];

        if (userRole === 'ADMIN') {
            items.push({
                label: "Admin Panel",
                bgColor: "#e74c3c",
                textColor: "#fff",
                links: [{ label: "Dashboard", href: "/admin" }]
            });
        }
        return items;
    }, [userRole]);

    const currentStyles = {
        pageBackground: darkMode ? '#121212' : '#ffffff',
        formCardBg: darkMode ? '#1e1e1e' : 'white',
        formCardBorder: darkMode ? '1px solid #333' : '1px solid #eee',
        textColor: darkMode ? '#ffffff' : '#333',
        inputBg: darkMode ? '#2d2d2d' : '#f9f9f9',
        inputColor: darkMode ? 'white' : '#333',
        inputBorder: darkMode ? '1px solid #444' : '1px solid #e0e0e0',
        subText: darkMode ? '#aaa' : '#999',
        cardBg: darkMode ? '#1e1e1e' : 'white',
        cardText: darkMode ? 'white' : '#333',
        cardBorderColor: darkMode ? '#333' : '#eee'
    };

    const dockItems = [
        { icon: <VscHome size={22} />, label: 'Home', onClick: () => { setShowCreateForm(false); fetchRoutes(''); setSearchQuery(''); } },
        { icon: <VscAdd size={22} />, label: 'Post Ride', onClick: () => setShowCreateForm(!showCreateForm) },
        { icon: <VscColorMode size={22} />, label: darkMode ? 'Light Mode' : 'Dark Mode', onClick: () => setDarkMode(!darkMode) },
        { icon: <VscSignOut size={22} />, label: 'Logout', onClick: handleLogout },
    ];

    const inputStyle = { ...styles.cleanInput, background: currentStyles.inputBg, color: currentStyles.inputColor, border: currentStyles.inputBorder };

    //render location fields (University button)
    const renderLocationInput = (field, placeholder) => (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                <input
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                    placeholder={placeholder}
                    type="text"
                    value={formData[field]}
                    onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                    required
                />
                <button type="button" onClick={() => setUniversity(field)} style={styles.iconBtn} title="Set to University">
                    <FaUniversity /> Uni
                </button>
            </div>
        </div>
    );

    return (
        <div style={{...styles.pageContainer, background: currentStyles.pageBackground}}>
            <NotificationBell />

            <CardNav
                logo="GreenRide"
                logoAlt="GreenRide"
                items={navItems}
                baseColor={darkMode ? '#1e1e1e' : '#fff'}
                menuColor={darkMode ? '#fff' : '#000'}
                buttonBgColor="#2ecc71"
                buttonTextColor="#fff"
                ease="power3.out"
            />

            <div style={styles.searchContainer}>
                <LiquidSearch
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSearch={handleSearch}
                    darkMode={darkMode}
                />
                <div style={{ textAlign: 'center', marginTop: '15px', color: currentStyles.subText, fontSize: '0.9rem', fontWeight: '500', letterSpacing: '0.5px' }}>
                    <CountUp to={routes.length} duration={1.9} /> Rides Posted
                </div>
            </div>
            <div style={styles.contentArea}>
                {showCreateForm ? (
                    <div style={{...styles.formCard, background: currentStyles.formCardBg, border: currentStyles.formCardBorder}}>
                        <h2 style={{color: '#2ecc71', marginTop: 0}}>Post a New Ride</h2>
                        <form onSubmit={handleCreateSubmit} style={{ display: 'grid', gap: '15px' }}>

                            {/* Location Inputs with University Shortcut */}
                            {renderLocationInput('startLocation', 'Start Location')}
                            {renderLocationInput('destination', 'Destination')}

                            {/* Remaining Fields */}
                            {['departureTime', 'availableSeats', 'costPerSeat'].map((field, i) => (
                                <input
                                    key={i}
                                    style={inputStyle}
                                    placeholder={field}
                                    type={field.includes('Time') ? 'datetime-local' : field.includes('seat') || field.includes('Cost') ? 'number' : 'text'}
                                    onChange={e => setFormData({...formData, [field]: e.target.value})}
                                    required
                                />
                            ))}

                            <h4 style={{color: currentStyles.textColor, margin: '5px 0 0', opacity: 0.8}}>Vehicle Details:</h4>
                            <input style={inputStyle} placeholder="Vehicle Brand (e.g., Toyota)" type="text" onChange={e => setFormData({...formData, vehicleBrand: e.target.value})} required />
                            <input style={inputStyle} placeholder="Vehicle Model (e.g., Camry XLE)" type="text" onChange={e => setFormData({...formData, vehicleModel: e.target.value})} required />

                            <h4 style={{color: currentStyles.textColor, margin: '5px 0 0', opacity: 0.8}}>Driver Verification (Dummy):</h4>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="button" onClick={(e) => { e.preventDefault(); setUploads(prev => ({...prev, license: true})); }} style={{...styles.greenButton, flex: 1, background: uploads.license ? '#2ecc71' : currentStyles.inputBg, color: uploads.license ? 'white' : currentStyles.textColor, border: uploads.license ? 'none' : currentStyles.inputBorder}}>
                                    {uploads.license ? "License Uploaded ✓" : "Upload Driver License"}
                                </button>
                                <button type="button" onClick={(e) => { e.preventDefault(); setUploads(prev => ({...prev, registration: true})); }} style={{...styles.greenButton, flex: 1, background: uploads.registration ? '#2ecc71' : currentStyles.inputBg, color: uploads.registration ? 'white' : currentStyles.textColor, border: uploads.registration ? 'none' : currentStyles.inputBorder}}>
                                    {uploads.registration ? "Registration Uploaded ✓" : "Upload Car Registration"}
                                </button>
                            </div>

                            <button type="submit" style={styles.greenButton}>Publish Ride</button>
                        </form>
                    </div>
                ) : (
                    <div style={styles.gridContainer}>
                        {routes.map(route => {
                            const isBooked = route.availableSeats === 0 || bookedRides[route.id];
                            return (
                                <GlareHover
                                    key={route.id}
                                    width="300px"
                                    height="320px"
                                    background={currentStyles.cardBg}
                                    borderRadius="20px"
                                    borderColor={currentStyles.cardBorderColor}
                                    glareColor={darkMode ? "#ffffff" : "#ffffff"}
                                    glareOpacity={darkMode ? 0.1 : 0.3}
                                    style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.05)', margin: '0' }}
                                    onClick={() => navigate(`/ride/${route.id}`)}
                                >
                                    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', boxSizing: 'border-box'}}>
                                        <div style={styles.cardHeader}>
                                            <span style={styles.priceTag}>
                                                € <CountUp to={route.costPerSeat} duration={0.2} />
                                            </span>
                                        </div>

                                        <div style={styles.cardContent}>
                                            <p style={{ margin: '0 0 5px 0', color: currentStyles.subText, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaCar /> {route.vehicleBrand} - {route.vehicleModel}
                                            </p>

                                            <h3 style={{...styles.destinationText, color: currentStyles.cardText}}>
                                                {route.destination}
                                            </h3>

                                            <p style={styles.fromText}>from {route.startLocation}</p>

                                            <div style={{ color: currentStyles.subText, fontSize: '0.8rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaCalendarAlt /> {new Date(route.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </div>

                                            <div style={styles.driverInfo}>
                                                <div style={styles.driverAvatar}>{route.driver?.username?.charAt(0).toUpperCase()}</div>
                                                <span style={{fontSize: '0.9rem', color: currentStyles.cardText}}>
                                                    {route.driver?.username}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={styles.cardFooter}>
                                            <span style={{ color: isBooked ? '#e74c3c' : '#2ecc71', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                {bookedRides[route.id] ? 'BOOKED' : (route.availableSeats === 0 ? 'FULL' : `${route.availableSeats} seats left`)}
                                            </span>
                                            <span style={{color: currentStyles.subText, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                Details <FaArrowRight size={10} />
                                            </span>
                                        </div>
                                    </div>
                                </GlareHover>
                            );
                        })}

                        {routes.length === 0 && (
                            <div style={{textAlign: 'center', color: currentStyles.subText, marginTop: '50px', width: '100%'}}>
                                <h3>No rides found</h3>
                                <p>Try searching for a city or post a new ride!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dock items={dockItems} panelHeight={90} baseItemSize={75} magnification={105} />
        </div>
    );
}

const styles = {
    pageContainer: { minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '120px', transition: 'background 0.3s ease', fontFamily: "'Segoe UI', sans-serif" },
    searchContainer: { marginTop: '250px', marginBottom: '40px', width: '90%', maxWidth: '1200px', zIndex: 10 },
    contentArea: { width: '90%', maxWidth: '1400px', zIndex: 2 },
    formCard: { padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', transition: 'background 0.3s ease', maxWidth: '600px', margin: '0 auto' },
    gridContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'flex-start', width: '100%' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '5px', width: '100%' },
    priceTag: { background: '#2ecc71', color: 'white', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, whiteSpace: 'nowrap' },
    destinationText: { margin: '0', fontSize: '1.3rem', fontWeight: '800', lineHeight: '1.2', whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1, textAlign: 'left', wordBreak: 'break-word' },
    cardContent: { textAlign: 'left' },
    fromText: { margin: '5px 0 0 0', color: '#888', fontSize: '0.95rem' },
    driverInfo: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' },
    driverAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#eee', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '10px' },
    cleanInput: { padding: '12px 15px', borderRadius: '8px', outline: 'none', width: '100%', boxSizing: 'border-box', fontSize: '1rem', marginBottom: '10px' },
    greenButton: { background: '#2ecc71', border: 'none', padding: '14px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px', boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)', transition: 'background 0.3s' },

    // Style for he "Uni" button
    iconBtn: {
        background: 'transparent',
        border: '1px solid #ddd',
        borderRadius: '5px',
        cursor: 'pointer',
        padding: '0 15px',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#666',
        height: '45px'
    }
};

export default Home;