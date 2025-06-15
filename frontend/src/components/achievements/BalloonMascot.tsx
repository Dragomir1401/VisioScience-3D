import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

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

export function BalloonMascot({ badges, onBadgeClick }: BalloonMascotProps) {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBadgeClick = (badgeId: string) => {
    setSelectedBadge(selectedBadge === badgeId ? null : badgeId);
    onBadgeClick?.(badgeId);
  };

  return (
    <div className="h-full w-full relative">
      {/* Scrollable container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-x-auto overflow-y-hidden"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4f46e5 #1a0b2e',
        }}
      >
        <div className="h-full" style={{ minWidth: `${badges?.length * 300}px` }}>
          <Canvas 
            camera={{ position: [0, 0, 25], fov: 40 }}
            style={{ 
              background: '#1a0b2e',
              height: '100%',
              width: '100%'
            }}
          >
            <color attach="background" args={['#1a0b2e']} />
            <fog attach="fog" args={['#1a0b2e', 15, 35]} />
            <Environment preset="sunset" />
            
            {/* Adjusted lighting for new camera distance */}
            <ambientLight intensity={4} />
            <pointLight position={[15, 15, 15]} intensity={2} color="#FF69B4" />
            <pointLight position={[-15, -15, -15]} intensity={1.5} color="#4B0082" />
            <pointLight position={[0, 10, 10]} intensity={2} color="#FF1493" />
            
            {/* Adjusted accent lights */}
            <pointLight position={[10, -10, 10]} intensity={1.5} color="#00FFFF" />
            <pointLight position={[-10, 10, -10]} intensity={1.5} color="#FF00FF" />
            
            {/* Badge balloons in horizontal line with increased spacing */}
            {badges && badges.length > 0 && badges.map((badge, index) => {
              const x = (index - (badges.length - 1) / 2) * 4;
              return (
                <Balloon
                  key={badge.id}
                  position={[x, 0, 0]}
                  color={badge.type}
                  scale={1.5}
                  animationState={
                    selectedBadge === badge.id ? 'selected' :
                    hoveredBadge === badge.id ? 'hover' : 'idle'
                  }
                  onClick={() => handleBadgeClick(badge.id)}
                  isEarned={badge.earned}
                />
              );
            })}

            {/* Badge title display - adjusted for new camera distance */}
            {selectedBadge && (
              <group position={[0, -4, 0]}>
                {/* Background glow */}
                <mesh position={[0, 0, -0.1]}>
                  <planeGeometry args={[6, 1.5]} />
                  <meshBasicMaterial 
                    color="#000000" 
                    transparent 
                    opacity={0.4}
                  />
                </mesh>
                
                {/* Title with glow effect */}
                <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
                  <Text
                    position={[0, 0, 0]}
                    fontSize={0.7}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.04}
                    outlineColor={ACCENTS[badges.find(b => b.id === selectedBadge)?.type as keyof typeof ACCENTS] || ACCENTS.default}
                  >
                    {badges.find(b => b.id === selectedBadge)?.title}
                  </Text>
                </Float>
              </group>
            )}
            
            {/* Disable orbit controls for horizontal scroll */}
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
          </Canvas>
        </div>
      </div>

      {/* Custom scrollbar styling */}
      <style jsx global>{`
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #1a0b2e;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
} 