import { useEffect, useState } from 'react';

function Menu() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/menu')
      .then(response => response.json())
      .then(data => setMenu(data.subjects))
      .catch(err => console.error('API error:', err));
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