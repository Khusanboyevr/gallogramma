import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { HeartAura, LightningAura } from './GenderEffects';

const GESTURE_CONFIG = {
    OPEN: { color: '#00f2ff', intensity: 2, label: 'SPHERE' },
    FIST: { color: '#ff4400', intensity: 8, label: 'CUBE' },
    PEACE: { color: '#00ff44', intensity: 4, label: 'PYRAMID' },
    POINTING: { color: '#ff00ff', intensity: 6, label: 'BEAM' },
    ROCK: { color: '#ff00ff', intensity: 5, label: 'ROCK' },
    HEART: { color: '#ff66aa', intensity: 10, label: 'HEART' },
    NONE: { color: '#00f2ff', intensity: 1, label: '...' }
};

const getPos = (kp) => {
    if (!kp) return null;
    if (Array.isArray(kp)) return { x: kp[0], y: kp[1], z: kp[2] || 0 };
    return { x: kp.x, y: kp.y, z: kp.z || 0 };
};

const PARTICLE_COUNT = 2500;

const HandSkeleton = ({ handsData, gesture, userName, gender }) => {
    const groupRef = useRef();
    const pointsRef = useRef();
    const textRef = useRef();
    const config = GESTURE_CONFIG[gesture] || GESTURE_CONFIG.OPEN;

    const [typedName, setTypedName] = useState("");
    const typingIndex = useRef(0);
    const lastTypeTime = useRef(0);
    const currentScale = useRef(1);

    // Particle data
    const particles = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);
        const targets = new Float32Array(PARTICLE_COUNT * 3);

        // Initial random positions
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }

        return { positions, velocities, targets };
    }, []);

    // Geometry samples
    const sampledGeometries = useMemo(() => {
        const tempBus = {
            OPEN: new THREE.SphereGeometry(1.2, 32, 32),
            FIST: new THREE.BoxGeometry(1.5, 1.5, 1.5),
            PEACE: new THREE.ConeGeometry(1.2, 2, 4),
            POINTING: new THREE.CylinderGeometry(0.2, 0.2, 5, 16),
            ROCK: new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8),
            HEART: new THREE.TorusKnotGeometry(1.2, 0.4, 64, 8, 2, 3)
        };

        const results = {};
        Object.keys(tempBus).forEach(key => {
            const geo = tempBus[key];
            const posAttr = geo.attributes.position;
            const count = posAttr.count;
            const targetArr = new Float32Array(PARTICLE_COUNT * 3);

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const index = Math.floor(Math.random() * count);
                targetArr[i * 3] = posAttr.getX(index);
                targetArr[i * 3 + 1] = posAttr.getY(index);
                targetArr[i * 3 + 2] = posAttr.getZ(index);
            }
            results[key] = targetArr;
        });
        return results;
    }, []);

    useEffect(() => {
        setTypedName("");
        typingIndex.current = 0;
    }, [userName]);

    useFrame((state) => {
        if (!groupRef.current || !pointsRef.current) return;

        // 1. Typing Effect Logic
        if (typingIndex.current < userName.length) {
            if (state.clock.elapsedTime - lastTypeTime.current > 0.15) {
                setTypedName(userName.slice(0, typingIndex.current + 1));
                typingIndex.current += 1;
                lastTypeTime.current = state.clock.elapsedTime;
            }
        }

        // 2. Hand Influence
        const handWorldPos = new THREE.Vector3();
        let isTracking = false;

        if (handsData.length > 0) {
            const landmarks = handsData[0];
            const p9 = getPos(landmarks[9]);
            const p0 = getPos(landmarks[0]);

            if (p9 && p0) {
                isTracking = true;
                const targetX = (p9.x - 320) / 45;
                const targetY = -(p9.y - 240) / 45;
                const targetZ = -p9.z / 25;
                handWorldPos.set(targetX, targetY, targetZ);

                // Instant/Fast following
                groupRef.current.position.lerp(handWorldPos, 0.3);

                // Scale based on hand distance
                const dist = Math.sqrt(Math.pow(p9.x - p0.x, 2) + Math.pow(p9.y - p0.y, 2));
                const targetScale = THREE.MathUtils.clamp(dist / 40, 0.5, 4);
                currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.15);
                groupRef.current.scale.setScalar(currentScale.current);

                // Rotation sekinroq
                const dir = new THREE.Vector3(p9.x - p0.x, -(p9.y - p0.y), -(p9.z - p0.z)).normalize();
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -dir.y, 0.1);
                groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, dir.x, 0.1);
            }
        }

        groupRef.current.rotation.y += 0.005;

        // 3. Particle Animation (Scatter & Gather)
        const posAttr = pointsRef.current.geometry.attributes.position;
        const currentTargets = sampledGeometries[gesture] || sampledGeometries.OPEN;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const z = posAttr.getZ(i);

            const tx = currentTargets[i * 3];
            const ty = currentTargets[i * 3 + 1];
            const tz = currentTargets[i * 3 + 2];

            // Attraction to target (Gather)
            let vx = (tx - x) * 0.05;
            let vy = (ty - y) * 0.05;
            let vz = (tz - z) * 0.05;

            // Repulsion from hand (Scatter)
            if (isTracking) {
                // We need relative position to handWorldPos, but group follows handWorldPos.
                // So hand is at local origin (0,0,0) of groupRef.current mostly, 
                // but actually group position follows hand. 
                // Let's calculate interaction based on hand distance in local space.
                // Since group position = hand world pos, local origin is the hand.
                const dx = x;
                const dy = y;
                const dz = z;
                const dDistSq = dx * dx + dy * dy + dz * dz;

                if (dDistSq < 2.0) { // Higher interaction radius
                    const force = (2.0 - Math.sqrt(dDistSq)) * 0.4; // Stronger repulsion
                    vx -= (dx / Math.sqrt(dDistSq)) * force;
                    vy -= (dy / Math.sqrt(dDistSq)) * force;
                    vz -= (dz / Math.sqrt(dDistSq)) * force;
                }
            }

            // Apply velocity sekinroq
            posAttr.setXYZ(i, x + vx, y + vy, z + vz);
        }
        posAttr.needsUpdate = true;

        if (pointsRef.current.material) {
            pointsRef.current.material.color.set(config.color);
        }

        if (textRef.current) {
            textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            {/* 3D NAME */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text
                    ref={textRef}
                    position={[0, 2.5, 0]}
                    fontSize={0.5}
                    color={gender === 'female' ? '#ff66aa' : '#00f2ff'}
                    anchorX="center"
                    anchorY="middle"
                >
                    {typedName}
                    <meshStandardMaterial emissive={gender === 'female' ? '#ff66aa' : '#00f2ff'} emissiveIntensity={5} />
                </Text>
            </Float>

            {/* GENDER EFFECTS */}
            {gender === 'female' ? (
                <HeartAura count={60} color="#ff66aa" />
            ) : (
                <LightningAura count={100} color="#00f2ff" />
            )}

            {/* PARTICLE HOLOGAM */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={PARTICLE_COUNT}
                        array={particles.positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.06}
                    color={config.color}
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                    sizeAttenuation
                />
            </points>
        </group>
    );
};

export default HandSkeleton;
