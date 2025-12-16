import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { removeAuthToken, fetchJson } from '../utils/api';
import { LogOut, Bell, X } from 'lucide-react';
import './Layout.css';
import klordLogo from '../assets/klordlogoblack.png';

export default function Layout() {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const [isScrolled, setIsScrolled] = React.useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [navigate]);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const data = await fetchJson('/api/admin/notifications');
                setNotifications(data);
            } catch (err) {
                console.error('Failed to load notifications:', err);
            }
        };
        loadNotifications();
        // Refresh notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        removeAuthToken();
        navigate('/login');
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };



    const unreadCount = notifications.filter(n => n.unread).length;

    const filteredNotifications = notifications.filter(n => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            n.title.toLowerCase().includes(query) ||
            n.message.toLowerCase().includes(query) ||
            getTimeAgo(n.time).toLowerCase().includes(query)
        );
    });

    return (
        <div className="layout-container">
            {/* Vertical Sidebar */}
            <aside className="vertical-sidebar">
                <button
                    className={`sidebar-btn ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => navigate('/app/dashboard')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={location.pathname === '/dashboard' || location.pathname === '/' ? "white" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </button>
                <button
                    className={`sidebar-btn ${location.pathname.includes('/leads') ? 'active' : ''}`}
                    onClick={() => navigate('/app/leads')}
                    title="Bookings"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={location.pathname.includes('/leads') ? "white" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                </button>
                <button
                    className={`sidebar-btn ${location.pathname.includes('/referrals') ? 'active' : ''}`}
                    onClick={() => navigate('/app/referrals')}
                    title="Referrals"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={location.pathname.includes('/referrals') ? "white" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
                <button
                    className={`sidebar-btn ${location.pathname.includes('/staff') ? 'active' : ''}`}
                    onClick={() => navigate('/app/staff')}
                    title="Staff"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={location.pathname.includes('/staff') ? "white" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </button>
                <button
                    className={`sidebar-btn ${location.pathname.includes('/amc') ? 'active' : ''}`}
                    onClick={() => navigate('/app/amc')}
                    title="AMC Service"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={location.pathname.includes('/amc') ? "white" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
                <button
                    className={`sidebar-btn ${location.pathname.includes('/complaints') ? 'active' : ''}`}
                    onClick={() => navigate('/app/complaints')}
                    title="Complaints"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={location.pathname.includes('/complaints') ? "white" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </button>
            </aside>

            <div className="main-wrapper">
                <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                    <div className="navbar-left">
                        {/* Logo */}
                        <div className="logo">
                            <img src={klordLogo} alt="Klord Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                        </div>

                        {/* Navigation Tabs */}
                        <div className="nav-tabs">
                            <NavLink
                                to="/app/dashboard"
                                className={({ isActive }) => (isActive || location.pathname.includes('/leads') || location.pathname.includes('/referrals') || location.pathname.includes('/staff')) ? 'nav-tab active' : 'nav-tab'}
                            >
                                Dashboard
                            </NavLink>
                            <NavLink to="/app/data" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>
                                Data
                            </NavLink>
                            <NavLink to="/app/pulse" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>
                                Pulse
                            </NavLink>
                        </div>
                    </div>

                    <div className="navbar-right">
                        {/* User Avatars */}
                        <div className="user-avatars">
                            <img src="https://i.pravatar.cc/32?img=1" alt="User 1" className="avatar" />
                            <img src="https://i.pravatar.cc/32?img=5" alt="User 2" className="avatar" />
                            <img src="https://i.pravatar.cc/32?img=9" alt="User 3" className="avatar" />
                            <div className="avatar-count">+6</div>
                        </div>

                        {/* Share Button */}
                        <button className="icon-btn share-btn">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1V11M8 1L11 4M8 1L5 4M3 11V13C3 14.1046 3.89543 15 5 15H11C12.1046 15 13 14.1046 13 13V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Share
                        </button>

                        {/* Dark Mode Toggle */}
                        <button className="icon-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 3V1M10 19V17M17 10H19M1 10H3M15.657 4.343L17.071 2.929M2.929 17.071L4.343 15.657M15.657 15.657L17.071 17.071M2.929 2.929L4.343 4.343" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </button>

                        {/* Settings */}
                        <button className="icon-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M16.5 10C16.5 10.3 16.47 10.59 16.43 10.88L18.54 12.47C18.73 12.61 18.78 12.86 18.66 13.05L16.66 16.45C16.54 16.64 16.29 16.71 16.1 16.63L13.65 15.58C13.17 15.95 12.65 16.26 12.09 16.5L11.75 19.21C11.72 19.42 11.54 19.58 11.33 19.58H7.33C7.12 19.58 6.94 19.42 6.91 19.21L6.57 16.5C6.01 16.26 5.49 15.95 5.01 15.58L2.56 16.63C2.37 16.71 2.12 16.64 2 16.45L0 13.05C-0.12 12.86 -0.07 12.61 0.12 12.47L2.23 10.88C2.19 10.59 2.16 10.3 2.16 10C2.16 9.7 2.19 9.41 2.23 9.12L0.12 7.53C-0.07 7.39 -0.12 7.14 0 6.95L2 3.55C2.12 3.36 2.37 3.29 2.56 3.37L5.01 4.42C5.49 4.05 6.01 3.74 6.57 3.5L6.91 0.79C6.94 0.58 7.12 0.42 7.33 0.42H11.33C11.54 0.42 11.72 0.58 11.75 0.79L12.09 3.5C12.65 3.74 13.17 4.05 13.65 4.42L16.1 3.37C16.29 3.29 16.54 3.36 16.66 3.55L18.66 6.95C18.78 7.14 18.73 7.39 18.54 7.53L16.43 9.12C16.47 9.41 16.5 9.7 16.5 10Z" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </button>

                        {/* Notifications */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="icon-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ position: 'relative' }}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#DC2626',
                                        borderRadius: '50%',
                                        border: '2px solid white'
                                    }}></span>
                                )}
                            </button>

                            <div className={`notifications-dropdown ${showNotifications ? 'open' : ''}`}>
                                <div style={{
                                    padding: '20px 24px',
                                    borderBottom: '1px solid #F3F4F6',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)'
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1c1c1e', marginBottom: '2px' }}>Notifications</h3>
                                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                                            {unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        style={{
                                            background: '#F3F4F6',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                    >
                                        <X size={16} color="#666" />
                                    </button>
                                </div>

                                <div style={{ padding: '12px 24px', borderBottom: '1px solid #F3F4F6' }}>
                                    <input
                                        type="text"
                                        placeholder="Search notifications..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            fontSize: '14px',
                                            outline: 'none',
                                            backgroundColor: '#F9FAFB'
                                        }}
                                    />
                                </div>

                                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    {filteredNotifications.length === 0 ? (
                                        <div style={{ padding: '40px 24px', textAlign: 'center', color: '#999' }}>
                                            <p style={{ fontSize: '14px', margin: 0 }}>No notifications found</p>
                                        </div>
                                    ) : (
                                        filteredNotifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                style={{
                                                    padding: '18px 24px',
                                                    borderBottom: '1px solid #F9FAFB',
                                                    cursor: 'pointer',
                                                    backgroundColor: notif.unread ? '#F0F9FF' : 'white',
                                                    transition: 'all 0.2s',
                                                    position: 'relative'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                                                    e.currentTarget.style.transform = 'translateX(4px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = notif.unread ? '#F0F9FF' : 'white';
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                                    <div style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        borderRadius: '12px',
                                                        backgroundColor: notif.color,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px',
                                                        flexShrink: 0
                                                    }}>
                                                        {notif.icon}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: '#1c1c1e',
                                                            marginBottom: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}>
                                                            {notif.title}
                                                            {notif.unread && (
                                                                <span style={{
                                                                    width: '6px',
                                                                    height: '6px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#3B82F6',
                                                                    flexShrink: 0
                                                                }}></span>
                                                            )}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            marginBottom: '6px',
                                                            lineHeight: '1.4'
                                                        }}>
                                                            {notif.message}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#9CA3AF',
                                                            fontWeight: '500'
                                                        }}>
                                                            {getTimeAgo(notif.time)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div style={{
                                    padding: '16px 24px',
                                    borderTop: '1px solid #F3F4F6',
                                    textAlign: 'center',
                                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)'
                                }}>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#3B82F6',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Mark all as read
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Logout */}
                        <button className="icon-btn" onClick={handleLogout} title="Logout">
                            <LogOut size={20} />
                        </button>

                        {/* Profile */}
                        <img src="https://i.pravatar.cc/32?img=12" alt="Profile" className="avatar profile-avatar" />
                    </div>
                </nav>

                <div className="content">
                    <Outlet />
                </div>
            </div >
        </div >
    );
}
