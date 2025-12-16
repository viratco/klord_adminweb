import { useState, useEffect } from 'react';
import { ArrowUpRight, Filter, X } from 'lucide-react';
import { fetchJson } from '../utils/api';
import { INDIAN_STATES_CITIES } from '../constants/IndianStatesCities';
import './Analytics.css';

export default function Analytics() {
    const [data, setData] = useState<any>(null);

    // Filter state
    const [timeframe, setTimeframe] = useState('all');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (timeframe !== 'all') params.append('timeframe', timeframe);
            if (selectedState) params.append('state', selectedState);
            if (selectedCity) params.append('city', selectedCity);

            const queryString = params.toString();
            const url = `/api/admin/analytics${queryString ? `?${queryString}` : ''}`;

            const res = await fetchJson(url);
            console.log('[Analytics] Received data:', res);
            console.log('[Analytics] Project Distribution:', res.projectDistribution);
            setData(res);
        } catch (err) {
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const cards = [
        {
            title: 'Total Bookings',
            value: data?.cards?.bookings?.toLocaleString() || '...',
            subValue: 'Lifetime',
            change: '+15%',
            bg: '#FCD34D', // Yellow
            text: '#1C1C1E',
            badgeBg: 'white',
            badgeText: '#059669',
            isDark: false
        },
        {
            title: 'Total Packages',
            value: data?.cards?.packages ? `${data.cards.packages} Types` : '...',
            subValue: 'Active Projects',
            change: '+10%',
            bg: '#1C1C1E', // Black
            text: 'white',
            badgeBg: 'white',
            badgeText: '#059669',
            isDark: true
        },
        {
            title: 'Total Revenue',
            value: data?.cards?.revenue ? `$${data.cards.revenue.toLocaleString()}` : '...',
            subValue: 'Gross Revenue',
            change: '+20%',
            bg: '#1C1C1E',
            text: 'white',
            badgeBg: 'white',
            badgeText: '#059669',
            isDark: true
        },
        {
            title: 'Hot Destinations',
            value: data?.cards?.hotDestinations || '...',
            subValue: 'Top City Bookings',
            change: '+42%',
            bg: '#1C1C1E',
            text: 'white',
            badgeBg: 'white',
            badgeText: '#059669',
            isDark: true
        }
    ];

    return (
        <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px', color: '#1c1c1e' }}>Analytics</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px'
            }}>
                {cards.map((card, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                        {/* The Card */}
                        <div style={{
                            backgroundColor: card.bg,
                            borderRadius: '24px',
                            padding: '20px',
                            color: card.text,
                            height: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden' // Ensure content stays inside
                        }}>
                            {/* Top Right "Notch" Simulation */}
                            <div style={{
                                position: 'absolute',
                                top: '-15px',
                                right: '-15px',
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#F3F4F6', // Matches page background (assumed)
                                borderRadius: '50%',
                                zIndex: 10
                            }}></div>

                            {/* Arrow Button */}
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 20
                            }}>
                                <ArrowUpRight size={16} color="#1C1C1E" />
                            </div>

                            {/* Content */}
                            <div>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    opacity: 0.9,
                                    marginBottom: '8px'
                                }}>{card.title}</h3>
                                <div style={{
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    letterSpacing: '-1px',
                                    lineHeight: '1.1'
                                }}>{card.value}</div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{
                                    fontSize: '12px',
                                    opacity: 0.7,
                                    fontWeight: '500'
                                }}>{card.subValue}</span>
                                <span style={{
                                    backgroundColor: card.badgeBg,
                                    color: card.badgeText,
                                    padding: '4px 10px',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: '700'
                                }}>{card.change}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Section */}
            <div style={{
                marginTop: '24px',
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid #f0f0f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Filter size={20} color="#1c1c1e" />
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1c1e', margin: 0 }}>Filters</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                    {/* Timeframe Dropdown */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                            TIMEFRAME
                        </label>
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1c1c1e',
                                backgroundColor: '#F9FAFB',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="all">All Time</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="12months">Last 12 Months</option>
                        </select>
                    </div>

                    {/* State Dropdown */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                            STATE
                        </label>
                        <select
                            value={selectedState}
                            onChange={(e) => {
                                setSelectedState(e.target.value);
                                setSelectedCity('');
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                fontWeight: '500',
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

                    {/* City Dropdown */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                            CITY
                        </label>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            disabled={!selectedState}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                fontWeight: '500',
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

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={loadData}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: loading ? '#999' : '#1c1c1e',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 8px rgba(28,28,30,0.15)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {loading ? 'Loading...' : 'Apply'}
                        </button>
                        <button
                            onClick={() => {
                                setTimeframe('all');
                                setSelectedState('');
                                setSelectedCity('');
                                setTimeout(loadData, 0);
                            }}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: 'white',
                                color: '#666',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#1c1c1e';
                                e.currentTarget.style.color = '#1c1c1e';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#E5E7EB';
                                e.currentTarget.style.color = '#666';
                            }}
                        >
                            <X size={16} />
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                marginTop: '24px',
                backgroundColor: 'white',
                borderRadius: '32px',
                padding: '32px',
                minHeight: '500px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1c1c1e' }}>Overview</h2>
                <div style={{
                    width: '100%',
                    height: '400px',
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    position: 'relative',
                    padding: '20px 0'
                }}>
                    {/* Custom SVG Line Graph */}
                    {data?.graph ? <RevenueGraph data={data.graph} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading Graph...</div>}
                </div>
            </div>

            {/* New 3:1 Section */}
            <div className="analytics-bottom-section">
                <div className="bottom-card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1c1c1e', marginBottom: '12px' }}>Detailed Report</h3>
                    <p style={{ color: '#666' }}>This section takes up 75% of the width.</p>
                </div>
                <div className="bottom-card black">
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '24px', alignSelf: 'flex-start', marginLeft: '24px' }}>Project Distribution</h3>
                    <AnimatedPieChart data={data?.projectDistribution} />
                </div>
            </div>
        </div>
    );
}

function AnimatedPieChart({ data }: { data: any[] }) {
    console.log('[PieChart] Received data:', data);

    // Fallback if no data
    const chartData = (data && data.length > 0) ? data.map(item => {
        let color = '#9CA3AF'; // Default Gray
        if (item.type === 'Residential') color = '#3B82F6'; // Blue
        else if (item.type === 'Commercial') color = '#8B5CF6'; // Purple
        else if (item.type === 'Industrial') color = '#F59E0B'; // Orange
        else if (item.type === 'Ground Mounted') color = '#10B981'; // Green

        return {
            label: item.type,
            value: item.count,
            color
        };
    }) : [
        { label: 'No Data', value: 1, color: '#374151' }
    ];

    console.log('[PieChart] Processed chartData:', chartData);

    const size = 280;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 100;
    const totalValue = chartData.reduce((acc, item) => acc + item.value, 0);

    let currentAngle = -90; // Start from top

    // Calculate paths for each segment
    const segments = chartData.map((item) => {
        const percentage = (item.value / totalValue) * 100;
        const angle = (item.value / totalValue) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        // Calculate path for the segment
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        // Calculate label position (middle of the segment)
        const midAngle = startAngle + angle / 2;
        const midRad = (midAngle * Math.PI) / 180;
        const labelRadius = radius * 0.65;
        const labelX = centerX + labelRadius * Math.cos(midRad);
        const labelY = centerY + labelRadius * Math.sin(midRad);

        currentAngle = endAngle;

        return {
            path: pathData,
            color: item.color,
            label: item.label,
            value: item.value,
            percentage: percentage.toFixed(1),
            labelX,
            labelY,
            angle: midAngle
        };
    });

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '20px' }}>
            <svg width={size} height={size} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
                {/* Draw segments */}
                {segments.map((segment, index) => (
                    <g key={index}>
                        <path
                            d={segment.path}
                            fill={segment.color}
                            stroke="#1C1C1E"
                            strokeWidth="2"
                            style={{
                                opacity: 0,
                                animation: `fadeInSegment 0.6s ease-out ${index * 0.15}s forwards`,
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9';
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.transformOrigin = `${centerX}px ${centerY}px`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        />

                        {/* Label inside segment */}
                        <g style={{ pointerEvents: 'none' }}>
                            <text
                                x={segment.labelX}
                                y={segment.labelY - 8}
                                textAnchor="middle"
                                fill="white"
                                fontSize="13"
                                fontWeight="700"
                                style={{
                                    opacity: 0,
                                    animation: `fadeIn 0.6s ease-out ${index * 0.15 + 0.3}s forwards`
                                }}
                            >
                                {segment.percentage}%
                            </text>
                            <text
                                x={segment.labelX}
                                y={segment.labelY + 8}
                                textAnchor="middle"
                                fill="white"
                                fontSize="11"
                                fontWeight="600"
                                style={{
                                    opacity: 0,
                                    animation: `fadeIn 0.6s ease-out ${index * 0.15 + 0.4}s forwards`
                                }}
                            >
                                ({segment.value})
                            </text>
                        </g>
                    </g>
                ))}

                {/* Center circle */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r="45"
                    fill="#1C1C1E"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                />

                {/* Center text */}
                <text
                    x={centerX}
                    y={centerY - 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="32"
                    fontWeight="800"
                >
                    {totalValue}
                </text>
                <text
                    x={centerX}
                    y={centerY + 15}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.6)"
                    fontSize="11"
                    fontWeight="600"
                >
                    Projects
                </text>
            </svg>

            {/* Compact Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', maxWidth: '240px' }}>
                {chartData.map((item, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.8)'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '2px',
                            backgroundColor: item.color
                        }}></div>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RevenueGraph({ data }: { data: any[] }) {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Graph dimensions
    const height = 300;
    const width = 1000; // Viewport width
    const padding = 40;

    // Use passed data or fallback
    const graphData = data && data.length > 0 ? data : [];

    if (graphData.length === 0) return <div>No Data</div>;

    const maxValue = Math.max(...graphData.map(d => d.value)) * 1.2 || 1000; // 20% buffer

    // Coordinate calculations
    const getX = (index: number) => padding + (index * ((width - padding * 2) / (graphData.length - 1)));
    const getY = (value: number) => height - padding - ((value / maxValue) * (height - padding * 2));

    // Generate Smooth Path (Cubic Bezier)
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
            {/* Tooltip */}
            <div
                className={`graph-tooltip ${hoveredPoint !== null ? 'visible' : ''}`}
                style={{
                    left: `${(tooltipPos.x / width) * 100}%`,
                    top: `${(tooltipPos.y / height) * 100}%`
                }}
            >
                {hoveredPoint !== null && `$${graphData[hoveredPoint].value.toLocaleString()}`}
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
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

                {/* Area Fill - Animated */}
                <path d={fillPath} fill="url(#gradient)" className="revenue-area" />

                {/* Line - Animated */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="revenue-line"
                />

                {/* Data Points - Animated */}
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

                {/* X Axis Labels */}
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
