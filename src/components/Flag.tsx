import React from 'react';

// Custom SVG flag rendering with strong vivid colors
// Each flag is a simplified but recognizable representation

const flagDefs: Record<string, { stripes: string[][]; symbol?: string; symbolColor?: string }> = {
    EG: { stripes: [['#CE1126'], ['#FFFFFF'], ['#000000']], symbol: '🦅', symbolColor: '#C09300' },
    SA: { stripes: [['#006C35']], symbol: '☪', symbolColor: '#FFFFFF' },
    AE: { stripes: [['#FF0000', '20%'], ['#00732F'], ['#FFFFFF'], ['#000000']] },
    IQ: { stripes: [['#CE1126'], ['#FFFFFF'], ['#000000']], symbol: '★', symbolColor: '#007A3D' },
    PS: { stripes: [['#000000'], ['#FFFFFF'], ['#007A3D']], symbol: '▲', symbolColor: '#CE1126' },
    JO: { stripes: [['#000000'], ['#FFFFFF'], ['#007A3D']], symbol: '★', symbolColor: '#CE1126' },
    SY: { stripes: [['#CE1126'], ['#FFFFFF'], ['#000000']], symbol: '★★', symbolColor: '#007A3D' },
    LB: { stripes: [['#ED1C24'], ['#FFFFFF'], ['#ED1C24']], symbol: '🌲', symbolColor: '#00A651' },
    YE: { stripes: [['#CE1126'], ['#FFFFFF'], ['#000000']] },
    LY: { stripes: [['#E70013'], ['#000000', '50%'], ['#239E46']], symbol: '☪', symbolColor: '#FFFFFF' },
    TN: { stripes: [['#E70013']], symbol: '☪★', symbolColor: '#FFFFFF' },
    DZ: { stripes: [['#006233', '50%'], ['#FFFFFF', '50%']], symbol: '☪★', symbolColor: '#D21034' },
    MA: { stripes: [['#C1272D']], symbol: '★', symbolColor: '#006233' },
    SD: { stripes: [['#D21034'], ['#FFFFFF'], ['#000000']], symbol: '▲', symbolColor: '#007229' },
    SO: { stripes: [['#4189DD']], symbol: '★', symbolColor: '#FFFFFF' },
    KW: { stripes: [['#007A3D'], ['#FFFFFF'], ['#CE1126']], symbol: '◆', symbolColor: '#000000' },
    BH: { stripes: [['#CE1126']], symbol: '◆', symbolColor: '#FFFFFF' },
    QA: { stripes: [['#8A1538']], symbol: '◆', symbolColor: '#FFFFFF' },
    OM: { stripes: [['#FFFFFF'], ['#DB161B'], ['#008000']], symbol: '⚔', symbolColor: '#DB161B' },
    US: { stripes: [['#B22234'], ['#FFFFFF'], ['#B22234'], ['#FFFFFF'], ['#B22234']], symbol: '★', symbolColor: '#FFFFFF' },
    GB: { stripes: [['#012169']], symbol: '+', symbolColor: '#CF142B' },
    FR: { stripes: [['#002395', '33%'], ['#FFFFFF', '33%'], ['#ED2939', '33%']] },
    DE: { stripes: [['#000000'], ['#DD0000'], ['#FFCC00']] },
    IT: { stripes: [['#009246', '33%'], ['#FFFFFF', '33%'], ['#CE2B37', '33%']] },
    ES: { stripes: [['#AA151B'], ['#F1BF00', '50%'], ['#AA151B']] },
    PT: { stripes: [['#006600', '40%'], ['#FF0000', '60%']], symbol: '⊕', symbolColor: '#FFCC00' },
    NL: { stripes: [['#AE1C28'], ['#FFFFFF'], ['#21468B']] },
    BE: { stripes: [['#000000', '33%'], ['#FDDA24', '33%'], ['#EF3340', '33%']] },
    SE: { stripes: [['#006AA7']], symbol: '+', symbolColor: '#FECC00' },
    NO: { stripes: [['#BA0C2F']], symbol: '+', symbolColor: '#00205B' },
    DK: { stripes: [['#C60C30']], symbol: '+', symbolColor: '#FFFFFF' },
    FI: { stripes: [['#FFFFFF']], symbol: '+', symbolColor: '#002F6C' },
    CH: { stripes: [['#FF0000']], symbol: '+', symbolColor: '#FFFFFF' },
    AT: { stripes: [['#ED2939'], ['#FFFFFF'], ['#ED2939']] },
    PL: { stripes: [['#FFFFFF'], ['#DC143C']] },
    RU: { stripes: [['#FFFFFF'], ['#0039A6'], ['#D52B1E']] },
    UA: { stripes: [['#005BBB'], ['#FFD500']] },
    TR: { stripes: [['#E30A17']], symbol: '☪★', symbolColor: '#FFFFFF' },
    GR: { stripes: [['#0D5EAF'], ['#FFFFFF'], ['#0D5EAF'], ['#FFFFFF'], ['#0D5EAF']], symbol: '+', symbolColor: '#FFFFFF' },
    JP: { stripes: [['#FFFFFF']], symbol: '●', symbolColor: '#BC002D' },
    KR: { stripes: [['#FFFFFF']], symbol: '◉', symbolColor: '#C60C30' },
    CN: { stripes: [['#DE2910']], symbol: '★', symbolColor: '#FFDE00' },
    IN: { stripes: [['#FF9933'], ['#FFFFFF'], ['#138808']], symbol: '◉', symbolColor: '#000080' },
    PK: { stripes: [['#01411C']], symbol: '☪★', symbolColor: '#FFFFFF' },
    BD: { stripes: [['#006A4E']], symbol: '●', symbolColor: '#F42A41' },
    ID: { stripes: [['#FF0000'], ['#FFFFFF']] },
    PH: { stripes: [['#0038A8'], ['#CE1126']], symbol: '★', symbolColor: '#FCD116' },
    TH: { stripes: [['#A51931'], ['#FFFFFF'], ['#2D2A4A'], ['#FFFFFF'], ['#A51931']] },
    VN: { stripes: [['#DA251D']], symbol: '★', symbolColor: '#FFFF00' },
    MY: { stripes: [['#CC0001'], ['#FFFFFF'], ['#CC0001'], ['#FFFFFF']], symbol: '☪', symbolColor: '#FFD700' },
    SG: { stripes: [['#EF3340'], ['#FFFFFF']], symbol: '☪', symbolColor: '#FFFFFF' },
    BR: { stripes: [['#009B3A']], symbol: '◆', symbolColor: '#FFDF00' },
    AR: { stripes: [['#74ACDF'], ['#FFFFFF'], ['#74ACDF']], symbol: '☀', symbolColor: '#F6B40E' },
    MX: { stripes: [['#006341', '33%'], ['#FFFFFF', '33%'], ['#CE1126', '33%']], symbol: '🦅', symbolColor: '#006341' },
    CO: { stripes: [['#FCD116', '50%'], ['#003893'], ['#CE1126']] },
    CL: { stripes: [['#FFFFFF'], ['#D52B1E']], symbol: '★', symbolColor: '#0039A6' },
    PE: { stripes: [['#D91023', '33%'], ['#FFFFFF', '33%'], ['#D91023', '33%']] },
    VE: { stripes: [['#FFCC00'], ['#00247D'], ['#CF142B']], symbol: '★', symbolColor: '#FFFFFF' },
    CA: { stripes: [['#FF0000', '25%'], ['#FFFFFF', '50%'], ['#FF0000', '25%']], symbol: '🍁', symbolColor: '#FF0000' },
    AU: { stripes: [['#002868']], symbol: '★', symbolColor: '#FFFFFF' },
    NZ: { stripes: [['#00247D']], symbol: '★', symbolColor: '#CC142B' },
    ZA: { stripes: [['#007749'], ['#FFFFFF'], ['#DE3831'], ['#002395']], symbol: '▶', symbolColor: '#FFB81C' },
    NG: { stripes: [['#008751', '33%'], ['#FFFFFF', '33%'], ['#008751', '33%']] },
    GH: { stripes: [['#CE1126'], ['#FCD116'], ['#006B3F']], symbol: '★', symbolColor: '#000000' },
    KE: { stripes: [['#000000'], ['#BB0000'], ['#006600']] },
    ET: { stripes: [['#009B48'], ['#FCDD09'], ['#DA121A']], symbol: '★', symbolColor: '#0F47AF' },
    TZ: { stripes: [['#00A550'], ['#FFD700'], ['#000000'], ['#00A3DD']] },
    RW: { stripes: [['#00A1DE'], ['#00A1DE'], ['#FAD201'], ['#20603D']], symbol: '☀', symbolColor: '#FAD201' },
    CM: { stripes: [['#007A5E', '33%'], ['#CE1126', '33%'], ['#FCD116', '33%']], symbol: '★', symbolColor: '#FCD116' },
    Global: { stripes: [['#1a1a2e']], symbol: '🌐', symbolColor: '#a855f7' },
};

interface FlagProps { code: string; size?: number }

export const Flag: React.FC<FlagProps> = ({ code, size = 24 }) => {
    const flagData = flagDefs[code];

    if (!flagData) {
        // Fallback: Generate a colorful flag from the country code
        const hash = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const h1 = (hash * 37) % 360;
        const h2 = (hash * 73) % 360;
        return (
            <svg width={size} height={size * 0.7} viewBox="0 0 40 28" style={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', flexShrink: 0 }}>
                <rect x="0" y="0" width="40" height="14" fill={`hsl(${h1}, 70%, 50%)`} />
                <rect x="0" y="14" width="40" height="14" fill={`hsl(${h2}, 70%, 40%)`} />
                <text x="20" y="18" textAnchor="middle" fontSize="10" fontWeight="900" fill="white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{code.slice(0, 2)}</text>
            </svg>
        );
    }

    const stripeCount = flagData.stripes.length;
    const stripeHeight = 28 / stripeCount;

    return (
        <svg width={size} height={size * 0.7} viewBox="0 0 40 28" style={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
            {/* Flag stripes */}
            {flagData.stripes.map((stripe, i) => (
                <rect key={i} x="0" y={i * stripeHeight} width="40" height={stripeHeight + 0.5} fill={stripe[0]} />
            ))}
            {/* Symbol overlay */}
            {flagData.symbol && (
                <text
                    x="20" y="18"
                    textAnchor="middle"
                    fontSize={(flagData.symbol?.length || 0) > 1 ? '8' : '14'}
                    fontWeight="900"
                    fill={flagData.symbolColor || '#FFF'}
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                >
                    {flagData.symbol}
                </text>
            )}
        </svg>
    );
};

export default Flag;
