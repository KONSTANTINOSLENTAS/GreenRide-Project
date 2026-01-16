import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function MyRides() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'upcoming';

    const darkMode = localStorage.getItem('theme') === 'dark';
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);


    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({});
    const [modalAction, setModalAction] = useState(null); // Function to execute on confirm

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                setCurrentUser(jwtDecode(token).sub);
            } catch (e) {
                console.error("Invalid token format");
            }
        }

        fetchRides();
    }, [type]);

    const fetchRides = () => {
        setLoading(true);
        api.get(`/users/me/rides?type=${type}`)
            .then(res => {
                setRides(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch rides", err);
                setLoading(false);
            });
    };


    const confirmAction = (content, action, isWarning = false) => {
        setModalContent({
            title: isWarning ? "⚠️ Warning" : "Confirm Action",
            message: content,
            isWarning: isWarning
        });
        setModalAction(() => action);
        setShowModal(true);
    };

    // EXECUTE CANCELLATION
    const executeCancellation = async () => {
        setShowModal(false); // Close modal right away
        if (modalAction) {
            try {
                await modalAction();
                // After successful execution (delete or booking cancel), refresh list
                fetchRides();
            } catch (error) {
                const errMsg = error.response?.data?.message || error.response?.data || "An unexpected error occurred.";
                alert(`Operation Failed: ${errMsg}`); 
            }
        }
    };



    //  DRIVER CANCELLATION LOGIC
    const handleCancelRoute = (e, rideId, departureTime) => {
        if (e) e.stopPropagation();

        const departureDate = new Date(departureTime);
        const now = new Date();
        const minutesUntilDeparture = Math.round((departureDate - now) / 60000);
        const isLate = minutesUntilDeparture <= 10 && minutesUntilDeparture > 0;

        const action = async () => {
            const res = await api.post(`/routes/${rideId}/cancel`);
            // We expect the route to be deleted, so no need to update state other than refreshing the list
        };

        const message = isLate
            ? "This is a late cancellation. The route will be permanently deleted, and a penalty may apply."
            : "The route will be permanently deleted. Continue?";

        confirmAction(message, action, isLate);
    };

    //  PASSENGER CANCELLATION LOGIC (
    const handleCancelBooking = (e, rideId, departureTime, costPerSeat) => {
        if (e) e.stopPropagation();

        const departureDate = new Date(departureTime);
        const now = new Date();
        const minutesUntilDeparture = Math.round((departureDate - now) / 60000);
        const isLate = minutesUntilDeparture <= 10 && minutesUntilDeparture > 0;

        const action = async () => {
            const res = await api.post(`/routes/${rideId}/cancel-booking`);
        };

        const message = isLate
            ? "Cancellation is less than 10 minutes before departure. You will NOT be refunded. Proceed?"
            : "The booking will be cancelled, and a refund will be processed. Continue?";

        confirmAction(message, action, isLate);
    };



    const theme = {
        bg: darkMode ? '#121212' : '#f4f4f4',
        cardBg: darkMode ? '#1e1e1e' : 'white',
        text: darkMode ? '#fff' : '#333',
        subText: darkMode ? '#aaa' : '#666',
        border: darkMode ? '#333' : '#ddd',
        tagBg: type === 'history' ? '#95a5a6' : '#2ecc71',
        tagText: type === 'history' ? 'COMPLETED' : 'BOOKED'
    };

    const titleText = type === 'history' ? "Ride History" : "Upcoming Rides";

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: theme.text, background: theme.bg, height: '100vh'}}>Loading Rides...</div>;



    const CustomModal = () => {
        const modalTheme = {
            overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
            card: { background: theme.cardBg, padding: '30px', borderRadius: '15px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', color: theme.text }
        };

        return (
            <div style={modalTheme.overlay}>
                <div style={modalTheme.card}>
                    <h3 style={{marginTop: 0, color: modalContent.isWarning ? '#e74c3c' : theme.text}}>
                        {modalContent.title}
                    </h3>
                    <p style={{color: theme.subText, marginBottom: '20px'}}>{modalContent.message}</p>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{padding: '10px 15px', background: 'transparent', border: `1px solid ${theme.subText}`, color: theme.subText, borderRadius: '8px', cursor: 'pointer'}}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={executeCancellation}
                            style={{padding: '10px 15px', background: modalContent.isWarning ? '#e74c3c' : '#2ecc71', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}
                        >
                            {modalContent.isWarning ? "Proceed Anyway" : "Confirm"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    


    return (
        <div style={{minHeight: '100vh', background: theme.bg, fontFamily: "'Segoe UI', sans-serif", padding: '40px 20px'}}>

            {showModal && <CustomModal />}


            <button
                onClick={() => navigate('/home')}
                style={{marginBottom: '20px', background: 'none', border: `1px solid ${theme.border}`, color: theme.text, padding: '10px 20px', borderRadius: '30px', cursor: 'pointer'}}
            >
                ← Back to Home
            </button>

            <div style={{maxWidth: '800px', margin: '0 auto'}}>
                <h1 style={{color: theme.text, marginBottom: '30px'}}>{titleText}</h1>

                {rides.length === 0 ? (
                    <div style={{textAlign: 'center', color: theme.subText, marginTop: '50px'}}>
                        <h3>No {type} rides found.</h3>
                        <p>{type === 'history' ? "You haven't completed any trips yet." : "Go back home to book your first trip!"}</p>
                    </div>
                ) : (
                    <div style={{display: 'grid', gap: '20px'}}>
                        {rides.map(ride => {
                            const isDriver = ride.driver?.username === currentUser;
                            const isPassenger = !isDriver && ride.status !== 'CANCELLED';
                            const isScheduled = ride.status === 'SCHEDULED';

                            return (
                                <div
                                    key={ride.id}
                                    onClick={() => navigate(`/ride/progress/${ride.id}`)}
                                    style={{
                                        background: theme.cardBg,
                                        padding: '25px',
                                        borderRadius: '15px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s',
                                        opacity: type === 'history' ? 0.7 : 1
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div>
                                        <h2 style={{margin: '0 0 10px 0', color: type === 'history' ? theme.subText : '#2ecc71'}}>
                                            {ride.startLocation} ➝ {ride.destination}
                                        </h2>
                                        <div style={{color: theme.subText}}>
                                             {new Date(ride.departureTime).toLocaleString()}
                                        </div>
                                        <div style={{color: theme.subText, marginTop: '5px'}}>
                                            Driver: {ride.driver?.username}
                                        </div>
                                    </div>

                                    <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                                        <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: theme.text}}>
                                            ${ride.costPerSeat}
                                        </div>
                                        <span style={{
                                            background: theme.tagBg,
                                            color: 'white',
                                            padding: '5px 10px',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            display: 'inline-block',
                                            marginTop: '5px'
                                        }}>
                                            {ride.status || theme.tagText}
                                        </span>

                                        {isScheduled && type === 'upcoming' && (
                                            <>
                                                {/*  DRIVER CANCEL BUTTON */}
                                                {isDriver && (
                                                    <button
                                                        onClick={(e) => handleCancelRoute(e, ride.id, ride.departureTime)}
                                                        style={{
                                                            background: '#e74c3c',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '5px',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            marginTop: '8px',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        Cancel Route (Driver)
                                                    </button>
                                                )}

                                                {/*  PASSENGER CANCEL BUTTON */}
                                                {isPassenger && (
                                                    <button
                                                        onClick={(e) => handleCancelBooking(e, ride.id, ride.departureTime, ride.costPerSeat)}
                                                        style={{
                                                            background: '#f39c12',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '5px',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            marginTop: '8px',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        Cancel Booking
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyRides;