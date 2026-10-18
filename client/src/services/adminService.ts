const API_URL = "/api/admin";
const headers = () => ({Authorization: `Bearer ${localStorage.getItem("token") || ""}`});

export const obtenerDashboardAdmin = async () => {
  const response = await fetch(`${API_URL}/dashboard`, {headers: headers()});
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al obtener dashboard administrador");
  }

  return data.dashboard;
};

export const obtenerUsuariosAdmin = async () => {
  const response = await fetch(`${API_URL}/usuarios`, {headers: headers()});
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al obtener usuarios");
  }

  return data.usuarios;
};
