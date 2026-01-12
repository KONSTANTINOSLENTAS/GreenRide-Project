import React from 'react';
import { VscSearch } from "react-icons/vsc";

const LiquidSearch = ({ value, onChange, onSearch, darkMode }) => {
    // Dynamic Styles based on Theme
    const themeStyles = {
        wrapper: {
            background: darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
            border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e9ecef',
            boxShadow: darkMode ? '0 8px 32px 0 rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.08)',
        },
        input: {
            color: darkMode ? 'white' : '#333',
        },
        iconColor: darkMode ? 'rgba(255,255,255,0.7)' : '#2ecc71'
    };

    return (
        <div style={styles.container}>
            <div style={{...styles.glassWrapper, ...themeStyles.wrapper}}>
                <VscSearch size={18} color={themeStyles.iconColor} style={{ marginLeft: '15px' }} />

                <input
                    type="text"
                    placeholder="Where to?"
                    value={value}
                    onChange={onChange}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch(e)}
                    style={{...styles.input, ...themeStyles.input}}
                />

                <button onClick={onSearch} style={styles.button}>
                    GO
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center', // Forces center alignment
        width: '100%',
        marginBottom: '20px',
    },
    glassWrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '450px', // <--- FIXED: Much smaller width (was 100% or 600px)
        height: '50px',    // Slightly more compact height
        borderRadius: '25px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
    },
    input: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        height: '100%',
        fontSize: '1rem',
        paddingLeft: '10px',
        outline: 'none',
        fontWeight: '500'
    },
    button: {
        marginRight: '4px',
        height: '42px', // scaled down to fit new height
        width: '42px',
        borderRadius: '50%',
        border: 'none',
        background: '#2ecc71',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)',
        transition: 'transform 0.1s'
    }
};

export default LiquidSearch;