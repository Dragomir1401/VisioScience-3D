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

function Balloon({ position, color, scale = 1, animationState, onClick, isEarned = false }: BalloonProps) {
  const balloonRef = useRef<THREE.Mesh>(null);
  const stringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Neon colors for different states
  const neonColor = new THREE.Color(color);
  const glowColor = new THREE.Color(color).multiplyScalar(1.5);
  const edgeColor = new THREE.Color(color).multiplyScalar(2);

  useFrame((state) => {
    if (balloonRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Base floating animation
      const baseY = position[1] + Math.sin(time * 2) * 0.1;
      
      switch (animationState) {
        case 'hover':
          balloonRef.current.position.y = baseY + 0.2;
          balloonRef.current.rotation.z = Math.sin(time * 3) * 0.1;
          break;
        case 'selected':
          balloonRef.current.position.y = baseY + 0.3;
          balloonRef.current.rotation.z = Math.sin(time * 4) * 0.15;
          break;
        default:
          balloonRef.current.position.y = baseY;
          balloonRef.current.rotation.z = Math.sin(time) * 0.05;
      }

      // Update string position to follow balloon
      if (stringRef.current) {
        stringRef.current.position.y = balloonRef.current.position.y - 1.5;
      }
    }
  });

  return (
    <group>
      {/* Balloon */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh 
          ref={balloonRef} 
          position={position} 
          scale={scale}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhongMaterial 
            color={neonColor}
            emissive={glowColor}
            emissiveIntensity={hovered ? 0.8 : 0.4}
            shininess={150}
            transparent
            opacity={isEarned ? 0.95 : 0.4}
          />
        </mesh>

        {/* Outer glow ring */}
        <mesh position={position} scale={[scale * 1.1, scale * 1.1, scale * 1.1]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhongMaterial
            color={edgeColor}
            transparent
            opacity={hovered ? 0.3 : 0.1}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Additional glow effect on hover */}
        {hovered && (
          <mesh position={position} scale={[scale * 1.2, scale * 1.2, scale * 1.2]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhongMaterial
              color={glowColor}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </Float>
      
      {/* String */}
      <mesh ref={stringRef} position={[position[0], position[1] - 1.5, position[2]]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
        <meshPhongMaterial 
          color="#2C0E37"
          emissive="#4A1B4D"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
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

  const handleBadgeClick = (badgeId: string) => {
    setSelectedBadge(selectedBadge === badgeId ? null : badgeId);
    onBadgeClick?.(badgeId);
  };

  return (
    <div className="h-full w-full relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Environment preset="sunset" />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#FF69B4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4B0082" />
        
        {/* Badge balloons */}
        {badges.map((badge, index) => {
          const angle = (index / badges.length) * Math.PI * 2;
          const radius = 3;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <Balloon
              key={badge.id}
              position={[x, y, 0]}
              color={badge.color}
              scale={1}
              animationState={
                selectedBadge === badge.id ? 'selected' :
                hoveredBadge === badge.id ? 'hover' : 'idle'
              }
              onClick={() => handleBadgeClick(badge.id)}
              isEarned={badge.earned}
            />
          );
        })}

        {/* Badge title display */}
        {selectedBadge && (
          <Float speed={1.5} rotationIntensity={0.05}>
            <Text
              position={[0, -2, 0]}
              fontSize={0.3}
              color="#FF69B4"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#4B0082"
            >
              {badges.find(b => b.id === selectedBadge)?.title}
            </Text>
          </Float>
        )}
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minDistance={5}
          maxDistance={12}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
} 