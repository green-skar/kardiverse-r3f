import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function Bubble({
  bounds = { x: 4, y: 2.5, z: 0 },
  startEdge = "top",
  size = 0.15 + Math.random() * 0.25,
  speed = 0.01 + Math.random() * 0.015,
}: {
  bounds?: { x: number; y: number; z: number };
  startEdge?: "top" | "left" | "right";
  size?: number;
  speed?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);

  // Compute initial position and velocity before useRef
  let initialPos: [number, number, number];
  if (startEdge === "top") initialPos = [randomBetween(-bounds.x, bounds.x), bounds.y, 0];
  else if (startEdge === "left") initialPos = [-bounds.x, randomBetween(-bounds.y, bounds.y), 0];
  else initialPos = [bounds.x, randomBetween(-bounds.y, bounds.y), 0];

  let initialVel: [number, number, number];
  let vx = randomBetween(-0.01, 0.01);
  let vy = startEdge === "top" ? -speed : randomBetween(-speed, speed);
  if (startEdge === "left") vx = speed;
  if (startEdge === "right") vx = -speed;
  initialVel = [vx, vy, 0];

  const pos = useRef<[number, number, number]>(initialPos);
  const vel = useRef<[number, number, number]>(initialVel);

  useFrame(() => {
    // Move bubble
    pos.current[0] += vel.current[0];
    pos.current[1] += vel.current[1];

    // Bounce from bottom
    if (pos.current[1] < -bounds.y) {
      pos.current[1] = -bounds.y;
      vel.current[1] = Math.abs(vel.current[1]) * 0.8; // lose some energy
      // Add some random wind
      vel.current[0] += randomBetween(-0.01, 0.01);
    }
    // Bounce from sides
    if (pos.current[0] < -bounds.x || pos.current[0] > bounds.x) {
      vel.current[0] *= -1;
    }
    // Reset if out of bounds (top)
    if (pos.current[1] > bounds.y + 0.5) {
      pos.current[1] = bounds.y;
      pos.current[0] = randomBetween(-bounds.x, bounds.x);
      vel.current[1] = -Math.abs(vel.current[1]);
    }

    mesh.current.position.set(pos.current[0], pos.current[1], pos.current[2]);
    // Add a little rotation for sparkle
    mesh.current.rotation.y += 0.01;
    mesh.current.rotation.x += 0.008;
  });

  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhysicalMaterial
        color="#b3e6ff"
        roughness={0.05}
        metalness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.05}
        transmission={1}
        thickness={1}
        ior={1.33}
        reflectivity={0.8}
        sheen={1}
        sheenColor="#fff"
        sheenRoughness={0.1}
        envMapIntensity={2}
        emissive="#fff"
        emissiveIntensity={0.12}
        transparent={true}
      />
      {/* Sun glare sparkle */}
      <mesh position={[size * 0.4, size * 0.4, size * 0.7]}>
        <sphereGeometry args={[size * 0.08, 8, 8]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.8} />
      </mesh>
    </mesh>
  );
}