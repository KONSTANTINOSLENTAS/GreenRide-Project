import { useState } from 'react';
import { GoArrowUpRight } from 'react-icons/go';
import './CardNav.css';

const CardNav = ({
                     logo,
                     logoAlt = 'GreenRide',
                     items = [],
                     className = '',
                     baseColor = '#fff',
                     menuColor,
                     buttonBgColor,
                     buttonTextColor
                 }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className={`card-nav-container ${className}`}>
            <nav
                className={`card-nav ${isOpen ? 'open' : ''}`}
                style={{ backgroundColor: baseColor }}
            >
                {/* TOP BAR (Always Visible) */}
                <div className="card-nav-top">
                    {/* Hamburger Icon */}
                    <div
                        className={`hamburger-menu ${isOpen ? 'open' : ''}`}
                        onClick={toggleMenu}
                        role="button"
                        tabIndex={0}
                        style={{ color: menuColor || '#000' }}
                    >
                        <div className="hamburger-line" />
                        <div className="hamburger-line" />
                    </div>

                    {/* Logo */}
                    {/* CENTERED TEXT LOGO */}
                    <div
                        className="logo-container"
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {/* If logo is a string, we wrap it. If it's a component, we just render it. */}
                        {typeof logo === 'string' ? <span className="nav-logo-text">{logo}</span> : logo}
                    </div>

                </div>

                {/* EXPANDABLE CONTENT (Animated via CSS Grid) */}
                <div className="card-nav-grid-wrapper">
                    <div className="card-nav-content-inner">
                        <div className="card-nav-items">
                            {items.slice(0, 3).map((item, idx) => (
                                <div
                                    key={idx}
                                    className="nav-card"
                                    style={{ backgroundColor: item.bgColor, color: item.textColor }}
                                >
                                    <div className="nav-card-label">{item.label}</div>
                                    <div className="nav-card-links">
                                        {item.links?.map((lnk, i) => (
                                            <a key={i} className="nav-card-link" href={lnk.href}>
                                                <GoArrowUpRight className="nav-card-link-icon" />
                                                {lnk.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default CardNav;