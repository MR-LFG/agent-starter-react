'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTrackVolume, useVoiceAssistant } from '@livekit/components-react';
import { Stars } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

const PURPLE = '#7a4df8';

/**
 * Full-viewport interactive star field that lives behind every other UI element.
 *
 * Two parallax layers of drei <Stars> + a custom drifting nebula glow.
 * Mouse parallax: starfield rotates subtly with cursor position.
 * Audio reactivity: drift speeds up + central glow brightens when Q speaks.
 *
 * Sits at z-0 (above raw bg, below all content). pointer-events: none so the
 * dashboard remains clickable.
 */
export function QCStarfield() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <StarfieldScene />
      </Canvas>
    </div>
  );
}

function StarfieldScene() {
  const farRef = useRef<THREE.Group>(null);
  const nearRef = useRef<THREE.Group>(null);
  const nebulaRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const { audioTrack, state } = useVoiceAssistant();
  const rawVolume = useTrackVolume(audioTrack);
  const volumeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Global mouse tracking (window-level, since pointer-events: none on canvas)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame((_, delta) => {
    // Volume smoothing
    const target = rawVolume ?? 0;
    const followSpeed = state === 'speaking' ? 12 : 5;
    volumeRef.current += (target - volumeRef.current) * Math.min(1, followSpeed * delta);
    const v = volumeRef.current;

    const stateBoost = state === 'speaking' ? 0.6 : state === 'thinking' ? 0.3 : 0;

    // Far layer — slow ambient drift, light parallax
    if (farRef.current) {
      farRef.current.rotation.y += delta * (0.02 + v * 0.06 + stateBoost * 0.04);
      farRef.current.rotation.x = mouseRef.current.y * 0.04;
      farRef.current.position.x = mouseRef.current.x * 0.15;
    }

    // Near layer — faster drift, stronger parallax
    if (nearRef.current) {
      nearRef.current.rotation.y -= delta * (0.05 + v * 0.15 + stateBoost * 0.08);
      nearRef.current.rotation.x = mouseRef.current.y * 0.1;
      nearRef.current.position.x = mouseRef.current.x * 0.4;
      nearRef.current.position.y = mouseRef.current.y * 0.25;
    }

    // Central nebula glow — pulses with audio
    if (nebulaRef.current) {
      const baseOpacity = 0.06;
      const audioOpacity = v * 0.15;
      const stateOpacity = state === 'speaking' ? 0.08 : 0;
      const mat = nebulaRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = baseOpacity + audioOpacity + stateOpacity;
      const scale = 1 + Math.sin(_.clock.elapsedTime * 0.8) * 0.05 + v * 0.15;
      nebulaRef.current.scale.setScalar(scale);
    }
  });

  // Aspect handling — make sure stars fill non-square viewports gracefully
  const aspect = size.width / size.height;

  return (
    <>
      {/* Subtle ambient lighting on the nebula */}
      <ambientLight intensity={0.5} />

      {/* Far star layer — many, slow */}
      <group ref={farRef}>
        <Stars
          radius={Math.max(8, aspect * 6)}
          depth={60}
          count={3500}
          factor={3}
          saturation={1}
          fade
          speed={0.8}
        />
      </group>

      {/* Near star layer — fewer, brighter, mouse-reactive */}
      <group ref={nearRef}>
        <Stars
          radius={Math.max(5, aspect * 3.5)}
          depth={30}
          count={1500}
          factor={5}
          saturation={1}
          fade
          speed={2.2}
        />
      </group>

      {/* Central nebula glow — additive blended sphere that pulses */}
      <mesh ref={nebulaRef} position={[0, 0, -2]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color={PURPLE}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
