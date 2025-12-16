import { useState, useEffect } from 'react';
import {
    Search,
    MoreHorizontal,
    Clock,
    AlertCircle,
    User,
    Briefcase,
    AlertTriangle
} from 'lucide-react';
import { fetchJson } from '../utils/api';

export default function Complaints() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadComplaints = async () => {
            try {
                const data = await fetchJson('/api/admin/complaints');
                setComplaints(data);
            } catch (err) {
                console.error('Failed to load complaints', err);
            } finally {
                setLoading(false);
            }
        };
        loadComplaints();
    }, []);

    const handleResolve = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        console.log('Resolving complaint with ID:', id);
        if (!confirm('Are you sure you want to resolve this complaint?')) return;

        try {
            await fetchJson(`/api/admin/complaints/${id}/resolve`, {
                method: 'POST'
            });

            // Update local state
            setComplaints(prev => prev.map(c =>
                c.id === id ? { ...c, status: 'resolved' } : c
            ));
        } catch (err: any) {
            console.error('Error resolving complaint:', err);
            alert(err.message || 'Error resolving complaint');
        }
    };

    const filteredComplaints = complaints.filter(req => {
        const matchesTab = activeTab === 'pending'
            ? ['pending', 'in_progress'].includes(req.status)
            : req.status === 'resolved';

        const customerName = req.customer?.name || req.lead?.fullName || 'Unknown';
        const note = req.message || '';
        const type = 'General Issue'; // Placeholder as backend doesn't have type

        const matchesSearch =
            customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return { bg: '#FEF2F2', text: '#B91C1C', border: '#FEE2E2' };
            case 'high': return { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' };
            case 'medium': return { bg: '#FFFBEB', text: '#B45309', border: '#FEF3C7' };
            case 'low': return { bg: '#F0FDF4', text: '#15803D', border: '#DCFCE7' };
            default: return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
        }
    };

    if (loading) {
        return <div style={{ padding: '32px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1c1c1e', letterSpacing: '-0.5px' }}>Complaints</h1>
                    <p style={{ color: '#666', marginTop: '8px', fontSize: '15px' }}>Track and resolve customer complaints</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} color="#666" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '12px 16px 12px 48px',
                                borderRadius: '16px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white',
                                width: '300px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '32px',
                backgroundColor: 'white',
                padding: '6px',
                borderRadius: '16px',
                width: 'fit-content',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
            }}>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: activeTab === 'pending' ? '#1c1c1e' : 'transparent',
                        color: activeTab === 'pending' ? 'white' : '#666',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Pending & In Progress
                </button>
                <button
                    onClick={() => setActiveTab('resolved')}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: activeTab === 'resolved' ? '#1c1c1e' : 'transparent',
                        color: activeTab === 'resolved' ? 'white' : '#666',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Resolved History
                </button>
            </div>

            {/* Grid Content */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {filteredComplaints.map((req) => {
                    // Default values since backend doesn't support type/severity yet
                    const severity = 'medium';
                    const type = 'General Issue';
                    const severityStyle = getSeverityColor(severity);
                    const customerName = req.customer?.name || req.lead?.fullName || 'Unknown';

                    return (
                        <div key={req.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            padding: '24px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            border: '1px solid transparent'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)';
                            }}
                        >
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        backgroundColor: '#FEF2F2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <AlertTriangle size={24} color="#DC2626" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1c1e' }}>{type}</h3>
                                        <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>ID: {req.lead?.id || 'N/A'}</p>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    backgroundColor: severityStyle.bg,
                                    color: severityStyle.text,
                                    border: `1px solid ${severityStyle.border} `,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {severity} Priority
                                </span>
                            </div>

                            {/* Card Body */}
                            <div style={{
                                backgroundColor: '#F9FAFB',
                                padding: '16px',
                                borderRadius: '16px',
                                fontSize: '14px',
                                color: '#374151',
                                lineHeight: '1.5'
                            }}>
                                {req.message}
                            </div>

                            {/* Card Footer Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={14} color="#9CA3AF" />
                                    <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
                                        {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={14} color="#9CA3AF" />
                                    <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{customerName}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                                    <Briefcase size={14} color="#9CA3AF" />
                                    <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
                                        {req.lead?.assignedStaff ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                Against <span style={{ color: '#1c1c1e', fontWeight: '600' }}>{req.lead.assignedStaff.name}</span>
                                            </span>
                                        ) : (
                                            <span style={{ color: '#F59E0B', fontWeight: '600' }}>General Complaint</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                                {req.status !== 'resolved' ? (
                                    <>
                                        <button
                                            onClick={(e) => handleResolve(req.id, e)}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '12px',
                                                backgroundColor: '#DC2626',
                                                color: 'white',
                                                border: 'none',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Resolve Issue
                                        </button>
                                        <button style={{
                                            padding: '10px',
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            border: '1px solid #E5E7EB',
                                            color: '#1c1c1e',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <button style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '12px',
                                        backgroundColor: '#F3F4F6',
                                        color: '#666',
                                        border: 'none',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'not-allowed'
                                    }}>
                                        View Resolution
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredComplaints.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '32px',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto'
                    }}>
                        <AlertCircle size={32} color="#9CA3AF" />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1c1e', marginBottom: '4px' }}>No complaints found</h3>
                    <p style={{ fontSize: '14px' }}>Try adjusting your search or filter</p>
                </div>
            )}
        </div>
    );
}
