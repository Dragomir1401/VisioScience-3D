const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

const FILES = [
  'computer_science/array.json',
  'computer_science/doubly_linked_list.json',
  'computer_science/deque.json',
  'computer_science/list.json',
  'computer_science/map.json',
  'computer_science/multiset.json',
  'computer_science/priority_queue.json',
  'computer_science/queue.json',
  'computer_science/set.json',
  'computer_science/stack.json',
  'computer_science/unordered_map.json',
  'computer_science/unordered_set.json',
  'computer_science/vector.json',
];

const BASE = path.join(__dirname);
const URL = 'http://localhost:8000/feed';

(async () => {
  for (const file of FILES) {
    const filePath = path.join(BASE, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const formula of data) {
      try {
        const res = await fetch(URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formula),
        });
        const out = await res.json();
        console.log(`[${file}]`, out);
      } catch (e) {
        console.error(`[${file}] Eroare la upload:`, e);
      }
    }
  }
})(); 