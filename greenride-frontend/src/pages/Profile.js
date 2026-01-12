import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';


function Profile() {
    const { id } = useParams(); // Get ID from URL if present
    const navigate = useNavigate();
    const darkMode = localStorage.getItem('theme') === 'dark';

    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        // Decide which endpoint to hit
        const endpoint = id ? `/users/${id}` : '/users/me';
        const reviewsEndpoint = id ? `/users/${id}/reviews` : '/users/me/reviews';

        api.get(endpoint).then(res => setProfile(res.data));
        api.get(reviewsEndpoint).then(res => setReviews(res.data));
    }, [id]);

    const theme = {
        bg: darkMode ? '#121212' : '#f4f4f4',
        cardBg: darkMode ? '#1e1e1e' : 'white',
        text: darkMode ? '#fff' : '#333',
        subText: darkMode ? '#aaa' : '#666',
        border: darkMode ? '#333' : '#ddd'
    };

    if (!profile) return <div style={{padding: '50px', textAlign: 'center', color: theme.text}}>Loading...</div>;

    return (
        <div style={{minHeight: '100vh', background: theme.bg, fontFamily: "'Segoe UI', sans-serif", padding: '40px 20px'}}>

            <button
                onClick={() => navigate(-1)}
                style={{marginBottom: '20px', background: 'none', border: `1px solid ${theme.border}`, color: theme.text, padding: '10px 20px', borderRadius: '30px', cursor: 'pointer'}}
            >
                ← Back
            </button>

            <div style={{maxWidth: '800px', margin: '0 auto'}}>

                {/* PROFILE CARD */}
                <div style={{background: theme.cardBg, borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center'}}>
                    <div style={{width: '100px', height: '100px', borderRadius: '50%', background: '#2ecc71', color: 'white', fontSize: '3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto'}}>
                        {profile.username?.charAt(0).toUpperCase()}
                    </div>

                    <h1 style={{margin: '0', color: theme.text}}>{profile.username}</h1>
                    <p style={{color: '#2ecc71', fontWeight: 'bold', marginTop: '5px'}}>{profile.role}</p>

                    <div style={{display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '30px', borderTop: `1px solid ${theme.border}`, paddingTop: '30px'}}>
                        <div>
                            <div style={{fontSize: '0.9rem', color: theme.subText, textTransform: 'uppercase', letterSpacing: '1px'}}>Rating</div>
                            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: theme.text}}>⭐ {profile.rating || 0}</div>
                        </div>
                        {!id && (
                            <>
                                <div>
                                    <div style={{fontSize: '0.9rem', color: theme.subText, textTransform: 'uppercase', letterSpacing: '1px'}}>Phone</div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: theme.text}}>{profile.phoneNumber}</div>
                                </div>
                            </>
                        )}
                    </div>

                    {!id && <div style={{marginTop: '30px', color: theme.subText}}>Email: {profile.email}</div>}
                </div>

                {/* REVIEWS SECTION */}
                <h2 style={{color: theme.text, marginTop: '40px'}}>Reviews ({reviews.length})</h2>
                <div style={{display: 'grid', gap: '20px'}}>
                    {reviews.map((rev, i) => (
                        <div key={i} style={{background: theme.cardBg, padding: '20px', borderRadius: '15px', borderLeft: '5px solid #2ecc71'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                <strong style={{color: theme.text}}>{rev.author}</strong>
                                <span style={{color: '#f1c40f'}}>{"⭐".repeat(rev.rating)}</span>
                            </div>
                            <p style={{margin: 0, color: theme.subText}}>"{rev.comment}"</p>
                        </div>
                    ))}
                    {reviews.length === 0 && <p style={{color: theme.subText}}>No reviews yet.</p>}
                </div>
            </div>
        </div>
    );
}

export default Profile;