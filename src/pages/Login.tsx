import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson, setAuthToken } from '../utils/api';
import { Lock, Mail, ArrowRight, Zap } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
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

            if (data.otpRequired) {
                setShowOtp(true);
                setSuccessMsg('Verification code sent to your email');
            } else {
                // Fallback for unexpected response structure
                if (data.user?.type === 'admin' && data.token) {
                    setAuthToken(data.token);
                    navigate('/app/dashboard');
                } else {
                    throw new Error('Unexpected response from server');
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await fetchJson('/api/auth/admin/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ email, otp }),
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

                {successMsg && !error && (
                    <div style={{
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        color: '#34d399',
                        padding: '16px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        textAlign: 'center',
                        border: '1px solid rgba(52, 211, 153, 0.2)'
                    }}>
                        {successMsg}
                    </div>
                )}

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

                {!showOtp ? (
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
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FCD34D';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(252, 211, 77, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
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
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FCD34D';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(252, 211, 77, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '12px',
                                padding: '16px',
                                backgroundColor: loading ? 'rgba(255, 255, 255, 0.5)' : '#ffffff',
                                color: '#000000',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)'
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {loading ? 'Sending Code...' : 'Continue'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                marginBottom: '8px'
                            }}>
                                We've sent a 6-digit verification code to<br />
                                <strong style={{ color: '#FCD34D' }}>{email}</strong>
                            </p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 6) setOtp(val);
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="one-time-code"
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '2px dashed rgba(252, 211, 77, 0.3)',
                                    borderRadius: '20px',
                                    color: 'white',
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    letterSpacing: '12px',
                                    textAlign: 'center',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box',
                                    textShadow: '0 0 10px rgba(252, 211, 77, 0.2)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FCD34D';
                                    e.target.style.background = 'rgba(252, 211, 77, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(252, 211, 77, 0.3)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                style={{
                                    padding: '16px',
                                    backgroundColor: (loading || otp.length < 6) ? 'rgba(252, 211, 77, 0.3)' : '#FCD34D',
                                    color: '#000000',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {loading ? 'Verifying...' : 'Verify Identity'}
                                {!loading && <ArrowRight size={20} />}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowOtp(false);
                                    setOtp('');
                                    setSuccessMsg('');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    marginTop: '8px',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#FCD34D'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                            >
                                Use a different account? Go back
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                input::placeholder {
                    color: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
