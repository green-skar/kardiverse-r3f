import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export default function HologramAvatar({
  modelUrl = "/src/assets/avatar.glb",
  scale = 1.0,
  isActive = false,
}: {
  modelUrl?: string;
  scale?: number;
  isActive?: boolean;
}) {
  const group = useRef<any>();
  const { scene } = useGLTF(modelUrl) as any;
  const rightArmRef = useRef<any>();
  const headRef = useRef<any>();

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.depthWrite = false;
        child.material.side = THREE.DoubleSide;
        if (!child.material.emissive)
          child.material.emissive = new THREE.Color("#00c8ff");
        child.material.emissiveIntensity = 0.8;
        child.material.color = new THREE.Color("#66dfff");
        child.material.opacity = 0.95;
      }
      // Find right arm and head by name (adjust names as per your model)
      if (
        child.name.toLowerCase().includes("arm") &&
        child.name.toLowerCase().includes("right")
      ) {
        rightArmRef.current = child;
      }
      if (child.name.toLowerCase().includes("head")) {
        headRef.current = child;
      }
    });
  }, [scene]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Idle floating
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.5) * 0.03;
      group.current.position.y = 0.03 * Math.sin(t * 0.9);
    }
    // Hologram active: animate more
    if (isActive) {
      // Waving right arm
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = Math.sin(t * 3) * 0.5;
      }
      // Head nodding
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 2) * 0.15;
        headRef.current.rotation.y = Math.sin(t * 1.5) * 0.08;
      }
      // Body sway
      if (group.current) {
        group.current.rotation.x = Math.sin(t * 1.2) * 0.05;
      }
    } else {
      // Reset arm/head rotations if needed
      if (rightArmRef.current) rightArmRef.current.rotation.z = 0;
      if (headRef.current) {
        headRef.current.rotation.x = 0;
        headRef.current.rotation.y = 0;
      }
      if (group.current) group.current.rotation.x = 0;
    }
    // Glow pulse
    scene.traverse((c: any) => {
      if (c.isMesh && c.material)
        c.material.emissiveIntensity =
          0.6 + 0.35 * Math.sin(clock.getElapsedTime() * 2.2);
    });
  });

  return (
    <group ref={group} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}
