import React, { useState } from "react";
import { insertNode, deleteNode } from "../../models/computer_science/Map";

export const AVLTreeOperations = ({ root, setRoot }) => {
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [message, setMessage] = useState("");
  const inorder = node => {
    if (!node) return [];
    return [...inorder(node.left), { key: node.key, value: node.value }, ...inorder(node.right)];
  }
  
  const entries = inorder(root);

  const handleInsert = () => {
    if (!keyInput) return;
    const k = isNaN(keyInput) ? keyInput : Number(keyInput);
    const newRoot = insertNode(root, k, valueInput);
    setRoot(newRoot);
    setMessage(`Inserted ${k}:${valueInput}`);
    setKeyInput("");
    setValueInput("");
  };

  const handleDelete = () => {
    if (!keyInput) return;
    const k = isNaN(keyInput) ? keyInput : Number(keyInput);
    const newRoot = deleteNode(root, k);
    setRoot(newRoot);
    setMessage(`Deleted ${k}`);
    setKeyInput("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4">
      <h4 className="text-lg font-semibold text-mulberry">Ordered Map (AVL)</h4>
      <div className="flex gap-2">
        <input type="text" placeholder="Key" className="border rounded px-2 py-1 flex-1" value={keyInput} onChange={e => setKeyInput(e.target.value)} />
        <input type="text" placeholder="Value" className="border rounded px-2 py-1 flex-1" value={valueInput} onChange={e => setValueInput(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button onClick={handleInsert} className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">Insert/Update</button>
        <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">Delete</button>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
      <div className="mt-4 text-sm text-gray-700">In-order: {entries.map(e => `${e.key}:${e.value}`).join(", ")}</div>
    </div>
  );
};
