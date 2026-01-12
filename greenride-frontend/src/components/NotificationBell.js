import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { VscBell, VscBellDot } from "react-icons/vsc";

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const darkMode = localStorage.getItem('theme') === 'dark';

    // Poll for notifications every 10 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (e) {
            console.error("Notif error", e);
        }
    };

    const handleRead = async (id) => {
        await api.post(`/notifications/${id}/read`);
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const styles = {
        container: { position: 'fixed', top: '20px', right: '100px', zIndex: 1100 },
        bellBtn: {
            background: darkMode ? '#333' : 'white',
            color: darkMode ? 'white' : '#333',
            border: 'none',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            position: 'relative'
        },
        badge: {
            position: 'absolute', top: '-2px', right: '-2px',
            background: '#e74c3c', color: 'white',
            borderRadius: '50%', width: '20px', height: '20px',
            fontSize: '0.75rem', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        },
        dropdown: {
            position: 'absolute', top: '55px', right: '0',
            width: '300px',
            background: darkMode ? '#1e1e1e' : 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            border: darkMode ? '1px solid #333' : '1px solid #eee'
        },
        item: {
            padding: '15px',
            borderBottom: darkMode ? '1px solid #333' : '1px solid #f0f0f0',
            cursor: 'pointer',
            textAlign: 'left',
            opacity: 1
        },
        readItem: {
            opacity: 0.5,
            background: darkMode ? '#121212' : '#f9f9f9'
        }
    };

    return (
        <div style={styles.container}>
            <button style={styles.bellBtn} onClick={() => setIsOpen(!isOpen)}>
                {unreadCount > 0 ? <VscBellDot size={24} color="#e74c3c" /> : <VscBell size={24} />}
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div style={styles.dropdown}>
                    <div style={{padding: '10px 15px', fontWeight: 'bold', background: darkMode?'#2ecc71':'#2ecc71', color: 'white'}}>
                        Notifications
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{padding: '20px', color: '#888', fontSize: '0.9rem'}}>No new notifications</div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                style={{...styles.item, ...(n.read ? styles.readItem : {})}}
                                onClick={() => handleRead(n.id)}
                            >
                                <div style={{fontSize: '0.9rem', color: darkMode ? 'white' : '#333', marginBottom: '5px'}}>
                                    {n.message}
                                </div>
                                <div style={{fontSize: '0.75rem', color: '#888'}}>
                                    {new Date(n.createdAt).toLocaleTimeString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;