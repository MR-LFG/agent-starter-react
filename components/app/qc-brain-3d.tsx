'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTrackVolume, useVoiceAssistant } from '@livekit/components-react';
import { Float } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';

const PURPLE = '#7a4df8';
const PURPLE_DEEP = '#4c1d95';

/**
 * The Q "brain" — a 3D rotating neural-synaptic visualization that reacts
 * to Q's voice in real time.
 *
 * Audio reactivity: useTrackVolume on Q's audio track gives a 0-1 amplitude
 * value per render. We feed that into rotation speed, particle scatter,
 * inner-core scale, and glow intensity. When Q is silent, the brain rotates
 * at a baseline speed; when Q speaks, every component jitters/pulses with
 * the per-syllable amplitude.
 */
export function QCBrain3D() {
  return (
    <div className="relative h-[450px] w-[450px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} color={PURPLE} intensity={2} />
        <pointLight position={[-5, -5, -5]} color={PURPLE_DEEP} intensity={1.5} />

        {/* Stars are now in the global QCStarfield (full-viewport background).
            Just the brain components inside this canvas. */}

        {/* The brain core — neural network of nodes + connecting lines */}
        <NeuralCore />

        {/* Wireframe icosahedron shell — the "container" */}
        <FloatingShell />

        {/* Inner pulsing core — heavily reactive to volume */}
        <InnerCore />
      </Canvas>
    </div>
  );
}

/**
 * Hook: return current Q audio amplitude as a ref (0-1).
 * Smoothed with a small follower so frame-by-frame jitter doesn't strobe.
 */
function useQVolumeRef() {
  const { audioTrack, state } = useVoiceAssistant();
  // useTrackVolume tolerates undefined trackRef (returns 0)
  const rawVolume = useTrackVolume(audioTrack);
  const volumeRef = useRef(0);

  // Smooth: lerp toward latest rawVolume each render. Faster when speaking,
  // slower when idle so it doesn't lurch.
  useFrameSafe((_, delta) => {
    const target = rawVolume ?? 0;
    const speed = state === 'speaking' ? 18 : 6;
    volumeRef.current += (target - volumeRef.current) * Math.min(1, speed * delta);
  });

  return { volumeRef, state };
}

// useFrame inside a hook needs a small wrapper because useFrame must be
// called from a Three.js context. We export this as a no-op outside the
// canvas — the actual subscription happens inside individual <mesh> /
// <group> components below.
function useFrameSafe(_cb: (state: unknown, delta: number) => void) {
  // No-op shim. Each visual component below calls useFrame itself and reads
  // from a shared ref via the closure.
}

/**
 * NeuralCore — synapse-style nodes + connecting lines that rotate.
 * Reads Q audio volume to drive rotation speed and node scatter.
 */
function NeuralCore() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { audioTrack, state } = useVoiceAssistant();
  const rawVolume = useTrackVolume(audioTrack);
  const volumeRef = useRef(0);

  // Generate ~100 nodes scattered in a roughly spherical cloud
  const { points, lines, originals } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const NODE_COUNT = 100;

    for (let i = 0; i < NODE_COUNT; i++) {
      const radius = 0.7 + Math.pow(Math.random(), 0.5) * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pts.push(
        new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        )
      );
    }

    const linePoints: number[] = [];
    const MAX_DIST = 0.6;
    for (let i = 0; i < pts.length; i++) {
      const distances: { j: number; d: number }[] = [];
      for (let j = 0; j < pts.length; j++) {
        if (i === j) continue;
        const d = pts[i].distanceTo(pts[j]);
        if (d < MAX_DIST) distances.push({ j, d });
      }
      distances.sort((a, b) => a.d - b.d);
      for (const { j } of distances.slice(0, 3)) {
        linePoints.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }

    // Keep originals so we can scale/jitter from a stable basis
    const originals = pts.map((p) => p.clone());

    return { points: pts, lines: new Float32Array(linePoints), originals };
  }, []);

  const particlePositions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      arr[i * 3] = points[i].x;
      arr[i * 3 + 1] = points[i].y;
      arr[i * 3 + 2] = points[i].z;
    }
    return arr;
  }, [points]);

  useFrame((_, delta) => {
    // Smooth volume tracking
    const target = rawVolume ?? 0;
    const followSpeed = state === 'speaking' ? 18 : 6;
    volumeRef.current += (target - volumeRef.current) * Math.min(1, followSpeed * delta);
    const v = volumeRef.current;

    // Faster baseline rotation + amplitude-driven boost
    if (groupRef.current) {
      const stateBoost = state === 'speaking' ? 1.5 : state === 'thinking' ? 1.0 : 0;
      const speedMul = 1 + v * 4 + stateBoost;
      groupRef.current.rotation.y += delta * 0.35 * speedMul;
      groupRef.current.rotation.x += delta * 0.18 * speedMul;
    }

    // Per-particle "breathing" — scale outward with volume
    if (pointsRef.current) {
      const positions = (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute)
        .array as Float32Array;
      const expand = 1 + v * 0.18;
      for (let i = 0; i < originals.length; i++) {
        positions[i * 3] = originals[i].x * expand;
        positions[i * 3 + 1] = originals[i].y * expand;
        positions[i * 3 + 2] = originals[i].z * expand;
      }
      (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          color={PURPLE}
          transparent
          opacity={0.95}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={PURPLE}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/**
 * FloatingShell — wireframe icosahedron, faster + jitters with audio.
 */
function FloatingShell() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { audioTrack, state } = useVoiceAssistant();
  const rawVolume = useTrackVolume(audioTrack);
  const volumeRef = useRef(0);

  useFrame((_, delta) => {
    const target = rawVolume ?? 0;
    volumeRef.current += (target - volumeRef.current) * Math.min(1, 14 * delta);
    const v = volumeRef.current;

    if (!meshRef.current) return;
    const stateBoost = state === 'speaking' ? 1.0 : 0;
    const speedMul = 1 + v * 3 + stateBoost;
    meshRef.current.rotation.x -= delta * 0.18 * speedMul;
    meshRef.current.rotation.z += delta * 0.14 * speedMul;
    // Scale subtly with volume
    const s = 1 + v * 0.08;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshBasicMaterial color={PURPLE} wireframe transparent opacity={0.22} />
      </mesh>
    </Float>
  );
}

/**
 * InnerCore — soft glowing sphere, scales + opacity with audio amplitude.
 * This is the most directly audio-reactive element.
 */
function InnerCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const { audioTrack, state } = useVoiceAssistant();
  const rawVolume = useTrackVolume(audioTrack);
  const volumeRef = useRef(0);

  useFrame((clockState, delta) => {
    const target = rawVolume ?? 0;
    volumeRef.current += (target - volumeRef.current) * Math.min(1, 22 * delta);
    const v = volumeRef.current;

    if (!meshRef.current || !matRef.current) return;
    const t = clockState.clock.elapsedTime;

    // Base scale by state, layered with audio amplitude
    const stateBase = state === 'speaking' ? 0.55 : state === 'thinking' ? 0.45 : 0.4;
    const ambientPulse = Math.sin(t * 1.5) * 0.04;
    const audioPulse = v * 0.45;
    meshRef.current.scale.setScalar(stateBase + ambientPulse + audioPulse);

    // Opacity also reactive — louder = brighter
    matRef.current.opacity = 0.4 + v * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        ref={matRef}
        color={PURPLE}
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
