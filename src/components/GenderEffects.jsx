import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

/**
 * GIRL EFFECT: Floating neon hearts (Enhanced Density)
 */
export const HeartAura = ({ count = 60, color = "#ff66aa" }) => {
    const hearts = useMemo(() => {
        const h = [];
        for (let i = 0; i < count; i++) {
            h.push({
                pos: [(Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7],
                speed: 0.015 + Math.random() * 0.025,
                scale: 0.08 + Math.random() * 0.2
            });
        }
        return h;
    }, [count]);

    return (
        <group>
            {hearts.map((h, i) => <Heart key={i} {...h} color={color} />)}
        </group>
    );
};

const Heart = ({ pos, speed, scale, color }) => {
    const ref = useRef();
    useFrame(() => {
        if (ref.current) {
            ref.current.position.y += speed;
            if (ref.current.position.y > 4) ref.current.position.y = -4;
            ref.current.rotation.y += 0.03;
            ref.current.rotation.x += 0.01;
        }
    });
    return (
        <mesh ref={ref} position={pos} scale={scale}>
            <torusKnotGeometry args={[0.5, 0.2, 64, 8, 2, 3]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={12} transparent opacity={0.7} />
        </mesh>
    );
};

/**
 * BOY EFFECT: Energy sparkles / Lightning (Enhanced Density)
 */
export const LightningAura = ({ count = 100, color = "#00f2ff" }) => {
    return (
        <Sparkles
            count={count}
            scale={6}
            size={5}
            speed={2.5}
            opacity={1}
            color={color}
        />
    );
};
