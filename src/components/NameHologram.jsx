import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const NameHologram = ({ handsData, gesture, userName }) => {
    const groupRef = useRef();
    const nameRef = useRef();
    const [scaleMultiplier, setScaleMultiplier] = useState(1);

    // Heart particle count
    const PARTICLE_COUNT = 2000;
    const particles = useMemo(() => {
        const pos = new Float32Array(PARTICLE_COUNT * 3);
        const scale = 0.2;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Parametric heart formula
            const t = Math.random() * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

            pos[i * 3] = x * scale;
            pos[i * 3 + 1] = y * scale;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // Slight depth
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;

        // Ultra-smooth hand tracking (stable movement)
        if (handsData && handsData.length > 0) {
            const kp = Array.isArray(handsData[0][9])
                ? { x: handsData[0][9][0], y: handsData[0][9][1] }
                : handsData[0][9];

            if (kp && !isNaN(kp.x)) {
                // Stabilized coordinates for smooth movement
                const tx = ((kp.x - 320) / 320) * 6;
                const ty = -((kp.y - 240) / 240) * 4.5;

                // Stability focus: lower lerp value (0.07)
                groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, tx, 0.07);
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, ty, 0.07);

                // CONTROLLED ROTATION (O'ngga/Chapga burilish)
                // Normalize kp.x (-1 to 1) and map to rotation range
                const targetRotY = (kp.x - 320) / 320 * Math.PI * 0.8;
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);

                // Subtle X tilt
                const targetRotX = (kp.y - 240) / 240 * 0.2;
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1);
            }
        }

        // ZOOM / SCALE CONTROL
        // 0: Fist (Yaqinlashish), 5: Open Hand (Uzoqlashish), others: Default
        let targetScale = 1.0;
        if (gesture === '0') targetScale = 2.0;    // Closer/Bigger
        else if (gesture === '5') targetScale = 0.5; // Further/Smaller

        const currentScale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08);
        groupRef.current.scale.set(currentScale, currentScale, currentScale);

        // Gentle overall pulsing (Z rotation)
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    });

    return (
        <group ref={groupRef}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <Text
                    ref={nameRef}
                    font="https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/pressstart2p/PressStart2P-Regular.ttf"
                    fontSize={0.6}
                    color="#00f2ff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.03}
                    outlineColor="#0066ff"
                >
                    {userName || "USER"}
                </Text>
            </Float>

            <PointHeart positions={particles} />
        </group>
    );
};

const PointHeart = ({ positions }) => {
    const pointsRef = useRef();

    useFrame((state) => {
        if (pointsRef.current) {
            // Slight breathing effect
            const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
            pointsRef.current.scale.set(s, s, s);
            pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#ff2d75"
                transparent
                opacity={0.9}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export default NameHologram;
