import React, { useEffect, useState } from 'react';
import { Dropdown } from "./ui/dropdown";

function Menu() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/menu')
      .then(response => response.json())
      .then(data => setSubjects(data.subjects))
      .catch(err => console.error('Failed to fetch subjects:', err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">VisioScience 3dddD</h1>
      <Dropdown subjects={subjects} />
    </div>
  );
}

export default Menu;