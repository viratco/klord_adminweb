import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson, setAuthToken } from '../utils/api';
import { Lock, Mail, ArrowRight, Zap } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Removed auto-redirect to dashboard - users should always see login page first

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await fetchJson('/api/auth/admin/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (data.user.type !== 'admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            setAuthToken(data.token);
            navigate('/app/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            background: 'radial-gradient(circle at top right, #2a2a2a 0%, #000000 100%)',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(252, 211, 77, 0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                zIndex: 0
            }} />

            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0
            }} />

            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
                backgroundColor: 'rgba(28, 28, 30, 0.6)',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                zIndex: 1,
                margin: '20px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)'
                    }}>
                        <Zap size={32} color="#1c1c1e" fill="#1c1c1e" />
                    </div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        marginBottom: '12px',
                        color: 'white',
                        letterSpacing: '-0.5px'
                    }}>Welcome Back</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px' }}>Sign in to manage Klord Solar</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '16px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        textAlign: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px 16px 16px 56px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#FCD34D'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px 16px 16px 56px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#FCD34D'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '12px',
                            padding: '16px',
                            background: 'white',
                            color: 'black',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'transform 0.1s',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
                        onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
