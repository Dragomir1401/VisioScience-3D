export async function apiGet(path) {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  }
  