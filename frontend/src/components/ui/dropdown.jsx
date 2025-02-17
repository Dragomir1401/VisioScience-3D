import React, { useState } from "react";
import "./dropdown.css";

export function Dropdown({ subjects }) {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen((prev) => !prev);

  return (
    <div className="dropdown-container">
      <button className="dropdown-button" onClick={toggleMenu}>
        Materii
      </button>

      {open && (
        <div className="dropdown-menu">
          {subjects.map((subject, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => {
                console.log(`Ai selectat: ${subject}`);
                setOpen(false);
              }}
            >
              {subject}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
