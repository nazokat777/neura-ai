'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// 3D cinematic miya: neyron point-cloud + yonadigan mintaqalar.
// Har mintaqa real o'lchangan natijaga qarab yonadi (asset kerak emas).

export interface BrainRegion {
  domain: string;
  label: string;
  value: number | null; // 0..1 yoki null (o'lchanmagan)
  dir: [number, number, number];
}

const TEAL = new THREE.Color('#4D8DFF');

// Organik (miya-simon) deformatsiya — qatlamli trig "shovqin".
function lump(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 1.7 + y * 0.4) * 0.5 +
    Math.sin(y * 2.2 + z * 0.8) * 0.3 +
    Math.sin(z * 1.4 + x * 1.1) * 0.2
  );
}

function brainPosition(v: THREE.Vector3): THREE.Vector3 {
  const n = v.clone().normalize();
  const d = 1 + 0.16 * lump(n.x * 2.4, n.y * 2.4, n.z * 2.4);
  // old-orqa cho'zilgan, pastdan biroz yassi — miya silueti
  return new THREE.Vector3(n.x * d * 1.18, n.y * d * 0.9 - 0.04, n.z * d * 1.02);
}

function BrainPoints() {
  const geo = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1, 5);
    const pos = ico.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const p = brainPosition(v);
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    pos.needsUpdate = true;
    return ico;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial
        color={TEAL}
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Atrofda suzuvchi neyron zarralari (chuqurlik/cinematic ambiance).
function Motes({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.6 + Math.random() * 1.1;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      arr[i * 3 + 2] = r * Math.cos(ph);
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y -= dt * 0.04;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color={TEAL}
        size={0.014}
        sizeAttenuation
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function RegionNode({ region }: { region: BrainRegion }) {
  const measured = region.value != null;
  const v = measured ? Math.max(0, Math.min(1, region.value as number)) : 0;
  const dir = new THREE.Vector3(...region.dir).normalize();
  const pos = brainPosition(dir).multiplyScalar(1.04);
  const haloRef = useRef<THREE.Mesh>(null);

  // Yongan mintaqa "nafas oladi"
  useFrame((state) => {
    if (haloRef.current && measured) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2 + dir.x * 3) * 0.12;
      haloRef.current.scale.setScalar(s);
    }
  });

  const core = 0.03 + v * 0.05;
  return (
    <group position={pos.toArray()}>
      {measured && (
        <mesh ref={haloRef}>
          <sphereGeometry args={[core + 0.06, 16, 16]} />
          <meshBasicMaterial
            color={TEAL}
            transparent
            opacity={0.18 + v * 0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[measured ? core : 0.022, 16, 16]} />
        <meshBasicMaterial
          color={measured ? TEAL : '#3a4456'}
          transparent
          opacity={measured ? 1 : 0.6}
        />
      </mesh>
      <Html center distanceFactor={6} occlude={false} style={{ pointerEvents: 'none' }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: measured ? '#ECEFF7' : '#8A93A6',
            whiteSpace: 'nowrap',
            textShadow: '0 0 6px rgba(6,8,15,0.9)',
          }}
        >
          {region.label.toUpperCase()}
        </span>
      </Html>
    </group>
  );
}

function BrainGroup({
  regions,
  reduced,
}: {
  regions: BrainRegion[];
  reduced: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.y += dt * 0.16;
  });
  return (
    <group ref={ref}>
      <BrainPoints />
      {regions.map((r) => (
        <RegionNode key={r.domain} region={r} />
      ))}
    </group>
  );
}

export default function Brain3D({
  regions,
  reduced,
  lowPower,
}: {
  regions: BrainRegion[];
  reduced: boolean;
  lowPower: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.3], fov: 45 }}
      dpr={[1, lowPower ? 1 : 2]}
      gl={{ antialias: !lowPower, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <BrainGroup regions={regions} reduced={reduced} />
      {!lowPower && <Motes count={120} />}
    </Canvas>
  );
}
