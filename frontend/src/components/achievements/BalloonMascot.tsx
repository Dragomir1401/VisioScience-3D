import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring } from "@react-spring/three";
import { extend } from '@react-three/fiber';

// Extend Three.js elements to be recognized by JSX
extend(THREE);

// Type declarations for Three.js elements
declare module '@react-three/fiber' {
  interface ThreeElements {
    group: JSX.IntrinsicElements['group'];
    mesh: JSX.IntrinsicElements['mesh'];
    sphereGeometry: JSX.IntrinsicElements['sphereGeometry'];
    meshPhongMaterial: JSX.IntrinsicElements['meshPhongMaterial'];
    cylinderGeometry: JSX.IntrinsicElements['cylinderGeometry'];
    circleGeometry: JSX.IntrinsicElements['circleGeometry'];
    ringGeometry: JSX.IntrinsicElements['ringGeometry'];
    boxGeometry: JSX.IntrinsicElements['boxGeometry'];
    torusGeometry: JSX.IntrinsicElements['torusGeometry'];
  }
}

interface Badge {
  id: string;
  title: string;
  type: 'BronzeBadge' | 'SilverBadge' | 'GoldBadge' | 'PerfectBadge';
  earned: boolean;
  progress: number;
  earnedAt?: string;
  color: string;
  icon: string;
  description: string;
  currentValue?: number;
  updatedAt?: string;
}

interface BalloonProps {
  position: [number, number, number];
  color: string;
  scale?: number;
  animationState: 'idle' | 'hover' | 'selected';
  onClick?: () => void;
  isEarned?: boolean;
}

// Unify color definitions
const BADGE_COLORS = {
  BronzeBadge: {
    accent: "#690375",
    default: "#CD7F32"
  },
  SilverBadge: {
    accent: "#AE847E",
    default: "#C0C0C0"
  },
  GoldBadge: {
    accent: "#4f46e5",
    default: "#FFD700"
  },
  PerfectBadge: {
    accent: "#f3e8ff",
    default: "#FF69B4"
  }
} as const;

// Helper function to get colors based on badge type
function getBadgeColors(type: string) {
  return BADGE_COLORS[type as keyof typeof BADGE_COLORS] || {
    accent: "#4f46e5",
    default: "#4f46e5"
  };
}

function Balloon({ position, color, scale = 1, animationState, onClick, isEarned = false }: BalloonProps) {
  const balloonRef = useRef<THREE.Mesh>(null);
  const stringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Get colors based on badge type
  const colors = getBadgeColors(color);
  const neonColor = new THREE.Color(colors.accent);
  const glowColor = new THREE.Color(colors.accent).multiplyScalar(1.2);
  const edgeColor = new THREE.Color(colors.accent).multiplyScalar(1.4);

  useFrame((state) => {
    if (balloonRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Enhanced floating animation
      const baseY = position[1] + Math.sin(time * 2) * 0.15;
      const baseZ = position[2] + Math.sin(time * 1.5) * 0.1;
      
      switch (animationState) {
        case 'hover':
          balloonRef.current.position.y = baseY + 0.3;
          balloonRef.current.position.z = baseZ + 0.2;
          balloonRef.current.rotation.z = Math.sin(time * 3) * 0.15;
          balloonRef.current.scale.setScalar(scale * 1.1);
          break;
        case 'selected':
          balloonRef.current.position.y = baseY + 0.4;
          balloonRef.current.position.z = baseZ + 0.3;
          balloonRef.current.rotation.z = Math.sin(time * 4) * 0.2;
          balloonRef.current.scale.setScalar(scale * 1.2);
          break;
        default:
          balloonRef.current.position.y = baseY;
          balloonRef.current.position.z = baseZ;
          balloonRef.current.rotation.z = Math.sin(time) * 0.1;
          balloonRef.current.scale.setScalar(scale);
      }

      // Update string position with slight wave effect
      if (stringRef.current) {
        stringRef.current.position.y = balloonRef.current.position.y - 1.8;
        stringRef.current.position.z = balloonRef.current.position.z;
        stringRef.current.rotation.x = Math.sin(time * 2) * 0.1;
      }
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Main balloon with more realistic material */}
        <mesh 
          ref={balloonRef} 
          position={position} 
          scale={scale}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial 
            color={neonColor}
            emissive={glowColor}
            emissiveIntensity={hovered ? 0.8 : 0.4} // Reduced emissive intensity
            shininess={100} // Reduced shininess
            transparent
            opacity={isEarned ? 0.9 : 0.7} // More opaque
            specular={new THREE.Color(0xffffff)} // Added specular highlight
            reflectivity={0.5} // Added reflectivity
          />
        </mesh>

        {/* Subtle outer glow */}
        <mesh position={position} scale={[scale * 1.1, scale * 1.1, scale * 1.1]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial
            color={edgeColor}
            transparent
            opacity={hovered ? 0.3 : 0.15} // Reduced opacity
            side={THREE.BackSide}
          />
        </mesh>

        {/* Minimal hover effects */}
        {hovered && (
          <>
            <mesh position={position} scale={[scale * 1.15, scale * 1.15, scale * 1.15]}>
              <sphereGeometry args={[1, 64, 64]} />
              <meshPhongMaterial
                color={glowColor}
                transparent
                opacity={0.2} // Reduced opacity
                side={THREE.BackSide}
              />
            </mesh>
            {/* Subtle ground shadow */}
            <mesh position={[position[0], position[1], position[2] - 0.1]}>
              <circleGeometry args={[scale * 1.2, 64]} />
              <meshBasicMaterial
                color={glowColor}
                transparent
                opacity={0.15} // Reduced opacity
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}
      </Float>
      
      {/* More realistic string */}
      <mesh ref={stringRef} position={[position[0], position[1] - 1.8, position[2]]}>
        <cylinderGeometry args={[0.015, 0.015, 2.5, 8]} /> {/* Thinner string */}
        <meshPhongMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2} // Reduced glow
          transparent
          opacity={0.8} // More opaque
        />
      </mesh>
    </group>
  );
}

interface BalloonMascotProps {
  badges: Badge[];
  onBadgeClick?: (badgeId: string) => void;
}

function CameraController({ 
  targetRotation,
  isRotating
}: { 
  targetRotation: number,
  isRotating: boolean
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.8;
  const cameraRadius = 35;

  useFrame(() => {
    if (cameraRef.current) {
      if (!isRotating) {
        // Apply damping for smooth rotation
        rotationSpeed.current *= dampingFactor;
        if (Math.abs(rotationSpeed.current) < 0.001) {
          rotationSpeed.current = 0;
        }
        
        // Update camera position based on rotation
        const currentRotation = cameraRef.current.rotation.y + rotationSpeed.current;
        cameraRef.current.position.x = Math.sin(currentRotation) * cameraRadius;
        cameraRef.current.position.z = Math.cos(currentRotation) * cameraRadius;
        cameraRef.current.rotation.y = currentRotation;
        
        // Always look at center
        cameraRef.current.lookAt(0, 0, 0);
      } else {
        // Smooth rotation to target
        const currentRotation = cameraRef.current.rotation.y;
        let rotationDiff = targetRotation - currentRotation;
        
        // Normalize the rotation difference to be between -PI and PI
        while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        // Use a smaller factor for smoother rotation
        const newRotation = currentRotation + rotationDiff * 0.05;
        
        // Update camera position based on new rotation
        cameraRef.current.position.x = Math.sin(newRotation) * cameraRadius;
        cameraRef.current.position.z = Math.cos(newRotation) * cameraRadius;
        cameraRef.current.rotation.y = newRotation;
        
        // Always look at center
        cameraRef.current.lookAt(0, 0, 0);
      }
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, cameraRadius]}
      fov={30}
    />
  );
}

// Component that handles mouse/touch interactions inside Canvas
function SceneController({ 
  onRotate,
  isRotating,
  viewport
}: { 
  onRotate: (delta: number) => void,
  isRotating: boolean,
  viewport: { width: number, height: number }
}) {
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const sensitivity = 0.005;

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    lastX.current = e.clientX;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      const deltaX = e.clientX - lastX.current;
      onRotate(deltaX * sensitivity);
      lastX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [onRotate]);

  return null;
}

// Scene component that contains all 3D elements
function Scene({ 
  badges,
  selectedBadge,
  hoveredBadge,
  onBadgeClick,
  targetRotation,
  isRotating
}: {
  badges: Badge[],
  selectedBadge: string | null,
  hoveredBadge: string | null,
  onBadgeClick: (badgeId: string) => void,
  targetRotation: number,
  isRotating: boolean
}) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const currentRotation = useRef(0);

  const handleRotate = (delta: number) => {
    if (groupRef.current) {
      currentRotation.current += delta;
      groupRef.current.rotation.y = currentRotation.current;
    }
  };

  return (
    <>
      <CameraController 
        targetRotation={targetRotation}
        isRotating={isRotating}
      />
      
      <SceneController 
        onRotate={handleRotate}
        isRotating={isRotating}
        viewport={viewport}
      />

      <color attach="background" args={['#1a0b2e']} />
      <fog attach="fog" args={['#1a0b2e', 15, 35]} />
      <Environment preset="sunset" />
      
      {/* Lighting setup */}
      <ambientLight intensity={4} />
      <pointLight position={[15, 15, 15]} intensity={2} color="#FF69B4" />
      <pointLight position={[-15, -15, -15]} intensity={1.5} color="#4B0082" />
      <pointLight position={[0, 10, 10]} intensity={2} color="#FF1493" />
      <pointLight position={[10, -10, 10]} intensity={1.5} color="#00FFFF" />
      <pointLight position={[-10, 10, -10]} intensity={1.5} color="#FF00FF" />
      
      {/* Balloons arranged in a circle */}
      <group ref={groupRef}>
        {badges && badges.length > 0 && badges.map((badge, index) => {
          const angle = (index / badges.length) * Math.PI * 2;
          const radius = 7;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          
          return (
            <group key={badge.id || badge.type} position={[x, 0, z]}>
              <Balloon
                position={[0, 0, 0]}
                color={badge.type}
                scale={1.5}
                animationState={
                  selectedBadge === badge.id ? 'selected' :
                  hoveredBadge === badge.id ? 'hover' : 'idle'
                }
                onClick={() => onBadgeClick(badge.id)}
                isEarned={badge.earned}
              />
            </group>
          );
        })}
      </group>
    </>
  );
}

export function BalloonMascot({ badges, onBadgeClick }: BalloonMascotProps) {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const [showHint, setShowHint] = useState(true);

  // Filter out duplicate badges by type
  const uniqueBadges = badges.reduce((acc, badge) => {
    // Check if we already have a badge of this type
    const existingBadge = acc.find(b => b.type === badge.type);
    if (!existingBadge) {
      // If no badge of this type exists, add it
      acc.push(badge);
    } else if (badge.earned && !existingBadge.earned) {
      // If we have a duplicate but the new one is earned and the existing one isn't,
      // replace the existing one
      acc[acc.indexOf(existingBadge)] = badge;
    }
    return acc;
  }, [] as Badge[]);

  console.log('BalloonMascot received badges:', uniqueBadges);

  // Render loading, error, or empty state outside of Canvas
  if (!uniqueBadges || uniqueBadges.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-lg">
        <div className="text-mulberry text-lg">No badges available yet.</div>
      </div>
    );
  }

  const handleBadgeClick = (badgeId: string) => {
    const badge = uniqueBadges.find(b => b.id === badgeId);
    if (badge) {
      console.log('Badge clicked:', badge);
      setSelectedBadge(badgeId);
      if (onBadgeClick) {
        onBadgeClick(badgeId);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Canvas for 3D scene */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 35], fov: 30 }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        style={{ cursor: 'grab' }}
      >
        <Scene 
          badges={uniqueBadges}
          selectedBadge={selectedBadge}
          hoveredBadge={hoveredBadge}
          onBadgeClick={handleBadgeClick}
          targetRotation={targetRotation}
          isRotating={isRotating}
        />
      </Canvas>

      {/* Hint overlay */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm"
            onClick={() => setShowHint(false)}
          >
            Click and drag to rotate • Click a balloon to view details
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 