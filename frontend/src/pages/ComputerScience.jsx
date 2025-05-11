// src/pages/ComputerScience.jsx
import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import CSLanding from "../components/computer_science/ComputerScienceLanding";
import VectorScene from "../models/computer_science/Vector";
import VectorOperations from "../components/computer_science/VectorOperations";
import VectorFormulas from "../components/computer_science/VectorFormulas";
import { MapScene } from "../models/computer_science/UnorderedMap";
import { MapOperations } from "../components/computer_science/UnorderedMapOperations";
import UnorderedMapFormulas from "../components/computer_science/UnorderedMapFormulas";
import AVLTreeDemo from "../models/computer_science/Map";
import MapFormulas from "../components/computer_science/MapFormulas";
import { UnorderedSetScene } from "../models/computer_science/UnorderedSet";
import { UnorderedSetOperations } from "../components/computer_science/UnorderedSetOperations";
import UnorderedSetFormulas from "../components/computer_science/UnorderedSetFormulas";
import AVLSetDemo from "../models/computer_science/Set";
import SetFormulas from "../components/computer_science/SetFormulas";
import AVLMultiSetDemo from "../models/computer_science/Multiset";
import MultisetFormulas from "../components/computer_science/MultisetFormulas";
import PriorityQueueDemo from "../models/computer_science/PriorityQueue";
import PriorityQueueFormulas from "../components/computer_science/PriorityQueueFormulas";
import QueueDemo from "../models/computer_science/Queue";
import QueueFormulas from "../components/computer_science/QueueFormulas";
import StackDemo from "../models/computer_science/Stack";
import StackFormulas from "../components/computer_science/StackFormulas";
import DequeDemo from "../models/computer_science/Deque";
import DequeFormulas from "../components/computer_science/DequeFormulas";
import ListDemo from "../models/computer_science/List";
import ListFormulas from "../components/computer_science/ListFormulas";
import DoublyLinkedListDemo from "../models/computer_science/DoublyLinkedList";
import DoublyLinkedListFormulas from "../components/computer_science/DoublyLinkedListFormulas";
import ArrayDemo from "../models/computer_science/Array";
import ArrayFormulas from "../components/computer_science/ArrayFormulas";
import {
  array,
  vector,
  map,
  set,
  prioq,
  stack,
  queue,
  deque,
  list,
  dll,
} from "../assets/icons";

const csObjects = [
  { id: "array", label: "Array", icon: array },
  { id: "vector", label: "Vector", icon: vector },
  { id: "unordered_map", label: "Unordered Map", icon: map },
  { id: "map", label: "Map", icon: map },
  { id: "unordered_set", label: "Unordered Set", icon: set },
  { id: "set", label: "Set", icon: set },
  { id: "multiset", label: "Multiset", icon: set },
  { id: "priority_queue", label: "Priority Queue", icon: prioq },
  { id: "deque", label: "Deque", icon: deque },
  { id: "stack", label: "Stack", icon: stack },
  { id: "queue", label: "Queue", icon: queue },
  { id: "list", label: "List", icon: list },
  {
    id: "doubly_linked_list",
    label: "Doubly Linked List",
    icon: dll,
  },
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

  React.useEffect(() => {
    setBuckets(Array(8).fill([]).map(() => []));
    setElements([1, 2, 3, 4, 5]);
    setRoot(null);
    setVisibleCount(0);
  }, [selected?.id]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lavender via-[#f8edf7] to-[#fdf6f6] pt-[80px]">
      <SideMenu
        items={csObjects}
        selectedItem={selected}
        onSelect={setSelected}
        header={"Structuri de date"}
      />

      <main className="flex-1 p-7 overflow-y-auto text-black-500">
        {!selected && <CSLanding />}

        {selected?.id === "vector" && (
          <div className="space-y-6">
            <VectorScene elements={elements} />
            <VectorOperations elements={elements} onChange={setElements} />
            <VectorFormulas />
          </div>
        )}

        {selected?.id === "unordered_map" && (
          <div className="space-y-6">
            <MapScene buckets={buckets} />
            <MapOperations buckets={buckets} onChange={setBuckets} />
            <UnorderedMapFormulas />
          </div>
        )}

        {selected?.id === "map" && (
          <div className="space-y-6">
            <AVLTreeDemo />
            <MapFormulas />
          </div>
        )}

        {selected?.id === "unordered_set" && (
          <div className="space-y-6">
            <UnorderedSetScene buckets={buckets} />
            <UnorderedSetOperations buckets={buckets} onChange={setBuckets} />
            <UnorderedSetFormulas />
          </div>
        )}

        {selected?.id === "set" && (
          <div className="space-y-6">
            <AVLSetDemo root={root} setRoot={setRoot} />
            <SetFormulas />
          </div>
        )}

        {selected?.id === "priority_queue" && (
          <div className="space-y-6">
            <PriorityQueueDemo root={root} setRoot={setRoot} />
            <PriorityQueueFormulas />
          </div>
        )}

        {selected?.id === "multiset" && (
          <div className="space-y-6">
            <AVLMultiSetDemo
              root={root}
              setRoot={setRoot}
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
            />
            <MultisetFormulas />
          </div>
        )}

        {selected?.id === "queue" && (
          <div className="space-y-6">
            <QueueDemo root={root} setRoot={setRoot} />
            <QueueFormulas />
          </div>
        )}

        {selected?.id === "stack" && (
          <div className="space-y-6">
            <StackDemo root={root} setRoot={setRoot} />
            <StackFormulas />
          </div>
        )}

        {selected?.id === "deque" && (
          <div className="space-y-6">
            <DequeDemo root={root} setRoot={setRoot} />
            <DequeFormulas />
          </div>
        )}

        {selected?.id === "list" && (
          <div className="space-y-6">
            <ListDemo root={root} setRoot={setRoot} />
            <ListFormulas />
          </div>
        )}

        {selected?.id === "doubly_linked_list" && (
          <div className="space-y-6">
            <DoublyLinkedListDemo root={root} setRoot={setRoot} />
            <DoublyLinkedListFormulas />
          </div>
        )}

        {selected?.id === "array" && (
          <div className="space-y-6">
            <ArrayDemo root={root} setRoot={setRoot} />
            <ArrayFormulas />
          </div>
        )}

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
