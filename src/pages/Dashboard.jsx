import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [recetas, setRecetas] = useState([]);
  const [insumos, setInsumos] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const rec = await supabase.from("recetas").select("*");
    const ins = await supabase.from("insumos").select("*");

    if (rec.data) setRecetas(rec.data);
    if (ins.data) setInsumos(ins.data);
  };

  const totalRecetas = recetas.length;

  const costoTotalRecetas = recetas.reduce(
    (acc, r) => acc + Number(r.costo || 0),
    0
  );

  const precioTotalRecetas = recetas.reduce(
    (acc, r) => acc + Number(r.precio_final || 0),
    0
  );

  const gananciaTotal = precioTotalRecetas - costoTotalRecetas;

  return (
    <div style={{ padding: 30 }}>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
        }}
      >
        <div style={cardStyle}>
          <h3>Recetas</h3>
          <h2>{totalRecetas}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Costo total</h3>
          <h2>${costoTotalRecetas.toFixed(2)}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Ventas potenciales</h3>
          <h2>${precioTotalRecetas.toFixed(2)}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Ganancia estimada</h3>
          <h2>${gananciaTotal.toFixed(2)}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Insumos cargados</h3>
          <h2>{insumos.length}</h2>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffe5ec",
  padding: 20,
  borderRadius: 15,
};