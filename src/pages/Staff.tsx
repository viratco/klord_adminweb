import { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, Search, MoreHorizontal, Phone, X, Mail, Shield, FileText, Wrench, User, Trash2 } from 'lucide-react';
import { fetchJson } from '../utils/api';

interface StaffMember {
    id: string;
    name: string;
    role: string;
    status: 'Active' | 'On Leave' | 'Busy';
    rating: number;
    phone: string;
    email: string;
    avatar: string;
    joinedDate: string;
    address?: string;
    emergencyContact?: string;
}

export default function Staff() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [amcRequests, setAmcRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const [staffData, leadsData, amcData] = await Promise.all([
                fetchJson('/api/admin/staff'),
                fetchJson('/api/admin/leads'),
                fetchJson('/api/admin/amc-requests')
            ]);
            setStaffList(staffData);
            setLeads(leadsData);
            setAmcRequests(amcData);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async () => {
        if (!newName || !newEmail || !newPassword) {
            alert('Please fill in all required fields (Name, Email, Password)');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            alert('Please enter a valid email address');
            return;
        }

        setIsAdding(true);
        try {
            await fetchJson('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, email: newEmail, phone: newPhone, password: newPassword })
            });
            // Reset form and reload
            setNewName('');
            setNewEmail('');
            setNewPhone('');
            setNewPassword('');
            await loadStaff();
            alert('Staff added successfully!');
        } catch (err: any) {
            console.error('Failed to add staff', err);
            alert(err.message || 'Failed to add staff. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteStaff = async (id: string) => {
        if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;

        try {
            await fetchJson(`/api/admin/staff/${id}`, {
                method: 'DELETE',
            });
            alert('Staff member deleted successfully');
            setSelectedStaff(null);
            loadStaff();
        } catch (err: any) {
            console.error('Failed to delete staff', err);
            alert(err.message || 'Failed to delete staff');
        }
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = staffList.length; // For now, assuming all are active or we can filter by status if backend provided it properly

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px' }}>Staff Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
                {/* Left Column - 3 Stacked Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Card 1: Total Staff */}
                    <div style={{
                        backgroundColor: '#1c1c1e',
                        borderRadius: '24px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '180px',
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                <Users size={24} color="white" />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '20px' }}>Live</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>Total Staff</div>
                            <div style={{ fontSize: '32px', fontWeight: '800' }}>{staffList.length}</div>
                        </div>
                    </div>

                    {/* Card 2: Active Now */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '24px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '180px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: '12px' }}>
                                <UserCheck size={24} color="#16A34A" />
                            </div>
                            <div style={{ width: '10px', height: '10px', backgroundColor: '#16A34A', borderRadius: '50%', boxShadow: '0 0 0 4px #DCFCE7' }}></div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Active Now</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: '#1c1c1e' }}>{activeCount}</div>
                        </div>
                    </div>

                    {/* Card 3: Departments */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '24px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        flex: 1,
                        minHeight: '200px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '8px', backgroundColor: '#F5F5F7', borderRadius: '10px' }}>
                                <Briefcase size={20} color="#1c1c1e" />
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1c1e' }}>Departments</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { name: 'Installation', count: Math.floor(staffList.length * 0.4), color: '#F5CE57' },
                                { name: 'Maintenance', count: Math.floor(staffList.length * 0.3), color: '#1c1c1e' },
                                { name: 'Sales', count: Math.floor(staffList.length * 0.2), color: '#9CA3AF' },
                                { name: 'Technical Support', count: Math.ceil(staffList.length * 0.1), color: '#E5E7EB' }
                            ].map((dept, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dept.color }}></div>
                                        <span style={{ fontSize: '14px', color: '#4B5563', fontWeight: '500' }}>{dept.name}</span>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1c1c1e' }}>{dept.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column - Flex Container for List and Details */}
                <div style={{ display: 'flex', gap: '24px', overflow: 'hidden' }}>

                    {/* Staff List Table */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        minHeight: '600px',
                        flex: selectedStaff ? '0 0 50%' : '1',
                        maxWidth: selectedStaff ? '50%' : '100%',
                        transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}>
                        {/* Header & Search */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ minWidth: '150px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', whiteSpace: 'nowrap' }}>All Staff</h2>
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '4px', whiteSpace: 'nowrap' }}>Manage your team members</p>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#F5F5F7',
                                borderRadius: '12px',
                                padding: '10px 16px',
                                gap: '10px',
                                width: selectedStaff ? '180px' : '300px',
                                transition: 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
                            }}>
                                <Search size={18} color="#666" style={{ minWidth: '18px' }} />
                                <input
                                    type="text"
                                    placeholder="Search..."
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

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            {loading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading staff...</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: '600', padding: '0 16px' }}>NAME</th>
                                            <th style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: '600', padding: '0 16px' }}>ADDED DATE</th>
                                            <th style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: '600', padding: '0 16px' }}>NUMBER</th>
                                            <th style={{ textAlign: 'right', fontSize: '12px', color: '#666', fontWeight: '600', padding: '0 16px' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStaff.map((staff) => {
                                            const isSelected = selectedStaff?.id === staff.id;
                                            return (
                                                <tr
                                                    key={staff.id}
                                                    onClick={() => setSelectedStaff(staff)}
                                                    style={{
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer',
                                                        transform: isSelected ? 'scale(0.98)' : 'scale(1)'
                                                    }}
                                                >
                                                    <td style={{ padding: '12px 16px', backgroundColor: isSelected ? '#1c1c1e' : '#F9FAFB', borderRadius: '12px 0 0 12px', color: isSelected ? 'white' : 'inherit', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <User size={20} color="#1c1c1e" />
                                                            </div>
                                                            <div style={{ fontSize: '14px', fontWeight: '600', color: isSelected ? 'white' : '#1c1c1e', whiteSpace: 'nowrap' }}>{staff.name}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', backgroundColor: isSelected ? '#1c1c1e' : '#F9FAFB', color: isSelected ? 'rgba(255,255,255,0.7)' : 'inherit', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
                                                        <div style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>{staff.joinedDate}</div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', backgroundColor: isSelected ? '#1c1c1e' : '#F9FAFB', color: isSelected ? 'rgba(255,255,255,0.7)' : 'inherit', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                                            <Phone size={14} /> {staff.phone}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', backgroundColor: isSelected ? '#1c1c1e' : '#F9FAFB', borderRadius: '0 12px 12px 0', textAlign: 'right', transition: 'background-color 0.3s ease' }}>
                                                        <button style={{
                                                            border: 'none',
                                                            background: isSelected ? 'rgba(255,255,255,0.1)' : 'white',
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            boxShadow: isSelected ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                                                            transition: 'background-color 0.3s ease'
                                                        }}>
                                                            <MoreHorizontal size={16} color={isSelected ? 'white' : '#666'} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                            {!loading && filteredStaff.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                    No staff members found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Panel - Slides in from right */}
                    <div style={{
                        flex: selectedStaff ? '1' : '0',
                        width: selectedStaff ? '50%' : '0',
                        opacity: selectedStaff ? 1 : 0,
                        transform: selectedStaff ? 'translateX(0)' : 'translateX(50px)',
                        transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        padding: selectedStaff ? '24px' : '0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        overflow: 'hidden',
                        height: 'fit-content',
                        minHeight: '600px',
                        marginLeft: selectedStaff ? '0' : '-24px' // Pull it back when hidden to avoid gap
                    }}>
                        {selectedStaff && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={40} color="#1c1c1e" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1c1c1e' }}>{selectedStaff.name}</h2>
                                            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{selectedStaff.role}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                                <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                                    {selectedStaff.status}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}>
                                                    ⭐ {selectedStaff.rating}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedStaff(null)}
                                        style={{ border: 'none', background: '#F5F5F7', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <X size={18} color="#666" />
                                    </button>
                                </div>

                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1c1c1e' }}>Contact Information</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                                                <Phone size={14} /> PHONE
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1c1c1e' }}>{selectedStaff.phone}</div>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                                                <Mail size={14} /> EMAIL
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1c1c1e' }}>{selectedStaff.email}</div>
                                        </div>
                                    </div>
                                </div>



                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1c1c1e' }}>Assigned Work</h3>

                                    {/* Bookings */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                <FileText size={14} /> Active Bookings
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '12px', color: '#1c1c1e' }}>
                                                {leads.filter(l => l.assignedStaff?.id === selectedStaff.id).length}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {leads.filter(l => l.assignedStaff?.id === selectedStaff.id).map(lead => (
                                                <div key={lead.id} style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px', fontSize: '13px', border: '1px solid #F3F4F6' }}>
                                                    <div style={{ fontWeight: '600', color: '#1c1c1e' }}>{lead.projectType || 'Solar Installation'}</div>
                                                    <div style={{ color: '#666', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{lead.customer?.name || lead.fullName}</span>
                                                        <span style={{ fontSize: '11px', backgroundColor: '#E5E7EB', padding: '1px 6px', borderRadius: '4px' }}>{lead.status || 'Active'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {leads.filter(l => l.assignedStaff?.id === selectedStaff.id).length === 0 && (
                                                <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic', padding: '8px 0' }}>No active bookings</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* AMC */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                <Wrench size={14} /> AMC Requests
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '12px', color: '#1c1c1e' }}>
                                                {amcRequests.filter(r => r.assignedStaff?.id === selectedStaff.id).length}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {amcRequests.filter(r => r.assignedStaff?.id === selectedStaff.id).map(req => (
                                                <div key={req.id} style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px', fontSize: '13px', border: '1px solid #F3F4F6' }}>
                                                    <div style={{ fontWeight: '600', color: '#1c1c1e' }}>{req.lead?.projectType || 'Maintenance'}</div>
                                                    <div style={{ color: '#666', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{req.customer?.name || 'Unknown Customer'}</span>
                                                        <span style={{ fontSize: '11px', backgroundColor: req.status === 'resolved' ? '#DCFCE7' : '#FEF3C7', color: req.status === 'resolved' ? '#166534' : '#92400E', padding: '1px 6px', borderRadius: '4px' }}>{req.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {amcRequests.filter(r => r.assignedStaff?.id === selectedStaff.id).length === 0 && (
                                                <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic', padding: '8px 0' }}>No AMC requests</div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteStaff(selectedStaff.id)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            backgroundColor: '#FEF2F2',
                                            color: '#DC2626',
                                            border: '1px solid #FECACA',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            marginTop: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                    >
                                        <Trash2 size={16} />
                                        Delete Staff Member
                                    </button>
                                </div>


                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Add Staff & Recent */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', marginTop: '24px' }}>

                {/* Add Staff Form */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e' }}>Add New Staff</h2>
                            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Create a new account for a team member</p>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color="#1c1c1e" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <Users size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 44px',
                                        borderRadius: '16px',
                                        border: '1px solid #E5E7EB',
                                        fontSize: '14px',
                                        outline: 'none',
                                        backgroundColor: '#F9FAFB',
                                        color: '#1c1c1e',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1c1c1e';
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.backgroundColor = '#F9FAFB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="email"
                                    placeholder="e.g. john@klord.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 44px',
                                        borderRadius: '16px',
                                        border: '1px solid #E5E7EB',
                                        fontSize: '14px',
                                        outline: 'none',
                                        backgroundColor: '#F9FAFB',
                                        color: '#1c1c1e',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1c1c1e';
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.backgroundColor = '#F9FAFB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Shield size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 44px',
                                        borderRadius: '16px',
                                        border: '1px solid #E5E7EB',
                                        fontSize: '14px',
                                        outline: 'none',
                                        backgroundColor: '#F9FAFB',
                                        color: '#1c1c1e',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1c1c1e';
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.backgroundColor = '#F9FAFB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Phone size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px 14px 44px',
                                            borderRadius: '16px',
                                            border: '1px solid #E5E7EB',
                                            fontSize: '14px',
                                            outline: 'none',
                                            backgroundColor: '#F9FAFB',
                                            color: '#1c1c1e',
                                            fontWeight: '500',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#1c1c1e';
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E5E7EB';
                                            e.target.style.backgroundColor = '#F9FAFB';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleAddStaff}
                                    disabled={isAdding}
                                    style={{
                                        backgroundColor: isAdding ? '#666' : '#1c1c1e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: '0 28px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: isAdding ? 'not-allowed' : 'pointer',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 4px 12px rgba(28,28,30,0.2)',
                                        transition: 'transform 0.2s',
                                        height: '48px'
                                    }}
                                    onMouseEnter={(e) => !isAdding && (e.currentTarget.style.transform = 'scale(1.02)')}
                                    onMouseLeave={(e) => !isAdding && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    {isAdding ? 'Adding...' : 'Add Staff'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recently Added */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1c1e' }}>Recently Added</h2>
                        <span style={{ fontSize: '12px', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>New</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {staffList.slice(0, 3).map((staff, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} color="#1c1c1e" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1c1c1e' }}>{staff.name}</div>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{staff.joinedDate}</div>
                                </div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E5E7EB' }}></div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
