import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const elementColors = {
  H: 0xffffff,
  C: 0xaaaaaa,
  O: 0xff0000,
  N: 0x0000ff,
  S: 0xffff00,
  Cl: 0x00ff00,
  Br: 0x996600,
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
      window.innerWidth / window.innerHeight, // Dimensiuni dinamic
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight); // Canvas mare
    renderer.setClearColor(0xeeeeee); // Culoare fundal deschisă

    // Adăugăm la DOM
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Controale (rotație, zoom, pan)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lumină
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Lumină ambientală
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1); // Lumină direcțională
    dirLight.position.set(5, 5, 5).normalize();
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
          // Exemplu simplu: radius = 0.4, doar pentru demo
          const radius = atom.type === "H" ? 0.2 : 0.4;

          const geom = new THREE.SphereGeometry(radius, 32, 32);
          const mat = new THREE.MeshPhongMaterial({ color });
          const sphere = new THREE.Mesh(geom, mat);
          sphere.position.set(atom.x, atom.y, atom.z);

          moleculeGroup.add(sphere);
        });

        // 2. Desenăm legături
        bonds.forEach((bond) => {
          const startAtom = atoms[bond.atom1 - 1];
          const endAtom = atoms[bond.atom2 - 1];
          if (!startAtom || !endAtom) return;

          const startVec = new THREE.Vector3(startAtom.x, startAtom.y, startAtom.z);
          const endVec = new THREE.Vector3(endAtom.x, endAtom.y, endAtom.z);

          const bondGeom = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
          const bondMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
          const bondMesh = new THREE.Mesh(bondGeom, bondMat);

          const midPoint = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
          bondMesh.position.copy(midPoint);

          bondMesh.lookAt(endVec);
          const dist = startVec.distanceTo(endVec);
          bondMesh.scale.set(1, dist, 1);

          moleculeGroup.add(bondMesh);
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
    const box = new THREE.Box3().setFromObject(group);
    const center = new THREE.Vector3();
    box.getCenter(center);
    group.position.x -= center.x;
    group.position.y -= center.y;
    group.position.z -= center.z;
  };

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />
  );
}

export default Molecule3DViewer;
