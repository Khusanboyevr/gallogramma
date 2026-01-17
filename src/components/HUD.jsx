import React, { useState, useEffect } from 'react';
import { Target, HelpCircle, X } from 'lucide-react';

const getPos = (kp) => {
    if (!kp) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(kp)) return { x: kp[0], y: kp[1], z: kp[2] || 0 };
    return { x: kp.x, y: kp.y, z: kp.z || 0 };
};

const HUD = ({ landmarks, activeGesture }) => {
    const [stableTracking, setStableTracking] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const isTracking = !!landmarks;

    useEffect(() => {
        let timeout;
        if (isTracking) setStableTracking(true);
        else timeout = setTimeout(() => setStableTracking(false), 500);
        return () => clearTimeout(timeout);
    }, [isTracking]);

    return (
        <div className="hud-overlay" style={{ pointerEvents: 'none' }}>
            <div className="scanline" />

            {/* YO'RIQNOMA BUTTON */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', pointerEvents: 'auto' }}>
                <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="glass-panel"
                    style={{
                        padding: '10px 15px',
                        fontSize: '0.7rem',
                        color: '#00f2ff',
                        border: '1px solid rgba(0, 242, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(0, 10, 20, 0.6)',
                        boxShadow: '0 0 10px rgba(0, 242, 255, 0.2)'
                    }}
                >
                    <HelpCircle size={14} />
                    Yo'riqnoma
                </button>
            </div>

            {/* INSTRUCTION OVERLAY */}
            {showInstructions && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'auto', padding: '20px'
                }}>
                    <div className="glass-panel" style={{
                        width: '100%', maxWidth: '400px', padding: '30px',
                        position: 'relative', border: '1px solid #00f2ff',
                        textAlign: 'left', lineHeight: 1.6
                    }}>
                        <button
                            onClick={() => setShowInstructions(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#00f2ff', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>

                        <h2 style={{ color: '#00f2ff', marginBottom: '15px', fontSize: '1.2rem', textAlign: 'center' }}>INTERAKTIV BOSHQARUV</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.2rem' }}>↔️</span>
                                <span>Qo'lni chap/o'ngga siljiting — Hologramma aylanadi</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.2rem' }}>✊</span>
                                <span>Qo'lni yuming (fist) — Hologramma yaqinlashadi (Masshtab +)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🖐️</span>
                                <span>Qo'lni oching — Hologramma uzoqlashadi (Masshtab -)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🎯</span>
                                <span>Hologramma qo'lingizga bog'langan holda harakatlanadi</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '25px', fontSize: '0.7rem', textAlign: 'center', color: '#00f2ff', opacity: 0.6, borderTop: '1px solid rgba(0,242,255,0.2)', paddingTop: '15px' }}>
                            GEN V4.0 NEURAL INTERFACE
                        </div>
                    </div>
                </div>
            )}

            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '8px 20px', marginTop: '20px' }}>
                    <div style={{ fontSize: '0.5rem', opacity: 0.6, textAlign: 'center' }}>HOLOGRAPHIC_OS</div>
                    <div className="glow-text" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {isTracking ? 'LINK STABLE' : 'SEARCHING...'}
                    </div>
                </div>
            </div>

            {/* BOTTOM STATUS */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                <div className="glass-panel" style={{ minWidth: '150px' }}>
                    <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                        NEURAL LINK: <span style={{ color: stableTracking ? '#00ff44' : '#ff4444' }}>{stableTracking ? 'ACTIVE' : 'OFFLINE'}</span>
                    </div>
                </div>
                <div className="glass-panel" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Target size={14} color="#00f2ff" />
                    <span style={{ fontSize: '0.6rem' }}>GEN V4.0</span>
                </div>
            </div>
        </div>
    );
};

export default HUD;
