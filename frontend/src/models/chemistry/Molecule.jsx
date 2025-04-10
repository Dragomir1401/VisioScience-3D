import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Poți pune un mic dictionary pentru culori/radii, custom cum dorești
const elementColors = {
  H: 0xffffff,
  C: 0xaaaaaa,
  O: 0xff0000,
  N: 0x0000ff,
  S: 0xffff00,
  Cl: 0x00ff00,
  Br: 0x996600,
  // etc.
};

function Molecule3DViewer({ moleculeId }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!moleculeId) return;

    let scene, camera, renderer, controls;
    let requestId = null;

    // Creăm scena, camera, renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      800 / 600, // dimensiuni fixe, doar exemplu
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);

    // Adăugăm la DOM
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Controale (rotație, zoom, pan)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lumină
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Facem fetch la structura JSON: { header, counts, atoms[], bonds[] }
    fetch(`http://localhost:8000/feed/chem/molecules/${moleculeId}/3d`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch 3D data");
        }
        return res.json();
      })
      .then((data) => {
        // data = { header, counts, atoms, bonds }
        const { atoms, bonds } = data;
        // Cream un grup ca să putem manipula totul la pachet
        const moleculeGroup = new THREE.Group();

        // 1. Desenăm atomi
        atoms.forEach((atom, idx) => {
          const color = elementColors[atom.type] || 0xcccccc;
          // exemplu simplu: radius = 0.4, doar pt demo
          // sau personalizat după `atom.type`
          const radius = atom.type === "H" ? 0.2 : 0.4;

          const geom = new THREE.SphereGeometry(radius, 32, 32);
          const mat = new THREE.MeshPhongMaterial({ color });
          const sphere = new THREE.Mesh(geom, mat);
          sphere.position.set(atom.x, atom.y, atom.z);

          moleculeGroup.add(sphere);
        });

        // 2. Desenăm legături
        bonds.forEach((bond) => {
          // bond.atom1, bond.atom2 = index 1-based => scădem 1
          const startAtom = atoms[bond.atom1 - 1];
          const endAtom = atoms[bond.atom2 - 1];
          if (!startAtom || !endAtom) return;

          // Poziții
          const startVec = new THREE.Vector3(startAtom.x, startAtom.y, startAtom.z);
          const endVec = new THREE.Vector3(endAtom.x, endAtom.y, endAtom.z);

          // Definim cilindrul
          const bondGeom = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
          const bondMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
          const bondMesh = new THREE.Mesh(bondGeom, bondMat);

          // Ca să așezăm cilindrul între 2 puncte:
          // 1) îl poziționăm la mijloc
          const midPoint = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
          bondMesh.position.copy(midPoint);

          // 2) îl "întoarcem" să fie aliniat
          // Observație: By default, CylinderGeometry e pe axa Y
          // => "lookAt" transformă axa Y să se îndrepte către endVec
          bondMesh.lookAt(endVec);

          // 3) scale pe lungime
          const dist = startVec.distanceTo(endVec);
          bondMesh.scale.set(1, dist, 1);

          moleculeGroup.add(bondMesh);

          // Poți face ceva și cu bondType (1=single, 2=double etc.)
          // ex. double bond => două cilindri subțiri, paralele
        });

        // (opțional) Poți centra totul la origine, calculând bounding box
        centerGroupAtOrigin(moleculeGroup);

        scene.add(moleculeGroup);
      })
      .catch((err) => {
        console.error("Error fetching molecule 3D data:", err);
      });

    // Anim loop
    const animate = () => {
      requestId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup la demontare
    return () => {
      if (requestId) cancelAnimationFrame(requestId);
      if (renderer) {
        renderer.dispose();
      }
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [moleculeId]);

  // Funcție helper pt centrare la origine
  const centerGroupAtOrigin = (group) => {
    // Calculează boundingBox
    const box = new THREE.Box3().setFromObject(group);
    const center = new THREE.Vector3();
    box.getCenter(center);
    // Translatare inversă
    group.position.x -= center.x;
    group.position.y -= center.y;
    group.position.z -= center.z;
  };

  return (
    <div style={{ border: "1px solid #ddd", display: "inline-block" }}>
      <div ref={mountRef} />
    </div>
  );
}

export default Molecule3DViewer;
