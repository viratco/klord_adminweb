import { useState, useEffect } from 'react';
import { Phone, Search, MoreHorizontal, X, FileDown } from 'lucide-react';
import { fetchJson } from '../utils/api';
import * as XLSX from 'xlsx';

interface Customer {
    id: string;
    mobile: string;
    referralCode?: string;
    referredBy?: string;
    level: number;
    createdAt: string;
    leads: Array<{
        id: string;
        projectType: string;
        percent: number;
        createdAt: string;
    }>;
    referredByCustomer?: {
        id: string;
        mobile: string;
    };
    downlines: Array<{
        id: string;
        mobile: string;
    }>;
    wallet?: {
        balance: number;
    };
}

export default function Data() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await fetchJson('/api/admin/customers');
            setCustomers(data);
        } catch (err) {
            console.error('Failed to load customers', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportToExcel = () => {
        // Prepare data for Excel
        const excelData = customers.map((customer, index) => ({
            'S.No': index + 1,
            'Mobile': customer.mobile,
            'Referral Code': customer.referralCode || 'N/A',
            'Level': customer.level,
            'Total Bookings': customer.leads?.length || 0,
            'Total Referrals': customer.downlines?.length || 0,
            'Referred By': customer.referredByCustomer?.mobile || 'Direct',
            'Joined Date': new Date(customer.createdAt).toLocaleDateString(),
            'Customer ID': customer.id,
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const columnWidths = [
            { wch: 6 },  // S.No
            { wch: 15 }, // Mobile
            { wch: 15 }, // Referral Code
            { wch: 8 },  // Level
            { wch: 15 }, // Total Bookings
            { wch: 15 }, // Total Referrals
            { wch: 15 }, // Referred By
            { wch: 15 }, // Joined Date
            { wch: 30 }, // Customer ID
        ];
        worksheet['!cols'] = columnWidths;

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const filename = `Customer_Report_${date}.xlsx`;

        // Download file
        XLSX.writeFile(workbook, filename);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.mobile.includes(searchQuery) ||
        customer.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px' }}>Customer Data</h1>

            {/* Full Width - Customer List and Details */}
            <div style={{ display: 'flex', gap: '24px', overflow: 'hidden' }}>

                {/* Customer List Table */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    minHeight: '600px',
                    flex: selectedCustomer ? '0 0 50%' : '1',
                    maxWidth: selectedCustomer ? '50%' : '100%',
                    transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}>
                    {/* Header & Search */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ minWidth: '150px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', whiteSpace: 'nowrap' }}>All Customers</h2>
                            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px', whiteSpace: 'nowrap' }}>View customer information</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#F5F5F7',
                                borderRadius: '12px',
                                padding: '10px 16px',
                                gap: '10px',
                                width: selectedCustomer ? '180px' : '300px',
                                transition: 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
                            }}>
                                <Search size={18} color="#666" style={{ minWidth: '18px' }} />
                                <input
                                    type="text"
                                    placeholder="Search by mobile..."
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
                            <button
                                onClick={handleExportToExcel}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    backgroundColor: '#1c1c1e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <FileDown size={18} />
                                Create Report
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading customers...</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: '600', padding: '0 16px' }}>MOBILE</th>
                                        <th style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: '600', padding: '0 16px' }}>BOOKINGS</th>
                                        <th style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: '600', padding: '0 16px' }}>REFERRALS</th>
                                        <th style={{ textAlign: 'right', fontSize: '12px', color: '#666', fontWeight: '600', padding: '0 16px' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => {
                                        const isSelected = selectedCustomer?.id === customer.id;
                                        return (
                                            <tr
                                                key={customer.id}
                                                onClick={() => setSelectedCustomer(customer)}
                                                style={{
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                    transform: isSelected ? 'scale(0.98)' : 'scale(1)'
                                                }}
                                            >
                                                <td style={{ padding: '12px 16px', backgroundColor: isSelected ? '#1c1c1e' : '#F9FAFB', borderRadius: '12px 0 0 12px', color: isSelected ? 'white' : 'inherit', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ padding: '8px', backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : '#F0FDF4', borderRadius: '10px' }}>
                                                            <Phone size={16} color={isSelected ? 'white' : '#16A34A'} />
                                                        </div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: isSelected ? 'white' : '#1c1c1e', whiteSpace: 'nowrap' }}>{customer.mobile}</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', backgroundColor: isSelected ? '#1c1c1e' : '#F9FAFB', color: isSelected ? 'rgba(255,255,255,0.7)' : 'inherit', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>{customer.leads?.length || 0}</div>
                                                </td>
                                                <td style={{ padding: '12px 16px', backgroundColor: isSelected ? '#1c1c1e' : '#F9FAFB', color: isSelected ? 'rgba(255,255,255,0.7)' : 'inherit', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>{customer.downlines?.length || 0}</div>
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
                        {!loading && filteredCustomers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                No customers found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Panel - Slides in from right */}
                <div style={{
                    flex: selectedCustomer ? '1' : '0',
                    width: selectedCustomer ? '50%' : '0',
                    opacity: selectedCustomer ? 1 : 0,
                    transform: selectedCustomer ? 'translateX(0)' : 'translateX(50px)',
                    transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    padding: selectedCustomer ? '24px' : '0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    overflow: 'hidden',
                    height: 'fit-content',
                    minHeight: '600px',
                    marginLeft: selectedCustomer ? '0' : '-24px'
                }}>
                    {selectedCustomer && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1c1c1e' }}>{selectedCustomer.mobile}</h2>
                                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Customer ID: {selectedCustomer.id.substring(0, 8)}...</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                            Level {selectedCustomer.level}
                                        </span>
                                        {selectedCustomer.referralCode && (
                                            <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                                Code: {selectedCustomer.referralCode}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    style={{ border: 'none', background: '#F5F5F7', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <X size={18} color="#666" />
                                </button>
                            </div>

                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1c1c1e' }}>Bookings ({selectedCustomer.leads?.length || 0})</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {selectedCustomer.leads && selectedCustomer.leads.length > 0 ? (
                                        selectedCustomer.leads.map((lead, idx) => (
                                            <div key={idx} style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1c1c1e' }}>{lead.projectType}</div>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Progress: {lead.percent}%</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No bookings yet</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1c1c1e' }}>Referral Network</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedCustomer.referredByCustomer && (
                                        <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '12px', color: '#D97706', fontWeight: '600', marginBottom: '4px' }}>REFERRED BY</div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1c1c1e' }}>{selectedCustomer.referredByCustomer.mobile}</div>
                                        </div>
                                    )}
                                    <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', marginBottom: '4px' }}>TOTAL REFERRALS</div>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#1c1c1e' }}>{selectedCustomer.downlines?.length || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
