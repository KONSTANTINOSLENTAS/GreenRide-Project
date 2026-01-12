import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Icons
import { VscDebugStart, VscCheck } from "react-icons/vsc";
import { FaStar, FaClock } from "react-icons/fa";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RideProgress() {
    const { id } = useParams();
    const navigate = useNavigate();
    const darkMode = localStorage.getItem('theme') === 'dark';

    const [ride, setRide] = useState(null);
    const [mapData, setMapData] = useState(null);
    const [currentUser, setCurrentUser] = useState('');

    const [reviewQueue, setReviewQueue] = useState([]);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const [now, setNow] = useState(new Date());

    // Review Form State
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try { setCurrentUser(jwtDecode(token).sub); } catch (e) {}
        }

        fetchRideStatus();
        fetchMapData();

        const apiInterval = setInterval(fetchRideStatus, 5000);

        // 2X SPEED CLOCK
        const clockInterval = setInterval(() => {
            setNow(prevTime => new Date(prevTime.getTime() + 200));
        }, 100);

        return () => {
            clearInterval(apiInterval);
            clearInterval(clockInterval);
        };
    }, [id]);

    const fetchRideStatus = async () => {
        try {
            const res = await api.get(`/routes/${id}`);
            const data = res.data.details || res.data;
            setRide(data);
        } catch (error) {
            console.error("Error loading ride");
        }
    };

    const fetchMapData = async () => {
        try {
            const res = await api.get(`/routes/${id}/map`);
            setMapData(res.data);
        } catch (error) {}
    };

    const handleStatusChange = async (newStatus) => {
        const endpoint = newStatus === 'IN_PROGRESS' ? 'start' : 'finish';
        await api.post(`/routes/${id}/${endpoint}`);
        if (newStatus === 'COMPLETED') {
            await fetchRideStatus();
            prepareReviewQueue();
        } else {
            fetchRideStatus();
        }
    };

    // PREPARE REVIEW QUEUE
    const prepareReviewQueue = async () => {
        try {
            const routeRes = await api.get(`/routes/${id}`);
            const driver = routeRes.data.driver;
            const passRes = await api.get(`/routes/${id}/passengers`);
            const passengers = passRes.data;

            const allParticipants = [];
            if (driver.username !== currentUser) {
                allParticipants.push({ id: driver.id, username: driver.username, role: 'Driver' });
            }
            passengers.forEach(p => {
                if (p.username !== currentUser) {
                    allParticipants.push({ id: p.id, username: p.username, role: 'Passenger' });
                }
            });

            setReviewQueue(allParticipants);
            setShowReviewModal(true);
        } catch (e) { console.error("Error building review queue", e); }
    };

    const submitReview = async () => {
        if (reviewQueue.length === 0) return;
        setIsSubmitting(true);
        const target = reviewQueue[currentReviewIndex];

        try {
            await api.post(`/reviews/${id}`, {
                targetId: target.id,
                rating: reviewRating,
                comment: reviewComment
            });

            setReviewRating(5);
            setReviewComment('');
            setIsSubmitting(false);

            if (currentReviewIndex < reviewQueue.length - 1) {
                setCurrentReviewIndex(prev => prev + 1);
            } else {
                setShowReviewModal(false);
                navigate('/my-rides?type=history');
            }
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const theme = {
        bg: darkMode ? '#121212' : '#f4f4f4',
        card: darkMode ? '#1e1e1e' : 'white',
        text: darkMode ? 'white' : '#333',
        subText: darkMode ? '#aaa' : '#666',
        green: '#2ecc71',
        red: '#e74c3c',
        mapTiles: darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    };

    if (!ride) return <div style={{padding:'50px', textAlign:'center', color: theme.text}}>Loading...</div>;

    //  LOGIC: TIME & PROGRESS
    const isDriver = ride.driver?.username === currentUser;
    const currentStatus = ride.status || 'SCHEDULED';

    //
    const durationMin = mapData?.durationMin || ride.durationMin || 60;
    const durationMs = durationMin * 60 * 1000;

    // PROGRESS BAR CALCULATION (Linked to 2x Clock) ---
    let progressPercent = 0;
    if (currentStatus === 'COMPLETED') {
        progressPercent = 100;
    } else if (currentStatus === 'IN_PROGRESS') {
        const startTime = ride.actualDepartureTime ? new Date(ride.actualDepartureTime).getTime() : now.getTime();
        const elapsed = now.getTime() - startTime;

        if (elapsed > 0 && durationMs > 0) {
            progressPercent = (elapsed / durationMs) * 100;
        }
        if (progressPercent > 98) progressPercent = 98;
    }

    const routeLine = mapData?.geometry || [];
    const mapCenter = routeLine.length > 0 ? routeLine[0] : [51.505, -0.09];


    const renderMultiReviewModal = () => {
        if (!showReviewModal || reviewQueue.length === 0) return null;
        const target = reviewQueue[currentReviewIndex];
        const isLast = currentReviewIndex === reviewQueue.length - 1;

        return (
            <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
                <div style={{background: theme.card, padding: '30px', borderRadius: '20px', width: '350px', textAlign: 'center', color: theme.text}}>
                    <div style={{fontSize: '0.8rem', color: theme.subText, marginBottom: '10px', textTransform:'uppercase'}}>Reviewing {currentReviewIndex + 1} of {reviewQueue.length}</div>
                    <h2 style={{margin: '0 0 5px 0'}}>Rate {target.username}</h2>
                    <p style={{margin: '0 0 20px 0', color: theme.green, fontSize: '0.9rem', fontWeight: 'bold'}}>{target.role}</p>
                    <div style={{fontSize: '2rem', marginBottom: '20px', cursor: 'pointer'}}>
                        {[1,2,3,4,5].map(star => <FaStar key={star} onClick={() => setReviewRating(star)} color={star <= reviewRating ? '#f1c40f' : '#ddd'} />)}
                    </div>
                    <textarea placeholder={`Experience with ${target.username}?`} style={{width: '90%', padding: '10px', borderRadius: '10px', marginBottom: '20px', background: theme.bg, color: theme.text, border: 'none'}} onChange={e => setReviewComment(e.target.value)} value={reviewComment}/>
                    <button onClick={submitReview} disabled={isSubmitting} style={{background: theme.green, color: 'white', border: 'none', padding: '12px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width:'100%'}}>{isSubmitting ? 'Saving...' : (isLast ? 'Finish Reviews' : 'Next Person')}</button>
                </div>
            </div>
        );
    };

    //   COMPLETED RIDE
    if (currentStatus === 'COMPLETED') {
        const actualFinish = ride.actualArrivalTime ? new Date(ride.actualArrivalTime) : new Date();

        const actualStart = ride.actualDepartureTime
            ? new Date(ride.actualDepartureTime)
            : new Date(actualFinish.getTime() - durationMs);

        // Est Arrival = Start + Duration
        const estimatedArrival = new Date(actualStart.getTime() + durationMs);

        const diffMins = Math.round((actualFinish - estimatedArrival) / 60000);
        let statusText = "On Time";
        let statusColor = theme.green;

        if (diffMins > 2) { statusText = `Arrived ${diffMins} min Late`; statusColor = theme.red; }
        else if (diffMins < -2) { statusText = `Arrived ${Math.abs(diffMins)} min Early`; statusColor = theme.green; }

        return (
            <div style={{minHeight: '100vh', background: theme.bg, fontFamily: "'Segoe UI', sans-serif", padding: '40px 20px'}}>
                <button onClick={() => navigate('/my-rides?type=history')} style={backBtnStyle(theme)}>← Back</button>
                <div style={{maxWidth: '600px', margin: '0 auto', background: theme.card, borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
                    <VscCheck size={50} color={theme.green} style={{marginBottom: '20px'}}/>
                    <h1 style={{margin: '0', color: theme.text}}>Ride Completed</h1>
                    <p style={{color: statusColor, fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '30px'}}>{statusText}</p>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px'}}>
                        <StatRow label="Actual Departure" value={actualStart.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} theme={theme} />
                        <StatRow label="Actual Arrival" value={actualFinish.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} theme={theme} highlight />
                        <StatRow label="Est. Arrival (Map)" value={estimatedArrival.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} theme={theme} />
                    </div>
                    <button onClick={prepareReviewQueue} style={{background: '#f1c40f', color: '#333', border: 'none', padding: '15px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'}}>Leave Reviews</button>
                </div>
                {renderMultiReviewModal()}
            </div>
        );
    }

    // --- VIEW 2: ACTIVE RIDE (PROGRESS) ---
    const startTimeBasis = ride.actualDepartureTime
        ? new Date(ride.actualDepartureTime)
        : new Date(ride.departureTime);
    const estimatedArrival = new Date(startTimeBasis.getTime() + durationMs);

    return (
        <div style={{minHeight: '100vh', background: theme.bg, fontFamily: "'Segoe UI', sans-serif", padding: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', maxWidth: '600px', margin: '0 auto 15px auto', color: theme.text}}>
                <div>
                    <div style={{fontSize: '0.8rem', color: theme.subText}}>CURRENT TIME (2x)</div>
                    <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second: '2-digit'})}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '0.8rem', color: theme.subText}}>EST. ARRIVAL</div>
                    <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: theme.green}}>{estimatedArrival.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
            </div>
            <div style={{maxWidth: '600px', margin: '0 auto', background: theme.card, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
                <div style={{height: '250px', width: '100%', background: '#e0e0e0'}}>
                    {routeLine.length > 0 ? (
                        <MapContainer center={mapCenter} zoom={10} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                            <TileLayer url={theme.mapTiles} />
                            <Polyline positions={routeLine} color="#2ecc71" weight={5} />
                            <Marker position={routeLine[0]}><Popup>Start</Popup></Marker>
                            <Marker position={routeLine[routeLine.length - 1]}><Popup>End</Popup></Marker>
                        </MapContainer>
                    ) : <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#888'}}>Loading Map...</div>}
                </div>
                <div style={{padding: '25px'}}>
                    <h2 style={{margin: '0 0 5px 0', color: theme.text, textAlign: 'center'}}>{ride.startLocation} ➝ {ride.destination}</h2>
                    <div style={{textAlign: 'center', color: theme.green, fontWeight: 'bold', marginBottom: '15px', fontSize: '1rem'}}>{currentStatus.replace('_', ' ')}</div>
                    <div style={{height: '12px', background: '#ddd', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px'}}>
                        <div style={{height: '100%', width: `${progressPercent}%`, background: '#3498db', transition: 'width 1s linear'}}></div>
                    </div>
                    <div style={{textAlign: 'center', fontSize: '0.8rem', color: theme.subText, marginBottom: '30px'}}>{currentStatus === 'IN_PROGRESS' ? Math.round(progressPercent) + "% Complete" : "Not Started"}</div>
                    {isDriver && currentStatus === 'SCHEDULED' && (
                        <button onClick={() => handleStatusChange('IN_PROGRESS')} style={btnStyle(theme.green)}> <VscDebugStart size={24}/> START RIDE </button>
                    )}
                    {isDriver && currentStatus === 'IN_PROGRESS' && (
                        <button onClick={() => handleStatusChange('COMPLETED')} style={btnStyle(theme.red)}> <VscCheck size={24}/> FINISH RIDE </button>
                    )}
                    {!isDriver && (
                        <div style={{textAlign: 'center', color: theme.subText}}> <FaClock /> Enjoy the ride! </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const StatRow = ({label, value, theme, highlight}) => (
    <div style={{display: 'flex', justifyContent: 'space-between', padding: '15px', background: theme.bg, borderRadius: '10px', borderLeft: highlight ? `4px solid ${theme.green}` : '4px solid transparent'}}>
        <span style={{color: theme.subText}}>{label}</span>
        <span style={{fontWeight: 'bold', color: theme.text}}>{value}</span>
    </div>
);

const backBtnStyle = (theme) => ({ marginBottom: '20px', background: 'none', border: `1px solid ${theme.subText}`, color: theme.text, padding: '8px 20px', borderRadius: '30px', cursor: 'pointer' });
const btnStyle = (bg) => ({ background: bg, color: 'white', border: 'none', padding: '18px', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '10px' });

export default RideProgress;