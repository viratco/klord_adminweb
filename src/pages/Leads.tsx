import { useEffect, useState } from 'react';
import { fetchJson, API_URL } from '../utils/api';
import { Phone, User, ChevronRight, Coins, UserCheck, AlertCircle, X, MapPin, ArrowLeft, CheckCircle, Calendar, ChevronDown, ChevronUp, FileText, Image as ImageIcon, Plus, Upload, Filter } from 'lucide-react';
import './Leads.css';
import * as XLSX from 'xlsx';
import { INDIAN_STATES_CITIES } from '../constants/IndianStatesCities';

const StepItem = ({ step, idx, isExpanded, onToggle, onAddContent, daysOverdue }: { step: any, idx: number, isExpanded: boolean, onToggle: () => void, onAddContent: (step: any, idx: number) => void, daysOverdue: number }) => {
    // Helper function to get urgency colors based on days overdue
    const getUrgencyColors = (days: number) => {
        if (days === 0) return null; // Not overdue

        const colorMap: { [key: number]: { bg: string, border: string, text: string, numberBg: string, label: string } } = {
            1: { bg: '#FFF9E6', border: '#F59E0B', text: '#F59E0B', numberBg: '#FEF3C7', label: 'Due Soon' },
            2: { bg: '#FFF4E0', border: '#FB923C', text: '#FB923C', numberBg: '#FFEDD5', label: 'Attention' },
            3: { bg: '#FFEDD5', border: '#F97316', text: '#F97316', numberBg: '#FED7AA', label: 'Urgent' },
            4: { bg: '#FEE2E2', border: '#EF4444', text: '#EF4444', numberBg: '#FECACA', label: 'Very Urgent' },
            5: { bg: '#FFF5F5', border: '#E53935', text: '#E53935', numberBg: '#FFEBEE', label: 'CRITICAL' }
        };

        return colorMap[Math.min(days, 5)];
    };

    const urgencyColors = getUrgencyColors(daysOverdue);

    return (
        <div style={{ transition: 'all 0.3s ease' }}>
            <div
                className={`step-pill ${step.completed ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}
                onClick={onToggle}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: isExpanded ? 'white' : (step.completed ? '#F0FDF4' : (urgencyColors ? urgencyColors.bg : 'white')),
                    border: isExpanded ? '1px solid #E5E5E7' : (step.completed ? '1px solid #DCFCE7' : (urgencyColors ? `1px solid ${urgencyColors.border}` : '1px solid white')),
                    borderRadius: isExpanded ? '16px 16px 4px 4px' : '16px',
                    boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.02)',
                    cursor: 'pointer'
                }}
            >
                <div className="step-header" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        className={`step-number ${step.completed ? 'completed' : ''}`}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: step.completed ? '#4CAF50' : (urgencyColors ? urgencyColors.numberBg : '#F2F2F4'),
                            color: step.completed ? 'white' : (urgencyColors ? urgencyColors.text : '#8E8E93'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '700',
                            flexShrink: 0
                        }}
                    >
                        {step.completed ? <CheckCircle size={18} /> : idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div
                            className={`step-title ${step.completed ? 'completed' : ''}`}
                            style={{
                                fontSize: '16px',
                                fontWeight: step.completed ? '600' : '500',
                                color: step.completed ? '#166534' : (urgencyColors ? urgencyColors.text : '#1C1C1E')
                            }}
                        >
                            {step.name}
                        </div>
                        {!step.completed && urgencyColors && (
                            <div style={{ fontSize: '12px', color: urgencyColors.text, fontWeight: '600', marginTop: '2px' }}>
                                {urgencyColors.label}
                            </div>
                        )}
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="#8E8E93" /> : <ChevronDown size={20} color="#8E8E93" />}
                </div>
            </div>

            <div className={`step-details-wrapper ${isExpanded ? 'open' : ''}`}>
                <div className="step-details-inner">
                    <div
                        className="step-details"
                        style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '0 0 16px 16px',
                            border: '1px solid #E5E5E7',
                            borderTop: 'none',
                            margin: '0 4px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                        }}
                    >
                        {/* Add Content Button */}
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddContent(step, idx);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#F5CE57',
                                    color: '#1C1C1E',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F7CE73';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 206, 87, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#F5CE57';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Plus size={16} />
                                Add Content
                            </button>
                        </div>

                        {!step.completed ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8E8E93', fontSize: '14px', padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
                                <AlertCircle size={16} />
                                This step is pending completion.
                            </div>
                        ) : (
                            <>
                                <div className="detail-row" style={{ marginBottom: '20px' }}>
                                    <div className="completed-badge" style={{ background: '#DCFCE7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle size={14} />
                                        Completed
                                    </div>
                                    <div className="detail-date" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '13px', marginLeft: '12px' }}>
                                        <Calendar size={14} />
                                        {new Date(step.completedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>

                                <div className="notes-box" style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <div className="notes-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <FileText size={12} />
                                        Technician Notes
                                    </div>
                                    <div className="notes-text" style={{ fontSize: '14px', color: '#1C1C1E', lineHeight: '1.5' }}>
                                        {step.completionNotes || 'No additional notes provided.'}
                                    </div>
                                </div>

                                {step.medias && step.medias.length > 0 && (
                                    <div>
                                        <div className="notes-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            <ImageIcon size={12} />
                                            Evidence ({step.medias.length})
                                        </div>
                                        <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                                            {step.medias.map((m: any, mIdx: number) => (
                                                <div key={mIdx} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)' }} onClick={() => window.open(m.url, '_blank')}>
                                                    <img
                                                        src={m.url}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                        alt="Evidence"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Leads() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any>(null);

    // Staff assignment state
    const [staff, setStaff] = useState<any[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [staffError, setStaffError] = useState<string | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [assignOpen, setAssignOpen] = useState(false);
    const [assigningStaff, setAssigningStaff] = useState(false);

    // Steps view state
    const [showSteps, setShowSteps] = useState(false);
    const [steps, setSteps] = useState<any[]>([]);
    const [loadingSteps, setLoadingSteps] = useState(false);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    // Filter state
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [timeframe, setTimeframe] = useState('all');
    const [appliedTimeframe, setAppliedTimeframe] = useState('all');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [appliedState, setAppliedState] = useState('');
    const [appliedCity, setAppliedCity] = useState('');

    const filteredLeads = leads.filter(lead => {
        // Timeframe Filter
        const date = new Date(lead.createdAt);
        const now = new Date();
        let matchesTime = true;
        if (appliedTimeframe === 'month') {
            matchesTime = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        } else if (appliedTimeframe === '3months') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            matchesTime = date >= threeMonthsAgo;
        } else if (appliedTimeframe === '6months') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            matchesTime = date >= sixMonthsAgo;
        }

        // Location Filter
        let matchesLocation = true;
        if (appliedState) {
            matchesLocation = lead.state === appliedState;
            if (appliedCity) {
                matchesLocation = matchesLocation && lead.city === appliedCity;
            }
        }

        return matchesTime && matchesLocation;
    });

    const handleExportExcel = () => {
        const data = filteredLeads.map(lead => ({
            'Booking Code': lead.bookingCode || '—',
            'Date': new Date(lead.createdAt).toLocaleDateString('en-IN'),
            'Customer Name': lead.fullName || lead.customer?.fullName,
            'Phone': lead.phone || lead.customer?.phone,
            'Email': lead.email || lead.customer?.email,
            'Project Type': lead.projectType || '—',
            'System Size (kW)': lead.sizedKW,
            'Provider': lead.provider || '—',
            'Total Investment': lead.totalInvestment,
            'GST Amount': lead.gstAmount,
            'Monthly Bill': lead.monthlyBill,
            'Plates': lead.plates || '—',
            'WP': lead.wp || '—',
            'City': lead.city,
            'State': lead.state,
            'Address': [lead.address, lead.street, lead.zip].filter(Boolean).join(', '),
            'Progress (%)': lead.percent,
            'Subsidy': lead.withSubsidy ? 'Yes' : 'No',
            'Assigned Staff': lead.assignedStaff ? lead.assignedStaff.name : 'Unassigned'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, `Bookings_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Upload modal state
    const [uploadingStep, setUploadingStep] = useState<any>(null);
    const [uploadingStepIdx, setUploadingStepIdx] = useState<number>(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadNotes, setUploadNotes] = useState('');
    const [uploadImages, setUploadImages] = useState<File[]>([]);
    const [uploadVideo, setUploadVideo] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadLeads();
        loadStaff();
    }, []);

    // Auto-refresh selected lead every 10 seconds to show real-time updates
    useEffect(() => {
        if (!selectedLead?.id) return;

        const refreshSelectedLead = async () => {
            try {
                const data = await fetchJson(`/api/admin/leads/${selectedLead.id}`);
                setSelectedLead(data);
                // Also update in the leads list
                setLeads(prev => prev.map(l => l.id === data.id ? data : l));
            } catch (err) {
                console.error('Failed to refresh selected lead:', err);
            }
        };

        // Set up polling every 10 seconds (no immediate refresh to avoid loop)
        const interval = setInterval(refreshSelectedLead, 10000);

        return () => clearInterval(interval);
    }, [selectedLead?.id]);

    const loadLeads = async () => {
        try {
            setLoading(true);
            const data = await fetchJson('/api/admin/leads');
            setLeads(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load leads:', err);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStaff = async () => {
        try {
            setLoadingStaff(true);
            setStaffError(null);
            const data = await fetchJson('/api/admin/staff');
            setStaff(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load staff:', err);
            setStaffError('Failed to load staff list');
            setStaff([]);
        } finally {
            setLoadingStaff(false);
        }
    };

    const refreshSelectedLead = async () => {
        if (!selectedLead?.id) return;
        try {
            const data = await fetchJson(`/api/admin/leads/${selectedLead.id}`);
            setSelectedLead(data);
            // Also update in the leads list
            setLeads(prev => prev.map(l => l.id === data.id ? data : l));
        } catch (err) {
            console.error('Failed to refresh lead:', err);
        }
    };

    const assignStaff = async () => {
        if (!selectedStaffId || !selectedLead?.id) return;
        try {
            setAssigningStaff(true);
            await fetchJson(`/api/admin/leads/${selectedLead.id}/assign`, {
                method: 'POST',
                body: JSON.stringify({ staffId: selectedStaffId })
            });
            setSelectedStaffId(null);
            setAssignOpen(false);
            await refreshSelectedLead();
        } catch (err) {
            console.error('Failed to assign staff:', err);
            alert('Failed to assign staff. Please try again.');
        } finally {
            setAssigningStaff(false);
        }
    };

    const unassignStaff = async () => {
        if (!selectedLead?.id) return;
        try {
            setAssigningStaff(true);
            await fetchJson(`/api/admin/leads/${selectedLead.id}/unassign`, {
                method: 'POST'
            });
            await refreshSelectedLead();
        } catch (err) {
            console.error('Failed to unassign staff:', err);
            alert('Failed to unassign staff. Please try again.');
        } finally {
            setAssigningStaff(false);
        }
    };

    const loadSteps = async () => {
        if (!selectedLead?.id) return;
        try {
            setLoadingSteps(true);
            setShowSteps(true); // Open immediately
            const data = await fetchJson(`/api/admin/leads/${selectedLead.id}`);

            const dbSteps = Array.isArray(data?.steps) ? data.steps : [];

            const defaultLabels = [
                'Meeting', 'Survey', 'Structure Install', 'Civil Work', 'Wiring',
                'Panel Installation', 'Net Metering', 'Testing', 'Full Plant Start',
                'Subsidy Process Request', 'Subsidy Disbursement', 'Certificate'
            ];

            const mergedSteps = defaultLabels.map((label, idx) => {
                // Match by order (preferred, DB is 1-based) OR by name (only if order is not set or matches)
                const found = dbSteps.find((s: any) => s.order === (idx + 1)) ||
                    dbSteps.find((s: any) => s.name === label && (s.order === null || s.order === undefined));

                // Force the name to be the standard label, but keep DB status
                if (found) return { ...found, name: label, order: idx };
                return { id: `default-${idx}`, name: label, order: idx, completed: false };
            });

            setSteps(mergedSteps);
        } catch (err) {
            console.error('Failed to load steps:', err);
        } finally {
            setLoadingSteps(false);
        }
    };

    const handleAddContent = (step: any, idx: number) => {
        setUploadingStep(step);
        setUploadingStepIdx(step.order !== undefined ? step.order : idx);
        setUploadNotes('');
        setUploadImages([]);
        setUploadVideo(null);
        setShowUploadModal(true);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages = Array.from(files).slice(0, 5 - uploadImages.length);
        setUploadImages(prev => [...prev, ...newImages]);
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            alert('Video file is too large. Maximum size is 50MB.');
            return;
        }

        setUploadVideo(file);
    };

    const removeImage = (index: number) => {
        setUploadImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeVideo = () => setUploadVideo(null);

    const handleUploadContent = async () => {
        if (!uploadingStep || !uploadNotes.trim()) {
            alert('Please provide notes before uploading.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('notes', uploadNotes.trim());
            formData.append('stepName', uploadingStep.name);
            formData.append('stepOrder', String(uploadingStepIdx));

            uploadImages.forEach((img) => {
                formData.append('images', img);
            });

            if (uploadVideo) {
                formData.append('video', uploadVideo);
            }

            const response = await fetch(`${API_URL}/api/admin/leads/${selectedLead.id}/steps/add-content`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            // Refresh steps and lead data to update percentage
            await loadSteps();
            await refreshSelectedLead();

            // Close modal and reset
            setShowUploadModal(false);
            setUploadingStep(null);
            setUploadNotes('');
            setUploadImages([]);
            setUploadVideo(null);

            alert('Content added successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload content. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="leads-container">
            {/* Header */}
            <div className="leads-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1C1C1E' }}>Bookings</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowFilterModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: appliedTimeframe !== 'all' || appliedState ? '#1C1C1E' : 'white',
                            color: appliedTimeframe !== 'all' || appliedState ? 'white' : '#1C1C1E',
                            border: appliedTimeframe !== 'all' || appliedState ? 'none' : '1px solid #E5E5E7',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: appliedTimeframe !== 'all' || appliedState ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        <Filter size={18} />
                        Filters {(appliedTimeframe !== 'all' || appliedState) ? '(Active)' : ''}
                    </button>
                    <button
                        onClick={handleExportExcel}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#1C1C1E',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <FileText size={18} />
                        Export to Excel
                    </button>
                </div>
            </div>

            <div className="leads-content">
                {/* Left Side - Pill List */}
                <div className="leads-left">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading bookings...</div>
                    ) : (
                        <div className="leads-list">
                            {filteredLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="lead-pill"
                                    onClick={() => setSelectedLead(lead)}
                                    style={{ borderColor: selectedLead?.id === lead.id ? '#F5CE57' : 'transparent' }}
                                >
                                    <div className="pill-left">
                                        <div className="pill-avatar">
                                            <User size={20} />
                                        </div>
                                        <div className="pill-info">
                                            <h3>{lead.fullName || lead.customer?.fullName}</h3>
                                            <div className="pill-sub">
                                                <Phone size={12} />
                                                {lead.phone || lead.customer?.phone}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pill-right">
                                        <div className="pill-badges">
                                            {/* Subsidy Icon */}
                                            <div className={`icon-badge ${lead.withSubsidy ? 'subsidy-yes' : 'subsidy-no'}`} title={lead.withSubsidy ? 'Subsidy Available' : 'No Subsidy'}>
                                                <Coins size={16} />
                                            </div>

                                            {/* Assigned Icon */}
                                            <div className={`icon-badge ${lead.assignedStaff ? 'assigned' : 'unassigned'}`} title={lead.assignedStaff ? 'Assigned' : 'Pending Assignment'}>
                                                {lead.assignedStaff ? <UserCheck size={16} /> : <AlertCircle size={16} />}
                                            </div>
                                        </div>
                                        <ChevronRight size={16} color="#ccc" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side - Details Panel */}
                <div className="leads-right">
                    {selectedLead ? (
                        <div className="leads-right-panel" key={selectedLead.id}>
                            <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                                <div className="panel-title">
                                    <h2>{selectedLead.fullName || selectedLead.customer?.fullName}</h2>
                                    <div className="panel-subtitle">
                                        <MapPin size={14} />
                                        {selectedLead.city}, {selectedLead.state}
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setSelectedLead(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Staff Assignment */}
                            <div className="assign-card">
                                <div className="assign-header">
                                    <span className="assign-title">Assign to staff</span>
                                    {loadingStaff && <span style={{ fontSize: '12px', color: '#666' }}>Loading...</span>}
                                </div>
                                {staffError && <div style={{ color: '#b00020', fontSize: '12px', marginTop: '8px' }}>{staffError}</div>}
                                {selectedLead.assignedStaff ? (
                                    <div className="assigned-row">
                                        <span className="assigned-text">
                                            Assigned: {selectedLead.assignedStaff.name} ({selectedLead.assignedStaff.email})
                                        </span>
                                        <button
                                            className="unassign-btn"
                                            onClick={unassignStaff}
                                            disabled={assigningStaff}
                                        >
                                            {assigningStaff ? 'Unassigning...' : 'Unassign'}
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '12px' }}>
                                        {/* Dropdown */}
                                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                                            <button
                                                onClick={() => setAssignOpen(!assignOpen)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    border: '2px solid #E5E7EB',
                                                    backgroundColor: '#F9FAFB',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#1c1c1e',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <span>{selectedStaffId ? staff.find(s => s.id === selectedStaffId)?.name || 'Select staff' : 'Select staff'}</span>
                                                <span>{assignOpen ? '▲' : '▼'}</span>
                                            </button>
                                            {assignOpen && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    marginTop: '4px',
                                                    backgroundColor: 'white',
                                                    border: '2px solid #E5E7EB',
                                                    borderRadius: '12px',
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    zIndex: 10,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}>
                                                    {staff.map((s) => (
                                                        <div
                                                            key={s.id}
                                                            onClick={() => {
                                                                setSelectedStaffId(s.id);
                                                                setAssignOpen(false);
                                                            }}
                                                            style={{
                                                                padding: '12px 16px',
                                                                cursor: 'pointer',
                                                                backgroundColor: selectedStaffId === s.id ? 'rgba(28,28,30,0.06)' : 'transparent',
                                                                fontSize: '14px',
                                                                borderBottom: '1px solid #f0f0f0'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(28,28,30,0.04)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedStaffId === s.id ? 'rgba(28,28,30,0.06)' : 'transparent'}
                                                        >
                                                            <div style={{ fontWeight: '600', color: '#1c1c1e' }}>{s.name}</div>
                                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{s.email}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {/* Assign Button */}
                                        <button
                                            onClick={assignStaff}
                                            disabled={!selectedStaffId || assigningStaff}
                                            style={{
                                                width: '100%',
                                                padding: '12px 24px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                backgroundColor: selectedStaffId && !assigningStaff ? '#1C1C1E' : '#ccc',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                cursor: selectedStaffId && !assigningStaff ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {assigningStaff ? 'Assigning...' : 'Assign'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Receipt Card (Black) */}
                            <div className="receipt-card">
                                <div className="receipt-header-row">
                                    <div className="receipt-title">Booking Receipt</div>
                                    <div className="receipt-sub">{selectedLead.fullName || selectedLead.customer?.fullName}</div>
                                </div>

                                <div className="receipt-row">
                                    <span className="receipt-label">Project Status</span>
                                    <span className="receipt-value" style={{ color: selectedLead.percent >= 100 ? '#4CAF50' : '#F5CE57' }}>
                                        {selectedLead.percent || 0}% Complete
                                    </span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">Project Type</span>
                                    <span className="receipt-value" style={{ textTransform: 'capitalize' }}>{selectedLead.projectType || '—'}</span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">Booking Code</span>
                                    <span className="receipt-value">{selectedLead.bookingCode || '—'}</span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">Created Date</span>
                                    <span className="receipt-value">{selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                                </div>

                                <div className="receipt-divider"></div>

                                <div className="receipt-row">
                                    <span className="receipt-label">Cost of Solar PV Plant</span>
                                    <span className="receipt-value">₹ {selectedLead.totalInvestment?.toLocaleString('en-IN') || '0'}</span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">GST ({selectedLead.gstPct || 0}%)</span>
                                    <span className="receipt-value">₹ {selectedLead.gstAmount?.toLocaleString('en-IN') || '0'}</span>
                                </div>
                                <div className="receipt-divider"></div>
                                <div className="receipt-row">
                                    <span className="receipt-label" style={{ color: 'white' }}>Total Payable</span>
                                    <span className="receipt-value" style={{ fontSize: '18px' }}>
                                        ₹ {((selectedLead.totalInvestment || 0) + (selectedLead.gstAmount || 0))?.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className="receipt-divider"></div>

                                <div className="receipt-meta-row">
                                    <span className="receipt-meta">Size: {selectedLead.sizedKW || 0} kW</span>
                                    <span className="receipt-meta">Provider: {selectedLead.provider || '—'}</span>
                                </div>
                                <div className="receipt-meta-row">
                                    <span className="receipt-meta">Plates: {selectedLead.plates || '—'}</span>
                                    <span className="receipt-meta">WP: {selectedLead.wp || '—'}</span>
                                </div>

                                <div className="receipt-divider"></div>

                                <div className="receipt-row">
                                    <span className="receipt-label">Customer Name</span>
                                    <span className="receipt-value">{selectedLead.fullName || selectedLead.customer?.fullName || '—'}</span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">Phone</span>
                                    <span className="receipt-value">{selectedLead.phone || selectedLead.customer?.phone || '—'}</span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">Email</span>
                                    <span className="receipt-value">{selectedLead.email || selectedLead.customer?.email || '—'}</span>
                                </div>
                                <div className="receipt-address-row" style={{ marginTop: '12px' }}>
                                    <div className="receipt-label" style={{ marginBottom: '4px' }}>Address</div>
                                    <div className="receipt-value" style={{ textAlign: 'left', lineHeight: '1.4', opacity: 0.9 }}>
                                        {[selectedLead.address, selectedLead.street, selectedLead.city, selectedLead.state, selectedLead.zip].filter(Boolean).join(', ') || '—'}
                                    </div>
                                </div>

                                <div className="receipt-divider"></div>

                                <div className="receipt-row">
                                    <span className="receipt-label">Monthly Bill</span>
                                    <span className="receipt-value">₹ {selectedLead.monthlyBill?.toLocaleString('en-IN') || '0'}</span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">Rate per kW</span>
                                    <span className="receipt-value">₹ {selectedLead.ratePerKW?.toLocaleString('en-IN') || '0'}</span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">With Subsidy</span>
                                    <span className="receipt-value">{selectedLead.withSubsidy ? 'Yes' : 'No'}</span>
                                </div>
                            </div>

                            {/* View Steps Button (Yellow) */}
                            <div style={{ marginBottom: '24px' }}>
                                <button
                                    onClick={loadSteps}
                                    style={{
                                        background: '#F5CE57',
                                        padding: '16px 24px',
                                        borderRadius: '16px',
                                        fontSize: '15px',
                                        fontWeight: '700',
                                        color: '#1C1C1E',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        width: '100%',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 8px 20px rgba(245, 206, 87, 0.25)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    View Steps Completed
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Complaints */}
                            <div className="bottom-section">
                                <div className="bottom-title">Customer Complaints</div>
                                {selectedLead.complaints && selectedLead.complaints.length > 0 ? (
                                    selectedLead.complaints.map((c: any) => (
                                        <div key={c.id} className="complaint-item">
                                            <div className="complaint-msg">{c.message}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                                <span className="complaint-meta">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                <span className={`status-pill ${c.status}`}>{c.status.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', padding: '12px' }}>No complaints filed</div>
                                )}
                            </div>

                            {/* AMC Requests */}
                            <div className="bottom-section">
                                <div className="bottom-title">AMC Requests</div>
                                {selectedLead.amcRequests && selectedLead.amcRequests.length > 0 ? (
                                    selectedLead.amcRequests.map((a: any) => (
                                        <div key={a.id} className="complaint-item">
                                            <div className="complaint-msg">{a.note}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                                <span className="complaint-meta">{new Date(a.createdAt).toLocaleDateString()}</span>
                                                <span className={`status-pill ${a.status}`}>{a.status.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', padding: '12px' }}>No AMC requests</div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Steps Overlay */}
            <div className={`steps-overlay ${showSteps ? 'open' : ''}`} style={{ boxShadow: '-10px 0 40px rgba(0,0,0,0.15)' }}>
                <div className="steps-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                    <button className="steps-back-btn" onClick={() => setShowSteps(false)}>
                        <ArrowLeft size={20} color="#1C1C1E" />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1C1C1E' }}>Project Progress</h2>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', fontWeight: '500' }}>
                            {selectedLead?.fullName || 'Booking Details'}
                        </div>
                    </div>
                    <div style={{
                        background: selectedLead?.percent >= 100 ? '#DCFCE7' : '#FEF3C7',
                        color: selectedLead?.percent >= 100 ? '#166534' : '#D97706',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700'
                    }}>
                        {selectedLead?.percent || 0}% Done
                    </div>
                </div>

                <div className="steps-content">
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '32px', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#1C1C1E' }}>
                            <span>Progress Overview</span>
                            <span>{steps.filter(s => s.completed).length} / {steps.length} Steps</span>
                        </div>
                        <div className="steps-progress-bar" style={{ height: '10px', background: '#F2F2F4', borderRadius: '5px' }}>
                            <div
                                className="steps-progress-fill"
                                style={{
                                    width: `${selectedLead?.percent || 0}%`,
                                    backgroundColor: selectedLead?.percent >= 100 ? '#4CAF50' : '#F5CE57',
                                    borderRadius: '5px',
                                    boxShadow: '0 2px 8px rgba(245, 206, 87, 0.4)'
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Steps List */}
                    {loadingSteps ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#8E8E93' }}>
                            <div style={{ marginBottom: '16px' }}>Loading steps...</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>
                            {steps.map((step, idx) => {
                                // Simple! Just use the dueDays field from database
                                const daysOverdue = step.dueDays || 0;

                                return (
                                    <StepItem
                                        key={step.id || idx}
                                        step={step}
                                        idx={idx}
                                        isExpanded={expandedStep === (step.id || idx)}
                                        onToggle={() => setExpandedStep(expandedStep === (step.id || idx) ? null : (step.id || idx))}
                                        onAddContent={handleAddContent}
                                        daysOverdue={daysOverdue}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '20px'
                    }}
                    onClick={() => setShowUploadModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '24px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1C1C1E', marginBottom: '4px' }}>
                                Add Content to Step
                            </h2>
                            <p style={{ fontSize: '14px', color: '#8E8E93' }}>
                                {uploadingStep?.name}
                            </p>
                        </div>

                        {/* Notes Input */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1C1C1E', marginBottom: '8px' }}>
                                Notes *
                            </label>
                            <textarea
                                value={uploadNotes}
                                onChange={(e) => setUploadNotes(e.target.value)}
                                placeholder="Describe what was completed or your observations..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E5E7',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Media Upload Section */}
                        <div style={{ marginBottom: '20px', background: '#F9FAFB', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Upload size={18} color="#1C1C1E" />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1C1C1E' }}>
                                        Attach Evidence
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#8E8E93' }}>
                                        Add up to 5 photos and 1 video
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                                    Photos ({uploadImages.length}/5)
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                                    {uploadImages.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E5E7' }}>
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`Preview ${idx + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(0,0,0,0.6)',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '16px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {uploadImages.length < 5 && (
                                    <label style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        background: 'white',
                                        border: '2px dashed #E5E5E7',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#1C1C1E'
                                    }}>
                                        <Plus size={16} />
                                        Add Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Video */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                                    Video {uploadVideo && '(1/1)'}
                                </label>
                                {uploadVideo ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #E5E5E7' }}>
                                        <div style={{ flex: 1, fontSize: '14px', color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {uploadVideo.name}
                                        </div>
                                        <button
                                            onClick={removeVideo}
                                            style={{
                                                padding: '4px 12px',
                                                background: '#FEE2E2',
                                                color: '#DC2626',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        background: 'white',
                                        border: '2px dashed #E5E5E7',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#1C1C1E'
                                    }}>
                                        <Upload size={16} />
                                        Add Video
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    background: '#F2F2F4',
                                    color: '#1C1C1E',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadContent}
                                disabled={!uploadNotes.trim() || isUploading}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    background: !uploadNotes.trim() || isUploading ? '#E5E5E7' : '#1C1C1E',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: !uploadNotes.trim() || isUploading ? 'not-allowed' : 'pointer',
                                    boxShadow: !uploadNotes.trim() || isUploading ? 'none' : '0 4px 12px rgba(28,28,30,0.2)'
                                }}
                            >
                                {isUploading ? 'Uploading...' : 'Upload Content'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}
                    onClick={() => setShowFilterModal(false)}
                >
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1c1c1e', margin: 0 }}>Filters</h2>
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Filter bookings data</p>
                            </div>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px'
                                }}
                            >
                                <X size={24} color="#666" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Timeframe */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    Timeframe
                                </label>
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '2px solid #E5E7EB',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1c1c1e',
                                        backgroundColor: '#F9FAFB',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="all">All Time</option>
                                    <option value="month">This Month</option>
                                    <option value="3months">Last 3 Months</option>
                                    <option value="6months">Last 6 Months</option>
                                </select>
                            </div>

                            {/* State */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    State
                                </label>
                                <select
                                    value={selectedState}
                                    onChange={(e) => {
                                        setSelectedState(e.target.value);
                                        setSelectedCity('');
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '2px solid #E5E7EB',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1c1c1e',
                                        backgroundColor: '#F9FAFB',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">All States</option>
                                    {Object.keys(INDIAN_STATES_CITIES).map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            {/* City */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    City
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    disabled={!selectedState}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '2px solid #E5E7EB',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: selectedState ? '#1c1c1e' : '#999',
                                        backgroundColor: selectedState ? '#F9FAFB' : '#f5f5f5',
                                        cursor: selectedState ? 'pointer' : 'not-allowed',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">All Cities</option>
                                    {selectedState && INDIAN_STATES_CITIES[selectedState]?.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button
                                onClick={() => {
                                    setTimeframe('all');
                                    setAppliedTimeframe('all');
                                    setSelectedState('');
                                    setSelectedCity('');
                                    setAppliedState('');
                                    setAppliedCity('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    border: '2px solid #E5E7EB',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => {
                                    setAppliedTimeframe(timeframe);
                                    setAppliedState(selectedState);
                                    setAppliedCity(selectedCity);
                                    setShowFilterModal(false);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: '#1C1C1E',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(28,28,30,0.2)'
                                }}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
