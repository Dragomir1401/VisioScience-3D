import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ForestBackground2 from '../ForestBackground2';

const vdwRadii = {
  H: 1.2,
  C: 1.7,
  N: 1.55,
  O: 1.52,
  F: 1.47,
  Cl: 1.75,
  Br: 1.85,
  I: 1.98,
};

const elementColors = {
  H: '#ffffff',
  C: '#aaaaaa',
  O: '#ff0000',
  N: '#0000ff',
  S: '#ffff00',
  Cl: '#00ff00',
  Br: '#996600',
  I: '#6600cc',
};

const Molecule = ({ moleculeId, onParsed }) => {
  const groupRef = useRef();
  const [atoms, setAtoms] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [header, setHeader] = useState(null);
  const [counts, setCounts] = useState(null);
  const [elementTypesInMolecule, setElementTypesInMolecule] = useState(new Set());

  useEffect(() => {
    fetch(`http://localhost:8000/feed/chem/molecules/${moleculeId}/3d`)
      .then((res) => res.json())
      .then((data) => {
        setAtoms(data.atoms || []);
        setBonds(data.bonds || []);
        setHeader(data.header);
        setCounts(data.counts);

        // Extragem tipurile de atomi din moleculă pentru a le adăuga în legendă
        const elementsInMolecule = new Set(data.atoms.map((atom) => atom.type));
        setElementTypesInMolecule(elementsInMolecule);

        onParsed && onParsed(data);
      })
      .catch((err) => console.error('Eroare la fetch:', err));
  }, [moleculeId]);

  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      groupRef.current.position.sub(center);
    }
  }, [atoms, bonds]);

  return (
    <group ref={groupRef}>
      {atoms.map((atom, idx) => {
        const radius = vdwRadii[atom.type] || 1.5;
        const color = new THREE.Color().setStyle(elementColors[atom.type] || '#cccccc');
        return (
          <mesh key={idx} position={[atom.x, atom.y, atom.z]}>
            <sphereGeometry args={[radius * 0.4, 32, 32]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      {bonds.map((bond, idx) => {
        const start = atoms[bond.atom1];
        const end = atoms[bond.atom2];
        if (!start || !end) return null;

        const startVec = new THREE.Vector3(start.x, start.y, start.z);
        const endVec = new THREE.Vector3(end.x, end.y, end.z);
        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(endVec, startVec);
        const length = dir.length();
        dir.normalize();

        const bondRadius = bond.bondType === 2 ? 0.1 : bond.bondType === 3 ? 0.12 : 0.08;

        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        return (
          <mesh key={idx} position={midPoint} quaternion={quaternion}>
            <cylinderGeometry args={[bondRadius, bondRadius, length, 16]} />
            <meshStandardMaterial color={0x888888} />
          </mesh>
        );
      })}
    </group>
  );
};

const AtomLegend = ({ elementTypesInMolecule }) => (
  <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded shadow text-sm space-y-1 z-10">
    {[...elementTypesInMolecule].map((el) => (
      <p key={el} className="flex items-center">
        <span className="inline-block w-4 h-4 mr-2 rounded-full" style={{ background: elementColors[el] }}></span>
        {el}
      </p>
    ))}
  </div>
);

function Molecule3DViewer({ moleculeId }) {
  const [parsedData, setParsedData] = useState(null);
  const [elementTypesInMolecule, setElementTypesInMolecule] = useState(new Set());

  return (
    <div className="w-full h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />
        <Molecule moleculeId={moleculeId} onParsed={(data) => setElementTypesInMolecule(data.atoms.map((atom) => atom.type))} />
        <ForestBackground2 />
      </Canvas>
      <AtomLegend elementTypesInMolecule={elementTypesInMolecule} />
    </div>
  );
}

export default Molecule3DViewer;
