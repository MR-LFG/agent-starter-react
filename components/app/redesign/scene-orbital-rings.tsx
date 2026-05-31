'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useVoiceAssistant } from '@livekit/components-react';
import { useFrame } from '@react-three/fiber';

const PURPLE = '#7a4df8';
const PURPLE_BRIGHT = '#b89dff';
const PURPLE_DEEP = '#4c2dac';

/**
 * Five concentric orbital rings — different radii, inclinations, speeds.
 * Plus orbital satellites traveling along each ring.
 * Rendered inside the centerpiece's Canvas alongside the globe.
 *
 * State responses per plans/q-dashboard-jarvis-visual-language.md:
 *   idle      → baseline rotation
 *   listening → 0.5x (Q paying attention, not processing)
 *   thinking  → 1.5x (Q processing)
 *   speaking  → baseline (audio reactivity lives on the globe)
 */
export function OrbitalRings() {
  return (
    <>
      {/* Inner equatorial ring — bright + tick-marked (the primary one) */}
      <Ring
        radius={2.5}
        thickness={0.008}
        inclinationX={0}
        inclinationZ={0}
        secondsPerTurn={100}
        ticks={36}
        bright
        satellites={2}
      />

      {/* Mid rings — varying inclinations */}
      <Ring
        radius={2.85}
        thickness={0.005}
        inclinationX={Math.PI / 6}
        inclinationZ={0}
        secondsPerTurn={60}
        satellites={3}
      />
      <Ring
        radius={3.15}
        thickness={0.005}
        inclinationX={Math.PI / 8}
        inclinationZ={Math.PI / 4}
        secondsPerTurn={30}
        reverse
        satellites={2}
      />

      {/* Outer rings — broader, faster, more inclined */}
      <Ring
        radius={3.55}
        thickness={0.004}
        inclinationX={Math.PI / 3}
        inclinationZ={-Math.PI / 5}
        secondsPerTurn={45}
        satellites={2}
      />
      <Ring
        radius={3.95}
        thickness={0.003}
        inclinationX={-Math.PI / 4}
        inclinationZ={Math.PI / 7}
        secondsPerTurn={75}
        reverse
        ticks={24}
      />

      {/* Horizon ring — large, faint, framing the system at the edge */}
      <Ring
        radius={4.4}
        thickness={0.002}
        inclinationX={0}
        inclinationZ={0}
        secondsPerTurn={200}
        faint
      />
    </>
  );
}

interface RingProps {
  radius: number;
  thickness: number;
  inclinationX: number;
  inclinationZ: number;
  secondsPerTurn: number;
  ticks?: number;
  reverse?: boolean;
  bright?: boolean;
  faint?: boolean;
  satellites?: number;
}

function Ring({
  radius,
  thickness,
  inclinationX,
  inclinationZ,
  secondsPerTurn,
  ticks,
  reverse,
  bright,
  faint,
  satellites = 0,
}: RingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { state } = useVoiceAssistant();

  const speedMul = useMemo(() => {
    switch (state) {
      case 'listening':
        return 0.5;
      case 'thinking':
        return 1.5;
      default:
        return 1;
    }
  }, [state]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const rad = ((Math.PI * 2) / secondsPerTurn) * speedMul;
    groupRef.current.rotation.z += (reverse ? -1 : 1) * delta * rad;
  });

  const tickPositions = useMemo(() => {
    if (!ticks) return [];
    return Array.from({ length: ticks }, (_, i) => {
      const angle = (i / ticks) * Math.PI * 2;
      const isMajor = i % (ticks / 4) === 0;
      return { angle, isMajor };
    });
  }, [ticks]);

  // Satellites — small dots evenly spaced around the ring
  const satellitePositions = useMemo(() => {
    return Array.from({ length: satellites }, (_, i) => {
      const angle = (i / satellites) * Math.PI * 2;
      return { angle, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    });
  }, [satellites, radius]);

  const ringColor = bright ? PURPLE_BRIGHT : faint ? PURPLE_DEEP : PURPLE;
  const ringOpacity = bright ? 0.55 : faint ? 0.18 : 0.32;

  return (
    <group rotation={[inclinationX, 0, inclinationZ]}>
      <group ref={groupRef}>
        {/* The ring itself — flat torus, rotated to lie in XY plane */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, thickness, 8, 96]} />
          <meshBasicMaterial color={ringColor} transparent opacity={ringOpacity} />
        </mesh>

        {/* Tick marks — small radial lines extending inward */}
        {tickPositions.map(({ angle, isMajor }, i) => {
          const len = isMajor ? 0.12 : 0.05;
          const tickRadius = radius - len / 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * tickRadius, Math.sin(angle) * tickRadius, 0]}
              rotation={[0, 0, angle + Math.PI / 2]}
            >
              <boxGeometry args={[0.008, len, 0.008]} />
              <meshBasicMaterial
                color={isMajor ? PURPLE_BRIGHT : PURPLE}
                transparent
                opacity={isMajor ? 0.8 : 0.4}
              />
            </mesh>
          );
        })}

        {/* Satellites — small bright dots traveling along the ring */}
        {satellitePositions.map(({ x, y }, i) => (
          <group key={i} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color={PURPLE_BRIGHT} transparent opacity={0.95} />
            </mesh>
            {/* Soft halo */}
            <mesh>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color={PURPLE} transparent opacity={0.35} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
