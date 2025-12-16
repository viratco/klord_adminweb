import { useState, useEffect } from 'react';
import {
    Search,
    MoreHorizontal,
    Clock,
    AlertCircle,
    User,
    Home,
    Briefcase
} from 'lucide-react';
import { fetchJson } from '../utils/api';

export default function Amc() {
    const [requests, setRequests] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const data = await fetchJson('/api/admin/amc-requests');
                setRequests(data);
            } catch (err) {
                console.error('Failed to load AMC requests', err);
            } finally {
                setLoading(false);
            }
        };
        loadRequests();
    }, []);

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const data = await fetchJson('/api/admin/staff');
                setStaff(data);
            } catch (err) {
                console.error('Failed to load staff', err);
            }
        };
        loadStaff();
    }, []);

    const handleAssignStaff = async (staffId: string) => {
        if (!selectedRequest) return;

        try {
            await fetchJson(`/api/admin/amc-requests/${selectedRequest.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ assignedStaffId: staffId }),
                headers: { 'Content-Type': 'application/json' }
            });

            // Update local state
            setRequests(prev => prev.map(r =>
                r.id === selectedRequest.id
                    ? { ...r, assignedStaff: staff.find(s => s.id === staffId) }
                    : r
            ));

            setShowStaffModal(false);
            setSelectedRequest(null);
        } catch (err: any) {
            console.error('Error assigning staff:', err);
            alert(err.message || 'Error assigning staff');
        }
    };

    const handleCompleteAMC = async (requestId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to mark this AMC request as complete?')) return;

        try {
            await fetchJson(`/api/admin/amc-requests/${requestId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'resolved' }),
                headers: { 'Content-Type': 'application/json' }
            });

            // Update local state
            setRequests(prev => prev.map(r =>
                r.id === requestId ? { ...r, status: 'resolved', resolvedAt: new Date() } : r
            ));
        } catch (err: any) {
            console.error('Error completing AMC:', err);
            alert(err.message || 'Error completing AMC');
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesTab = activeTab === 'pending'
            ? ['pending', 'in_progress', 'rejected'].includes(req.status)
            : req.status === 'resolved';

        const customerName = req.customer?.name || req.lead?.fullName || 'Unknown';
        const projectType = req.lead?.projectType || 'Unknown';
        const note = req.note || '';

        const matchesSearch =
            customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' };
            case 'in_progress': return { bg: '#EFF6FF', text: '#1D4ED8', border: '#DBEAFE' };
            case 'resolved': return { bg: '#F0FDF4', text: '#15803D', border: '#DCFCE7' };
            case 'rejected': return { bg: '#FEF2F2', text: '#B91C1C', border: '#FEE2E2' };
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
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1c1c1e', letterSpacing: '-0.5px' }}>AMC Service</h1>
                    <p style={{ color: '#666', marginTop: '8px', fontSize: '15px' }}>Manage annual maintenance requests and tracking</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} color="#666" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search requests..."
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
                {filteredRequests.map((req) => {
                    const statusStyle = getStatusColor(req.status);
                    const customerName = req.customer?.name || req.lead?.fullName || 'Unknown';
                    const projectType = req.lead?.projectType || 'Unknown';

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
                                        backgroundColor: '#F5F5F7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Home size={24} color="#1c1c1e" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1c1e' }}>{projectType}</h3>
                                        <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>ID: {req.lead?.id || 'N/A'}</p>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.text,
                                    border: `1px solid ${statusStyle.border} `,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {req.status.replace('_', ' ')}
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
                                {req.note}
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
                                        {req.assignedStaff ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                Assigned to <span style={{ color: '#1c1c1e', fontWeight: '600' }}>{req.assignedStaff.name}</span>
                                            </span>
                                        ) : (
                                            <span style={{ color: '#F59E0B', fontWeight: '600' }}>Unassigned</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                                {req.status !== 'resolved' ? (
                                    <>
                                        {req.assignedStaff ? (
                                            <button
                                                onClick={(e) => handleCompleteAMC(req.id, e)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#059669',
                                                    color: 'white',
                                                    border: 'none',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Complete AMC
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRequest(req);
                                                    setShowStaffModal(true);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#1c1c1e',
                                                    color: 'white',
                                                    border: 'none',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Assign Staff
                                            </button>
                                        )}
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
                                        View Details
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredRequests.length === 0 && (
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
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1c1e', marginBottom: '4px' }}>No requests found</h3>
                    <p style={{ fontSize: '14px' }}>Try adjusting your search or filter</p>
                </div>
            )}

            {/* Staff Assignment Modal */}
            {showStaffModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowStaffModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Assign Staff</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {staff.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleAssignStaff(s.id)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '1px solid #E5E7EB',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        e.currentTarget.style.borderColor = '#1c1c1e';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                    }}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{s.name}</div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>{s.email}</div>
                                    {s.phone && <div style={{ fontSize: '14px', color: '#666' }}>{s.phone}</div>}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowStaffModal(false)}
                            style={{
                                marginTop: '24px',
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
