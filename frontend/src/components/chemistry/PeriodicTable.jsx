import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

/* -------------------- date minime (poţi extinde) -------------------- */
const ELEMENTS = [
  { Z: 1,  simbol: "H",  nume: "Hidrogen", masa: 1.01, grup: 1,  perioada: 1 },
  { Z: 2,  simbol: "He", nume: "Heliu",    masa: 4.00, grup: 18, perioada: 1 },
  { Z: 3,  simbol: "Li", nume: "Litiu",    masa: 6.94, grup: 1,  perioada: 2 },
  { Z: 4,  simbol: "Be", nume: "Beriliu",  masa: 9.01, grup: 2,  perioada: 2 },
  { Z: 5,  simbol: "B",  nume: "Bor",      masa: 10.81, grup: 13, perioada: 2 },
  { Z: 6,  simbol: "C",  nume: "Carbon",   masa: 12.01, grup: 14, perioada: 2 },
  { Z: 7,  simbol: "N",  nume: "Azot",     masa: 14.01, grup: 15, perioada: 2 },
  { Z: 8,  simbol: "O",  nume: "Oxigen",   masa: 16.00, grup: 16, perioada: 2 },
  { Z: 9,  simbol: "F",  nume: "Fluor",    masa: 19.00, grup: 17, perioada: 2 },
  { Z: 10, simbol: "Ne", nume: "Neon",     masa: 20.18, grup: 18, perioada: 2 },
  // … continuă cu restul elementelor
];

/* -------------------- cub cu tooltip -------------------- */
function ElementBox({ el }) {
  const ref = useRef();
  const color = useMemo(() => {
    // colorăm pe grupe
    const palette = [
      "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#14b8a6",
      "#0ea5e9", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e", "#737373"
    ];
    return palette[(el.grup - 1) % palette.length];
  }, [el.grup]);

  // uşoară animaţie de rotaţie
  useFrame((_s, dt) => {
    ref.current.rotation.y += dt * 0.3;
  });

  return (
    <group position={[
      (el.grup - 9.5) * 2,      // centrează pe axa X
      -(el.perioada - 3.5) * 2, // inversează Y pentru a avea Per.1 sus
      0,
    ]}>
      <mesh ref={ref}>
        <boxGeometry args={[1.8, 1.8, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <Html distanceFactor={8}>
        <div className="text-center text-xs leading-tight select-none pointer-events-none">
          <p className="font-bold">{el.symbol ?? el.simbol}</p>
          <p>{el.Z}</p>
        </div>
      </Html>
    </group>
  );
}

/* -------------------- scena completă -------------------- */
export default function PeriodicTable3D() {
  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 5]} intensity={0.5} />
      <OrbitControls enablePan={false} />

      {ELEMENTS.map((el) => (
        <ElementBox key={el.Z} el={el} />
      ))}
    </Canvas>
  );
}
