import React, { useState, useEffect } from 'react';
import { Target, HelpCircle, X } from 'lucide-react';

const getPos = (kp) => {
    if (!kp) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(kp)) return { x: kp[0], y: kp[1], z: kp[2] || 0 };
    return { x: kp.x, y: kp.y, z: kp.z || 0 };
};

const HUD = ({ landmarks, activeGesture }) => {
    const [stableTracking, setStableTracking] = useState(false);
    const isTracking = !!landmarks;

    useEffect(() => {
        let timeout;
        if (isTracking) setStableTracking(true);
        else timeout = setTimeout(() => setStableTracking(false), 500);
        return () => clearTimeout(timeout);
    }, [isTracking]);

    const stickers = [
        { g: 'NONE', t: 'Kreml (Default)', icon: '🏰', gest: '✋', c: '#ff4444' },
        { g: '0', t: 'Burj Xalifa', icon: '🏙️', gest: '✊ 0', c: '#00f2ff' },
        { g: '2', t: 'Eyfel Minorasi', icon: '🗼', gest: '✌️ 2', c: '#ffea00' },
        { g: '3', t: 'Toj Mahal', icon: '🏛️', gest: '🤟 3', c: '#ffffff' },
        { g: '4', t: 'Kolossey', icon: '🏟️', gest: '🖖 4', c: '#ffa500' },
        { g: '5', t: 'Ozodlik Haykali', icon: '🗽', gest: '🖐️ 5', c: '#40e0d0' }
    ];

    return (
        <div className="hud-overlay" style={{ pointerEvents: 'none' }}>
            <div className="scanline" />

            {/* PERSISTENT SIDE PANEL */}
            <div style={{
                position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                width: '160px', background: 'rgba(0,10,20,0.7)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 242, 255, 0.3)', borderRadius: '15px', padding: '15px',
                display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 10
            }}>
                <div style={{ fontSize: '0.6rem', color: '#00f2ff', textAlign: 'center', opacity: 0.7, marginBottom: '5px' }}>Yo'riqnoma</div>
                {stickers.map(s => {
                    const isActive = activeGesture === s.g || (s.g === 'NONE' && (activeGesture === 'NONE' || activeGesture === '1'));
                    return (
                        <div key={s.g} style={{
                            fontSize: '0.65rem', color: isActive ? s.c : 'white', opacity: isActive ? 1 : 0.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.3s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.9rem' }}>{s.icon}</span>
                                <span>{s.t}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{s.gest}</span>
                        </div>
                    );
                })}
                <div style={{ marginTop: '10px', fontSize: '0.5rem', opacity: 0.5, lineHeight: 1.4 }}>
                    * Chap/o'ng - Rang
                </div>
                <div style={{
                    marginTop: '10px', paddingTop: '8px',
                    borderTop: '1px solid rgba(0, 242, 255, 0.2)',
                    fontSize: '0.6rem', color: '#00f2ff', opacity: 0.8, letterSpacing: '1px'
                }}>
                    STATUS: {isTracking ? 'SYNCED' : 'OFFLINE'}
                    <br />
                    MODE: {activeGesture}
                </div>
            </div>

            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '8px 20px' }}>
                    <div style={{ fontSize: '0.5rem', opacity: 0.6, textAlign: 'center' }}>HOLOGRAPHIC_OS</div>
                    <div className="glow-text" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {activeGesture !== 'NONE' ? activeGesture : 'SEARCHING...'}
                    </div>
                </div>
            </div>

            {/* BOTTOM STATUS */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div className="glass-panel" style={{ minWidth: '150px' }}>
                    <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                        LINK: <span style={{ color: stableTracking ? '#00ff44' : '#ff4444' }}>{stableTracking ? 'STABLE' : 'SEARCHING...'}</span>
                    </div>
                </div>
                <div className="glass-panel" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Target size={14} color="#00f2ff" />
                    <span style={{ fontSize: '0.6rem' }}>NEURAL v4.0</span>
                </div>
            </div>
        </div>
    );
};

export default HUD;
