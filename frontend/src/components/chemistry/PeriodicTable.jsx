import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Vector3, Quaternion, Matrix4 } from "three";
import TWEEN from "@tweenjs/tween.js";
import DATA from "./periodic-data-full.json";   // 118 × [sym,name,mass,group,period]

/*-------------------------------------  LAYOUT URI  -----------------------------------*/
const layouts = {
  table: {
    label: "TABLE",
    getPos: (d /* element */) =>
      new Vector3(d[3] * 140 - 1260, -(d[4] * 180) + 990, 0)
  },
  sphere: {
    label: "SPHERE",
    getPos: (_, i, l = DATA.length) => {
      const phi   = Math.acos(-1 + 2 * i / l);
      const theta = Math.sqrt(l * Math.PI) * phi;
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
  }
};

/*----------------------------------  CARD  --------------------------------------------*/
const cardCSS = {
  width: 120,
  height: 160,
  background: "rgba(0,127,127,0.40)",
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
  userSelect: "none"
};

function outwardQuaternion(pos, up, bufQuat, bufMat, tmp) {
  tmp.copy(pos).multiplyScalar(2);        // punct în direcţia "afară"
  bufMat.lookAt(pos, tmp, up);
  bufQuat.setFromRotationMatrix(bufMat);
  return bufQuat;
}

function Element({ data, index, layout }) {
  const ref = useRef();
  const flip = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);

  /* tween poziția */
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

    const targetPos = layouts[layout].getPos(data, index);
    const tweenPos = new TWEEN.Tween(obj.position)
      .to(targetPos, Math.random() * 2000 + 2000)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    return () => tweenPos.stop();
  }, [layout, data, index]);

  const wantQ = useRef(new Quaternion()).current;   // ţinta la fiecare cadru
  const mat   = useRef(new Matrix4()).current;
  const tmp   = useRef(new Vector3()).current;
  useFrame(() => {
    const obj = ref.current;
    if (!obj) return;

    // calc ţinta curentă în funcţie de layout & poziţie
    if (layout === "sphere") {
      outwardQuaternion(obj.position, obj.up, wantQ, mat, tmp);
      wantQ.multiply(flip);
    } else if (layout === "helix") {
      tmp.set(obj.position.x * 2, obj.position.y, obj.position.z * 2);
      mat.lookAt(obj.position, tmp, obj.up);
      wantQ.setFromRotationMatrix(mat);
      wantQ.multiply(flip);
    } else {
      wantQ.identity();     // table / grid
    }

    /* slerp lent spre noul quaternion: 0.08 ≈ ~12 fps din 60 */
    obj.quaternion.slerp(wantQ, 0.08);
  });

  return (
    <group ref={ref}>
      <Html distanceFactor={400} transform>
        <div
          style={cardCSS}
          onPointerEnter={e => {
            e.currentTarget.style.boxShadow =
              "0 0 12px rgba(0,255,255,0.75)";
            e.currentTarget.style.border =
              "1px solid rgba(127,255,255,0.75)";
          }}
          onPointerLeave={e => {
            e.currentTarget.style.boxShadow =
              "0 0 12px rgba(0,255,255,0.5)";
            e.currentTarget.style.border =
              "1px solid rgba(127,255,255,0.25)";
          }}
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
            {data[0]}
          </div>

          <div style={{
            position:"absolute", bottom:15, fontSize:11,
            color:"rgba(127,255,255,0.75)", textAlign:"center", width:"100%"
          }}>
            {data[1]} <br/> {data[2]}
          </div>
        </div>
      </Html>
    </group>
  );
}

/*----------------------------------  SCENA  -------------------------------------------*/
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
      {DATA.map((el, i) => (
        <Element key={i} data={el} index={i} layout={layout} />
      ))}
    </>
  );
}

/*----------------------------------  MAIN  --------------------------------------------*/
export default function PeriodicTable3D() {
  const [layout, setLayout] = useState("table");

  return (
    <div className="w-full  h-full relative">
      {/* butoane de schimbare layout */}
      <div className="absolute bottom-6 w-full text-center space-x-2 z-10">
        {Object.entries(layouts).map(([k, cfg]) => (
          <button
            key={k}
            onClick={() => setLayout(k)}
            style={{
              padding:"4px 12px", fontSize:22, letterSpacing:1,
              border:"1px solid rgba(127,255,255,0.75)",
              background: layout === k ? "rgba(0,255,255,0.75)" : "transparent",
              color: layout === k ? "#000" : "rgba(127,255,255,0.75)",
              cursor:"pointer"
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Canvas → fundal negru, cameră ca în demo */}
      <Canvas
        style={{ background: "#000" }}
        camera={{ position:[0,0,3000], fov:40, near:1, far:10000 }}
      >
        <Scene layout={layout} />
      </Canvas>
    </div>
  );
}
