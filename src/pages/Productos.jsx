import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";

export default function Productos() {
  const [recetas, setRecetas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data } = await supabase
      .from("recetas")
      .select("*")
      .order("nombre", { ascending: true });

    if (data) setRecetas(data);
  };

  const filtradas = recetas.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: 30 }}>
      <h1>Productos</h1>

      <input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ padding: 10, width: "100%", marginBottom: 20 }}
      />

      <table width="100%" border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Costo</th>
            <th>Precio</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {filtradas.map((r) => (
            <tr key={r.id}>
              <td>{r.nombre}</td>
              <td>${Number(r.costo).toFixed(2)}</td>
              <td>${Number(r.precio_final).toFixed(2)}</td>
              <td>
                <Link to={`/producto/${r.id}`}>Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}