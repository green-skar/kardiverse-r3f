import React from "react";
import { Text } from "@react-three/drei";

export default function LogoGlow() {
    return (
        <Text
            position={[1.5, 2, 0]}
            fontSize={0.5}
            anchorX="right"
            anchorY="top"
            bevelEnabled
            bevelSize={0.02}
            bevelThickness={0.05}
            bevelSegments={5}
        >
            Kardiverse
            {/* Material with glow effect */}
            <meshStandardMaterial
                attach="material"
                color="white"
                emissive="#39e6ff"
                emissiveIntensity={1.2}
                metalness={0.3}
                roughness={0.2}
            />
        </Text>
    );
}
