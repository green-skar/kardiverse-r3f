import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { enhancedModelCache } from '../utils/modelCache';

interface InteractiveAvatarProps {
  modelUrl?: string;
  scale?: number;
  isActive?: boolean;
  onModelLoaded?: () => void;
  showImmediateFeedback?: boolean; // New prop for immediate feedback
}

export default function InteractiveAvatar({
  modelUrl = "/avatar.glb",
  scale = 1.0,
  isActive = false,
  onModelLoaded,
  showImmediateFeedback = true,
}: InteractiveAvatarProps) {
  const group = useRef<any>();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotationY, setRotationY] = useState(Math.PI / 2);
  const [targetRotationY, setTargetRotationY] = useState(Math.PI / 2);
  const [autoRotate, setAutoRotate] = useState(true);
  const [autoRotateDirection, setAutoRotateDirection] = useState(1);
  const [autoRotateProgress, setAutoRotateProgress] = useState(0);
  const [dragDirection, setDragDirection] = useState(0);
  const [continuousRotationSpeed, setContinuousRotationSpeed] = useState(0);
  
  // Enhanced loading states
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  
  // Try to get model from cache first, then fallback to useGLTF
  const [cachedGltf, setCachedGltf] = useState<any>(null);
  const [useCachedModel, setUseCachedModel] = useState(false);
  
  // Check cache first - synchronous check for immediate results
  const checkCacheAndLoad = async () => {
    // Synchronous cache check for immediate results
    const cached = enhancedModelCache.getCachedModel(modelUrl);
    if (cached) {
      console.log('InteractiveAvatar: Using cached model immediately');
      setCachedGltf(cached);
      setUseCachedModel(true);
      setIsModelLoading(false);
      // Show wireframe animation for a bit longer for better UX
      setTimeout(() => setShowPlaceholder(false), 800);
      if (onModelLoaded) onModelLoaded();
      return;
    }
    
    // If not cached, check if it's currently loading
    if (enhancedModelCache.isModelLoading(modelUrl)) {
      console.log('InteractiveAvatar: Model is currently loading, will wait');
      setUseCachedModel(false);
      return;
    }
    
    // If not cached and not loading, try to preload it
    try {
      console.log('InteractiveAvatar: Model not cached, preloading...');
      const gltf = await enhancedModelCache.preloadModel(modelUrl);
      setCachedGltf(gltf);
      setUseCachedModel(true);
      setIsModelLoading(false);
      // Show wireframe animation for a bit longer for better UX
      setTimeout(() => setShowPlaceholder(false), 800);
      if (onModelLoaded) onModelLoaded();
    } catch (error) {
      console.warn('InteractiveAvatar: Preload failed, using useGLTF fallback:', error);
      setUseCachedModel(false);
    }
  };

  // Initial cache check on mount
  useEffect(() => {
    checkCacheAndLoad();
  }, [modelUrl, onModelLoaded]);

  // Re-check cache when isActive changes (when button is clicked)
  useEffect(() => {
    if (isActive) {
      console.log('InteractiveAvatar: isActive changed to true, re-checking cache');
      // FIXED: Immediate execution, no setTimeout delay
      checkCacheAndLoad();
    }
  }, [isActive]);
  
  // Always call useGLTF (required by React rules), but prioritize cached model
  const gltf = useGLTF(modelUrl) as any;
  const scene = useCachedModel ? cachedGltf?.scene : gltf?.scene;
  const { camera } = useThree();

  // Handle model loading with progress tracking
  useEffect(() => {
    if (scene && onModelLoaded) {
      console.log('Interactive avatar model loaded successfully:', modelUrl);
      setIsModelLoading(false);
      setShowPlaceholder(false);
      onModelLoaded();
    } else if ((useCachedModel ? cachedGltf : gltf) && !scene) {
      console.error('Interactive avatar model loading failed - no scene found:', modelUrl);
    }
  }, [scene, gltf, cachedGltf, useCachedModel, onModelLoaded, modelUrl]);

  // Simulate loading progress for immediate feedback
  useEffect(() => {
    if (showImmediateFeedback && isModelLoading) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until real model loads
          return prev + Math.random() * 15;
        });
      }, 100);
      
      return () => clearInterval(progressInterval);
    }
  }, [showImmediateFeedback, isModelLoading]);

  // Handle mouse/touch interactions (same as original)
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
      setAutoRotate(false);
      setContinuousRotationSpeed(0);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = event.clientX - dragStart.x;
      const rotationSpeed = 0.01; // Reduced from 0.05 to 0.01 for gentler rotation
      const newRotation = rotationY + deltaX * rotationSpeed;
      
      setRotationY(newRotation);
      setTargetRotationY(newRotation);
      setDragDirection(deltaX > 0 ? 1 : -1);
      setDragStart({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setContinuousRotationSpeed(dragDirection * 0.01); // Reduced from 0.05 to 0.01 for gentler continuous rotation
      setAutoRotate(false);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        setIsDragging(true);
        setDragStart({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        setAutoRotate(false);
        setContinuousRotationSpeed(0);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging || event.touches.length !== 1) return;
      
      const deltaX = event.touches[0].clientX - dragStart.x;
      const rotationSpeed = 0.01; // Reduced from 0.05 to 0.01 for gentler rotation
      const newRotation = rotationY + deltaX * rotationSpeed;
      
      setRotationY(newRotation);
      setTargetRotationY(newRotation);
      setDragDirection(deltaX > 0 ? 1 : -1);
      setDragStart({ x: event.touches[0].clientX, y: event.touches[0].clientY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setContinuousRotationSpeed(dragDirection * 0.01); // Reduced from 0.05 to 0.01 for gentler continuous rotation
      setAutoRotate(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, rotationY]);

  // Animation frame updates (same as original)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (group.current) {
      // Apply manual rotation during dragging
      if (isDragging) {
        group.current.rotation.y = rotationY;
      } else {
        // Continuous rotation in user direction after interaction
        if (continuousRotationSpeed !== 0) {
          group.current.rotation.y += continuousRotationSpeed;
        } else if (autoRotate) {
          // Auto-rotation when not dragging
          const cycleDuration = 15;
          const cycleProgress = (t % cycleDuration) / cycleDuration;
          
          const startAngle = Math.PI / 2;
          const totalRotation = 2 * Math.PI;
          const targetY = startAngle + (cycleProgress * totalRotation);
          
          group.current.rotation.y = THREE.MathUtils.lerp(
            group.current.rotation.y, 
            targetY, 
            0.05
          );
        }
        
        // Subtle floating animation
        group.current.position.y = 0.1 * Math.sin(t * 0.8);
      }
      
      // Animate circle elements
      const circleGroup = group.current.children[1];
      if (circleGroup) {
        // Rotate the inner ring anticlockwise
        const innerRing = circleGroup.children[1];
        if (innerRing) {
          innerRing.rotation.z = -t * 0.6;
        }
        
        // Animate the moving boxes around the avatar
        circleGroup.children.slice(2, 14).forEach((box: any, index: number) => {
          if (box) {
            const angle = (index / 12) * Math.PI * 2 + t * 1.0;
            const radius = 2.2;
            box.position.x = Math.cos(angle) * radius;
            box.position.z = Math.sin(angle) * radius;
            box.rotation.y = angle;
            box.material.opacity = 0.5 + 0.3 * Math.sin(t * 3 + index);
          }
        });
        
        // Animate the floating particles
        circleGroup.children.slice(14, 22).forEach((particle: any, index: number) => {
          if (particle) {
            const angle = (index / 8) * Math.PI * 2 + t * 0.4;
            const radius = 1.9;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
            particle.position.y = -0.47 + 0.1 * Math.sin(t * 2 + index);
            particle.material.opacity = 0.4 + 0.3 * Math.sin(t * 2.5 + index);
          }
        });
      }
    }
    
    // Slow camera movement
    if (autoRotate && !isDragging) {
      const radius = 5;
      const angle = t * 0.05;
      const height = 1 + 0.3 * Math.sin(t * 0.2);
      
      camera.position.x = Math.cos(angle) * radius;
      camera.position.z = Math.sin(angle) * radius;
      camera.position.y = height;
      camera.lookAt(0, 0, 0);
    }
  });

  // Show placeholder while loading if immediate feedback is enabled
  if (showImmediateFeedback && showPlaceholder && !scene) {
    console.log('InteractiveAvatar: Showing wireframe animation - showImmediateFeedback:', showImmediateFeedback, 'showPlaceholder:', showPlaceholder, 'scene:', !!scene);
    return (
      <group ref={group}>
        {/* Immediate feedback placeholder - simple geometric shape */}
        <group scale={[scale, scale, scale]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 2, 0.5]} />
            <meshBasicMaterial
              color="#39e6ff"
              transparent
              opacity={0.6}
              wireframe={true}
            />
          </mesh>
        </group>
        
        {/* Glowing circle with moving elements - same as original */}
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <ringGeometry args={[2.5, 2.7, 64]} />
            <meshBasicMaterial
              color="#39e6ff"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
            <ringGeometry args={[1.8, 2.0, 32]} />
            <meshBasicMaterial
              color="#00c8ff"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Animated small boxes moving around the avatar */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh key={`box-${i}`} position={[0, -0.48, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial
                  color="#39e6ff"
                  transparent
                  opacity={0.8}
                />
              </mesh>
            );
          })}
          
          {/* Additional floating particles */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh key={`particle-${i}`} position={[0, -0.47, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial
                  color="#66dfff"
                  transparent
                  opacity={0.7}
                />
              </mesh>
            );
          })}
        </group>
      </group>
    );
  }

  if (!scene) return null;

  return (
    <group ref={group}>
      {/* Avatar with individual scaling */}
      <group scale={[scale, scale, scale]}>
        <primitive object={scene} />
      </group>
      
      {/* Glowing circle with moving elements - no scaling */}
      <group>
        {/* Outer animated circle */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[2.5, 2.7, 64]} />
          <meshBasicMaterial
            color="#39e6ff"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Inner rugged circle (moving anticlockwise) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial
            color="#00c8ff"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Animated small boxes moving around the avatar */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh key={`box-${i}`} position={[0, -0.48, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshBasicMaterial
                color="#39e6ff"
                transparent
                opacity={0.8}
              />
            </mesh>
          );
        })}
        
        {/* Additional floating particles */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={`particle-${i}`} position={[0, -0.47, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial
                color="#66dfff"
                transparent
                opacity={0.7}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
