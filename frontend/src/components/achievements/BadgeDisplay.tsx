import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, useCursor } from "@react-three/drei";
import * as THREE from "three";

interface Badge {
  id: string;
  title: string;
  type: "BronzeBadge" | "SilverBadge" | "GoldBadge" | "PerfectBadge" | "DiamondBadge" | "SpeedBadge" | "StreakBadge" | "MasterBadge" | "LegendBadge";
  earned: boolean;
  progress: number;
  earnedAt?: string;
  color: string;
  icon: string;
  description: string;
  currentValue?: number;
  updatedAt?: string;
}

interface BadgeDisplayProps {
  badge: Badge;
  position: [number, number, number];
  onClick?: () => void;
}

export function BadgeDisplay({ badge, position, onClick }: BadgeDisplayProps) {
  const badgeRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const colors = {
    badge: badge.color || getDefaultColor(badge.type),
    glow: new THREE.Color(badge.color || getDefaultColor(badge.type))
      .multiplyScalar(2)
      .getHexString(),
    text: new THREE.Color(badge.color || getDefaultColor(badge.type))
      .multiplyScalar(1.2)
      .getHexString(),
  };

  function getDefaultColor(type: string): string {
    switch (type) {
      case "BronzeBadge":
        return "#CD7F32";
      case "SilverBadge":
        return "#C0C0C0";
      case "GoldBadge":
        return "#FFD700";
      case "PerfectBadge":
        return "#FF69B4";
      case "DiamondBadge":
        return "#B9F2FF";
      case "SpeedBadge":
        return "#FF6B35";
      case "StreakBadge":
        return "#FF4500";
      case "MasterBadge":
        return "#9370DB";
      case "LegendBadge":
        return "#FFD700";
      default:
        return "#4f46e5";
    }
  }

  useFrame((state) => {
    if (badgeRef.current) {
      const time = state.clock.getElapsedTime();

      badgeRef.current.position.y = position[1] + Math.sin(time * 2) * 0.15;

      badgeRef.current.rotation.y = time * 0.5;

      if (hovered) {
        badgeRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        badgeRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group
      ref={badgeRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={badge.earned ? onClick : undefined}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshPhongMaterial
            color={colors.badge}
            shininess={150}
            transparent
            opacity={badge.earned ? 0.95 : 0.4}
            emissive={new THREE.Color(colors.glow)}
            emissiveIntensity={hovered ? 1.2 : 0.6}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.1, 16, 32]} />
          <meshPhongMaterial
            color={colors.badge}
            shininess={150}
            transparent
            opacity={badge.earned ? 0.95 : 0.4}
            emissive={new THREE.Color(colors.glow)}
            emissiveIntensity={hovered ? 1 : 0.5}
          />
        </mesh>

        {hovered && badge.earned && (
          <mesh position={[0, 0, -0.1]}>
            <circleGeometry args={[1.4, 32]} />
            <meshBasicMaterial color={colors.glow} transparent opacity={0.4} />
          </mesh>
        )}
      </Float>

      {hovered && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.3}
          color={badge.earned ? colors.text : "#666"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000"
          strokeWidth={0.02}
          strokeColor={colors.glow}
        >
          {badge.title}
        </Text>
      )}

      {!badge.earned && badge.progress > 0 && (
        <mesh position={[0, 0, 0.5]}>
          <ringGeometry
            args={[0.7, 0.8, 32, 1, 0, Math.PI * 2 * (badge.progress / 100)]}
          />
          <meshPhongMaterial
            color={colors.badge}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {!badge.earned && badge.progress === 0 && (
        <group position={[0, 0, 0.5]}>
          <mesh>
            <boxGeometry args={[0.3, 0.3, 0.1]} />
            <meshPhongMaterial
              color="#333"
              shininess={100}
              transparent
              opacity={0.9}
              emissive="#444"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
            <meshPhongMaterial
              color="#444"
              transparent
              opacity={0.9}
              emissive="#555"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
