const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

const FILES = [
  'physics/pulleys_2.json',
  'physics/pulleys_3.json',
  'physics/pendulum.json',
  'physics/spring.json',
  'physics/circular_motion.json',
  'physics/projectile.json',
  'physics/free_fall.json',
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