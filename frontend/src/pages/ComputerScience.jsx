// src/pages/ComputerScience.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import CppEditor from "../components/computer_science/CppEditor";
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

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
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [elements, setElements] = useState([1, 2, 3, 4, 5]);
  const [buckets, setBuckets] = useState(
    Array(8)
      .fill([])
      .map(() => [])
  );
  const [root, setRoot] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [viewMode, setViewMode] = useState("landing");
  const [type, setType] = useState("max");

  React.useEffect(() => {
    setBuckets(Array(8).fill([]).map(() => []));
    setElements([1, 2, 3, 4, 5]);
    setRoot(null);
    setVisibleCount(0);
    setViewMode("landing");
  }, [selected?.id]);

  const handleShowCppEditor = () => {
    navigate('/computer-science/editor');
  };

  const handleBackToLanding = () => {
    setSelected(null);
    setViewMode("landing");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lavender via-[#f8edf7] to-[#fdf6f6] pt-[80px]">
      <SideMenu
        items={csObjects}
        selectedItem={selected}
        onSelect={setSelected}
        header={"Structuri de date"}
      />

      <main className="flex-1 p-7 overflow-y-auto text-black-500">
        {selected && (
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={handleBackToLanding}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all 
                       bg-[#4f46e5] hover:bg-[#3f36d5] text-white font-semibold
                       shadow-lg hover:shadow-xl
                       border-2 border-[#4138d0] hover:border-[#3128c0]
                       transform hover:-translate-y-0.5"
            >
              <HomeIcon />
              Înapoi la pagina principală
            </button>
          </div>
        )}

        {viewMode === "landing" && !selected && <CSLanding onShowCppEditor={handleShowCppEditor} />}

        {selected?.id === "vector" && viewMode === "landing" && (
          <div className="space-y-6">
            <VectorScene 
              elements={elements}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              width="100%"
              height="600px"
            />
            <VectorOperations elements={elements} onChange={setElements} />
            <VectorFormulas />
          </div>
        )}

        {selected?.id === "unordered_map" && viewMode === "landing" && (
          <div className="space-y-6">
            <MapScene 
              buckets={buckets}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              edgeColor="#D4A5A5"
              width="100%"
              height="600px"
            />
            <MapOperations buckets={buckets} onChange={setBuckets} />
            <UnorderedMapFormulas />
          </div>
        )}

        {selected?.id === "map" && viewMode === "landing" && (
          <div className="space-y-6">
            <AVLTreeDemo 
              root={root}
              onRootChange={setRoot}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              edgeColor="#D4A5A5"
              width="100%"
              height="600px"
            />
            <MapFormulas />
          </div>
        )}

        {selected?.id === "unordered_set" && viewMode === "landing" && (
          <div className="space-y-6">
            <UnorderedSetScene 
              buckets={buckets}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              edgeColor="#D4A5A5"
              width="100%"
              height="600px"
            />
            <UnorderedSetOperations buckets={buckets} onChange={setBuckets} />
            <UnorderedSetFormulas />
          </div>
        )}

        {selected?.id === "set" && viewMode === "landing" && (
          <div className="space-y-6">
            <AVLSetDemo 
              root={root}
              onRootChange={setRoot}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              edgeColor="#D4A5A5"
              width="100%"
              height="600px"
            />
            <SetFormulas />
          </div>
        )}

        {selected?.id === "priority_queue" && viewMode === "landing" && (
          <div className="space-y-6">
            <PriorityQueueDemo 
              elements={elements}
              onElementsChange={setElements}
              type={type}
              onTypeChange={setType}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              edgeColor="#D4A5A5"
              width="100%"
              height="600px"
            />
            <PriorityQueueFormulas />
          </div>
        )}

        {selected?.id === "multiset" && viewMode === "landing" && (
          <div className="space-y-6">
            <AVLMultiSetDemo
              root={root}
              onRootChange={setRoot}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              edgeColor="#D4A5A5"
              width="100%"
              height="600px"
            />
            <MultisetFormulas />
          </div>
        )}

        {selected?.id === "queue" && viewMode === "landing" && (
          <div className="space-y-6">
            <QueueDemo 
              elements={elements}
              onElementsChange={setElements}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              frontIndicatorColor="#D4A5A5"
              backIndicatorColor="#9B6B9E"
              width="100%"
              height="600px"
            />
            <QueueFormulas />
          </div>
        )}

        {selected?.id === "stack" && viewMode === "landing" && (
          <div className="space-y-6">
            <StackDemo 
              elements={elements}
              onElementsChange={setElements}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              topIndicatorColor="#D4A5A5"
              width="100%"
              height="600px"
            />
            <StackFormulas />
          </div>
        )}

        {selected?.id === "deque" && viewMode === "landing" && (
          <div className="space-y-6">
            <DequeDemo 
              elements={elements}
              onElementsChange={setElements}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              frontIndicatorColor="#D4A5A5"
              backIndicatorColor="#9B6B9E"
              width="100%"
              height="600px"
            />
            <DequeFormulas />
          </div>
        )}

        {selected?.id === "list" && viewMode === "landing" && (
          <div className="space-y-6">
            <ListDemo 
              elements={elements}
              onElementsChange={setElements}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              arrowColor="#D4A5A5"
              nullColor="#9B6B9E"
              width="100%"
              height="600px"
            />
            <ListFormulas />
          </div>
        )}

        {selected?.id === "doubly_linked_list" && viewMode === "landing" && (
          <div className="space-y-6">
            <DoublyLinkedListDemo 
              elements={elements}
              onElementsChange={setElements}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              arrowColor="#D4A5A5"
              nullColor="#9B6B9E"
              width="100%"
              height="600px"
            />
            <DoublyLinkedListFormulas />
          </div>
        )}

        {selected?.id === "array" && viewMode === "landing" && (
          <div className="space-y-6">
            <ArrayDemo 
              elements={elements}
              onElementsChange={setElements}
              showControls={true}
              backgroundColor="#2D2D2D"
              textColor="#D4D4D4"
              nodeColor="#9B6B9E"
              highlightGetColor="#D4A5A5"
              highlightSetColor="#9B6B9E"
              width="100%"
              height="600px"
            />
            <ArrayFormulas />
          </div>
        )}

        {viewMode === "cpp_editor" && (
          <div className="bg-white border-2 border-mulberry rounded-lg shadow-xl h-full flex-1">
            <h2 className="text-xl font-bold text-mulberry mb-4 p-4">
              Editor C++ și Vizualizare Structuri de Date 3D
            </h2>
            <CppEditor />
          </div>
        )}

        {!selected && viewMode === "landing" && (
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
