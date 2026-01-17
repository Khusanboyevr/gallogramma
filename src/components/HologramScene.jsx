import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import NameHologram from './NameHologram';

const HologramScene = ({ handsData, gesture, userName }) => {
    return (
        <Canvas shadows dpr={[1, 2]}>
            <color attach="background" args={['#000']} />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <OrbitControls enablePan={false} maxDistance={20} minDistance={5} />

            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2ff" />
            <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ff00ff" />

            <Suspense fallback={null}>
                <NameHologram
                    handsData={handsData}
                    gesture={gesture}
                    userName={userName}
                />
            </Suspense>

            <EffectComposer disableNormalPass>
                <Bloom
                    luminanceThreshold={0.1}
                    mipmapBlur
                    intensity={1.5}
                    radius={0.4}
                />
            </EffectComposer>
        </Canvas>
    );
};

export default HologramScene;
