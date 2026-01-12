import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';



import CountUp from '../components/CountUp';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const VisaLogo = () => (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.7844 22.8444L14.7933 10.3778H11.5978C10.9311 10.3778 10.7089 10.5933 10.4622 11.2156L8.93111 19.1467L8.71111 19.0156L9.62667 14.5089C10.6667 11.9533 13.0644 11.8333 13.0644 11.8333L12.3978 15.3533L11.5111 19.9689L12.7844 22.8444ZM24.0156 22.8444H26.8356L28.6111 10.3778H25.7911L24.0156 22.8444ZM18.7844 10.3778L17.2289 18.3111L18.4289 10.3778H15.6378L14.1133 22.8444H17.2022L17.5222 21.0556H20.7222L21.0156 22.8444H24.0067L21.9978 10.3778H18.7844ZM19.5311 18.7111L20.2867 14.3778C20.2867 14.3778 20.2867 14.3778L20.66 18.7111H19.5311ZM11.4556 22.8444H8.72222L5.80222 11.7222C5.64667 11.0556 4.96667 10.7444 3.78889 10.6667V10.3778H8.38889C9.28444 10.3778 9.38889 10.6156 9.60222 11.6667L11.4556 22.8444Z" fill="#1A1F71"/>
    </svg>
);
const MasterCardLogo = () => (
    <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect fill="#1e1e1e" width="32" height="20" rx="2" fillOpacity="0"/>
        <circle cx="11" cy="16" r="7" fill="#EB001B"/>
        <circle cx="21" cy="16" r="7" fill="#F79E1B"/>
        <path d="M16 20.66C14.72 19.5 13.9 17.84 13.9 16C13.9 14.16 14.72 12.5 16 11.34C17.28 12.5 18.1 14.16 18.1 16C18.1 17.84 17.28 19.5 16 20.66Z" fill="#FF5F00"/>
    </svg>
);

const Spinner = () => (
    <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#e0e0e0" strokeWidth="4" />
        <circle cx="25" cy="25" r="20" fill="none" stroke="#2ecc71" strokeWidth="4" strokeDasharray="80" strokeDashoffset="60">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
        </circle>
    </svg>
);

function RideDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const darkMode = localStorage.getItem('theme') === 'dark';

    const [weather, setWeather] = useState(null);
    const [ride, setRide] = useState(null);
    const [mapData, setMapData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [loadingMap, setLoadingMap] = useState(true);
    const [isBooked, setIsBooked] = useState(false);
    const [passengers, setPassengers] = useState([]);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/routes/${id}`);
                setRide(response.data);
            } catch (error) {
                navigate('/home');
            } finally {
                setLoadingDetails(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    useEffect(() => {
        const fetchMap = async () => {
            try {
                const response = await api.get(`/routes/${id}/map`);
                setMapData(response.data);
                if (response.data.weather) {
                    setWeather(response.data.weather);
                }
            } catch (error) {
                console.error("Map error");
            } finally {
                setLoadingMap(false);
            }
        };
        fetchMap();
    }, [id]);

    useEffect(() => {
        const fetchPassengers = async () => {
            try {
                const response = await api.get(`/routes/${id}/passengers`);
                setPassengers(response.data);
            } catch (error) {
                console.error("Could not fetch passengers");
            }
        };
        fetchPassengers();
    }, [id]);

    useEffect(() => {
        const checkBooking = async () => {
            try {
                const response = await api.get('/routes/booked');
                if (response.data.includes(Number(id))) setIsBooked(true);
            } catch (error) {}
        };
        checkBooking();
    }, [id]);

    const getWeatherInfo = (code) => {
        if (code === 0) return { label: "Clear Sky", icon: "☀️" };
        if (code >= 1 && code <= 3) return { label: "Cloudy", icon: "☁️" };
        if (code >= 45 && code <= 48) return { label: "Foggy", icon: "🌫️" };
        if (code >= 51 && code <= 67) return { label: "Rainy", icon: "🌧️" };
        if (code >= 71 && code <= 77) return { label: "Snow", icon: "❄️" };
        if (code >= 95) return { label: "Storm", icon: "⛈️" };
        return { label: "Unknown", icon: "🌡️" };
    };

    const handlePayment = async (method) => {
        if (method === 'card' && !selectedCard) {
            setPaymentError("Please select a card first.");
            return;
        }

        setIsProcessing(true);
        setPaymentError('');

        try {
            const bankResponse = await api.post('/external/bank/process', {
                userId: "user_123",
                amount: ride.costPerSeat,
                method: method === 'card' ? selectedCard : 'apple_pay'
            });

            if (bankResponse.data.status === 'SUCCESS') {
                await api.post(`/routes/${id}/book`);
                setIsBooked(true);
                setShowPaymentModal(false);
                const detailRes = await api.get(`/routes/${id}`);
                setRide(detailRes.data);
                const passRes = await api.get(`/routes/${id}/passengers`);
                setPassengers(passRes.data);
            } else {
                setPaymentError("Transaction Declined by Bank.");
            }
        } catch (error) {
            console.error(error);
            setPaymentError("Payment System Error. Try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const theme = {
        bg: darkMode ? '#121212' : '#ffffff',
        panelBg: darkMode ? '#1e1e1e' : '#ffffff',
        text: darkMode ? '#ffffff' : '#333333',
        subText: darkMode ? '#aaaaaa' : '#555555',
        border: darkMode ? '#333333' : '#eeeeee',
        statBg: darkMode ? '#2d2d2d' : '#f8f9fa',
        backBtnBg: darkMode ? '#333' : 'white',
        backBtnText: darkMode ? 'white' : '#333',
        mapTiles: darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        modalBg: darkMode ? '#252525' : 'white',
        optionBorder: darkMode ? '#444' : '#ddd',
    };

    if (loadingDetails) return <div style={{padding: '50px', textAlign: 'center', color: theme.text, background: theme.bg, height: '100vh'}}>Loading...</div>;
    if (!ride) return null;

    const routeLine = mapData?.geometry || [];
    const mapCenter = routeLine.length > 0 ? routeLine[0] : [51.505, -0.09];

    const isButtonDisabled = isBooked || ride.availableSeats === 0;
    const buttonText = isBooked ? "Booked" : (ride.availableSeats === 0 ? "Fully Booked" : "Book This Ride");
    const buttonBg = isBooked ? "#ccc" : (ride.availableSeats === 0 ? "#555" : "#2ecc71");

    return (
        <div style={{...styles.container, background: theme.bg}}>

            {showPaymentModal && (
                <div style={styles.modalOverlay}>
                    <div style={{...styles.modalCard, background: theme.modalBg, color: theme.text}}>
                        {isProcessing ? (
                            <div style={{padding: '40px 0'}}>
                                <Spinner />
                                <h3 style={{marginTop: '20px', color: theme.text}}>Contacting Bank...</h3>
                                <p style={{color: theme.subText, fontSize: '0.9rem'}}>Please do not close this window.</p>
                            </div>
                        ) : (
                            <>
                                <h2 style={{marginTop: 0, marginBottom: '10px'}}>Confirm Booking</h2>
                                <p style={{color: theme.subText, fontSize: '0.9rem', marginBottom: '25px'}}>
                                    To <b>{ride.destination}</b> for <b style={{color: '#2ecc71'}}>{ride.costPerSeat} EUR</b>
                                </p>

                                <div style={styles.applePayBtn} onClick={() => handlePayment('apple_pay')}>
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/512px-Apple_Pay_logo.svg.png"
                                        alt="Apple Pay"
                                        style={{height: '22px', filter: 'invert(1)'}}
                                    />
                                </div>

                                <div style={{margin: '20px 0', fontSize: '0.8rem', fontWeight: 'bold', color: theme.subText}}>OR PAY WITH CARD</div>

                                <div
                                    style={{
                                        ...styles.paymentOption,
                                        borderColor: selectedCard === 'visa' ? '#2ecc71' : theme.optionBorder,
                                        background: selectedCard === 'visa' ? (darkMode ? '#1e3a29' : '#e8f8f0') : 'transparent'
                                    }}
                                    onClick={() => setSelectedCard('visa')}
                                >
                                    <div style={{...styles.radioCircle, background: selectedCard === 'visa' ? '#2ecc71' : 'transparent'}}></div>
                                    <span style={{flex: 1, textAlign: 'left', marginLeft: '10px'}}>Visa ending in 4242</span>
                                    <VisaLogo />
                                </div>

                                <div
                                    style={{
                                        ...styles.paymentOption,
                                        borderColor: selectedCard === 'master' ? '#2ecc71' : theme.optionBorder,
                                        background: selectedCard === 'master' ? (darkMode ? '#1e3a29' : '#e8f8f0') : 'transparent'
                                    }}
                                    onClick={() => setSelectedCard('master')}
                                >
                                    <div style={{...styles.radioCircle, background: selectedCard === 'master' ? '#2ecc71' : 'transparent'}}></div>
                                    <span style={{flex: 1, textAlign: 'left', marginLeft: '10px'}}>Mastercard ending in 8899</span>
                                    <MasterCardLogo />
                                </div>

                                {paymentError && <div style={{color: '#e74c3c', fontSize: '0.9rem', marginTop: '10px'}}>{paymentError}</div>}

                                <div style={{display: 'flex', gap: '10px', marginTop: '25px'}}>
                                    <button onClick={() => setShowPaymentModal(false)} style={{...styles.cancelBtn, color: theme.text, borderColor: theme.border}}>Cancel</button>
                                    <button onClick={() => handlePayment('card')} style={{...styles.payBtn, background: '#2ecc71'}}>Pay & Book</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <button onClick={() => navigate('/home')} style={{...styles.backButton, background: theme.backBtnBg, color: theme.backBtnText, border: `1px solid ${theme.border}`}}>
                ← Back
            </button>

            <div style={{...styles.infoPanel, background: theme.panelBg, borderColor: theme.border}}>
                <h1 style={{color: '#2ecc71', margin: 0}}>{ride.destination}</h1>
                <h3 style={{color: theme.subText, marginTop: '5px', fontWeight: '400'}}>From: <b>{ride.startLocation}</b></h3>

                {/* VEHICLE INFO */}
                <div style={{color: theme.text, marginTop: '15px', padding: '10px 0', borderBottom: `1px solid ${theme.border}`, borderTop: `1px solid ${theme.border}`}}>
                    <h4 style={{color: theme.subText, margin: 0, fontSize: '0.9rem', textTransform:'uppercase'}}>Vehicle</h4>
                    <strong style={{fontSize: '1.2rem'}}>{ride.vehicleBrand} {ride.vehicleModel}</strong>
                </div>


                {/* DATE TIME DISPLAY */}
                <div style={{color: theme.text, marginTop: '15px', padding: '10px 0', borderBottom: `1px solid ${theme.border}`}}>
                    <h4 style={{color: theme.subText, margin: 0, fontSize: '0.9rem', textTransform:'uppercase'}}>Departure Time</h4>
                    <strong style={{fontSize: '1.2rem'}}>{new Date(ride.departureTime).toLocaleString()}</strong>
                </div>

                <div style={{...styles.statsBox, background: theme.statBg, borderColor: theme.border}}>
                    <div style={styles.statItem}>
                        <span style={styles.statLabel}>Distance</span>
                        <span style={{...styles.statValue, color: theme.text, display:'flex', gap:'3px', alignItems:'baseline'}}>
                            {loadingMap ? "..." : (mapData?.distanceKm ? (
                                <>
                                    <CountUp to={mapData.distanceKm} duration={1.5} />
                                    <span style={{fontSize:'0.9rem'}}>km</span>
                                </>
                            ) : 'N/A')}
                        </span>
                    </div>
                    <div style={{...styles.statSeparator, background: theme.border}}></div>
                    <div style={styles.statItem}>
                        <span style={styles.statLabel}>Est. Time</span>
                        <span style={{...styles.statValue, color: theme.text, display:'flex', gap:'3px', alignItems:'baseline'}}>
                            {loadingMap ? "..." : (mapData?.durationMin ? (
                                <>
                                    <CountUp to={Math.round(mapData.durationMin)} duration={1.5} />
                                    <span style={{fontSize:'0.9rem'}}>min</span>
                                </>
                            ) : '--')}
                        </span>
                    </div>
                </div>

                {weather && weather.code !== -1 && (
                    <div style={{
                        marginTop: '15px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)'
                    }}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <span style={{fontSize:'1.5rem'}}>{getWeatherInfo(weather.code).icon}</span>
                            <div>
                                <div style={{fontSize:'0.8rem', opacity:0.9, textTransform:'uppercase'}}>Dest. Weather</div>
                                <div style={{fontWeight:'bold'}}>{getWeatherInfo(weather.code).label}</div>
                            </div>
                        </div>
                        <div style={{fontSize:'1.8rem', fontWeight:'bold'}}>
                            {Math.round(weather.temp)}°C
                        </div>
                    </div>
                )}

                <div style={{...styles.divider, background: theme.border}}></div>

                <div style={{...styles.detailRow, borderBottomColor: theme.border, color: theme.text}}>
                    <span style={{color: theme.subText}}>Driver:</span>
                    <strong
                        style={{cursor: 'pointer', textDecoration: 'underline'}}
                        onClick={() => navigate(`/profile/${ride.driver?.id}`)}
                    >
                        {ride.driver?.username}
                    </strong>
                </div>

                <div style={{...styles.detailRow, borderBottomColor: theme.border, color: theme.text}}><span>Price:</span><strong>{ride.costPerSeat} EUR</strong></div>

                <div style={{marginTop: '25px', marginBottom: '15px'}}>
                    <h4 style={{color: theme.text, margin: '0 0 10px 0', fontSize: '0.95rem', textTransform:'uppercase', opacity: 0.8}}>Fellow Passengers</h4>
                    {passengers.length === 0 ? (
                        <div style={{color: theme.subText, fontSize: '0.9rem', fontStyle: 'italic'}}>No other passengers yet.</div>
                    ) : (
                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            {passengers.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/profile/${p.id}`)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: theme.statBg, padding: '8px 12px', borderRadius: '20px',
                                        cursor: 'pointer', border: `1px solid ${theme.border}`,
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{width: '24px', height: '24px', borderRadius: '50%', background: '#2ecc71', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold'}}>
                                        {p.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{color: theme.text, fontSize: '0.9rem', fontWeight: 'bold'}}>{p.username}</span>
                                    {p.rating > 0 && <span style={{color: '#f1c40f', fontSize: '0.8rem'}}>★ {p.rating}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{marginTop: 'auto'}}>
                    <button onClick={() => setShowPaymentModal(true)} disabled={isButtonDisabled} style={{ ...styles.bookButton, background: buttonBg, cursor: isButtonDisabled ? 'not-allowed' : 'pointer', color: isBooked ? '#555' : 'white' }}>{buttonText}</button>
                </div>
            </div>

            <div style={styles.mapPanel}>
                {!loadingMap ? (
                    <MapContainer center={mapCenter} zoom={10} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url={theme.mapTiles} attribution='&copy; OpenStreetMap' />
                        {routeLine.length > 0 && <Polyline positions={routeLine} color="#2ecc71" weight={5} />}
                        {routeLine.length > 0 && <Marker position={routeLine[0]}><Popup>Start</Popup></Marker>}
                        {routeLine.length > 0 && <Marker position={routeLine[routeLine.length - 1]}><Popup>End</Popup></Marker>}
                    </MapContainer>
                ) : <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888'}}>Loading Map...</div>}
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', height: '100vh', width: '100%', fontFamily: "'Segoe UI', sans-serif" },
    backButton: { position: 'absolute', top: '20px', left: '20px', zIndex: 1000, padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' },
    infoPanel: { flex: '0 0 400px', padding: '80px 40px 40px 40px', display: 'flex', flexDirection: 'column', boxShadow: '5px 0 20px rgba(0,0,0,0.1)', zIndex: 2, overflowY: 'auto' },
    mapPanel: { flex: 1, background: '#e0e0e0' },
    statsBox: { display: 'flex', marginTop: '25px', borderRadius: '12px', padding: '15px', justifyContent: 'space-around', alignItems: 'center', border: '1px solid transparent' },
    statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statLabel: { fontSize: '0.85rem', color: '#888', fontWeight: '600', textTransform: 'uppercase' },
    statValue: { fontSize: '1.2rem', fontWeight: 'bold', marginTop: '4px' },
    statSeparator: { width: '1px', height: '30px' },
    divider: { height: '1px', margin: '25px 0' },
    detailRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid', fontSize: '1rem' },
    bookButton: { width: '100%', padding: '16px', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '20px', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },

    //  MODAL STYLES
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)' },
    modalCard: { width: '380px', padding: '30px', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', textAlign: 'center' },
    applePayBtn: { background: 'black', borderRadius: '8px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s' },
    paymentOption: { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '12px', border: '1px solid', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.2s' },
    radioCircle: { width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #ddd', marginRight: '10px' },
    payBtn: { flex: 1, border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', padding: '12px', fontSize: '1rem', cursor: 'pointer' },
    cancelBtn: { flex: 1, background: 'transparent', border: '1px solid', borderRadius: '8px', fontWeight: 'bold', padding: '12px', cursor: 'pointer' }
};

export default RideDetails;