// // src/components/InorderTreeScene.jsx
// import React, { useMemo } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Text, Line } from "@react-three/drei";

// export default function InorderTreeScene({ entries }) {
//   // entries: [{key,value},…] sorted by key

//   const { nodes, edges } = useMemo(() => {
//     const list = [];
//     const edgeList = [];

//     // Recursively carve out a balanced BST from the sorted array:
//     function layout(arr, x0, x1, y, gapY) {
//       if (!arr.length) return null;
//       const mid = Math.floor(arr.length / 2);
//       const { key, value } = arr[mid];
//       const x = (x0 + x1) / 2;

//       // record this node
//       list.push({ key, value, x, y });

//       // build left subtree
//       const left = layout(arr.slice(0, mid), x0, x, y - gapY, gapY);
//       if (left) edgeList.push({ from: [x, y, 0], to: left });

//       // build right subtree
//       const right = layout(arr.slice(mid + 1), x, x1, y - gapY, gapY);
//       if (right) edgeList.push({ from: [x, y, 0], to: right });

//       return [x, y, 0];
//     }

//     // initial call: span horizontally from -N…+N, start at y=4, gapY=2.5
//     const span = Math.max(entries.length * 1.5, 5);
//     layout(entries, -span, span, 4, 2.5);

//     return { nodes: list, edges: edgeList };
//   }, [entries]);

//   return (
//     <div className="w-full h-[650px]">
//       <Canvas camera={{ position: [0, 4, 12], fov: 60 }}>
//         <ambientLight intensity={0.5} />
//         <directionalLight position={[5, 10, 5]} intensity={1} />

//         {/* draw edges */}
//         {edges.map((e, i) => (
//           <Line
//             key={i}
//             points={[e.from, e.to]}
//             color="#888888"
//             lineWidth={1}
//           />
//         ))}

//         {/* draw nodes */}
//         {nodes.map(({ key, value, x, y }) => (
//           <group key={`${key}:${value}`} position={[x, y, 0]}>
//             <mesh>
//               <sphereGeometry args={[0.5, 16, 16]} />
//               <meshStandardMaterial color="#4f46e5" />
//             </mesh>
//             <Text
//               position={[0, 0, 0.6]}
//               fontSize={0.25}
//               color="#ffffff"
//               anchorX="center"
//               anchorY="middle"
//             >
//               {`${key}:${value}`}
//             </Text>
//           </group>
//         ))}

//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }
