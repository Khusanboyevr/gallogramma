import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField() {
    const ref = useRef();

    // Create random positions for particles
    const positions = useMemo(() => {
        const pos = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        ref.current.rotation.y += 0.001;
        ref.current.rotation.x += 0.0005;
        // Subtle drift
        ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#00f2ff"
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

function NeuralGrid() {
    const gridRef = useRef();

    useFrame((state) => {
        if (!gridRef.current) return;
        gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 1;
    });

    return (
        <group rotation={[Math.PI / 2.5, 0, 0]} position={[0, -2, 0]} ref={gridRef}>
            <gridHelper args={[40, 40, '#00f2ff', '#001a1a']} />
        </group>
    );
}

const NeuralBackground = () => {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: 'radial-gradient(circle at center, #001214 0%, #000 100%)',
            pointerEvents: 'none'
        }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <StarField />
                <NeuralGrid />
                <fog attach="fog" args={['#000', 5, 20]} />
            </Canvas>
        </div>
    );
};

export default NeuralBackground;
