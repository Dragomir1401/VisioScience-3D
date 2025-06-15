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

  // Enhanced neon colors with periodic table style
  const accent = ACCENTS[color as keyof typeof ACCENTS] || ACCENTS.default;
  const neonColor = new THREE.Color(accent);
  const glowColor = new THREE.Color(accent).multiplyScalar(2.2);
  const edgeColor = new THREE.Color(accent).multiplyScalar(2.5);

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
        {/* Main balloon with enhanced 3D effect */}
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
            emissiveIntensity={hovered ? 1.5 : 0.8}
            shininess={200}
            transparent
            opacity={isEarned ? 0.95 : 0.4}
          />
        </mesh>

        {/* Enhanced outer glow ring */}
        <mesh position={position} scale={[scale * 1.2, scale * 1.2, scale * 1.2]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial
            color={edgeColor}
            transparent
            opacity={hovered ? 0.6 : 0.25}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Additional glow effects */}
        {hovered && (
          <>
            <mesh position={position} scale={[scale * 1.4, scale * 1.4, scale * 1.4]}>
              <sphereGeometry args={[1, 64, 64]} />
              <meshPhongMaterial
                color={glowColor}
                transparent
                opacity={0.4}
                side={THREE.BackSide}
              />
            </mesh>
            {/* Ground glow */}
            <mesh position={[position[0], position[1], position[2] - 0.1]}>
              <circleGeometry args={[scale * 1.6, 64]} />
              <meshBasicMaterial
                color={glowColor}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}
      </Float>
      
      {/* Enhanced string with glow */}
      <mesh ref={stringRef} position={[position[0], position[1] - 1.8, position[2]]}>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 8]} />
        <meshPhongMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.95}
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
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 55 }}
        style={{ background: '#1a0b2e' }}
      >
        <color attach="background" args={['#1a0b2e']} />
        <fog attach="fog" args={['#1a0b2e', 5, 20]} />
        <Environment preset="sunset" />
        
        {/* Enhanced scene lighting */}
        <ambientLight intensity={6} />
        <pointLight position={[10, 10, 10]} intensity={4.5} color="#FF69B4" />
        <pointLight position={[-10, -10, -10]} intensity={3.0} color="#4B0082" />
        <pointLight position={[0, 5, 5]} intensity={4} color="#FF1493" />
        
        {/* Additional accent lights */}
        <pointLight position={[5, -5, 5]} intensity={5} color="#00FFFF" />
        <pointLight position={[-5, 5, -5]} intensity={5} color="#FF00FF" />
        
        {/* Debug info */}
        <Text
          position={[0, 3, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {`Badges: ${badges.length}`}
        </Text>
        
        {/* Badge balloons */}
        {badges && badges.length > 0 && badges.map((badge, index) => {
          const angle = (index / badges.length) * Math.PI * 2;
          const radius = 4;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const z = Math.sin(angle * 2) * 0.5;
          
          return (
            <Balloon
              key={badge.id}
              position={[x, y, z]}
              color={badge.type}
              scale={1.2}
              animationState={
                selectedBadge === badge.id ? 'selected' :
                hoveredBadge === badge.id ? 'hover' : 'idle'
              }
              onClick={() => handleBadgeClick(badge.id)}
              isEarned={badge.earned}
            />
          );
        })}

        {/* Enhanced badge title display */}
        {selectedBadge && (
          <group position={[0, 0, 0]}>
            {/* Background glow */}
            <mesh position={[0, -2, -0.1]}>
              <planeGeometry args={[4, 1]} />
              <meshBasicMaterial 
                color="#000000" 
                transparent 
                opacity={0.4}
              />
            </mesh>
            
            {/* Title with glow effect */}
            <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
              <Text
                position={[0, -2, 0]}
                fontSize={0.4}
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
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minDistance={8}
          maxDistance={15}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
} 