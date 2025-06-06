import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Vector3 } from "three";
import TWEEN from "@tweenjs/tween.js";

import TABLE_DATA from "./periodic-data-full.json";

/* ---------- layout-uri exact ca gist ---------- */
const layouts = {
  table: {
    label: "TABLE",
    // ‹d› este chiar elementul (arrayul cu 5 câmpuri)
    getPos: (d, i) => {
    const group  = Number(d[3]);
    const period = Number(d[4]);
    console.log(i, group, period);   //  ← trebuie să vezi 1…18 și 1…7/10

    return new Vector3(
        group  * 140 - 1260,
        -(period * 180) + 990,
        0
    );
    },
  },
  sphere: {
    label: "SPHERE",
    getPos: (_, i, l = TABLE_DATA.length) => {
      const phi = Math.acos(-1 + 2 * i / l);
      const theta = Math.sqrt(l * Math.PI) * phi;
      return new Vector3(
        800 * Math.cos(theta) * Math.sin(phi),
        800 * Math.sin(theta) * Math.sin(phi),
        800 * Math.cos(phi)
      );
    },
  },
  helix: {
    label: "HELIX",
    getPos: (_, i) => {
      const phi = i * 0.175 + Math.PI;
      return new Vector3(
        900 * Math.sin(phi),
        -(i * 8) + 450,
        900 * Math.cos(phi)
      );
    },
  },
  grid: {
    label: "GRID",
    getPos: (_, i) =>
      new Vector3(
        ((i % 5) * 400) - 800,
        (-(Math.floor(i / 5) % 5) * 400) + 800,
        (Math.floor(i / 25) * 1000) - 2000
      ),
  },
};

/* ---------- card cyan pâlpâitor ---------- */
const cardStyle = {
  width: 120,
  height: 160,
  background: "rgba(0,127,127,0.4)",
  border: "1px solid rgba(127,255,255,0.25)",
  boxShadow: "0 0 12px rgba(0,255,255,0.5)",
  cursor: "default",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Helvetica, sans-serif",
  color: "rgba(255,255,255,0.85)",
  userSelect: "none",
};

function Element({ data, index, layout }) {
  const ref = useRef();

  useEffect(() => {
    const obj = ref.current;
    if (!obj) return;

    /* 1️⃣ – poziţie random doar la prima montare */
    if (obj.position.lengthSq() === 0) {
      obj.position.set(
        Math.random() * 4000 - 2000,
        Math.random() * 4000 - 2000,
        Math.random() * 4000 - 2000
      );
    }

    /* 2️⃣ – calculează ţinta şi porneşte tween-ul */
    const target = layouts[layout].getPos(data, index);

    const tween = new TWEEN.Tween(obj.position)
      .to(target, Math.random() * 2000 + 2000)
      .easing(TWEEN.Easing.Exponential.InOut)
      .onUpdate(() => obj.updateMatrix())   // ţine world-matrix la zi
      .start();

    /* cleanup când componenta sau layout-ul se schimbă */
    return () => tween.stop();
  }, [layout, data, index]);

  return (
    <group ref={ref}>
      <Html distanceFactor={50} transform> … </Html>
    </group>
  );
}


/* ---------- scenă: tween update + orbit ---------- */
function Scene({ layout }) {
  useFrame(() => TWEEN.update());

  return (
    <>
      <ambientLight intensity={0.8} />
      <OrbitControls
        enablePan={false}
        minDistance={500}
        maxDistance={6000}
        rotateSpeed={0.5}
      />
      {TABLE_DATA.map((el, i) => (
        <Element key={i} data={el} index={i} layout={layout} />
      ))}
    </>
  );
}

/* ---------- wrapper cu butoane & Canvas ---------- */
export default function PeriodicTable3D() {
  const [layout, setLayout] = useState("table");

  return (
    <div className="w-full h-full relative">
      {/* butoane */}
      <div className="absolute bottom-6 w-full text-center space-x-2 z-10">
        {Object.entries(layouts).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setLayout(key)}
            style={{
              padding: "4px 12px",
              fontSize: 22,
              letterSpacing: 1,
              border: "1px solid rgba(127,255,255,0.75)",
              background:
                layout === key
                  ? "rgba(0,255,255,0.75)"
                  : "transparent",
              color: layout === key ? "#000" : "rgba(127,255,255,0.75)",
              cursor: "pointer",
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
        <Canvas
        style={{ background: "#000" }}
        camera={{ position: [0, 0, 300], fov: 40, near: 1, far: 10000 }}
        >
        <Scene layout={layout} />
        </Canvas>
    </div>
  );
}
