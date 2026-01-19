import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import TextPressure from '../components/TextPressure';
import BlurText from '../components/BlurText';
import '../App.css';

function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isRegistering) {

                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(phoneNumber)) {
                    setError("Phone number must be exactly 10 digits.");
                    return; //Stop the form submission
                }

                // REGISTER LOGIC
                await api.post('/auth/register', {
                    username,
                    password,
                    email,
                    phoneNumber
                });
                setIsRegistering(false);
            } else {
                //  LOGIN LOGIC 
                const response = await api.post('/auth/login', { username, password });
                localStorage.setItem('token', response.data.token);
                navigate('/home');
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data || (isRegistering ? "Registration failed. Please check your details." : "Invalid credentials.");
            setError(errMsg);
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-info">
                <div style={{ position: 'relative', height: '120px', marginBottom: '130px' }}>
                    <TextPressure
                        text="GreenRide"
                        flex={false}
                        alpha={false}
                        stroke={false}
                        width={true}
                        weight={false}
                        italic={true}
                        textColor="#ffffff"
                        minFontSize={36}
                    />
                </div>
                <div style={{ marginTop: '20px' }}>
                    <BlurText
                        text="Join the university carpooling revolution. Save money, meet new friends, and reduce your carbon footprint—one ride at a time."
                        delay={20}
                        animateBy="words"
                        stepDuration={0.35}
                        direction="top"
                        className="landing-desc"
                    />
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
                    <li style={{ marginBottom: '15px' }}>
                        <BlurText text="🌱 Eco-Friendly: Reduce emissions." delay={30} direction="bottom" />
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        <BlurText text="💸 Save Costs: Split fuel expenses." delay={50} direction="bottom" />
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        <BlurText text="📍 Smart Routes: Real-time navigation." delay={60} direction="bottom" />
                    </li>
                </ul>
            </div>

            {/* RIGHT SIDE: Dynamic Form */}
            <div className="login-section">
                <div className="login-card">
                    <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* FIELDS FOR REGISTERING  */}
                        {isRegistering && (
                            <>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel" // Changed to tel for mobile keyboard support
                                        className="form-control"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        maxLength={10} // Added max length hint
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            {isRegistering ? "Sign Up" : "Log In"}
                        </button>
                    </form>

                    <p style={{textAlign: 'center', marginTop: '15px', color: '#777'}}>
                        {isRegistering ? "Already have an account? " : "New to GreenRide? "}
                        <span
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                                setUsername('');
                                setPassword('');
                                setEmail('');
                                setPhoneNumber('');
                            }}
                            style={{color: '#2ecc71', cursor: 'pointer', fontWeight: 'bold'}}
                        >
                            {isRegistering ? "Log in here" : "Create an account"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;