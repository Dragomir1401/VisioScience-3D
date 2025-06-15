import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment, PerspectiveCamera } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring } from "@react-spring/three";

interface BalloonProps {
  position: [number, number, number];
  color: string;
  scale?: number;
  animationState: 'idle' | 'hover' | 'selected';
  onClick?: () => void;
  isEarned?: boolean;
}

const ACCENTS = {
  bronze: "#690375",
  silver: "#AE847E",
  gold: "#4f46e5",
  perfect: "#f3e8ff",
  default: "#4f46e5"
};

function Balloon({ position, color, scale = 1, animationState, onClick, isEarned = false }: BalloonProps) {
  const balloonRef = useRef<THREE.Mesh>(null);
  const stringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // More subtle neon colors
  const accent = ACCENTS[color as keyof typeof ACCENTS] || ACCENTS.default;
  const neonColor = new THREE.Color(accent);
  const glowColor = new THREE.Color(accent).multiplyScalar(1.2); // Reduced glow intensity
  const edgeColor = new THREE.Color(accent).multiplyScalar(1.4); // Reduced edge intensity

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
  badges: Array<{
    id: string;
    title: string;
    type: string;
    earned: boolean;
    color: string;
  }>;
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
  onBadgeClick: (id: string) => void,
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
            <group key={badge.id} position={[x, 0, z]}>
              <Balloon
                position={[x, 0, z]}
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

  // Hide hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleBadgeClick = (id: string) => {
    setSelectedBadge(id);
    onBadgeClick?.(id);
  };

  return (
    <div className="relative w-full h-full">
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
        <fog attach="fog" args={['#000000', 25, 50]} />
        
        <Scene 
          badges={badges}
          selectedBadge={selectedBadge}
          hoveredBadge={hoveredBadge}
          onBadgeClick={handleBadgeClick}
          targetRotation={targetRotation}
          isRotating={isRotating}
        />
      </Canvas>

      {/* Drag hint animation */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     px-6 py-3 rounded-full bg-black/30 
                     backdrop-blur-sm border border-white/20
                     flex items-center gap-3
                     pointer-events-none"
          >
            <motion.div
              animate={{
                x: [-10, 10, -10],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-white/80"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
                />
              </svg>
            </motion.div>
            <span className="text-white/80 text-sm font-medium">
              Drag to explore
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 