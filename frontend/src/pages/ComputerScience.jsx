// src/pages/ComputerScience.jsx
import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import CSLanding from "../components/computer_science/ComputerScienceLanding";
import VectorScene from "../models/computer_science/Vector";
import VectorOperations from "../components/computer_science/VectorOperations";
import { MapScene } from "../models/computer_science/UnorderedMap";
import { MapOperations } from "../components/computer_science/UnorderedMapOperations";
import AVLTreeDemo from "../models/computer_science/Map";
import { UnorderedSetScene } from "../models/computer_science/UnorderedSet";
import { UnorderedSetOperations } from "../components/computer_science/UnorderedSetOperations";
import AVLSetDemo from "../models/computer_science/Set";

const csObjects = [
  { id: "vector", label: "Vector", icon: "" },
  { id: "unordered_map", label: "Unordered_map", icon: "" },
  { id: "map", label: "Map", icon: "" },
  { id: "unordered_set", label: "Unordered_set", icon: "" },
  { id: "set", label: "Set", icon: "" },
  // { id: "priority_queue", label: "Priority_queue", icon: "" },
  // { id: "deque", label: "Deque", icon: "" },
  // { id: "stack", label: "Stack", icon: "" },
  // { id: "queue", label: "Queue", icon: "" },
  // { id: "list", label: "List", icon: "" },
  // { id: "array", label: "Array", icon: "" },
];

const ComputerScience = () => {
  const [selected, setSelected] = useState(null);
  const [elements, setElements] = useState([1, 2, 3, 4, 5]);
  const [buckets, setBuckets] = useState(
    Array(8)
      .fill([])
      .map(() => [])
  );
  const [root, setRoot] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lavender via-[#f8edf7] to-[#fdf6f6] pt-[80px]">
      <SideMenu
        items={csObjects}
        selectedItem={selected}
        onSelect={setSelected}
      />

      <main className="flex-1 p-7 overflow-y-auto text-black-500">
        {!selected && <CSLanding />}

        {selected?.id === "vector" && (
          <div className="space-y-6">
            <VectorScene elements={elements} />
            <VectorOperations elements={elements} onChange={setElements} />
          </div>
        )}

        {selected?.id === "unordered_map" && (
          <div className="space-y-6">
            <MapScene buckets={buckets} />
            <MapOperations buckets={buckets} onChange={setBuckets} />
          </div>
        )}

        {selected?.id === "map" && (
          <div className="space-y-6">
            <AVLTreeDemo />
          </div>
        )}

        {selected?.id === "unordered_set" && (
          <div className="space-y-6">
            <UnorderedSetScene buckets={buckets} />
            <UnorderedSetOperations buckets={buckets} onChange={setBuckets} />
          </div>
        )}

        {selected?.id === "set" && (
          <div className="space-y-6">
            <AVLSetDemo root={root} setRoot={setRoot} />
          </div>
        )}

        {/* {selected?.id === "priority_queue" && <PriorityQueueDemo />} */}
        {/* {selected?.id === "deque" && <DequeDemo />} */}
        {/* {selected?.id === "stack" && <StackDemo />} */}
        {/* {selected?.id === "queue" && <QueueDemo />} */}
        {/* {selected?.id === "list" && <ListDemo />} */}
        {/* {selected?.id === "array" && <ArrayDemo />} */}

        {!selected && (
          <p className="text-rosy-brown italic mt-6">
            Selectează un subiect din meniul din stânga pentru secţiunea de
            Informatică.
          </p>
        )}
      </main>
    </div>
  );
};

export default ComputerScience;
