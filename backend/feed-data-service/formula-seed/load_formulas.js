const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

const FILES = [
  'chemistry/periodic-data-full.json',
];

const BASE = path.join(__dirname);
const URL = 'http://localhost:8000/feed/chem/elements';  

(async () => {
  for (const file of FILES) {
    const filePath = path.join(BASE, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Încărcare elemente din ${file}...`);
    
    for (const element of data) {
      try {
        console.log(`Încărcare element ${element.symbol}...`);
        const res = await fetch(URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(element),
        });
        
        if (res.ok) {
          const out = await res.json();
          console.log(`[${file}] Element ${element.symbol} încărcat cu succes:`, out);
        } else {
          console.error(`[${file}] Eroare la încărcarea elementului ${element.symbol}:`, await res.text());
        }
      } catch (e) {
        console.error(`[${file}] Eroare la upload pentru elementul ${element.symbol}:`, e);
      }
    }
  }
})(); 