'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTrackVolume, useVoiceAssistant } from '@livekit/components-react';
import { useFrame } from '@react-three/fiber';
import { CLIENT_LOCATIONS, latLongToVec3 } from './lib/client-locations';
import { useTabVisible } from './lib/use-visibility';

const PURPLE = '#7a4df8';
const PURPLE_BRIGHT = '#b89dff';
const GLOBE_RADIUS = 1.8;

/**
 * Globe scene component — rendered inside the centerpiece's Canvas.
 * Wireframe Earth with pulsing client pins.
 *
 * State responses per plans/q-dashboard-jarvis-visual-language.md:
 *   idle      → slow rotation (60s/turn), random pin pings every 20-40s
 *   listening → rotation pauses (Q paying attention), pin pings paused
 *   thinking  → 2x rotation, all pins glow dimly
 *   speaking  → audio-amplitude wobble + brighter overall
 */
export function Globe() {
  const groupRef = useRef<THREE.Group>(null);
  const { audioTrack, state } = useVoiceAssistant();
  const rawVolume = useTrackVolume(audioTrack);
  const volumeRef = useRef(0);

  useFrame((s, delta) => {
    const target = rawVolume ?? 0;
    const followSpeed = state === 'speaking' ? 16 : 6;
    volumeRef.current += (target - volumeRef.current) * Math.min(1, followSpeed * delta);
    const v = volumeRef.current;

    if (!groupRef.current) return;

    let rotSpeed = 0.105; // idle baseline: 60s per full rotation
    if (state === 'listening') rotSpeed = 0;
    else if (state === 'thinking') rotSpeed = 0.21;
    else if (state === 'speaking') rotSpeed = 0.105 + v * 0.4;

    groupRef.current.rotation.y += delta * rotSpeed;

    if (state === 'speaking') {
      groupRef.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.8) * 0.04 + v * 0.05;
    } else {
      groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * Math.min(1, 4 * delta);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 24]} />
        <meshBasicMaterial color={PURPLE} wireframe transparent opacity={0.18} />
      </mesh>

      {/* Inner solid sphere — sits behind wireframe so back-hemisphere lines stay visible */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.985, 32, 24]} />
        <meshBasicMaterial color="#0a0512" transparent opacity={0.92} />
      </mesh>

      <LatitudeRings />
      <ClientPins />
    </group>
  );
}

function ClientPins() {
  const [pingingPin, setPingingPin] = useState<string | null>(null);
  const { state } = useVoiceAssistant();
  const visible = useTabVisible();

  // Ambient pings — fire during any state except listening + thinking
  // (those are the "Q is engaged" states where ambient should pause)
  useEffect(() => {
    if (state === 'listening' || state === 'thinking') return;
    if (!visible) return; // pause when tab is hidden

    let cancelled = false;
    let nextTimer: ReturnType<typeof setTimeout> | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;

    const cycle = () => {
      if (cancelled) return;
      const random = CLIENT_LOCATIONS[Math.floor(Math.random() * CLIENT_LOCATIONS.length)];
      setPingingPin(random.id);
      clearTimer = setTimeout(() => {
        if (!cancelled) setPingingPin(null);
      }, 1500);
      const next = 20_000 + Math.random() * 20_000;
      nextTimer = setTimeout(cycle, next);
    };

    const initial = setTimeout(cycle, 4_000);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      if (nextTimer) clearTimeout(nextTimer);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [state, visible]);

  return (
    <>
      {CLIENT_LOCATIONS.map((loc) => {
        const pos = latLongToVec3(loc.lat, loc.long, GLOBE_RADIUS * 1.005);
        const isPinging = pingingPin === loc.id;
        const isHighlighted = state === 'thinking' || isPinging;
        return (
          <ClientPin key={loc.id} position={pos} highlighted={isHighlighted} pinging={isPinging} />
        );
      })}
    </>
  );
}

interface ClientPinProps {
  position: [number, number, number];
  highlighted: boolean;
  pinging: boolean;
}

function ClientPin({ position, highlighted, pinging }: ClientPinProps) {
  const dotRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const pingStartRef = useRef<number | null>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;

    if (dotRef.current) {
      const pulse = highlighted ? 1 + Math.sin(t * 4) * 0.25 : 1;
      dotRef.current.scale.setScalar(pulse);
    }

    if (ringRef.current && ringMatRef.current) {
      if (pinging) {
        if (pingStartRef.current === null) pingStartRef.current = t;
        const elapsed = t - pingStartRef.current;
        const cycleT = Math.min(elapsed / 1.5, 1);
        ringRef.current.scale.setScalar(0.5 + cycleT * 2.5);
        ringMatRef.current.opacity = 1 - cycleT;
      } else {
        pingStartRef.current = null;
        ringMatRef.current.opacity = 0;
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={PURPLE_BRIGHT} transparent opacity={0.95} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.085, 12, 12]} />
        <meshBasicMaterial color={PURPLE} transparent opacity={0.35} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.07, 0.085, 24]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={PURPLE_BRIGHT}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function LatitudeRings() {
  const lats = [-60, -30, 0, 30, 60];
  return (
    <group>
      {lats.map((lat) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const ringRadius = GLOBE_RADIUS * Math.sin(phi);
        const y = GLOBE_RADIUS * Math.cos(phi);
        return (
          <mesh key={lat} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ringRadius, 0.003, 6, 48]} />
            <meshBasicMaterial color={PURPLE} transparent opacity={lat === 0 ? 0.3 : 0.12} />
          </mesh>
        );
      })}
    </group>
  );
}
