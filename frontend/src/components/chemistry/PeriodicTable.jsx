import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Vector3, Quaternion, Matrix4 } from "three";
import * as TWEEN from "@tweenjs/tween.js";

// Create a global tweens group
const tweens = new TWEEN.Group();

const ACCENTS = {
  1:  "#690375", 
  2:  "#AE847E",  
  13: "#4f46e5", 
  17: "#888888",  
  18: "#f3e8ff", 
  default: "#4f46e5"
};

const layouts = {
  table: {
    label: "TABLE",
    getPos: (d) =>
      new Vector3(d[3] * 140 - 1260, -(d[4] * 180) + 990, 0)
  },
  sphere: {
    label: "SPHERE",
    getPos: (_, i, elements) => {
      const phi   = Math.acos(-1 + 2 * i / elements.length);
      const theta = Math.sqrt(elements.length * Math.PI) * phi;
      return new Vector3(
        800 * Math.cos(theta) * Math.sin(phi),
        800 * Math.sin(theta) * Math.sin(phi),
        800 * Math.cos(phi)
      );
    }
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
    }
  },
  grid: {
    label: "GRID",
    getPos: (_, i) =>
      new Vector3(
        ((i % 5) * 400) - 800,
        (-(Math.floor(i / 5) % 5) * 400) + 800,
        (Math.floor(i / 25) * 1000) - 2000
      )
  },
  spiral: {
    label: "SPIRAL",
    getPos: (_, i) => {
      const angle = i * 0.5;
      const radius = 50 + i * 15;
      return new Vector3(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        i * 10
      );
    }
  },
  pyramid: {
    label: "PYRAMID",
    getPos: (d) => {
      const group = d[3];
      const period = d[4];
      const angle = (group / 18) * Math.PI * 2;
      const radius = 300 + period * 80;
      return new Vector3(
        radius * Math.cos(angle),
        1000 - period * 150,
        radius * Math.sin(angle)
      );
    }
  },
  wave: {
    label: "WAVE",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      return new Vector3(
        (group - 9) * 150,
        Math.sin(i * 0.2) * 300,
        period * 150 - 1000
      );
    }
  },
  flower: {
    label: "FLOWER",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const angle = (group / 18) * Math.PI * 2;
      const radius = 300 + period * 50;
      return new Vector3(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        Math.sin(i * 0.5) * 200
      );
    }
  },
  torus: {
    label: "TORUS",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const angle1 = (group / 18) * Math.PI * 2;
      const angle2 = (period / 7) * Math.PI * 2;
      const radius = 400;
      const tubeRadius = 200;
      return new Vector3(
        (radius + tubeRadius * Math.cos(angle2)) * Math.cos(angle1),
        (radius + tubeRadius * Math.cos(angle2)) * Math.sin(angle1),
        tubeRadius * Math.sin(angle2)
      );
    }
  },
  cube: {
    label: "CUBE",
    getPos: (_, i) => {
      const size = 5;
      const x = (i % size) * 200 - 400;
      const y = (Math.floor(i / size) % size) * 200 - 400;
      const z = (Math.floor(i / (size * size))) * 200 - 400;
      return new Vector3(x, y, z);
    }
  },
  galaxy: {
    label: "GALAXY",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const angle = (group / 18) * Math.PI * 2;
      const radius = 100 + period * 50;
      const spiral = i * 0.1;
      return new Vector3(
        (radius + spiral) * Math.cos(angle + spiral),
        (radius + spiral) * Math.sin(angle + spiral),
        Math.sin(i * 0.2) * 100
      );
    }
  },
  dna: {
    label: "DNA",
    getPos: (_, i) => {
      const angle = i * 0.5;
      const radius = 300;
      const height = i * 20;
      const phase = Math.sin(i * 0.2) * 100;
      return new Vector3(
        radius * Math.cos(angle) + phase,
        height - 1000,
        radius * Math.sin(angle)
      );
    }
  },
  tree: {
    label: "TREE",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const angle = (group / 18) * Math.PI * 2;
      const height = period * 200;
      const radius = 100 + period * 50;
      return new Vector3(
        radius * Math.cos(angle),
        height,
        radius * Math.sin(angle)
      );
    }
  },
  vortex: {
    label: "VORTEX",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const angle = (group / 18) * Math.PI * 2 + i * 0.1;
      const radius = 500 - period * 50;
      return new Vector3(
        radius * Math.cos(angle),
        period * 100,
        radius * Math.sin(angle)
      );
    }
  },
  honeycomb: {
    label: "HONEYCOMB",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const hexSize = 150;
      const row = Math.floor(i / 10);
      const col = i % 10;
      const xOffset = (row % 2) * (hexSize * 0.75);
      return new Vector3(
        col * hexSize * 1.5 + xOffset - 1000,
        row * hexSize * 1.3 - 500,
        Math.sin(i * 0.2) * 100
      );
    }
  },
  solar: {
    label: "SOLAR",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const angle = (group / 18) * Math.PI * 2;
      const radius = 200 + period * 100;
      const orbitAngle = i * 0.1;
      return new Vector3(
        radius * Math.cos(angle) + Math.cos(orbitAngle) * 100,
        radius * Math.sin(angle) + Math.sin(orbitAngle) * 100,
        period * 50
      );
    }
  },
  fractal: {
    label: "FRACTAL",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const angle = (group / 18) * Math.PI * 2;
      const radius = 300 * Math.pow(0.8, period);
      const spiral = i * 0.2;
      return new Vector3(
        radius * Math.cos(angle + spiral),
        radius * Math.sin(angle + spiral),
        period * 100
      );
    }
  },
  matrix: {
    label: "MATRIX",
    getPos: (d, i) => {
      const group = d[3];
      const period = d[4];
      const size = 8;
      const x = (group % size) * 200 - 700;
      const y = (period % size) * 200 - 700;
      const z = Math.floor(i / (size * size)) * 200 - 700;
      return new Vector3(x, y, z);
    }
  }
};

const cardCSS = {
  width: 120,
  height: 160,
  cursor: "default",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Helvetica, sans-serif",
  color: "rgba(255,255,255,0.85)",
  userSelect: "none",
  transition: "all .25s ease"
};

function accentFor(group) {
  return ACCENTS[group] ?? ACCENTS.default;
}

function outwardQuaternion(pos, up, bufQuat, bufMat, tmp) {
  tmp.copy(pos).multiplyScalar(2);
  bufMat.lookAt(pos, tmp, up);
  bufQuat.setFromRotationMatrix(bufMat);
  return bufQuat;
}

function ElementDetails({ element, onClose }) {
  if (!element) return null;
  const accent = accentFor(element.group);

  return (
    <div 
      className="absolute top-4 left-4 p-6 rounded-xl shadow-2xl z-20"
      style={{
        background: `${accent}15`,
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 20px ${accent}40`,
        backdropFilter: "blur(8px)",
        minWidth: "300px",
        color: "#fff"
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-3xl font-bold" style={{ 
            color: "#fff",
            textShadow: `0 0 10px ${accent}`
          }}>
            {element.symbol}
          </h3>
          <p className="text-lg" style={{ 
            color: "#fff",
            textShadow: `0 0 5px ${accent}`
          }}>
            {element.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xl hover:opacity-70 transition-opacity"
          style={{ 
            color: "#fff",
            textShadow: `0 0 5px ${accent}`
          }}
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span style={{ color: "rgba(255,255,255,0.7)" }}>Număr atomic:</span>
          <span className="font-semibold" style={{ 
            color: "#fff",
            textShadow: `0 0 5px ${accent}`
          }}>
            {element.atomicNumber}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: "rgba(255,255,255,0.7)" }}>Grup:</span>
          <span className="font-semibold" style={{ 
            color: "#fff",
            textShadow: `0 0 5px ${accent}`
          }}>
            {element.group}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: "rgba(255,255,255,0.7)" }}>Perioadă:</span>
          <span className="font-semibold" style={{ 
            color: "#fff",
            textShadow: `0 0 5px ${accent}`
          }}>
            {element.period}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: "rgba(255,255,255,0.7)" }}>Masa atomică:</span>
          <span className="font-semibold" style={{ 
            color: "#fff",
            textShadow: `0 0 5px ${accent}`
          }}>
            {element.atomicMass}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t" style={{ borderColor: `${accent}40` }}>
        <p className="text-sm" style={{ 
          color: "rgba(255,255,255,0.8)",
          textShadow: `0 0 3px ${accent}`
        }}>
          {element.description}
        </p>
      </div>
    </div>
  );
}

function Element({ data, index, layout, onSelect, elements }) {
  const ref = useRef();
  const flip = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
  const accent = accentFor(data.group);

  useEffect(() => {
    const obj = ref.current;
    if (!obj) return;
  
    if (obj.position.lengthSq() === 0) {
      obj.position.set(
        Math.random() * 4000 - 2000,
        Math.random() * 4000 - 2000,
        Math.random() * 4000 - 2000
      );
    }
  
    const targetPos = layouts[layout].getPos(
      [data.symbol, data.name, data.atomicNumber, data.group, data.period],
      index,
      elements
    );
  
    const now = performance.now();                 
    const tweenPos = new TWEEN.Tween(obj.position, tweens)
      .to(targetPos, Math.random() * 2000 + 2000)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start(now);                                  
  
    return () => tweenPos.stop();
  }, [layout, data, index, elements, tweens]);

  const wantQ = useRef(new Quaternion()).current;  
  const mat   = useRef(new Matrix4()).current;
  const tmp   = useRef(new Vector3()).current;
  useFrame(() => {
    const obj = ref.current;
    if (!obj) return;

    if (layout === "sphere") {
      outwardQuaternion(obj.position, obj.up, wantQ, mat, tmp);
      wantQ.multiply(flip);
    } else if (layout === "helix") {
      tmp.set(obj.position.x * 2, obj.position.y, obj.position.z * 2);
      mat.lookAt(obj.position, tmp, obj.up);
      wantQ.setFromRotationMatrix(mat);
      wantQ.multiply(flip);
    } else {
      wantQ.identity();     
    }

    obj.quaternion.slerp(wantQ, 0.08);
  });

  return (
    <group ref={ref}>
      <Html distanceFactor={400} transform>
        <div
          style={{
            ...cardCSS,
            background: `${accent}20`,
            border: `1px solid ${accent}55`,
            boxShadow: `0 0 12px ${accent}40`
          }}
          onPointerEnter={e => {
            e.currentTarget.style.boxShadow = `0 0 12px ${accent}`;
            e.currentTarget.style.border = `1px solid ${accent}`;
          }}
          onPointerLeave={e => {
            e.currentTarget.style.boxShadow = `0 0 12px ${accent}40`;
            e.currentTarget.style.border = `1px solid ${accent}55`;
          }}
          onClick={() => onSelect(data)}
        >
          <div style={{
            position:"absolute", top:20, right:20, fontSize:12,
            color:"rgba(127,255,255,0.75)"
          }}>
            {index + 1}
          </div>

          <div style={{
            fontSize:60, fontWeight:"bold",
            textShadow:"0 0 10px rgba(0,255,255,0.95)", lineHeight:"60px"
          }}>
            {data.symbol}
          </div>

          <div style={{
            position:"absolute", bottom:15, fontSize:11,
            color:"rgba(127,255,255,0.75)", textAlign:"center", width:"100%"
          }}>
            {data.name} <br/> {data.atomicNumber}
          </div>
        </div>
      </Html>
    </group>
  );
}

function Scene({ layout, onSelectElement, elements, controls }) {
  useFrame(({ clock }) => {
    tweens.update(clock.getElapsedTime() * 1000);
  });
  return (
    <>
      <ambientLight intensity={0.8} />
      <OrbitControls
        enablePan={controls.pan}
        enableZoom={controls.zoom}
        enableRotate={controls.rotate}
        minDistance={100}
        maxDistance={6000}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        dampingFactor={0.05}
        screenSpacePanning={true}
      />
      {elements.map((el, i) => (
        <Element key={i} data={el} index={i} layout={layout} onSelect={onSelectElement} elements={elements} />
      ))}
    </>
  );
}

export default function PeriodicTable3D() {
  const [layout, setLayout] = useState("table");
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controls, setControls] = useState({
    zoom: true,
    pan: true,
    rotate: true
  });
  const accent = ACCENTS.default;

  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await fetch('http://localhost:8000/feed/chem/elements');
        const data = await response.json();
        setElements(data);
        setLoading(false);
      } catch (err) {
        setError('Eroare la încărcarea elementelor');
        setLoading(false);
        console.error('Error fetching elements:', err);
      }
    };

    fetchElements();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        Se încarcă elementele...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ElementDetails 
        element={selectedElement} 
        onClose={() => setSelectedElement(null)} 
      />

      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => setControls(prev => ({ ...prev, zoom: !prev.zoom }))}
          className="px-4 py-2 rounded-lg text-white"
          style={{
            background: controls.zoom ? `${accent}80` : `${accent}20`,
            border: `1px solid ${accent}aa`,
          }}
        >
          {controls.zoom ? '🔍 Zoom On' : '🔍 Zoom Off'}
        </button>
        <button
          onClick={() => setControls(prev => ({ ...prev, pan: !prev.pan }))}
          className="px-4 py-2 rounded-lg text-white"
          style={{
            background: controls.pan ? `${accent}80` : `${accent}20`,
            border: `1px solid ${accent}aa`,
          }}
        >
          {controls.pan ? '✋ Pan On' : '✋ Pan Off'}
        </button>
        <button
          onClick={() => setControls(prev => ({ ...prev, rotate: !prev.rotate }))}
          className="px-4 py-2 rounded-lg text-white"
          style={{
            background: controls.rotate ? `${accent}80` : `${accent}20`,
            border: `1px solid ${accent}aa`,
          }}
        >
          {controls.rotate ? '🔄 Rotate On' : '🔄 Rotate Off'}
        </button>
      </div>

      <div className="absolute bottom-6 w-full text-center space-x-2 z-10">
        {Object.entries(layouts).map(([k, cfg]) => (
          <button
            key={k}
            onClick={() => setLayout(k)}
            style={{
              padding: "4px 12px",
              fontSize: 22,
              letterSpacing: 1,
              border: `1px solid ${accent}aa`,
              background: layout === k ? `${accent}80` : `${accent}20`,
              color: layout === k ? "#fff" : `${accent}`,
              cursor: "pointer",
              transition: "all .25s ease",
              boxShadow: layout === k ? `0 0 12px ${accent}80` : "none",
              fontWeight: layout === k ? "bold" : "normal"
            }}
            onPointerEnter={e => {
              e.currentTarget.style.boxShadow = `0 0 12px ${accent}80`;
              e.currentTarget.style.border = `1px solid ${accent}`;
              e.currentTarget.style.background = layout === k ? `${accent}80` : `${accent}40`;
            }}
            onPointerLeave={e => {
              e.currentTarget.style.boxShadow = layout === k ? `0 0 12px ${accent}80` : "none";
              e.currentTarget.style.border = `1px solid ${accent}aa`;
              e.currentTarget.style.background = layout === k ? `${accent}80` : `${accent}20`;
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <Canvas
        style={{ background: "#1a0b2e" }}
        camera={{ position:[0,0,3000], fov:40, near:1, far:10000 }}
      >
        <Scene 
          layout={layout} 
          onSelectElement={setSelectedElement} 
          elements={elements}
          controls={controls}
        />
      </Canvas>
    </div>
  );
}
