import React from 'react';
export function Button({ variant, children }) {
  return <button className={`px-4 py-2 rounded ${variant}`}>{children}</button>;
}