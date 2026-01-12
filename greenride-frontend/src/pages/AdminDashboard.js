import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CountUp from '../components/CountUp';
import { FaChartLine, FaRoad, FaChair, FaMapMarkerAlt } from "react-icons/fa";

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRides: 0,
        avgLength: 0,
        avgSeats: 0,
        popularDest: 'Loading...'
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const darkMode = localStorage.getItem('theme') === 'dark';

    useEffect(() => {
        api.get('/admin/stats')
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                alert("Access Denied: You are not an Admin.");
                navigate('/home');
            });
    }, [navigate]);

    const theme = {
        bg: darkMode ? '#121212' : '#f4f4f4',
        cardBg: darkMode ? '#1e1e1e' : 'white',
        text: darkMode ? '#fff' : '#333',
        subText: darkMode ? '#aaa' : '#666',
        cardBorder: darkMode ? '1px solid #333' : '1px solid #eee'
    };

    const cards = [
        { title: "Total Rides", value: stats.totalRides, icon: <FaChartLine />, color: "#2ecc71" },
        { title: "Avg. Distance", value: stats.avgLength, suffix: " km", icon: <FaRoad />, color: "#3498db" },
        { title: "Avg. Seats", value: stats.avgSeats, icon: <FaChair />, color: "#9b59b6" },
        { title: "Top Destination", value: stats.popularDest, isString: true, icon: <FaMapMarkerAlt />, color: "#e74c3c" }
    ];

    if (loading) return <div style={{height: '100vh', background: theme.bg, color: theme.text, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading Dashboard...</div>;

    return (
        <div style={{minHeight: '100vh', background: theme.bg, padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif"}}>

            <button
                onClick={() => navigate('/home')}
                style={{marginBottom: '30px', background: 'transparent', border: `1px solid ${theme.text}`, color: theme.text, padding: '10px 20px', borderRadius: '30px', cursor: 'pointer'}}
            >
                ← Back to Home
            </button>

            <h1 style={{color: theme.text, textAlign: 'center', marginBottom: '50px'}}>Admin Dashboard</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {cards.map((card, index) => (
                    <div key={index} style={{
                        background: theme.cardBg,
                        border: theme.cardBorder,
                        padding: '30px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s'
                    }}
                         onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                         onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{fontSize: '2.5rem', color: card.color, marginBottom: '15px'}}>
                            {card.icon}
                        </div>
                        <h3 style={{margin: '0 0 10px 0', color: theme.subText, fontSize: '1rem', textTransform: 'uppercase'}}>{card.title}</h3>
                        <div style={{fontSize: '2rem', fontWeight: 'bold', color: theme.text}}>
                            {card.isString ? (
                                card.value
                            ) : (
                                <>
                                    <CountUp to={card.value} duration={2} />
                                    <span style={{fontSize: '1rem', marginLeft: '5px'}}>{card.suffix}</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}

export default AdminDashboard;