import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 2500;

const InteractiveHologram = ({ handsData, gesture }) => {
    const groupRef = useRef();
    const pointsRef = useRef();
    const ringsRef = useRef([]);
    const [currentColor, setCurrentColor] = useState('#00f2ff');

    const rotationX = useRef(0);
    const rotationY = useRef(0);
    const scaleFactor = useRef(2.5);

    // Particle data
    const particles = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const randomScale = 5;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * randomScale;
            positions[i * 3 + 1] = (Math.random() - 0.5) * randomScale;
            positions[i * 3 + 2] = (Math.random() - 0.5) * randomScale;
        }
        return { positions };
    }, []);

    // Geometry samples
    const sampledGeometries = useMemo(() => {
        const tempBus = {
            '0': new THREE.SphereGeometry(1.2, 32, 32),
            '1': new THREE.BoxGeometry(1.5, 1.5, 1.5),
            '2': new THREE.TorusGeometry(1, 0.4, 16, 100),
            '3': new THREE.OctahedronGeometry(1.5),
            '4': new THREE.IcosahedronGeometry(1.5),
            '5': new THREE.DodecahedronGeometry(1.5),
            'PINCH': new THREE.SphereGeometry(1.2, 32, 32),
            'NONE': new THREE.SphereGeometry(1.2, 32, 32)
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
            geo.dispose();
        });
        return results;
    }, []);

    // Helper for safe color parsing
    const getHue = (colorStr) => {
        const match = colorStr.match(/\d+/);
        return match ? parseInt(match[0]) : 180;
    };

    useFrame((state) => {
        if (!groupRef.current || !pointsRef.current) return;

        try {
            // 1. Gesture Fallback
            let targetGesture = gesture || '0';
            if (!sampledGeometries[targetGesture]) targetGesture = '0';

            if (handsData && handsData.length > 0) {
                const landmarks = handsData[0];
                const p9 = landmarks[9];

                if (p9) {
                    const kp = Array.isArray(p9) ? { x: p9[0], y: p9[1] } : p9;

                    // 2. Safe Color Update
                    if (!isNaN(kp.x)) {
                        const hue = THREE.MathUtils.clamp((kp.x / 640) * 360, 0, 360);
                        setCurrentColor(`hsl(${hue}, 100%, 50%)`);
                    }

                    // 3. Safe Rotation
                    if (!isNaN(kp.y) && !isNaN(kp.x)) {
                        const targetRotX = ((kp.y - 240) / 240) * Math.PI;
                        const targetRotY = ((kp.x - 320) / 320) * Math.PI;
                        rotationX.current = THREE.MathUtils.lerp(rotationX.current, targetRotX, 0.05);
                        rotationY.current = THREE.MathUtils.lerp(rotationY.current, targetRotY, 0.05);
                    }

                    // 4. Safe Scale
                    if (gesture === 'PINCH') {
                        scaleFactor.current = THREE.MathUtils.lerp(scaleFactor.current, 4.0, 0.1);
                    } else {
                        scaleFactor.current = THREE.MathUtils.lerp(scaleFactor.current, 2.5, 0.05);
                    }
                }
            }

            // Final check to prevent any NaN propagating to Three.js
            if (isNaN(rotationX.current)) rotationX.current = 0;
            if (isNaN(rotationY.current)) rotationY.current = 0;
            if (isNaN(scaleFactor.current)) scaleFactor.current = 2.5;

            groupRef.current.rotation.x = rotationX.current;
            groupRef.current.rotation.y += 0.01 + (rotationY.current * 0.005);
            groupRef.current.scale.setScalar(scaleFactor.current + Math.sin(state.clock.elapsedTime * 2) * 0.05);

            // 5. Safe Particle Morphing
            const posAttr = pointsRef.current.geometry.attributes.position;
            const currentTargets = sampledGeometries[targetGesture];

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const x = posAttr.getX(i);
                const y = posAttr.getY(i);
                const z = posAttr.getZ(i);

                const tx = currentTargets[i * 3];
                const ty = currentTargets[i * 3 + 1];
                const tz = currentTargets[i * 3 + 2];

                // Extra safety: only lerp if targets are numbers
                if (!isNaN(tx) && !isNaN(ty) && !isNaN(tz)) {
                    posAttr.setXYZ(
                        i,
                        THREE.MathUtils.lerp(x, tx, 0.08),
                        THREE.MathUtils.lerp(y, ty, 0.08),
                        THREE.MathUtils.lerp(z, tz, 0.08)
                    );
                }
            }
            posAttr.needsUpdate = true;
            pointsRef.current.material.color.set(currentColor);

            // 6. Safe Ring Animation
            const baseHue = getHue(currentColor);
            ringsRef.current.forEach((ring, idx) => {
                if (ring) {
                    ring.rotation.z += 0.005 * (idx + 1);
                    ring.rotation.x += 0.002 * (idx + 1);
                    const ringHue = (baseHue + idx * 25) % 360;
                    ring.material.color.set(`hsl(${ringHue}, 80%, 50%)`);
                }
            });

        } catch (err) {
            console.warn("Hologram Update Frame Error:", err);
            // Non-destructive fallback
        }
    });

    return (
        <group ref={groupRef}>
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
                    size={0.07}
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>

            <mesh>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial
                    color={currentColor}
                    transparent
                    opacity={0.2}
                    emissive={currentColor}
                    emissiveIntensity={10}
                />
            </mesh>

            {[1.8, 2.3, 2.8, 3.3].map((radius, i) => (
                <mesh key={i} ref={el => ringsRef.current[i] = el} rotation={[Math.PI / 2.5, 0, 0]}>
                    <torusGeometry args={[radius, 0.015, 8, 100]} />
                    <meshStandardMaterial
                        color={currentColor}
                        transparent
                        opacity={0.4}
                        emissive={currentColor}
                        emissiveIntensity={3}
                    />
                </mesh>
            ))}
        </group>
    );
};

export default InteractiveHologram;
