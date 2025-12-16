// Beautiful Pie Chart Component
function AnimatedPieChart({ data }: { data: any[] }) {
    const chartData = (data && data.length > 0) ? data.map(item => {
        let color = '#9CA3AF';
        let gradient = ['#9CA3AF', '#6B7280'];

        if (item.type === 'Residential') {
            color = '#3B82F6';
            gradient = ['#60A5FA', '#3B82F6'];
        } else if (item.type === 'Commercial') {
            color = '#8B5CF6';
            gradient = ['#A78BFA', '#8B5CF6'];
        } else if (item.type === 'Industrial') {
            color = '#F59E0B';
            gradient = ['#FBBF24', '#F59E0B'];
        } else if (item.type === 'Ground Mounted') {
            color = '#10B981';
            gradient = ['#34D399', '#10B981'];
        }

        return {
            label: item.type,
            value: item.count,
            color,
            gradient
        };
    }) : [
        { label: 'No Data', value: 1, color: '#374151', gradient: ['#4B5563', '#374151'] }
    ];

    const size = 300;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 110;
    const totalValue = chartData.reduce((acc, item) => acc + item.value, 0);

    let currentAngle = -90;

    const segments = chartData.map((item) => {
        const percentage = (item.value / totalValue) * 100;
        const angle = (item.value / totalValue) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

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

        const midAngle = startAngle + angle / 2;
        const midRad = (midAngle * Math.PI) / 180;
        const labelRadius = radius * 0.65;
        const labelX = centerX + labelRadius * Math.cos(midRad);
        const labelY = centerY + labelRadius * Math.sin(midRad);

        currentAngle = endAngle;

        return {
            path: pathData,
            color: item.color,
            gradient: item.gradient,
            label: item.label,
            value: item.value,
            percentage: percentage.toFixed(1),
            labelX,
            labelY
        };
    });

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
            padding: '24px 20px'
        }}>
            <svg width={size} height={size} style={{
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
                overflow: 'visible'
            }}>
                <defs>
                    {segments.map((segment, idx) => (
                        <radialGradient key={idx} id={`gradient-${idx}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={segment.gradient[0]} stopOpacity="1" />
                            <stop offset="100%" stopColor={segment.gradient[1]} stopOpacity="1" />
                        </radialGradient>
                    ))}

                    {/* Glow filters */}
                    {segments.map((_, idx) => (
                        <filter key={idx} id={`glow-${idx}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    ))}
                </defs>

                {/* Segments */}
                {segments.map((segment, idx) => (
                    <g key={idx}>
                        {/* Glow layer */}
                        <path
                            d={segment.path}
                            fill={segment.color}
                            opacity="0.3"
                            filter={`url(#glow-${idx})`}
                            style={{
                                opacity: 0,
                                animation: `fadeIn 0.8s ease-out ${idx * 0.15}s forwards`
                            }}
                        />

                        {/* Main segment */}
                        <path
                            d={segment.path}
                            fill={`url(#gradient-${idx})`}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                            style={{
                                opacity: 0,
                                animation: `fadeInSegment 0.8s ease-out ${idx * 0.15}s forwards`,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.filter = 'brightness(1.15)';
                                e.currentTarget.style.transform = 'scale(1.03)';
                                e.currentTarget.style.transformOrigin = `${centerX}px ${centerY}px`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.filter = 'brightness(1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        />

                        {/* Percentage label */}
                        <text
                            x={segment.labelX}
                            y={segment.labelY - 6}
                            textAnchor="middle"
                            fill="white"
                            fontSize="16"
                            fontWeight="800"
                            style={{
                                opacity: 0,
                                animation: `fadeIn 0.6s ease-out ${idx * 0.15 + 0.4}s forwards`,
                                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                pointerEvents: 'none'
                            }}
                        >
                            {segment.percentage}%
                        </text>

                        {/* Count label */}
                        <text
                            x={segment.labelX}
                            y={segment.labelY + 10}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.9)"
                            fontSize="12"
                            fontWeight="600"
                            style={{
                                opacity: 0,
                                animation: `fadeIn 0.6s ease-out ${idx * 0.15 + 0.5}s forwards`,
                                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                                pointerEvents: 'none'
                            }}
                        >
                            ({segment.value})
                        </text>
                    </g>
                ))}

                {/* Center circle with gradient */}
                <defs>
                    <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#2D2D30" />
                        <stop offset="100%" stopColor="#1C1C1E" />
                    </radialGradient>
                </defs>

                <circle
                    cx={centerX}
                    cy={centerY}
                    r="50"
                    fill="url(#centerGradient)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="3"
                    style={{
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
                    }}
                />

                {/* Center text */}
                <text
                    x={centerX}
                    y={centerY - 8}
                    textAnchor="middle"
                    fill="white"
                    fontSize="38"
                    fontWeight="900"
                    style={{
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                >
                    {totalValue}
                </text>
                <text
                    x={centerX}
                    y={centerY + 14}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="1"
                >
                    PROJECTS
                </text>
            </svg>

            {/* Beautiful Legend */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                width: '100%',
                maxWidth: '280px'
            }}>
                {chartData.map((item, idx) => {
                    const percentage = ((item.value / totalValue) * 100).toFixed(1);
                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                opacity: 0,
                                animation: `fadeIn 0.5s ease-out ${idx * 0.1 + 0.6}s forwards`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}40`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '3px',
                                background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                                boxShadow: `0 0 12px ${item.color}60`,
                                flexShrink: 0
                            }}></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'rgba(255,255,255,0.95)',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {item.label}
                                </div>
                                <div style={{
                                    fontSize: '10px',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontWeight: '600',
                                    marginTop: '2px'
                                }}>
                                    {percentage}% • {item.value}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AnimatedPieChart;
