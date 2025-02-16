import { useEffect, useState } from 'react';

function Menu() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetch('/menu')
      .then(response => response.json())
      .then(data => setMenu(data.subjects));
  }, []);

  return (
    <div>
      <h2>Materii disponibile</h2>
      <ul>
        {menu.map((subject, index) => (
          <li key={index}>{subject}</li>
        ))}
      </ul>
    </div>
  );
}

export default Menu;