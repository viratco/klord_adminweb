import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchJson } from '../utils/api';

interface ReferralUser {
    id: string;
    phoneNumber: string;
    referralCode: string;
    upline: { id: string; phoneNumber: string } | null;
    totalReferrals: number;
    earnings: number;
    downline: {
        a1: number;
        a2: number;
        a3: number;
        a4?: number;
        a5?: number;
    };
}

interface DetailedDownline {
    a1: { id: string; phoneNumber: string; joinedAt: string }[];
    a2: { id: string; phoneNumber: string; joinedAt: string }[];
    a3: { id: string; phoneNumber: string; joinedAt: string }[];
    a4?: { id: string; phoneNumber: string; joinedAt: string }[];
    a5?: { id: string; phoneNumber: string; joinedAt: string }[];
}

interface OverviewData {
    totalNetwork: number;
    activeUsers: number;
    totalEarnings: number;
    settings: {
        maxPayoutPercent: number;
        levelPercents: number[];
    };
    networkGrowth: { month: string; direct: number; indirect: number }[];
    topReferrers: ReferralUser[];
}

export default function Referrals() {
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [selectedUser, setSelectedUser] = useState<ReferralUser | null>(null);
    const [detailedDownline, setDetailedDownline] = useState<DetailedDownline | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        loadOverview();
    }, []);

    const loadOverview = async () => {
        try {
            setLoading(true);
            const data = await fetchJson('/api/admin/referrals/overview');
            setOverview(data);
            if (data.topReferrers && data.topReferrers.length > 0) {
                setSelectedUser(data.topReferrers[0]);
                loadUserDetails(data.topReferrers[0].id);
            }
        } catch (err) {
            console.error('Failed to load referrals overview:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadUserDetails = async (customerId: string) => {
        try {
            setLoadingDetails(true);
            const data = await fetchJson(`/api/admin/referrals/user/${customerId}`);
            setDetailedDownline(data.downline);
        } catch (err) {
            console.error('Failed to load user details:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleUserSelect = (user: ReferralUser) => {
        setSelectedUser(user);
        loadUserDetails(user.id);
    };

    // Default empty overview if no data
    // Default empty overview if no data
    const defaults = {
        totalNetwork: 0,
        activeUsers: 0,
        totalEarnings: 0,
        settings: {
            maxPayoutPercent: 10.0,
            levelPercents: [2.0, 2.0, 2.0, 2.0, 2.0]
        },
        networkGrowth: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
            month,
            direct: 0,
            indirect: 0
        })),
        topReferrers: []
    };

    const safeOverview = overview ? {
        ...overview,
        settings: overview.settings || defaults.settings
    } : defaults;

    const filteredUsers = safeOverview.topReferrers.filter(user =>
        user.phoneNumber.includes(searchQuery) ||
        user.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ padding: '20px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px' }}>Referrals</h1>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <div style={{ fontSize: '18px', color: '#666' }}>Loading referrals data...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px' }}>Referrals</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Black Box */}
                    <div style={{
                        backgroundColor: '#1c1c1e',
                        borderRadius: '20px',
                        padding: '20px',
                        minHeight: '160px',
                        height: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        color: 'white',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ opacity: 0.7, fontSize: '14px', fontWeight: '600' }}>Total Network</div>
                        <div style={{ fontSize: '36px', fontWeight: '800' }}>{safeOverview.totalNetwork.toLocaleString()}</div>
                    </div>

                    {/* Distribution Info */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '24px',
                        minHeight: '400px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', marginBottom: '4px' }}>Distribution</h2>
                            <p style={{ fontSize: '14px', color: '#666' }}>Commission breakdown</p>
                        </div>

                        {/* Max Payout */}
                        <div style={{ padding: '16px', backgroundColor: '#F9F9F9', borderRadius: '16px' }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Payout Cap</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1c1c1e' }}>{safeOverview.settings.maxPayoutPercent}%</div>
                        </div>

                        {/* Levels */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* A1 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 206, 87, 0.2)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>A1</div>
                                    <span style={{ fontWeight: '600', color: '#1c1c1e' }}>Direct</span>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '16px' }}>{safeOverview.settings.levelPercents[0]}%</span>
                            </div>

                            {/* A2 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(28, 28, 30, 0.05)', color: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>A2</div>
                                    <span style={{ fontWeight: '600', color: '#1c1c1e' }}>Level 2</span>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '16px' }}>{safeOverview.settings.levelPercents[1]}%</span>
                            </div>

                            {/* A3 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(28, 28, 30, 0.05)', color: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>A3</div>
                                    <span style={{ fontWeight: '600', color: '#1c1c1e' }}>Level 3</span>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '16px' }}>{safeOverview.settings.levelPercents[2]}%</span>
                            </div>

                            {/* A4 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(28, 28, 30, 0.05)', color: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>A4</div>
                                    <span style={{ fontWeight: '600', color: '#1c1c1e' }}>Level 4</span>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '16px' }}>{safeOverview.settings.levelPercents[3]}%</span>
                            </div>

                            {/* A5 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(28, 28, 30, 0.05)', color: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>A5</div>
                                    <span style={{ fontWeight: '600', color: '#1c1c1e' }}>Level 5</span>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '16px' }}>{safeOverview.settings.levelPercents[4]}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: White+Yellow Boxes and Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Top Row: White and Yellow Boxes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* White Box (Middle) */}
                        <div style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '20px',
                            padding: '20px',
                            height: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            color: '#1c1c1e',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
                        }}>
                            <div style={{ opacity: 0.6, fontSize: '14px', fontWeight: '600' }}>Active Users</div>
                            <div style={{ fontSize: '36px', fontWeight: '800' }}>{safeOverview.activeUsers.toLocaleString()}</div>
                        </div>

                        {/* Yellow Box (Right) */}
                        <div style={{
                            backgroundColor: '#F5CE57',
                            borderRadius: '20px',
                            padding: '20px',
                            height: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            color: '#1c1c1e',
                            boxShadow: '0 4px 24px rgba(245, 206, 87, 0.2)'
                        }}>
                            <div style={{ opacity: 0.8, fontSize: '14px', fontWeight: '600' }}>Total Earnings</div>
                            <div style={{ fontSize: '36px', fontWeight: '800' }}>₹{safeOverview.totalEarnings.toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    {/* Main Content Area - Network Growth Chart */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '24px',
                        minHeight: '400px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1
                    }}>
                        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', marginBottom: '4px' }}>Network Growth</h2>
                                <p style={{ fontSize: '14px', color: '#666' }}>New members joined over time</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#666' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F5CE57' }}></div>
                                    Direct (A1)
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#666' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1c1c1e' }}></div>
                                    Indirect (A2/A3)
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '24px', gap: '8px' }}>
                            {safeOverview.networkGrowth?.map((data, i) => {
                                const maxValue = Math.max(...(safeOverview.networkGrowth || []).map(d => Math.max(d.direct, d.indirect)));
                                const h1 = maxValue > 0 ? (data.direct / maxValue) * 100 : 0;
                                const h2 = maxValue > 0 ? (data.indirect / maxValue) * 100 : 0;
                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '200px' }}>
                                            <div style={{
                                                width: '10px',
                                                height: `${Math.max(h1, 5)}%`,
                                                backgroundColor: '#F5CE57',
                                                borderRadius: '4px 4px 0 0'
                                            }}></div>
                                            <div style={{
                                                width: '10px',
                                                height: `${Math.max(h2, 5)}%`,
                                                backgroundColor: '#1c1c1e',
                                                borderRadius: '4px 4px 0 0'
                                            }}></div>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#999', fontWeight: '500' }}>{data.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Two Equal Divs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                {/* Left Bottom Div - User List */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    minHeight: '300px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', marginBottom: '16px' }}>Top Referrers</h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#F5F5F7',
                            borderRadius: '12px',
                            padding: '10px 16px',
                            gap: '10px'
                        }}>
                            <Search size={18} color="#666" />
                            <input
                                type="text"
                                placeholder="Search by phone or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '14px',
                                    color: '#1c1c1e'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '400px' }}>
                        {filteredUsers?.map(user => (
                            <div
                                key={user.id}
                                onClick={() => handleUserSelect(user)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    backgroundColor: selectedUser?.id === user.id ? '#1c1c1e' : '#F9F9F9',
                                    color: selectedUser?.id === user.id ? 'white' : '#1c1c1e',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: selectedUser?.id === user.id ? '#F5CE57' : '#E5E5E7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        color: '#1c1c1e'
                                    }}>
                                        {user.phoneNumber.slice(-2)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{user.phoneNumber}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{user.referralCode}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', fontSize: '15px' }}>₹{user.earnings.toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{user.totalReferrals} Referrals</div>
                                </div>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                No users found
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Bottom Div - Downline Breakdown */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    minHeight: '300px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {selectedUser && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: '#F5CE57',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        fontSize: '18px',
                                        color: '#1c1c1e'
                                    }}>
                                        {selectedUser.phoneNumber.slice(-2)}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e' }}>{selectedUser.phoneNumber}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '13px', color: '#666', backgroundColor: '#F5F5F7', padding: '2px 8px', borderRadius: '6px' }}>
                                                Code: <span style={{ fontWeight: '600', color: '#1c1c1e' }}>{selectedUser.referralCode}</span>
                                            </span>
                                            {selectedUser.upline && (
                                                <span style={{ fontSize: '13px', color: '#666' }}>
                                                    Upline: <span style={{ fontWeight: '600', color: '#1c1c1e' }}>{selectedUser.upline.phoneNumber}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Earnings</div>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#1c1c1e' }}>₹{selectedUser.earnings.toLocaleString('en-IN')}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
                                <div style={{ backgroundColor: '#FFFBEB', padding: '12px', borderRadius: '12px', border: '1px solid #FEF3C7', minWidth: '80px', flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#92400E', marginBottom: '4px' }}>A1</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#B45309' }}>{selectedUser.downline.a1}</div>
                                </div>
                                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', minWidth: '80px', flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>A2</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>{selectedUser.downline.a2}</div>
                                </div>
                                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', minWidth: '80px', flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>A3</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>{selectedUser.downline.a3}</div>
                                </div>
                                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', minWidth: '80px', flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>A4</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>{selectedUser.downline.a4 ?? 0}</div>
                                </div>
                                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', minWidth: '80px', flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>A5</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>{selectedUser.downline.a5 ?? 0}</div>
                                </div>
                            </div>

                            {loadingDetails ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading details...</div>
                            ) : detailedDownline && (
                                <div style={{ display: 'flex', gap: '16px', flex: 1, overflowX: 'auto', padding: '4px', paddingBottom: '12px', maxWidth: '100%', width: '100%' }}>
                                    <div style={{ minWidth: '260px', flex: 1 }}>
                                        {/* A1 Column */}
                                        <DownlineColumn
                                            level="A1"
                                            title="Direct"
                                            subtitle="Level 1"
                                            members={detailedDownline.a1}
                                            gradient="linear-gradient(135deg, #F5CE57 0%, #D97706 100%)"
                                            color="#1c1c1e"
                                        />
                                    </div>

                                    <div style={{ minWidth: '260px', flex: 1 }}>
                                        {/* A2 Column */}
                                        <DownlineColumn
                                            level="A2"
                                            title="Level 2"
                                            subtitle="Indirect"
                                            members={detailedDownline.a2}
                                            gradient="linear-gradient(135deg, #374151 0%, #111827 100%)"
                                            color="#374151"
                                        />
                                    </div>

                                    <div style={{ minWidth: '260px', flex: 1 }}>
                                        {/* A3 Column */}
                                        <DownlineColumn
                                            level="A3"
                                            title="Level 3"
                                            subtitle="Extended"
                                            members={detailedDownline.a3}
                                            gradient="linear-gradient(135deg, #9CA3AF 0%, #4B5563 100%)"
                                            color="#4B5563"
                                        />
                                    </div>

                                    <div style={{ minWidth: '260px', flex: 1 }}>
                                        {/* A4 Column */}
                                        <DownlineColumn
                                            level="A4"
                                            title="Level 4"
                                            subtitle="Extended"
                                            members={detailedDownline.a4 || []}
                                            gradient="linear-gradient(135deg, #9CA3AF 0%, #4B5563 100%)"
                                            color="#4B5563"
                                        />
                                    </div>

                                    <div style={{ minWidth: '260px', flex: 1 }}>
                                        {/* A5 Column */}
                                        <DownlineColumn
                                            level="A5"
                                            title="Level 5"
                                            subtitle="Extended"
                                            members={detailedDownline.a5 || []}
                                            gradient="linear-gradient(135deg, #9CA3AF 0%, #4B5563 100%)"
                                            color="#4B5563"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper component for downline columns
function DownlineColumn({ level, title, subtitle, members, gradient, color }: {
    level: string;
    title: string;
    subtitle: string;
    members: { id: string; phoneNumber: string; joinedAt: string }[];
    gradient: string;
    color: string;
}) {
    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: gradient,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '800',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}>{level}</div>
                <div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1c1c1e', display: 'block' }}>{title}</span>
                    <span style={{ fontSize: '11px', color: '#999', fontWeight: '500' }}>{subtitle}</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px', paddingRight: '4px' }}>
                {members.map((member, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px',
                            borderRadius: '12px',
                            transition: 'background 0.2s',
                            cursor: 'default'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9F9F9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: '#E5E5E7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '12px',
                            color: color
                        }}>
                            {member.phoneNumber.slice(-2)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: color }}>{member.phoneNumber}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>Joined {member.joinedAt}</div>
                        </div>
                    </div>
                ))}
                {members.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', opacity: 0.5 }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>😴</div>
                        <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>No members yet</div>
                    </div>
                )}
            </div>
        </div>
    );
}
