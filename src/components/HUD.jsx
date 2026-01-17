import React, { useState, useEffect } from 'react';
import { Target, HelpCircle, X } from 'lucide-react';

const getPos = (kp) => {
    if (!kp) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(kp)) return { x: kp[0], y: kp[1], z: kp[2] || 0 };
    return { x: kp.x, y: kp.y, z: kp.z || 0 };
};

const HUD = ({ landmarks, activeGesture }) => {
    const [showGuide, setShowGuide] = useState(false);
    const [stableTracking, setStableTracking] = useState(false);
    const isTracking = !!landmarks;

    // Debounce tracking status to avoid flickering
    useEffect(() => {
        let timeout;
        if (isTracking) {
            setStableTracking(true);
        } else {
            timeout = setTimeout(() => setStableTracking(false), 500);
        }
        return () => clearTimeout(timeout);
    }, [isTracking]);

    const stickers = [
        { g: 'OPEN', t: 'Sphere (Shar)', icon: '✋', c: '#00f2ff' },
        { g: 'FIST', t: 'Cube (Kub)', icon: '✊', c: '#ff4400' },
        { g: 'PEACE', t: 'Pyramid (Piramida)', icon: '✌️', c: '#00ff44' },
        { g: 'POINTING', t: 'Beam (Nur)', icon: '☝️', c: '#ff00ff' },
        { g: 'HEART', t: 'Heart (Yurak)', icon: '❤️', c: '#ff66aa' }
    ];

    const gestureLabels = {
        OPEN: 'SPHERE_STABILIZED',
        FIST: 'CUBE_POWER_CORE',
        PEACE: 'PYRAMID_SCANNER',
        POINTING: 'INDEX_BEAM_LINK',
        ROCK: 'NEURAL_KNOT',
        HEART: 'QUANTUM_HEART',
        NONE: 'SYSTEM_IDLE'
    };

    return (
        <div className="hud-overlay">
            <div className="scanline" />

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', pointerEvents: 'none' }}>
                <div className="glass-panel" style={{ minWidth: '150px' }}>
                    <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>HOLOGRAPHIC_MODE</div>
                    <div className="glow-text" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {gestureLabels[activeGesture] || activeGesture}
                    </div>
                </div>

                <button
                    onClick={() => setShowGuide(!showGuide)}
                    style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid #00f2ff',
                        color: '#00f2ff', padding: '10px', borderRadius: '50%', cursor: 'pointer',
                        pointerEvents: 'auto', display: 'flex', alignItems: 'center',
                        boxShadow: '0 0 15px rgba(0, 242, 255, 0.4)'
                    }}
                >
                    {showGuide ? <X size={24} /> : <HelpCircle size={24} />}
                </button>
            </div>

            {showGuide && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '350px', background: 'rgba(0,10,20,0.95)', backdropFilter: 'blur(20px)',
                    border: '2px solid #00f2ff', borderRadius: '24px', padding: '24px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', zIndex: 2000,
                    pointerEvents: 'auto', boxShadow: '0 0 40px rgba(0,0,0,0.8)'
                }}>
                    <h3 style={{ gridColumn: '1/-1', textAlign: 'center', margin: '0 0 10px 0', color: '#00f2ff', letterSpacing: '2px' }}>NEURAL_COMMANDS</h3>
                    {stickers.map(s => (
                        <div key={s.g} style={{
                            background: activeGesture === s.g ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '16px', padding: '12px',
                            textAlign: 'center', border: `1px solid ${activeGesture === s.g ? s.c : 'rgba(255,255,255,0.1)'}`,
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: s.c }}>{s.g}</div>
                            <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>{s.t}</div>
                        </div>
                    ))}
                    <div style={{ gridColumn: '1/-1', fontSize: '0.6rem', color: '#00f2ff', textAlign: 'center', opacity: 0.6, marginTop: '5px' }}>
                        * MOVE HAND TO ROTATE • SPREAD FINGERS TO SCALE
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', pointerEvents: 'none' }}>
                <div className="glass-panel" style={{ minWidth: '180px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#00f2ff' }}>
                        Z_DEPTH: <span style={{ color: 'white' }}>{landmarks ? landmarks[0].z?.toFixed(1) || 'N/A' : '---'}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                        LINK_STATUS: <span style={{ color: stableTracking ? '#00ff44' : '#ff4444' }}>{stableTracking ? 'STABLE' : 'SEARCHING...'}</span>
                    </div>
                </div>
                <div className="glass-panel" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Target size={18} color="#00f2ff" />
                    <span style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>HOLOGRAPHIC_OS v3.0</span>
                </div>
            </div>
        </div>
    );
};

export default HUD;
