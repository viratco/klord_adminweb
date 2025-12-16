import { useState, useEffect } from 'react';
import { Maximize2, Sparkles, FileText, Database, Folder, Tag, List, Share, Settings, Pencil, ArrowUpRight, Filter, X, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchJson } from '../utils/api';
import { INDIAN_STATES_CITIES } from '../constants/IndianStatesCities';
import * as XLSX from 'xlsx';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState({
        completedBookings: 0,
        totalBookings: 0,
        totalStepsCompleted: 0,
        unresolvedComplaints: 0,
        pendingAMC: 0,
        overdueSteps: 0
    });

    const [analytics, setAnalytics] = useState<any>(null);
    const [projectStages, setProjectStages] = useState<any>(null);

    // Filter modal state
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [timeframe, setTimeframe] = useState('all');
    const [appliedTimeframe, setAppliedTimeframe] = useState('all');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchJson('/api/admin/dashboard/stats');
                setStats(data);
            } catch (err) {
                console.error('Failed to load dashboard stats', err);
            }
        };

        const loadAnalytics = async () => {
            try {
                const data = await fetchJson(`/api/admin/analytics?timeframe=${appliedTimeframe}`);
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to load analytics', err);
            }
        };

        const loadProjectStages = async () => {
            try {
                const data = await fetchJson(`/api/admin/dashboard/project-stages?timeFrame=${appliedTimeframe}`);
                setProjectStages(data);
            } catch (err) {
                console.error('Failed to load project stages', err);
            }
        };

        loadStats();
        loadAnalytics();
        loadProjectStages();
    }, [appliedTimeframe]);

    const handleExportReport = async () => {
        try {
            // Use existing state data instead of fetching new data
            const statsData = stats;
            const analyticsData = analytics;
            const projectStagesData = projectStages;

            // Validate we have data
            if (!analyticsData || !projectStagesData) {
                alert('Please wait for dashboard data to load before generating report.');
                return;
            }

            // Create workbook
            const workbook = XLSX.utils.book_new();

            // Sheet 1: Executive Summary
            const summaryData = [
                ['KLORD SOLAR DASHBOARD REPORT'],
                ['Generated on:', new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })],
                ['Time Period:', appliedTimeframe === 'all' ? 'All Time' : appliedTimeframe === '6months' ? 'Last 6 Months' : appliedTimeframe === '3months' ? 'Last 3 Months' : appliedTimeframe === 'month' ? 'This Month' : appliedTimeframe],
                [],
                ['EXECUTIVE SUMMARY'],
                [],
                ['Key Metrics', 'Value'],
                ['Total Revenue', `₹${analyticsData?.cards?.revenue?.toLocaleString('en-IN') || 0}`],
                ['Total Bookings', analyticsData?.cards?.bookings || 0],
                ['Completed Projects', statsData.completedBookings || 0],
                ['Pending Projects', (statsData.totalBookings || 0) - (statsData.completedBookings || 0)],
                ['Completed Bookings', statsData.completedBookings || 0],
                ['Total Steps Completed', statsData.totalStepsCompleted || 0],
                ['Unresolved Complaints', statsData.unresolvedComplaints || 0],
                ['Pending AMC', statsData.pendingAMC || 0],
            ];
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

            // Sheet 2: Revenue Analysis
            if (analyticsData) {
                const revenueData = [
                    ['REVENUE ANALYSIS'],
                    [],
                    ['Total Revenue', `₹${analyticsData?.cards?.revenue?.toLocaleString('en-IN') || 0}`],
                    ['Average Revenue per Project', (analyticsData?.cards?.bookings || 0) > 0 ? `₹${Math.round((analyticsData?.cards?.revenue || 0) / analyticsData.cards.bookings).toLocaleString('en-IN')}` : '₹0'],
                    [],
                    ['Revenue by Project Type'],
                    ['Project Type', 'Count', 'Estimated Revenue']
                ];

                if (analyticsData.projectDistribution) {
                    // Assuming average project values (you can adjust these)
                    const avgProjectValues: any = {
                        'Residential': 150000,
                        'Commercial': 500000,
                        'Industrial': 2000000,
                        'Ground Mounted': 1000000
                    };

                    analyticsData.projectDistribution.forEach((item: any) => {
                        const estimatedRevenue = item.count * (avgProjectValues[item.type] || 150000);
                        revenueData.push([
                            item.type,
                            item.count,
                            `₹${estimatedRevenue.toLocaleString('en-IN')}`
                        ]);
                    });
                }

                const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
                XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Analysis');
            }

            // Sheet 3: Project Activity (Monthly Breakdown)
            if (projectStagesData?.monthlyData) {
                const activityData = [
                    ['MONTHLY PROJECT ACTIVITY'],
                    [],
                    ['Month', 'New Bookings', 'Steps Completed', 'Completion Rate']
                ];

                projectStagesData.monthlyData.forEach((item: any) => {
                    const completionRate = item.bookings > 0
                        ? `${Math.round((item.completedSteps / (item.bookings * 10)) * 100)}%`
                        : '0%';

                    activityData.push([
                        item.month,
                        item.bookings || 0,
                        item.completedSteps || 0,
                        completionRate
                    ]);
                });

                // Add totals
                const totalBookings = projectStagesData.monthlyData.reduce((sum: number, item: any) => sum + (item.bookings || 0), 0);
                const totalSteps = projectStagesData.monthlyData.reduce((sum: number, item: any) => sum + (item.completedSteps || 0), 0);
                activityData.push([]);
                activityData.push(['TOTAL', totalBookings, totalSteps, '']);

                const activitySheet = XLSX.utils.aoa_to_sheet(activityData);
                XLSX.utils.book_append_sheet(workbook, activitySheet, 'Project Activity');
            }

            // Sheet 4: Subsidy Trends
            if (projectStagesData?.monthlyData) {
                const subsidyData = [
                    ['SUBSIDY TRENDS'],
                    [],
                    ['Month', 'Subsidy Projects', 'Non-Subsidy Projects', 'Total', 'Subsidy %']
                ];

                projectStagesData.monthlyData.forEach((item: any) => {
                    const total = (item.subsidy || 0) + (item.nonSubsidy || 0);
                    const subsidyPercent = total > 0 ? `${Math.round((item.subsidy / total) * 100)}%` : '0%';

                    subsidyData.push([
                        item.month,
                        item.subsidy || 0,
                        item.nonSubsidy || 0,
                        total,
                        subsidyPercent
                    ]);
                });

                // Add totals
                const totalSubsidy = projectStagesData.monthlyData.reduce((sum: number, item: any) => sum + (item.subsidy || 0), 0);
                const totalNonSubsidy = projectStagesData.monthlyData.reduce((sum: number, item: any) => sum + (item.nonSubsidy || 0), 0);
                const grandTotal = totalSubsidy + totalNonSubsidy;
                const overallSubsidyPercent = grandTotal > 0 ? `${Math.round((totalSubsidy / grandTotal) * 100)}%` : '0%';

                subsidyData.push([]);
                subsidyData.push(['TOTAL', totalSubsidy, totalNonSubsidy, grandTotal, overallSubsidyPercent]);

                const subsidySheet = XLSX.utils.aoa_to_sheet(subsidyData);
                XLSX.utils.book_append_sheet(workbook, subsidySheet, 'Subsidy Trends');
            }

            // Sheet 5: Project Distribution
            if (analyticsData?.projectDistribution) {
                const distributionData = [
                    ['PROJECT DISTRIBUTION BY TYPE'],
                    [],
                    ['Project Type', 'Count', 'Percentage']
                ];

                const totalProjects = analyticsData.projectDistribution.reduce((sum: number, item: any) => sum + item.count, 0);

                analyticsData.projectDistribution.forEach((item: any) => {
                    const percentage = totalProjects > 0 ? `${Math.round((item.count / totalProjects) * 100)}%` : '0%';
                    distributionData.push([item.type, item.count, percentage]);
                });

                distributionData.push([]);
                distributionData.push(['TOTAL', totalProjects, '100%']);

                const distributionSheet = XLSX.utils.aoa_to_sheet(distributionData);
                XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Project Distribution');
            }

            // Sheet 6: Staff & Operations
            const operationsData = [
                ['OPERATIONS METRICS'],
                [],
                ['Metric', 'Current Status'],
                ['Completed Bookings', statsData.completedBookings || 0],
                ['Total Bookings', statsData.totalBookings || 0],
                ['Completion Rate', statsData.totalBookings > 0 ? `${Math.round((statsData.completedBookings / statsData.totalBookings) * 100)}%` : '0%'],
                [],
                ['Total Steps Completed', statsData.totalStepsCompleted || 0],
                ['Unresolved Complaints', statsData.unresolvedComplaints || 0],
                ['Pending AMC', statsData.pendingAMC || 0],
            ];

            const operationsSheet = XLSX.utils.aoa_to_sheet(operationsData);
            XLSX.utils.book_append_sheet(workbook, operationsSheet, 'Staff & Operations');

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Klord_Dashboard_Report_${timestamp}.xlsx`;

            // Write and download the file
            XLSX.writeFile(workbook, filename);
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to generate report. Please try again.');
        }
    };

    return (
        <div className="dashboard-container-wrapper">
            {/* Header Section - Moved from Layout */}
            <div className="header-section" style={{ marginBottom: '32px', paddingLeft: '0' }}>
                <div className="header-left">
                    <button className="icon-btn back-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="header-text">
                        <h1>Solar Monetary System Dashboard</h1>
                        <p>Overseeing solar energy financial operations effectively today.</p>
                    </div>
                </div>

                <div className="header-right">
                    <button className="icon-btn search-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <button
                        className="date-pill"
                        onClick={() => setShowFilterModal(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        <Filter size={18} color="white" />
                        <span>Filters {appliedTimeframe !== 'all' ? '(Active)' : ''}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <button className="create-report-btn" onClick={handleExportReport}>
                        Create Report
                    </button>
                </div>
            </div>

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
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Filter analytics data</p>
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

            {/* Analytics Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {/* Total Bookings */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        backgroundColor: '#FCD34D',
                        borderRadius: '24px',
                        padding: '20px',
                        color: '#1C1C1E',
                        height: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.3)'
                        }}></div>

                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', opacity: 0.8 }}>
                                Total Bookings
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>
                                {analytics?.cards?.bookings?.toLocaleString() || '...'}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Lifetime</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'white',
                                color: '#059669',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: '700'
                            }}>
                                <ArrowUpRight size={14} />
                                +15%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Risk Factor Analysis */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        backgroundColor: '#1C1C1E',
                        borderRadius: '24px',
                        padding: '20px',
                        color: 'white',
                        height: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.05)'
                        }}></div>

                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', opacity: 0.8 }}>
                                Risk Factor Analysis
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px', color: (stats as any).overdueSteps > 0 ? '#EF4444' : 'white' }}>
                                {(stats as any).overdueSteps || 0}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Steps Overdue</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: (stats as any).overdueSteps > 0 ? '#FEF2F2' : '#ECFDF5',
                                color: (stats as any).overdueSteps > 0 ? '#DC2626' : '#059669',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: '700'
                            }}>
                                {(stats as any).overdueSteps > 0 ? (
                                    <>
                                        <AlertCircle size={14} />
                                        High Risk
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={14} />
                                        On Track
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        backgroundColor: '#1C1C1E',
                        borderRadius: '24px',
                        padding: '20px',
                        color: 'white',
                        height: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.05)'
                        }}></div>

                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', opacity: 0.8 }}>
                                Total Revenue
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>
                                {analytics?.cards?.revenue ? `₹${analytics.cards.revenue.toLocaleString()}` : '...'}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Gross Revenue</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'white',
                                color: '#059669',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: '700'
                            }}>
                                <ArrowUpRight size={14} />
                                +20%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hot Destinations */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        backgroundColor: '#1C1C1E',
                        borderRadius: '24px',
                        padding: '20px',
                        color: 'white',
                        height: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.05)'
                        }}></div>

                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', opacity: 0.8 }}>
                                Hot Destinations
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>
                                {analytics?.cards?.hotDestinations || '...'}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Unique Cities</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'white',
                                color: '#059669',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: '700'
                            }}>
                                <ArrowUpRight size={14} />
                                +42%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Growth Line Chart */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '32px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', margin: 0 }}>
                        Revenue Overview
                    </h2>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        {appliedTimeframe === 'month' ? 'Revenue trend for this month' :
                            appliedTimeframe === 'year' ? 'Revenue trend for this year' :
                                appliedTimeframe === '30days' ? 'Revenue trend for last 30 days' :
                                    'Last 12 months revenue trend'}
                    </p>
                </div>

                <div style={{
                    width: '100%',
                    height: '400px',
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    position: 'relative',
                    padding: '20px 0'
                }}>
                    {analytics?.graph ? <RevenueGraph data={analytics.graph} /> : (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999'
                        }}>
                            Loading graph...
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-container">
                {/* Left Column - Stats */}
                <div className="left-column">
                    {/* Bookings Completed */}
                    <div className="dashboard-card">
                        <div className="sales-card-header">
                            <div className="date-select">
                                Bookings
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <button className="expand-btn">
                                <Maximize2 size={16} />
                            </button>
                        </div>
                        <div className="sales-content">
                            <div className="sales-info">
                                <h3>Bookings Completed</h3>
                                <div className="sales-amount">{stats.completedBookings || 0}/{stats.totalBookings || 0}</div>
                            </div>
                            <div className="progress-circle" style={{ background: `conic-gradient(#10B981 ${stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings * 100) : 0}%, #ECFDF5 0)` }}>
                                <span className="progress-text" style={{ color: '#059669' }}>{stats.totalBookings > 0 ? Math.round(stats.completedBookings / stats.totalBookings * 100) : 0}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Total Steps Completed */}
                    <div className="dashboard-card">
                        <div className="sales-card-header">
                            <div className="date-select">
                                Steps
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <button className="expand-btn">
                                <Maximize2 size={16} />
                            </button>
                        </div>
                        <div className="sales-content">
                            <div className="sales-info">
                                <h3>Steps Completed</h3>
                                <div className="sales-amount">{stats.totalStepsCompleted || 0}</div>
                            </div>
                            <div className="progress-circle" style={{ background: 'conic-gradient(#3B82F6 60%, #EFF6FF 0)' }}>
                                <span className="progress-text" style={{ color: '#2563EB' }}>Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Unresolved Complaints */}
                    <div className="dashboard-card">
                        <div className="sales-card-header">
                            <div className="date-select">
                                Complaints
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <button className="expand-btn">
                                <Maximize2 size={16} />
                            </button>
                        </div>
                        <div className="sales-content">
                            <div className="sales-info">
                                <h3>Unresolved</h3>
                                <div className="sales-amount">{stats.unresolvedComplaints || 0}</div>
                            </div>
                            <div className="progress-circle" style={{ background: 'conic-gradient(#EF4444 30%, #FEF2F2 0)' }}>
                                <span className="progress-text" style={{ color: '#DC2626' }}>Alert</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                    {/* Assistant Card */}
                    <div className="dashboard-card">
                        <div className="assistant-header">
                            <div className="assistant-tabs">
                                <div className="assistant-tab active">
                                    <Sparkles size={16} />
                                    Project Activity
                                </div>
                                <div className="assistant-tab icon-only"><FileText size={16} /></div>
                                <div className="assistant-tab icon-only"><Database size={16} /></div>
                                <div className="assistant-tab icon-only"><Folder size={16} /></div>
                                <div className="assistant-tab icon-only"><Tag size={16} /></div>
                                <div className="assistant-tab icon-only"><List size={16} /></div>
                            </div>
                            <div className="assistant-tabs">
                                <div className="assistant-tab icon-only"><Share size={16} /></div>
                                <div className="assistant-tab icon-only"><Settings size={16} /></div>
                            </div>
                        </div>

                        <div className="chart-container" style={{ height: '280px', marginTop: '24px' }}>
                            {projectStages?.monthlyData ? (
                                projectStages.monthlyData.map((data: any, i: number) => {
                                    const maxVal = Math.max(
                                        ...projectStages.monthlyData.map((d: any) => d.bookings)
                                    ) || 1;

                                    const bookingsHeight = (data.bookings / maxVal) * 100;
                                    const STEPS_PER_BOOKING = 12;
                                    const maxSteps = data.bookings * STEPS_PER_BOOKING;
                                    const stepsProgress = maxSteps > 0 ? Math.min(data.completedSteps / maxSteps, 1) : 0;
                                    const stepsBarHeight = bookingsHeight * stepsProgress;

                                    return (
                                        <div key={i} className="bar-group" title={`${data.month}\nNew Bookings: ${data.bookings}\nSteps Completed: ${data.completedSteps}`}>
                                            <div className="bars-wrapper">
                                                <div
                                                    className="bar secondary"
                                                    style={{ height: `${stepsBarHeight}%` }}
                                                ></div>
                                                <div
                                                    className="bar primary"
                                                    style={{ height: `${Math.max(bookingsHeight, 5)}%` }}
                                                ></div>
                                            </div>
                                            <span className="bar-label">{data.month}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', flexDirection: 'column', gap: '8px' }}>
                                    <Database size={24} />
                                    <span>No activity data</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingBottom: '24px', fontSize: '12px', color: '#9CA3AF' }}>
                                <span>100%</span>
                                <span>80%</span>
                                <span>60%</span>
                                <span>40%</span>
                                <span>20%</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="bottom-row">
                        {/* AMC Requests */}
                        <div className="dashboard-card">
                            <div className="transfer-header">
                                <h3>AMC Requests</h3>
                                <button className="edit-btn">
                                    <Pencil size={14} />
                                </button>
                            </div>
                            <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(#F59E0B ' + ((stats.pendingAMC || 0) > 0 ? '75' : '0') + '%, #FEF3C7 0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', color: '#F59E0B' }}>
                                        {stats.pendingAMC || 0}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Pending AMC</h4>
                                    <p style={{ fontSize: '12px', color: '#999' }}>Awaiting completion</p>
                                </div>
                            </div>
                        </div>

                        {/* Project Stages */}
                        <div className="dashboard-card">
                            <div className="daily-header">
                                <h3>Subsidy Trends</h3>
                                <div className="legend">
                                    <div className="legend-item">
                                        <div className="dot receive"></div>
                                        Subsidy
                                    </div>
                                    <div className="legend-item">
                                        <div className="dot send"></div>
                                        Non-Subsidy
                                    </div>
                                </div>
                            </div>
                            <div className="daily-chart">
                                {projectStages?.monthlyData ? (
                                    projectStages.monthlyData.map((data: any, i: number) => {
                                        const maxVal = Math.max(
                                            ...projectStages.monthlyData.map((d: any) => Math.max(d.subsidy, d.nonSubsidy))
                                        ) || 1;

                                        const subsidyHeight = (data.subsidy / maxVal) * 80;
                                        const nonSubsidyHeight = (data.nonSubsidy / maxVal) * 80;

                                        return (
                                            <div key={i} className="daily-bar-group" title={`${data.month}\nSubsidy: ${data.subsidy}\nNon-Subsidy: ${data.nonSubsidy}`}>
                                                <div className="daily-bars">
                                                    <div className="d-bar bottom" style={{ height: `${Math.max(subsidyHeight, 5)}px` }}></div>
                                                    <div className="d-bar top" style={{ height: `${Math.max(nonSubsidyHeight, 5)}px` }}></div>
                                                </div>
                                                <span className="bar-label">{data.month}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', flexDirection: 'column', gap: '8px' }}>
                                        <Database size={24} />
                                        <span>No activity data</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Revenue Graph Component
function RevenueGraph({ data }: { data: any[] }) {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const height = 300;
    const width = 1000;
    const padding = 40;

    const graphData = data && data.length > 0 ? data : [];

    if (graphData.length === 0) return <div>No Data</div>;

    const maxValue = Math.max(...graphData.map(d => d.value)) * 1.2 || 1000;

    const getX = (index: number) => padding + (index * ((width - padding * 2) / (graphData.length - 1)));
    const getY = (value: number) => height - padding - ((value / maxValue) * (height - padding * 2));

    const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
        const p = previous || current;
        const n = next || current;
        const smoothing = 0.2;
        const o = {
            x: n[0] - p[0],
            y: n[1] - p[1]
        };
        return [
            current[0] + Math.cos(0) * o.x * smoothing * (reverse ? -1 : 1),
            current[1] + Math.cos(0) * o.y * smoothing * (reverse ? -1 : 1)
        ];
    };

    const pathData = graphData.reduce((acc, d, i, arr) => {
        if (i === 0) return `M ${getX(0)},${getY(d.value)}`;

        const current = [getX(i), getY(d.value)];
        const previous = [getX(i - 1), getY(arr[i - 1].value)];
        const next = arr[i + 1] ? [getX(i + 1), getY(arr[i + 1].value)] : current;
        const prevPrev = arr[i - 2] ? [getX(i - 2), getY(arr[i - 2].value)] : previous;

        const cps = controlPoint(previous, prevPrev, current);
        const cpe = controlPoint(current, previous, next, true);

        return `${acc} C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${current[0]},${current[1]}`;
    }, '');

    const fillPath = `${pathData} L ${getX(graphData.length - 1)},${height - padding} L ${padding},${height - padding} Z`;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div
                className={`graph-tooltip ${hoveredPoint !== null ? 'visible' : ''}`}
                style={{
                    left: `${(tooltipPos.x / width) * 100}%`,
                    top: `${(tooltipPos.y / height) * 100}%`
                }}
            >
                {hoveredPoint !== null && `₹${graphData[hoveredPoint].value.toLocaleString()}`}
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {[0, 1, 2, 3, 4].map(i => {
                    const y = padding + (i * ((height - padding * 2) / 4));
                    return (
                        <line
                            key={i}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}

                <path d={fillPath} fill="url(#gradient)" className="revenue-area" />

                <path
                    d={pathData}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="revenue-line"
                />

                {graphData.map((d, i) => (
                    <g key={i}>
                        <circle
                            cx={getX(i)}
                            cy={getY(d.value)}
                            r="6"
                            fill="white"
                            stroke="#F59E0B"
                            strokeWidth="3"
                            className="revenue-dot"
                            style={{ animationDelay: `${1.5 + (i * 0.1)}s` }}
                            onMouseEnter={() => {
                                setHoveredPoint(i);
                                setTooltipPos({ x: getX(i), y: getY(d.value) - 10 });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    </g>
                ))}

                {graphData.map((d, i) => (
                    <text
                        key={i}
                        x={getX(i)}
                        y={height - 10}
                        textAnchor="middle"
                        fill="#9CA3AF"
                        fontSize="12"
                        fontWeight="500"
                    >
                        {d.month}
                    </text>
                ))}
            </svg>
        </div>
    );
}
