import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

const PARTICLE_COUNT = 3000;

const InteractiveHologram = ({ handsData, gesture }) => {
    const groupRef = useRef();
    const pointsRef = useRef();
    const [currentColor, setCurrentColor] = useState('#00f2ff');

    const rotationX = useRef(0);
    const rotationY = useRef(0);
    const scaleFactor = useRef(2.8);

    const particles = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const rand = () => (Math.random() - 0.5) * 5;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = rand();
            positions[i * 3 + 1] = rand();
            positions[i * 3 + 2] = rand();
        }
        return { positions };
    }, []);

    const sampledGeometries = useMemo(() => {
        const sampleFromGeo = (geo) => {
            if (!geo) return new Float32Array(PARTICLE_COUNT * 3);
            const posAttr = geo.attributes.position;
            const count = posAttr.count;
            const targetArr = new Float32Array(PARTICLE_COUNT * 3);
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const index = Math.floor(Math.random() * count);
                targetArr[i * 3] = posAttr.getX(index);
                targetArr[i * 3 + 1] = posAttr.getY(index);
                targetArr[i * 3 + 2] = posAttr.getZ(index);
            }
            geo.dispose();
            return targetArr;
        };

        const tryMerge = (geos) => {
            try { return BufferGeometryUtils.mergeGeometries(geos); }
            catch (e) { return new THREE.SphereGeometry(1.5); }
        };

        const createKremlin = () => {
            const base = new THREE.BoxGeometry(2, 1, 2);
            const mainTower = new THREE.CylinderGeometry(0.3, 0.3, 1.5).translate(0, 1.25, 0);
            const centralDome = new THREE.SphereGeometry(0.5, 12, 12).scale(1, 1.4, 1).translate(0, 2.2, 0);
            const side1 = new THREE.SphereGeometry(0.3, 8, 8).scale(1, 1.3, 1).translate(0.8, 1, 0.8);
            const side2 = side1.clone().translate(-1.6, 0, 0);
            const side3 = side1.clone().translate(0, 0, -1.6);
            const side4 = side2.clone().translate(0, 0, -1.6);
            return tryMerge([base, mainTower, centralDome, side1, side2, side3, side4]);
        };

        const createBurj = () => {
            const t1 = new THREE.CylinderGeometry(0.8, 0.8, 1);
            const t2 = new THREE.CylinderGeometry(0.6, 0.6, 1).translate(0, 1, 0);
            const t3 = new THREE.CylinderGeometry(0.4, 0.4, 1).translate(0, 2, 0);
            const t4 = new THREE.CylinderGeometry(0.2, 0.2, 1).translate(0, 3, 0);
            const needle = new THREE.CylinderGeometry(0.02, 0.05, 1.5).translate(0, 4.25, 0);
            return tryMerge([t1, t2, t3, t4, needle]);
        };

        const createEiffel = () => {
            const base = new THREE.CylinderGeometry(0.1, 1.2, 1.5, 4);
            const mid = new THREE.CylinderGeometry(0.1, 0.4, 1.5, 4).translate(0, 1.5, 0);
            const top = new THREE.CylinderGeometry(0.01, 0.1, 1.5, 4).translate(0, 3, 0);
            return tryMerge([base, mid, top]);
        };

        const createTaj = () => {
            const platform = new THREE.BoxGeometry(2.5, 0.2, 2.5);
            const dome = new THREE.SphereGeometry(0.8, 16, 16).scale(1, 1.2, 1).translate(0, 0.8, 0);
            const m1 = new THREE.CylinderGeometry(0.05, 0.05, 1.2).translate(1, 0.6, 1);
            const m2 = m1.clone().translate(-2, 0, 0);
            const m3 = m1.clone().translate(0, 0, -2);
            const m4 = m2.clone().translate(0, 0, -2);
            return tryMerge([platform, dome, m1, m2, m3, m4]);
        };

        const createColosseum = () => {
            const outer = new THREE.CylinderGeometry(1.5, 1.5, 1.2, 32, 1, true);
            const inner = new THREE.CylinderGeometry(1.2, 1.2, 1.2, 32, 1, true);
            const base = new THREE.TorusGeometry(1.35, 0.15, 16, 32).rotateX(Math.PI / 2).translate(0, -0.6, 0);
            return tryMerge([outer, inner, base]);
        };

        const createLiberty = () => {
            const base = new THREE.BoxGeometry(1, 1, 1);
            const body = new THREE.CylinderGeometry(0.4, 0.5, 2).translate(0, 1.5, 0);
            const arm = new THREE.CylinderGeometry(0.05, 0.05, 1).translate(0.6, 2.5, 0).rotateZ(-Math.PI / 4);
            const torch = new THREE.SphereGeometry(0.15).translate(1, 3.2, 0);
            return tryMerge([base, body, arm, torch]);
        };

        return {
            'NONE': sampleFromGeo(createKremlin()),
            '0': sampleFromGeo(createBurj()),
            '1': sampleFromGeo(createKremlin()),
            '2': sampleFromGeo(createEiffel()),
            '3': sampleFromGeo(createTaj()),
            '4': sampleFromGeo(createColosseum()),
            '5': sampleFromGeo(createLiberty()),
            '6': sampleFromGeo(createKremlin()), // Safety
            'PINCH': sampleFromGeo(new THREE.SphereGeometry(1.2))
        };
    }, []);

    useFrame((state) => {
        if (!groupRef.current || !pointsRef.current) return;

        try {
            const targetGesture = sampledGeometries[gesture] ? gesture : 'NONE';

            if (handsData && handsData.length > 0) {
                const kp = Array.isArray(handsData[0][9])
                    ? { x: handsData[0][9][0], y: handsData[0][9][1] }
                    : handsData[0][9];

                if (kp && !isNaN(kp.x)) {
                    // POSITION
                    const tx = ((kp.x - 320) / 320) * 5;
                    const ty = -((kp.y - 240) / 240) * 4;
                    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, tx, 0.2);
                    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, ty, 0.2);

                    // COLOR
                    if (targetGesture === 'NONE' || targetGesture === '1') {
                        const hue = (state.clock.elapsedTime * 50 + kp.x) % 360;
                        setCurrentColor(`hsl(${hue}, 100%, 60%)`);
                    } else {
                        const hue = (kp.x / 640) * 360;
                        setCurrentColor(`hsl(${hue}, 100%, 55%)`);
                    }

                    // TILT & ROTATION
                    const rotX = ((kp.y - 240) / 240) * 0.5;
                    const rotY = ((kp.x - 320) / 320) * 0.8;
                    rotationX.current = THREE.MathUtils.lerp(rotationX.current, rotX, 0.1);
                    rotationY.current = THREE.MathUtils.lerp(rotationY.current, rotY, 0.1);
                }
            }

            groupRef.current.rotation.x = rotationX.current;
            groupRef.current.rotation.y += 0.015 + (rotationY.current * 0.01);
            groupRef.current.scale.setScalar(scaleFactor.current);

            const posAttr = pointsRef.current.geometry.attributes.position;
            const targets = sampledGeometries[targetGesture];

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const idx = i * 3;
                posAttr.setXYZ(i,
                    THREE.MathUtils.lerp(posAttr.getX(i), targets[idx], 0.25),
                    THREE.MathUtils.lerp(posAttr.getY(i), targets[idx + 1], 0.25),
                    THREE.MathUtils.lerp(posAttr.getZ(i), targets[idx + 2], 0.25)
                );
            }
            posAttr.needsUpdate = true;
            pointsRef.current.material.color.set(currentColor);

        } catch (e) { /* Safe catch */ }
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
                    size={0.06}
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
                <torusGeometry args={[2.5, 0.01, 16, 100]} />
                <meshStandardMaterial color={currentColor} transparent opacity={0.2} emissive={currentColor} emissiveIntensity={2} />
            </mesh>
        </group>
    );
};

export default InteractiveHologram;
